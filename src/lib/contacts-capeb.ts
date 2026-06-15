// ── Chargés de développement CAPEB par secteur ──────────────────────────────────

export type ChargeDeveloppement = {
  secteur: string;
  nom: string;
  email: string;
  telephone?: string;
};

export const CHARGES_DEV: ChargeDeveloppement[] = [
  { secteur: "Lescar", nom: "Guillaume PIGUÉ", email: "guillaume.pigue@capeb-adour-pyrenees.fr" },
  { secteur: "Anglet", nom: "Serge CAZEAUX", email: "serge.cazeaux@capeb-adour-pyrenees.fr" },
  { secteur: "Tarbes", nom: "Frédéric LAPLACE", email: "frederic.laplace@capeb-adour-pyrenees.fr", telephone: "07 77 33 41 88" },
];

/** Renvoie le(s) chargé(s) de développement compétent(s) pour un ou plusieurs départements (64, 65). */
export function chargesDevPourDepartements(departements: string[]): ChargeDeveloppement[] {
  const secteurs = new Set<string>();
  if (departements.includes("64")) { secteurs.add("Lescar"); secteurs.add("Anglet"); }
  if (departements.includes("65")) { secteurs.add("Tarbes"); }
  return CHARGES_DEV.filter(c => secteurs.has(c.secteur));
}
