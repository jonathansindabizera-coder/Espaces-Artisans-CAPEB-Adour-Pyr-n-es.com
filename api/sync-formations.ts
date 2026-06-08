import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const CAPEB_URL =
  "https://www.capeb.fr/adour-pyrenees/nos-services?tab=training";

const LIEUX = ["LESCAR", "ANGLET", "TARBES", "PAU"];

const THEMES: [RegExp, string][] = [
  [/pompe.?à.?chaleur|pac\b/i, "Pompe à chaleur"],
  [/qualipac/i, "Pompe à chaleur"],
  [/photovoltai|solaire|qualisol/i, "Énergie solaire"],
  [/rge|rénovation|qualibat|renovation/i, "RGE / Rénovation"],
  [/électri|habilitation|br|b1|b2|bc\b/i, "Électricité / Habilitation"],
  [/sécurité|securi|amiante|echafaud/i, "Sécurité"],
  [/gestion|comptab|devis|facturation/i, "Gestion"],
  [/communication|commercial|client/i, "Communication"],
  [/plomb|sanitaire/i, "Plomberie / Sanitaire"],
  [/charpente|menuiserie|bois/i, "Charpente / Menuiserie"],
  [/carrelage|faïence/i, "Carrelage"],
  [/peinture|enduit/i, "Peinture / Enduit"],
];

function detectLieu(titre: string): string | null {
  const upper = titre.toUpperCase();
  for (const lieu of LIEUX) {
    if (upper.includes(lieu)) return lieu.charAt(0) + lieu.slice(1).toLowerCase();
  }
  return null;
}

function detectTheme(titre: string): string {
  for (const [regex, label] of THEMES) {
    if (regex.test(titre)) return label;
  }
  return "Autre";
}

function nettoyerTitre(titre: string): string {
  let t = titre.trim();
  for (const lieu of LIEUX) {
    t = t.replace(new RegExp(`\\s+${lieu}\\s*$`, "i"), "").trim();
  }
  return t;
}

interface Formation {
  external_id: string;
  titre: string;
  lieu: string | null;
  theme: string;
  date_debut: string | null;
  duree_texte: string | null;
  description: string | null;
  url_programme_pdf: string | null;
  url_ics: string;
  date_maj: string;
}

function parseFormations(html: string): Formation[] {
  const formations: Formation[] = [];
  const now = new Date().toISOString();

  // Extraire les blocs ICS pour identifier les formations
  const icsRegex = /https:\/\/www\.capeb\.fr\/ics\?item=(training_\d+)/g;
  const icsMatches = [...html.matchAll(icsRegex)];
  const seen = new Set<string>();

  for (const icsMatch of icsMatches) {
    const external_id = icsMatch[1];
    if (seen.has(external_id)) continue;
    seen.add(external_id);

    const icsUrl = `https://www.capeb.fr/ics?item=${external_id}`;
    const pos = html.indexOf(icsUrl);
    // Remonter ~4000 chars pour trouver le bloc de cette formation
    const bloc = html.slice(Math.max(0, pos - 4000), pos + 500);

    // Titre : chercher balises h2, h3, h4 ou classe contenant le titre
    let titre = "";
    const titrePatterns = [
      /<h[234][^>]*>\s*([^<]{10,}?)\s*<\/h[234]>/i,
      /class="[^"]*title[^"]*"[^>]*>\s*([^<]{10,}?)\s*</i,
      /class="[^"]*formation[^"]*-title[^"]*"[^>]*>\s*([^<]{10,}?)\s*</i,
      /class="[^"]*name[^"]*"[^>]*>\s*([^<]{10,}?)\s*</i,
    ];
    for (const p of titrePatterns) {
      const m = bloc.match(p);
      if (m) { titre = m[1].trim(); break; }
    }
    if (!titre) {
      // Fallback : chercher le texte le plus long dans une balise avant le lien ICS
      const fallback = bloc.match(/<[^>]+>\s*([A-Z][A-Z\s\/]{15,})\s*<\/[^>]+>/);
      if (fallback) titre = fallback[1].trim();
    }
    if (!titre) titre = external_id;

    // Date : format ISO dans le HTML
    const dateMatch = bloc.match(/(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?)/);
    const date_debut = dateMatch ? new Date(dateMatch[1]).toISOString() : null;

    // Durée
    const dureeMatch = bloc.match(/(\d+\s*jours?\s*\d*\s*h(?:eures?)?)/i)
      || bloc.match(/(\d+\s*h(?:eures?)?)/i);
    const duree_texte = dureeMatch ? dureeMatch[1].trim() : null;

    // Description : paragraphe ou div avec texte descriptif
    let description: string | null = null;
    const descPatterns = [
      /<p[^>]*>\s*([^<]{40,}?)\s*<\/p>/,
      /class="[^"]*desc[^"]*"[^>]*>\s*([^<]{40,}?)\s*</i,
      /class="[^"]*objectif[^"]*"[^>]*>\s*([^<]{40,}?)\s*</i,
    ];
    for (const p of descPatterns) {
      const m = bloc.match(p);
      if (m) { description = m[1].replace(/\s+/g, " ").trim(); break; }
    }

    // PDF
    const pdfMatch = bloc.match(/href="([^"]+\.pdf[^"]*)"/i)
      || bloc.match(/href="([^"]*programme[^"]*)"/i)
      || bloc.match(/href="([^"]*telecharger[^"]*)"/i);
    let url_programme_pdf = pdfMatch ? pdfMatch[1] : null;
    if (url_programme_pdf && !url_programme_pdf.startsWith("http")) {
      url_programme_pdf = `https://www.capeb.fr${url_programme_pdf}`;
    }

    const titreBrut = titre;
    const lieuDetecte = detectLieu(titreBrut);
    const titreNettoye = nettoyerTitre(titreBrut);
    const theme = detectTheme(titreNettoye);

    formations.push({
      external_id,
      titre: titreNettoye,
      lieu: lieuDetecte,
      theme,
      date_debut,
      duree_texte,
      description,
      url_programme_pdf,
      url_ics: icsUrl,
      date_maj: now,
    });
  }

  return formations;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sécurité : token secret pour éviter les appels non autorisés
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

  try {
    // 1. Récupérer la page CAPEB
    const response = await fetch(CAPEB_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EspaceArtisanCAPEB/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} en accédant à capeb.fr`);
    }

    const html = await response.text();

    // 2. Parser le HTML
    const formations = parseFormations(html);

    if (formations.length === 0) {
      console.warn("[Formations] Aucune formation trouvée — structure HTML peut-être modifiée");
      return res.status(200).json({
        ok: false,
        message: "Aucune formation détectée dans la page. Les données existantes sont conservées.",
        count: 0,
      });
    }

    // 3. Upsert dans Supabase (jamais de suppression)
    const { error } = await supabase
      .from("formations")
      .upsert(formations, { onConflict: "external_id" });

    if (error) throw error;

    console.log(`[Formations] ${formations.length} formations synchronisées`);

    return res.status(200).json({
      ok: true,
      count: formations.length,
      date_maj: new Date().toISOString(),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Formations] Erreur de synchronisation:", message);
    // On ne renvoie PAS d'erreur 500 pour ne pas faire planter le cron
    return res.status(200).json({
      ok: false,
      error: message,
      message: "Synchronisation échouée. Les données existantes sont conservées.",
    });
  }
}
