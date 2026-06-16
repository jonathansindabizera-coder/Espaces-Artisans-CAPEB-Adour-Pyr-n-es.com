export type StatutValue =
  | "devis_a_faire"
  | "devis_envoye"
  | "devis_signe"
  | "travaux_en_cours"
  | "pv_a_signer"
  | "termine";

export type Client = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
};

export type Chantier = {
  id: string;
  client_id: string;
  nature_travaux: string;
  montant_estime: number | null;
  duree_estimee: string | null;
  statut: StatutValue;
  date_creation: string;
  // Planning (optionnel, ajouté ultérieurement)
  date_debut_prevue?: string | null;
  date_fin_prevue?: string | null;
  metier_requis?: string | null;
  nb_personnes_requises?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

const K_CLIENTS = "ea_clients";
const K_CHANTIERS = "ea_chantiers";

export const DATA_EVENT = "ea_data_updated";

export function loadClients(): Client[] {
  try {
    return JSON.parse(localStorage.getItem(K_CLIENTS) ?? "[]");
  } catch {
    return [];
  }
}

export function loadChantiers(): Chantier[] {
  try {
    return JSON.parse(localStorage.getItem(K_CHANTIERS) ?? "[]");
  } catch {
    return [];
  }
}

export function addClient(data: Omit<Client, "id">): Client {
  const c: Client = { id: crypto.randomUUID(), ...data };
  const list = loadClients();
  list.push(c);
  localStorage.setItem(K_CLIENTS, JSON.stringify(list));
  return c;
}

export function addChantier(data: Omit<Chantier, "id" | "date_creation">): Chantier {
  const c: Chantier = { id: crypto.randomUUID(), date_creation: new Date().toISOString(), ...data };
  const list = loadChantiers();
  list.unshift(c);
  localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  return c;
}

export function updateChantierStatut(id: string, statut: StatutValue): void {
  const list = loadChantiers();
  const i = list.findIndex((c) => c.id === id);
  if (i !== -1) {
    list[i].statut = statut;
    localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  }
}

export function updateChantier(
  id: string,
  data: Partial<Omit<Chantier, "id" | "date_creation">>,
): void {
  const list = loadChantiers();
  const i = list.findIndex((c) => c.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  }
}

export function notifyUpdate(): void {
  window.dispatchEvent(new Event(DATA_EVENT));
}

// ── RH & Juridique ────────────────────────────────────────────────────────────

export type EmployeRH = {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  num_secu: string | null;
  qualification: string | null;
  salarie_adresse: string | null;
  statut: "ouvrier" | "etam" | "cadre";
  actif: boolean;
  created_at: string;
  // Planning (optionnel, ajouté ultérieurement)
  metier?: string | null;
  couleur?: string | null;
  latitude_domicile?: number | null;
  longitude_domicile?: number | null;
};

export type ContratGenere = {
  id: string;
  employe_id: string;
  employe_nom: string;
  type_contrat: string;
  titre_contrat: string;
  date_generation: string;
  donnees: Record<string, string>;
};

export type ProfilEntreprise = {
  nom: string;
  siret: string;
  adresse: string;
  telephone: string;
  email: string;
  forme_juridique?: string;
  code_ape?: string;
  tva?: string;
  gerant?: string;
  code_postal?: string;
  ville?: string;
  site_web?: string;
  assurance?: string;
  num_police?: string;
  qualifications?: string;
};

export type ParametresCharges = {
  taux_patronal: number;
  cotisation_cibtp: number;
  oppbtp: number;
  chomage_intemp: number;
  prevoyance_probtp: number;
  atmp: number;
  mutuelle_mensuelle: number;
  indemnite_trajet: number;
  indemnite_repas: number;
  cout_premier_embauche: number;
};

const K_EMPLOYES_RH = "ea_employes_rh";
const K_CONTRATS = "ea_contrats_generes";
const K_PROFIL = "ea_profil_entreprise";
const K_PARAMS_CHARGES = "ea_params_charges";

export const PARAMETRES_CHARGES_DEFAUT: ParametresCharges = {
  taux_patronal: 30,
  cotisation_cibtp: 20,
  oppbtp: 0.11,
  chomage_intemp: 0.65,
  prevoyance_probtp: 2.8,
  atmp: 3.5,
  mutuelle_mensuelle: 30,
  indemnite_trajet: 80,
  indemnite_repas: 200,
  cout_premier_embauche: 350,
};

const PROFIL_ENTREPRISE_DEFAUT: ProfilEntreprise = {
  nom: "",
  siret: "",
  adresse: "",
  telephone: "",
  email: "",
  forme_juridique: "",
  code_ape: "",
  tva: "",
  gerant: "",
  code_postal: "",
  ville: "",
  site_web: "",
  assurance: "",
  num_police: "",
  qualifications: "",
};

export function loadProfilEntreprise(): ProfilEntreprise {
  try {
    const s = localStorage.getItem(K_PROFIL);
    return s ? { ...PROFIL_ENTREPRISE_DEFAUT, ...JSON.parse(s) } : { ...PROFIL_ENTREPRISE_DEFAUT };
  } catch {
    return { ...PROFIL_ENTREPRISE_DEFAUT };
  }
}
export function saveProfilEntreprise(p: ProfilEntreprise): void {
  localStorage.setItem(K_PROFIL, JSON.stringify(p));
}

export function loadParametresCharges(): ParametresCharges {
  try {
    const s = localStorage.getItem(K_PARAMS_CHARGES);
    return s ? { ...PARAMETRES_CHARGES_DEFAUT, ...JSON.parse(s) } : PARAMETRES_CHARGES_DEFAUT;
  } catch {
    return PARAMETRES_CHARGES_DEFAUT;
  }
}
export function saveParametresCharges(p: ParametresCharges): void {
  localStorage.setItem(K_PARAMS_CHARGES, JSON.stringify(p));
}

export function loadEmployesRH(): EmployeRH[] {
  try {
    return JSON.parse(localStorage.getItem(K_EMPLOYES_RH) ?? "[]");
  } catch {
    return [];
  }
}
export function addEmployeRH(data: Omit<EmployeRH, "id" | "created_at">): EmployeRH {
  const e: EmployeRH = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data };
  const list = loadEmployesRH();
  list.unshift(e);
  localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  return e;
}
export function updateEmployeRH(
  id: string,
  data: Partial<Omit<EmployeRH, "id" | "created_at">>,
): void {
  const list = loadEmployesRH();
  const i = list.findIndex((e) => e.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  }
}
export function removeEmployeRH(id: string): void {
  localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(loadEmployesRH().filter((e) => e.id !== id)));
}

export function loadContratsGeneres(): ContratGenere[] {
  try {
    return JSON.parse(localStorage.getItem(K_CONTRATS) ?? "[]");
  } catch {
    return [];
  }
}
export function addContratGenere(
  data: Omit<ContratGenere, "id" | "date_generation">,
): ContratGenere {
  const c: ContratGenere = {
    id: crypto.randomUUID(),
    date_generation: new Date().toISOString(),
    ...data,
  };
  const list = loadContratsGeneres();
  list.unshift(c);
  localStorage.setItem(K_CONTRATS, JSON.stringify(list));
  return c;
}

// ── Avantages CAPEB ───────────────────────────────────────────────────────────

export type AvantageCapeb = {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  economie_min_pct: number | null;
  economie_max_pct: number | null;
  type_action: "lien_externe" | "code_promo" | "demande_rappel" | "comparatif_factures";
  action_valeur: string;
  partenaire_nom: string | null;
  conditions: string;
  date_maj: string;
  actif: boolean;
};

const K_AVANTAGES = "ea_avantages_capeb";

export function loadAvantages(): AvantageCapeb[] {
  try {
    return JSON.parse(localStorage.getItem(K_AVANTAGES) ?? "[]");
  } catch {
    return [];
  }
}
export function replaceAvantages(list: AvantageCapeb[]): void {
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
}
export function addAvantage(data: Omit<AvantageCapeb, "id">): AvantageCapeb {
  const a: AvantageCapeb = { id: crypto.randomUUID(), ...data };
  const list = loadAvantages();
  list.push(a);
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
  return a;
}
export function updateAvantage(id: string, data: Partial<Omit<AvantageCapeb, "id">>): void {
  const list = loadAvantages();
  const i = list.findIndex((a) => a.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
  }
}
export function removeAvantage(id: string): void {
  const list = loadAvantages().filter((a) => a.id !== id);
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
}

// ── Planning & Chantiers ──────────────────────────────────────────────────────

export type Absence = {
  id: string;
  salarie_id: string;
  date_debut: string;
  date_fin: string;
  motif: "conges" | "maladie" | "formation" | "autre";
};

export type Affectation = {
  id: string;
  chantier_id: string;
  salarie_id: string;
  date: string;
};

const K_ABSENCES = "ea_absences";
const K_AFFECTATIONS = "ea_affectations";

export function loadAbsences(): Absence[] {
  try {
    return JSON.parse(localStorage.getItem(K_ABSENCES) ?? "[]");
  } catch {
    return [];
  }
}
export function addAbsence(data: Omit<Absence, "id">): Absence {
  const a: Absence = { id: crypto.randomUUID(), ...data };
  const list = loadAbsences();
  list.push(a);
  localStorage.setItem(K_ABSENCES, JSON.stringify(list));
  return a;
}
export function removeAbsence(id: string): void {
  const list = loadAbsences().filter((a) => a.id !== id);
  localStorage.setItem(K_ABSENCES, JSON.stringify(list));
}

export function loadAffectations(): Affectation[] {
  try {
    return JSON.parse(localStorage.getItem(K_AFFECTATIONS) ?? "[]");
  } catch {
    return [];
  }
}
export function addAffectation(data: Omit<Affectation, "id">): Affectation {
  const a: Affectation = { id: crypto.randomUUID(), ...data };
  const list = loadAffectations();
  list.push(a);
  localStorage.setItem(K_AFFECTATIONS, JSON.stringify(list));
  return a;
}
export function removeAffectation(id: string): void {
  const list = loadAffectations().filter((a) => a.id !== id);
  localStorage.setItem(K_AFFECTATIONS, JSON.stringify(list));
}
export function replaceAffectation(id: string, data: Partial<Omit<Affectation, "id">>): void {
  const list = loadAffectations();
  const i = list.findIndex((a) => a.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_AFFECTATIONS, JSON.stringify(list));
  }
}

// ── Planning : Ressources matérielles ────────────────────────────────────────

export type Ressource = {
  id: string;
  nom: string;
  type: "vehicule" | "machine" | "outillage";
  reference: string | null;
  actif: boolean;
};

export type AffectationRessource = {
  id: string;
  ressource_id: string;
  chantier_id: string;
  date: string;
};

const K_RESSOURCES = "ea_ressources";
const K_AFF_RESSOURCES = "ea_aff_ressources";

export function loadRessources(): Ressource[] {
  try {
    return JSON.parse(localStorage.getItem(K_RESSOURCES) ?? "[]");
  } catch {
    return [];
  }
}
export function addRessource(data: Omit<Ressource, "id">): Ressource {
  const r: Ressource = { id: crypto.randomUUID(), ...data };
  const list = loadRessources();
  list.push(r);
  localStorage.setItem(K_RESSOURCES, JSON.stringify(list));
  return r;
}
export function updateRessource(id: string, data: Partial<Omit<Ressource, "id">>): void {
  const list = loadRessources();
  const i = list.findIndex((r) => r.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_RESSOURCES, JSON.stringify(list));
  }
}
export function removeRessource(id: string): void {
  localStorage.setItem(K_RESSOURCES, JSON.stringify(loadRessources().filter((r) => r.id !== id)));
}

export function loadAffectationsRessources(): AffectationRessource[] {
  try {
    return JSON.parse(localStorage.getItem(K_AFF_RESSOURCES) ?? "[]");
  } catch {
    return [];
  }
}
export function addAffectationRessource(
  data: Omit<AffectationRessource, "id">,
): AffectationRessource {
  const a: AffectationRessource = { id: crypto.randomUUID(), ...data };
  const list = loadAffectationsRessources();
  list.push(a);
  localStorage.setItem(K_AFF_RESSOURCES, JSON.stringify(list));
  return a;
}
export function removeAffectationRessource(id: string): void {
  localStorage.setItem(
    K_AFF_RESSOURCES,
    JSON.stringify(loadAffectationsRessources().filter((a) => a.id !== id)),
  );
}

// ── Planning : Tâches chantier ────────────────────────────────────────────────

export type TacheChantier = {
  id: string;
  chantier_id: string;
  date: string;
  description: string;
  fait: boolean;
  salarie_id: string | null;
};

const K_TACHES = "ea_taches_chantier";

export function loadTaches(): TacheChantier[] {
  try {
    return JSON.parse(localStorage.getItem(K_TACHES) ?? "[]");
  } catch {
    return [];
  }
}
export function addTache(data: Omit<TacheChantier, "id">): TacheChantier {
  const t: TacheChantier = { id: crypto.randomUUID(), ...data };
  const list = loadTaches();
  list.push(t);
  localStorage.setItem(K_TACHES, JSON.stringify(list));
  return t;
}
export function updateTache(id: string, data: Partial<Omit<TacheChantier, "id">>): void {
  const list = loadTaches();
  const i = list.findIndex((t) => t.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_TACHES, JSON.stringify(list));
  }
}
export function removeTache(id: string): void {
  localStorage.setItem(K_TACHES, JSON.stringify(loadTaches().filter((t) => t.id !== id)));
}

// ── Planning : Pointages ──────────────────────────────────────────────────────

export type Pointage = {
  id: string;
  chantier_id: string;
  salarie_id: string;
  date: string;
  heures_prevues: number;
  heures_reelles: number | null;
  valide: boolean;
};

const K_POINTAGES = "ea_pointages";

export function loadPointages(): Pointage[] {
  try {
    return JSON.parse(localStorage.getItem(K_POINTAGES) ?? "[]");
  } catch {
    return [];
  }
}
export function addPointage(data: Omit<Pointage, "id">): Pointage {
  const p: Pointage = { id: crypto.randomUUID(), ...data };
  const list = loadPointages();
  list.push(p);
  localStorage.setItem(K_POINTAGES, JSON.stringify(list));
  return p;
}
export function updatePointage(id: string, data: Partial<Omit<Pointage, "id">>): void {
  const list = loadPointages();
  const i = list.findIndex((p) => p.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_POINTAGES, JSON.stringify(list));
  }
}
export function removePointage(id: string): void {
  localStorage.setItem(K_POINTAGES, JSON.stringify(loadPointages().filter((p) => p.id !== id)));
}

// ── Affaires CAPEB ────────────────────────────────────────────────────────────

export type AffaireCAPEB = {
  id: string;
  dateAjout: string;
  typesTravaux: string;
  commune: string;
  codePostal: string;
  description: string;
  statut: "nouveau" | "vu";
  corpsMetierCible: string;
  origine?: "depot_direct" | "capeb" | "veille_publique" | "partenaire" | "import_manuel";
  sourceNom?: string;
  sourceUrl?: string;
  sourceUrlType?: "annonce_exacte" | "page_recherche";
  validation?: "a_valider" | "validee";
  contactConsigne?: string;
};

const K_AFFAIRES_CAPEB = "ea_affaires_capeb";
const K_AFFAIRES_CAPEB_SEED_VERSION = "ea_affaires_capeb_seed_version";
const AFFAIRES_CAPEB_SEED_VERSION = "2026-06-16-veille-allovoisins-exact-url-workflow";
const AFFAIRES_CAPEB_SEED_REMOVED_IDS = new Set([
  "veille-allovoisins-mazeres-lezons-macon-demi-journees-20260616",
]);

const CONSIGNE_VEILLE_PUBLIQUE =
  "Vérifier que la demande est toujours active et contacter uniquement via la plateforme source. Ne pas recopier de coordonnées personnelles.";

const AFFAIRES_DEMO: AffaireCAPEB[] = [
  {
    id: "demo-affaire-1",
    dateAjout: "2026-06-10T09:00:00.000Z",
    typesTravaux: "Plomberie",
    commune: "Pau",
    codePostal: "64000",
    description:
      "Remplacement de la chaudière fioul par une pompe à chaleur. Maison individuelle de 120 m², construction 1975. Devis souhaité avant fin juin.",
    statut: "nouveau",
    corpsMetierCible: "Plomberie",
    origine: "capeb",
    sourceNom: "CAPEB Adour-Pyrénées",
    validation: "validee",
    contactConsigne: "Contact transmis par la CAPEB après validation de l'artisan intéressé.",
  },
  {
    id: "demo-affaire-2",
    dateAjout: "2026-06-12T14:30:00.000Z",
    typesTravaux: "Électricité",
    commune: "Tarbes",
    codePostal: "65000",
    description:
      "Mise aux normes du tableau électrique et ajout de prises dans une maison de 1968. Travaux à réaliser cet été si possible.",
    statut: "nouveau",
    corpsMetierCible: "Électricité",
    origine: "veille_publique",
    sourceNom: "Annonce publique locale",
    sourceUrl: "https://www.leboncoin.fr/",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne:
      "Vérifier que l'annonce est toujours publique et contacter le particulier uniquement via la plateforme source.",
  },
  {
    id: "demo-affaire-3",
    dateAjout: "2026-06-14T11:00:00.000Z",
    typesTravaux: "Peinture",
    commune: "Bayonne",
    codePostal: "64100",
    description:
      "Rénovation peinture d'un appartement T3 de 75 m² : murs et plafonds de toutes les pièces. Couleurs à définir ensemble.",
    statut: "nouveau",
    corpsMetierCible: "Peinture",
    origine: "import_manuel",
    sourceNom: "Groupe local public",
    sourceUrl: "https://www.facebook.com/",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne:
      "Demande importée manuellement depuis une publication visible publiquement. Ne pas republier de données personnelles.",
  },
  {
    id: "veille-allovoisins-pau-renovation-cuisine-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Menuiserie",
    commune: "Pau",
    codePostal: "64000",
    description:
      "Veille publique : rénovation d'un appartement au centre-ville de Pau. Besoin d'aide pour terminer la pose d'une cuisine et réaliser quelques finitions.",
    statut: "nouveau",
    corpsMetierCible: "Menuiserie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Rénovation Pau",
    sourceUrl: "https://www.allovoisins.com/v/artisan-tout-corps-d-etat-renovation/pau",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-billere-ravalement-facade-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Billère",
    codePostal: "64140",
    description:
      "Veille publique : recherche d'une personne pour un ravalement de façade avec une partie en pierre apparente.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Maçonnerie Pau",
    sourceUrl: "https://www.allovoisins.com/v/maconnerie/pau",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-lons-crepi-mur-terrasse-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Lons",
    codePostal: "64140",
    description: "Veille publique : réalisation d'un crépi sur un long mur devant une terrasse.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Crépi de mur Pau/Lons",
    sourceUrl: "https://www.allovoisins.com/v/si/crepi-de-mur/pau",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-lons-dalle-beton-abri-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Lons",
    codePostal: "64140",
    description:
      "Veille publique : construction d'une dalle béton d'environ 9 m2 pour un abri de jardin.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Dalle béton",
    sourceUrl: "https://www.allovoisins.com/v/si/realisation-de-dalle-en-beton",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-gelos-terrasse-trottoirs-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Gelos",
    codePostal: "64110",
    description:
      "Veille publique : création d'une terrasse d'environ 20 m2 avec continuité de deux trottoirs d'environ 1 mètre.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Terrassement Gelos",
    sourceUrl: "https://www.allovoisins.com/v/terrassement-assainissement/gelos",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-tarbes-tableau-electrique-appartement-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Électricité",
    commune: "Tarbes",
    codePostal: "65000",
    description:
      "Veille publique : appartement de 67 m2 avec tableau électrique à refaire, prises apparentes à ajouter avec goulottes et possible sèche-serviette.",
    statut: "nouveau",
    corpsMetierCible: "Électricité",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Bricolage Tarbes",
    sourceUrl: "https://www.allovoisins.com/v/bricolage-petits-travaux/tarbes",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-juillan-brise-vue-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Menuiserie",
    commune: "Juillan",
    codePostal: "65290",
    description:
      "Veille publique : installation d'un brise-vue d'environ 20 m en haie artificielle.",
    statut: "nouveau",
    corpsMetierCible: "Menuiserie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Brise-vue Juillan",
    sourceUrl: "https://www.allovoisins.com/v/bricolage-petits-travaux/azereix",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-soues-bazet-tringles-luminaire-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Électricité",
    commune: "Soues / Bazet",
    codePostal: "65430",
    description:
      "Veille publique : pose de tringles à rideaux et d'un luminaire, intervention estimée à environ trois heures.",
    statut: "nouveau",
    corpsMetierCible: "Électricité",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Tringles et luminaire Bazet",
    sourceUrl: "https://www.allovoisins.com/v/bricolage-petits-travaux/salles-adour",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-borderes-dalle-beton-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Bordères-sur-l'Échez",
    codePostal: "65320",
    description:
      "Veille publique : création d'une dalle béton d'environ 15 m2 et 15 à 20 cm d'épaisseur pour un abri de jardin.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Maçonnerie Bordères-sur-l'Échez",
    sourceUrl: "https://www.allovoisins.com/v/maconnerie/borderes-sur-lechez",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
  {
    id: "veille-allovoisins-barbazan-debat-ouverture-fenetre-20260616",
    dateAjout: "2026-06-16T14:20:00.000Z",
    typesTravaux: "Maçonnerie",
    commune: "Barbazan-Debat",
    codePostal: "65690",
    description:
      "Veille publique : ouverture de fenêtre sur mur de façade en rez-de-chaussée avec pose de linteau et appui de fenêtre.",
    statut: "nouveau",
    corpsMetierCible: "Maçonnerie",
    origine: "veille_publique",
    sourceNom: "AlloVoisins - Maçonnerie Barbazan-Debat",
    sourceUrl: "https://www.allovoisins.com/r/0/133/34931/0/Barbazan-debat/service/Maconnerie",
    sourceUrlType: "page_recherche",
    validation: "a_valider",
    contactConsigne: CONSIGNE_VEILLE_PUBLIQUE,
  },
];

function synchroniserAffairesCAPEBSeed(
  list: AffaireCAPEB[],
  storedSeedVersion: string | null,
): AffaireCAPEB[] {
  const seedById = new Map(AFFAIRES_DEMO.map((affaire) => [affaire.id, affaire]));
  const shouldAddMissingSeeds = !storedSeedVersion;

  const updated = list
    .filter((affaire) => !AFFAIRES_CAPEB_SEED_REMOVED_IDS.has(affaire.id))
    .map((affaire) => {
      const seed = seedById.get(affaire.id);
      if (!seed) return affaire;

      return {
        ...seed,
        sourceUrl:
          affaire.sourceUrlType === "annonce_exacte" && affaire.sourceUrl
            ? affaire.sourceUrl
            : seed.sourceUrl,
        sourceUrlType:
          affaire.sourceUrlType === "annonce_exacte" ? "annonce_exacte" : seed.sourceUrlType,
        statut: affaire.statut,
        validation: affaire.validation ?? seed.validation,
      };
    });

  if (!shouldAddMissingSeeds) return updated;

  const ids = new Set(updated.map((affaire) => affaire.id));
  const nouvelles = AFFAIRES_DEMO.filter((affaire) => !ids.has(affaire.id));
  return [...nouvelles, ...updated];
}

export function getAffairesCAPEB(): AffaireCAPEB[] {
  try {
    const stored = localStorage.getItem(K_AFFAIRES_CAPEB);
    if (stored) {
      const storedSeedVersion = localStorage.getItem(K_AFFAIRES_CAPEB_SEED_VERSION);
      const list = JSON.parse(stored) as AffaireCAPEB[];
      if (storedSeedVersion !== AFFAIRES_CAPEB_SEED_VERSION) {
        const merged = synchroniserAffairesCAPEBSeed(list, storedSeedVersion);
        localStorage.setItem(K_AFFAIRES_CAPEB, JSON.stringify(merged));
        localStorage.setItem(K_AFFAIRES_CAPEB_SEED_VERSION, AFFAIRES_CAPEB_SEED_VERSION);
        return merged;
      }
      return list;
    }
    localStorage.setItem(K_AFFAIRES_CAPEB, JSON.stringify(AFFAIRES_DEMO));
    localStorage.setItem(K_AFFAIRES_CAPEB_SEED_VERSION, AFFAIRES_CAPEB_SEED_VERSION);
    return [...AFFAIRES_DEMO];
  } catch {
    return [...AFFAIRES_DEMO];
  }
}

export function saveAffaireCAPEB(affaire: AffaireCAPEB): void {
  const list = getAffairesCAPEB();
  const i = list.findIndex((a) => a.id === affaire.id);
  if (i !== -1) {
    list[i] = affaire;
  } else {
    list.unshift(affaire);
  }
  localStorage.setItem(K_AFFAIRES_CAPEB, JSON.stringify(list));
}

export function deleteAffaireCAPEB(id: string): void {
  localStorage.setItem(
    K_AFFAIRES_CAPEB,
    JSON.stringify(getAffairesCAPEB().filter((a) => a.id !== id)),
  );
}

export function markAffaireVue(id: string): void {
  const list = getAffairesCAPEB();
  const i = list.findIndex((a) => a.id === id);
  if (i !== -1) {
    list[i].statut = "vu";
    localStorage.setItem(K_AFFAIRES_CAPEB, JSON.stringify(list));
  }
}
