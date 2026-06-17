import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// URLs de recherche AlloVoisins par département
const AV_64 = "https://www.allovoisins.com/near_you/?department=64";
const AV_65 = "https://www.allovoisins.com/near_you/?department=65";

// Catégories AlloVoisins correspondant à des travaux artisans
const SLUGS_ARTISAN = [
  "plomberie", "sanitaire", "chauffage", "installation-electrique", "electricite",
  "maconnerie", "gros-oeuvre", "terrassement", "peinture", "tapisserie", "ravalement",
  "menuiserie", "charpente", "couverture", "toiture", "carrelage", "faience",
  "renovation", "artisan", "batiment", "isolation", "carreleur", "electricien",
  "plombier", "peintre", "maçon", "menuisier", "couvreur",
];

const TYPES_TRAVAUX_MAP: [RegExp, string][] = [
  [/plomb|sanitaire|chauffage|chaudière|chaudiere|pac\b|pompe.?à.?chaleur/i, "Plomberie"],
  [/electr|électr|habilitation/i, "Électricité"],
  [/maçon|macon|gros.?oeuvre|gros.?œuvre|terrassement/i, "Maçonnerie"],
  [/peinture|tapisserie|enduit|ravalement/i, "Peinture"],
  [/menuiser|charpente|bois|parquet|plancher/i, "Menuiserie"],
  [/couverture|toiture|toit|zinguerie|ardoise|tuile/i, "Couverture"],
  [/carrelage|faïence|faience|dallage/i, "Carrelage"],
];

function detectCorpsMetier(text: string): string {
  for (const [rx, label] of TYPES_TRAVAUX_MAP) {
    if (rx.test(text)) return label;
  }
  return "Autre";
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

function estRecent(dateStr: string | null, maxJours = 30): boolean {
  if (!dateStr) return true;
  try {
    return Date.now() - new Date(dateStr).getTime() < maxJours * 86_400_000;
  } catch { return true; }
}

// Extrait le JSON __NEXT_DATA__ d'une page Next.js
function extractNextData(html: string): unknown {
  const m = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

// Parcours récursif pour trouver le premier tableau qui ressemble à des annonces
function trouverTableauAnnonces(obj: unknown, profondeur = 0): unknown[] | null {
  if (profondeur > 6 || obj === null || typeof obj !== "object") return null;
  if (Array.isArray(obj) && obj.length > 0) {
    const premier = obj[0];
    if (
      premier !== null &&
      typeof premier === "object" &&
      !Array.isArray(premier)
    ) {
      const keys = Object.keys(premier as Record<string, unknown>);
      // Heuristique : un tableau d'annonces a au moins un champ texte et un identifiant
      const aTexte = keys.some(k => ["title", "titre", "name", "description", "label"].includes(k));
      const aId = keys.some(k => ["id", "uid", "requestId", "slug"].includes(k));
      if (aTexte && aId) return obj as unknown[];
    }
  }
  if (!Array.isArray(obj)) {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      const trouve = trouverTableauAnnonces(val, profondeur + 1);
      if (trouve && trouve.length > 0) return trouve;
    }
  }
  return null;
}

interface AnnonceParsee {
  source: "allovoisins";
  external_id: string;
  titre: string;
  description: string | null;
  ville: string | null;
  code_postal: string | null;
  departement: "64" | "65";
  corps_metier: string;
  date_annonce: string | null;
  date_scraping: string;
  url_annonce: string;
  url_type: "annonce_exacte" | "page_recherche";
  statut_import: "nouveau";
}

function parserAnnonceAlloVoisins(
  item: unknown,
  departementCible: "64" | "65",
  urlRecherche: string,
  now: string
): AnnonceParsee | null {
  if (!item || typeof item !== "object") return null;
  const it = item as Record<string, unknown>;

  // Titre
  const titre = String(it.title ?? it.titre ?? it.name ?? it.label ?? "").trim();
  if (!titre) return null;

  // Description
  const descRaw = it.description ?? it.body ?? it.content ?? it.text ?? it.detail ?? "";
  const description = descRaw ? String(descRaw).replace(/\s+/g, " ").trim().slice(0, 800) : null;

  // Catégorie → filtre artisan
  const catObj = it.category ?? it.service ?? it.categorySlug ?? it.type ?? {};
  const catStr = typeof catObj === "object" && catObj !== null
    ? String((catObj as Record<string, unknown>).slug ?? (catObj as Record<string, unknown>).name ?? "")
    : String(catObj ?? "");
  const texteFiltre = (catStr + " " + titre + " " + (description ?? "")).toLowerCase();
  const estArtisan = SLUGS_ARTISAN.some(s => texteFiltre.includes(s));
  if (!estArtisan) return null;

  // Localisation
  const loc = it.location ?? it.address ?? it.place ?? {};
  const locObj = typeof loc === "object" && loc !== null ? loc as Record<string, unknown> : {};
  const ville = String(locObj.city ?? locObj.name ?? locObj.ville ?? it.city ?? "").trim() || null;
  const cp = String(locObj.zipcode ?? locObj.zip ?? locObj.postal ?? locObj.codePostal ?? it.zipcode ?? "").trim() || null;
  const deptLoc = String(locObj.department ?? locObj.dept ?? locObj.departement ?? "").trim();

  // Filtre département : cp préfixé ou dept déclaré
  const cpStart = cp?.slice(0, 2) ?? "";
  const deptDetecte = deptLoc.slice(0, 2) || cpStart;
  if (deptDetecte && deptDetecte !== departementCible) return null;
  // si aucune info geo, on ne filtre pas (on garde)

  // Date
  const dateRaw = String(it.createdAt ?? it.created_at ?? it.date ?? it.publishedAt ?? it.updatedAt ?? "").trim();
  let date_annonce: string | null = null;
  if (dateRaw) {
    try { date_annonce = new Date(dateRaw).toISOString().split("T")[0]; } catch { /* ignore */ }
  }
  if (!estRecent(date_annonce)) return null;

  // URL de l'annonce
  const urlRaw = String(it.url ?? it.link ?? it.href ?? it.permalink ?? "").trim();
  let url_annonce = urlRecherche;
  let url_type: "annonce_exacte" | "page_recherche" = "page_recherche";
  if (urlRaw.startsWith("/")) {
    url_annonce = `https://www.allovoisins.com${urlRaw}`;
    url_type = "annonce_exacte";
  } else if (urlRaw.startsWith("http")) {
    url_annonce = urlRaw;
    url_type = "annonce_exacte";
  }

  // External ID
  const idBrut = String(it.id ?? it.requestId ?? it.uid ?? "").trim();
  const external_id = `av_${departementCible}_${idBrut || simpleHash(`${titre}|${ville ?? ""}|${date_annonce ?? ""}`)}`;

  const corps_metier = detectCorpsMetier(catStr + " " + titre);

  return {
    source: "allovoisins",
    external_id,
    titre: titre.slice(0, 200),
    description,
    ville,
    code_postal: cp,
    departement: departementCible,
    corps_metier,
    date_annonce,
    date_scraping: now,
    url_annonce,
    url_type,
    statut_import: "nouveau",
  };
}

async function scrapeAlloVoisins(
  supabase: ReturnType<typeof createClient>,
  now: string
): Promise<{ count: number; inserted: number; updated: number; error?: string }> {
  const resultats: AnnonceParsee[] = [];

  for (const dept of ["64", "65"] as const) {
    const url = dept === "64" ? AV_64 : AV_65;
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (!resp.ok) {
        console.warn(`[AlloVoisins] HTTP ${resp.status} dept ${dept}`);
        continue;
      }

      const html = await resp.text();
      const nextData = extractNextData(html);

      if (!nextData) {
        console.warn(`[AlloVoisins] __NEXT_DATA__ introuvable pour dept ${dept} — structure HTML modifiée ?`);
        continue;
      }

      const items = trouverTableauAnnonces(nextData);
      if (!items || items.length === 0) {
        console.warn(`[AlloVoisins] Aucun tableau d'annonces dans __NEXT_DATA__ pour dept ${dept}`);
        continue;
      }

      let nbDept = 0;
      for (const item of items) {
        const annonce = parserAnnonceAlloVoisins(item, dept, url, now);
        if (annonce) { resultats.push(annonce); nbDept++; }
      }
      console.log(`[AlloVoisins] dept ${dept} : ${nbDept} annonces retenues (${items.length} items bruts)`);

    } catch (err) {
      console.error(`[AlloVoisins] Erreur dept ${dept}:`, err instanceof Error ? err.message : String(err));
    }
  }

  if (resultats.length === 0) return { count: 0, inserted: 0, updated: 0 };

  const externalIds = resultats.map(r => r.external_id);

  // Récupérer les external_ids déjà connus
  const { data: existants, error: selectErr } = await supabase
    .from("annonces_particuliers")
    .select("external_id")
    .eq("source", "allovoisins")
    .in("external_id", externalIds);

  if (selectErr) {
    return { count: resultats.length, inserted: 0, updated: 0, error: selectErr.message };
  }

  const existantsSet = new Set((existants ?? []).map((e: { external_id: string }) => e.external_id));
  const nouveaux = resultats.filter(r => !existantsSet.has(r.external_id));
  const dejaVus = resultats.filter(r => existantsSet.has(r.external_id)).map(r => r.external_id);

  let inserted = 0;
  let updated = 0;

  // Insérer les nouvelles annonces
  if (nouveaux.length > 0) {
    const { error: insertErr } = await supabase
      .from("annonces_particuliers")
      .insert(nouveaux);
    if (insertErr) {
      console.error("[AlloVoisins] Erreur insert:", insertErr.message);
    } else {
      inserted = nouveaux.length;
    }
  }

  // Mettre à jour date_scraping des annonces déjà connues (statut_import préservé)
  if (dejaVus.length > 0) {
    const { error: updateErr } = await supabase
      .from("annonces_particuliers")
      .update({ date_scraping: now })
      .eq("source", "allovoisins")
      .in("external_id", dejaVus);
    if (updateErr) {
      console.error("[AlloVoisins] Erreur update date_scraping:", updateErr.message);
    } else {
      updated = dejaVus.length;
    }
  }

  return { count: resultats.length, inserted, updated };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sécurité token (même schéma que sync-formations)
  const token = req.headers["x-sync-token"] || req.query.token;
  const expectedToken = process.env.SYNC_SECRET_TOKEN;
  if (expectedToken && token !== expectedToken) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Variables Supabase manquantes" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date().toISOString();

  // Les deux sources tournent indépendamment — une erreur sur l'une ne bloque pas l'autre
  const [avResult, aopResult] = await Promise.allSettled([
    scrapeAlloVoisins(supabase, now),
    // appeloffreduparticulier.com : annonces chargées en JS côté client uniquement
    // → non scrapable via fetch simple (vérifié). Fallback : liens manuels.
    Promise.resolve({
      count: 0,
      inserted: 0,
      updated: 0,
      blocage: "JS_RENDERING_REQUIRED",
      liens_manuels: {
        dept_64: "https://www.appeloffreduparticulier.com/index.php?page=1&cp=64",
        dept_65: "https://www.appeloffreduparticulier.com/index.php?page=1&cp=65",
      },
    }),
  ]);

  // On renvoie toujours 200 pour que le cron Vercel ne soit pas marqué en erreur
  return res.status(200).json({
    ok: true,
    date: now,
    allovoisins: avResult.status === "fulfilled"
      ? avResult.value
      : { count: 0, inserted: 0, updated: 0, error: String((avResult as PromiseRejectedResult).reason) },
    appeloffreduparticulier: aopResult.status === "fulfilled"
      ? aopResult.value
      : { count: 0, error: String((aopResult as PromiseRejectedResult).reason) },
  });
}
