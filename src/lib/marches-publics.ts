// ── Marchés publics (BOAMP / DILA) ──────────────────────────────────────────────
// Source : API ouverte OpenDataSoft du BOAMP, licence ouverte v2.0.

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export type MarchePublic = {
  idweb: string;
  objet: string;
  acheteur: string;
  /** Sous-ensemble de ["64","65"] présent dans code_departement pour cette annonce. */
  departements: string[];
  dateParution: string | null;
  dateLimiteReponse: string;
  procedureLibelle: string;
  /** true si procedure_categorise = "PROCEDURE_ADAPTE/" (MAPA, accessible à un artisan seul). */
  estMapa: boolean;
  descripteurs: string[];
  urlAvis: string;
};

export type MarchesPublicsCache = {
  fetchedAt: string;
  marches: MarchePublic[];
};

const K_MARCHES_PUBLICS = "ea_marches_publics_boamp";
const CACHE_DUREE_MS = 12 * 60 * 60 * 1000; // 12h, l'API BOAMP se met à jour 2x/jour

const BOAMP_RECORDS_URL = "https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records";

/**
 * Descripteurs BOAMP correspondant aux corps d'état du bâtiment (second œuvre et gros œuvre).
 * Le jeu de données BOAMP n'expose pas de code CPV exploitable : descripteur_libelle
 * (nomenclature interne BOAMP, en clair) est l'alternative la plus fiable pour filtrer
 * sur les travaux de bâtiment.
 */
const DESCRIPTEURS_BATIMENT = new Set([
  "Bâtiment", "Gros oeuvre", "Tous corps d'état", "Maçonnerie", "Charpente", "Couverture",
  "Etanchéité", "Menuiserie", "Serrurerie", "Métallerie", "Plomberie (travaux)", "Plomberie",
  "Sanitaire", "Chauffage (travaux)", "Climatisation", "Ventilation", "Electricité (travaux)",
  "Electricité", "Peinture (travaux)", "Revêtements de sols", "Revêtements muraux", "Carrelage",
  "Plâtrerie", "Cloison, faux plafond", "Isolation", "Démolition", "Terrassement", "Ascenseur",
  "Amiante (désamiantage)", "Bardage",
]);

type BoampRecord = {
  idweb: string;
  objet: string | null;
  nomacheteur: string | null;
  code_departement: string[] | null;
  dateparution: string | null;
  datelimitereponse: string | null;
  procedure_libelle: string | null;
  procedure_categorise: string | null;
  descripteur_libelle: string[] | null;
  url_avis: string | null;
};

async function fetchAvisDepartement(departement: "64" | "65"): Promise<BoampRecord[]> {
  const params = new URLSearchParams();
  params.set("limit", "100");
  params.set("order_by", "datelimitereponse asc");
  params.append("refine", `code_departement:"${departement}"`);
  params.append("refine", `nature_categorise_libelle:"Avis de marché"`);
  params.set("where", "datelimitereponse >= now()");

  const res = await fetch(`${BOAMP_RECORDS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`BOAMP a répondu avec une erreur (${res.status})`);

  const data = await res.json();
  return (data.results ?? []) as BoampRecord[];
}

/** Récupère et filtre les avis de marché BOAMP "bâtiment" pour les Pyrénées-Atlantiques (64) et les Hautes-Pyrénées (65). */
export async function fetchMarchesPublicsBoamp(): Promise<MarchesPublicsCache> {
  const [avis64, avis65] = await Promise.all([
    fetchAvisDepartement("64"),
    fetchAvisDepartement("65"),
  ]);

  // dédoublonnage : un même avis peut apparaître dans les deux requêtes
  const parId = new Map<string, BoampRecord>();
  for (const r of [...avis64, ...avis65]) parId.set(r.idweb, r);

  const marches: MarchePublic[] = [];
  for (const r of parId.values()) {
    const descripteurs = r.descripteur_libelle ?? [];
    if (!descripteurs.some(d => DESCRIPTEURS_BATIMENT.has(d))) continue;
    if (!r.datelimitereponse) continue;

    marches.push({
      idweb: r.idweb,
      objet: r.objet ?? "Objet non précisé",
      acheteur: r.nomacheteur ?? "Acheteur non précisé",
      departements: (r.code_departement ?? []).filter(d => d === "64" || d === "65"),
      dateParution: r.dateparution,
      dateLimiteReponse: r.datelimitereponse,
      procedureLibelle: r.procedure_libelle ?? "Procédure non précisée",
      estMapa: (r.procedure_categorise ?? "").startsWith("PROCEDURE_ADAPTE"),
      descripteurs,
      urlAvis: r.url_avis ?? `https://www.boamp.fr/pages/avis/?q=idweb:${r.idweb}`,
    });
  }

  marches.sort((a, b) => a.dateLimiteReponse.localeCompare(b.dateLimiteReponse));

  return { fetchedAt: new Date().toISOString(), marches };
}

// ── Cache localStorage (12h) ─────────────────────────────────────────────────────

export function loadMarchesPublicsCache(): MarchesPublicsCache | null {
  try {
    const s = localStorage.getItem(K_MARCHES_PUBLICS);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function saveMarchesPublicsCache(cache: MarchesPublicsCache): void {
  localStorage.setItem(K_MARCHES_PUBLICS, JSON.stringify(cache));
}

export function cacheEstValide(cache: MarchesPublicsCache | null): boolean {
  if (!cache) return false;
  return Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_DUREE_MS;
}

// ── Aide à la candidature ─────────────────────────────────────────────────────

/** Jours restants avant la date limite de remise des offres (peut être négatif si dépassée). */
export function joursRestants(dateLimiteReponse: string): number {
  const diffMs = new Date(dateLimiteReponse).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checklist standard des pièces d'un dossier de candidature à un marché public de bâtiment.
 * La liste exacte dépend de chaque marché et se trouve dans le DCE — voir l'avis complet.
 */
export const PIECES_CANDIDATURE_STANDARD = [
  "DC1 — Lettre de candidature",
  "DC2 — Déclaration du candidat",
  "Attestations fiscales et sociales à jour",
  "Attestation d'assurance décennale",
  "Certification RGE (si exigée par le marché)",
  "Références de chantiers similaires",
  "Mémoire technique",
];

/** Construit un lien mailto pré-rempli vers un chargé de développement CAPEB pour un marché donné. */
export function buildAideMarchePublicMailto(marche: MarchePublic, emailContact: string): string {
  const dateLimiteFr = format(parseISO(marche.dateLimiteReponse), "d MMMM yyyy", { locale: fr });

  const sujet = `Besoin d'aide pour répondre à un marché public : ${marche.objet}`;
  const corps = `Bonjour,

Je souhaite être accompagné(e) pour répondre au marché public suivant :

Objet : ${marche.objet}
Acheteur : ${marche.acheteur}
Date limite de remise des offres : ${dateLimiteFr}
Avis complet : ${marche.urlAvis}

Merci de me recontacter pour m'aider dans cette démarche.`;

  return `mailto:${emailContact}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}
