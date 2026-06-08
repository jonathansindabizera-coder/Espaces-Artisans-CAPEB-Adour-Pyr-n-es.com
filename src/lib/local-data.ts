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
};

const K_CLIENTS  = "ea_clients";
const K_CHANTIERS = "ea_chantiers";

export const DATA_EVENT = "ea_data_updated";

export function loadClients(): Client[] {
  try { return JSON.parse(localStorage.getItem(K_CLIENTS) ?? "[]"); }
  catch { return []; }
}

export function loadChantiers(): Chantier[] {
  try { return JSON.parse(localStorage.getItem(K_CHANTIERS) ?? "[]"); }
  catch { return []; }
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
  const i = list.findIndex(c => c.id === id);
  if (i !== -1) {
    list[i].statut = statut;
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

const K_EMPLOYES_RH    = "ea_employes_rh";
const K_CONTRATS       = "ea_contrats_generes";
const K_PROFIL         = "ea_profil_entreprise";
const K_PARAMS_CHARGES = "ea_params_charges";

export const PARAMETRES_CHARGES_DEFAUT: ParametresCharges = {
  taux_patronal: 30,
  cotisation_cibtp: 20,
  oppbtp: 0.11,
  chomage_intemp: 0.65,
  prevoyance_probtp: 2.80,
  atmp: 3.50,
  mutuelle_mensuelle: 30,
  indemnite_trajet: 80,
  indemnite_repas: 200,
  cout_premier_embauche: 350,
};

export function loadProfilEntreprise(): ProfilEntreprise {
  try {
    const s = localStorage.getItem(K_PROFIL);
    return s ? JSON.parse(s) : { nom: "", siret: "", adresse: "", telephone: "", email: "" };
  } catch { return { nom: "", siret: "", adresse: "", telephone: "", email: "" }; }
}
export function saveProfilEntreprise(p: ProfilEntreprise): void {
  localStorage.setItem(K_PROFIL, JSON.stringify(p));
}

export function loadParametresCharges(): ParametresCharges {
  try {
    const s = localStorage.getItem(K_PARAMS_CHARGES);
    return s ? { ...PARAMETRES_CHARGES_DEFAUT, ...JSON.parse(s) } : PARAMETRES_CHARGES_DEFAUT;
  } catch { return PARAMETRES_CHARGES_DEFAUT; }
}
export function saveParametresCharges(p: ParametresCharges): void {
  localStorage.setItem(K_PARAMS_CHARGES, JSON.stringify(p));
}

export function loadEmployesRH(): EmployeRH[] {
  try { return JSON.parse(localStorage.getItem(K_EMPLOYES_RH) ?? "[]"); }
  catch { return []; }
}
export function addEmployeRH(data: Omit<EmployeRH, "id" | "created_at">): EmployeRH {
  const e: EmployeRH = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data };
  const list = loadEmployesRH();
  list.unshift(e);
  localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  return e;
}
export function updateEmployeRH(id: string, data: Partial<Omit<EmployeRH, "id" | "created_at">>): void {
  const list = loadEmployesRH();
  const i = list.findIndex(e => e.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  }
}

export function loadContratsGeneres(): ContratGenere[] {
  try { return JSON.parse(localStorage.getItem(K_CONTRATS) ?? "[]"); }
  catch { return []; }
}
export function addContratGenere(data: Omit<ContratGenere, "id" | "date_generation">): ContratGenere {
  const c: ContratGenere = { id: crypto.randomUUID(), date_generation: new Date().toISOString(), ...data };
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
  try { return JSON.parse(localStorage.getItem(K_AVANTAGES) ?? "[]"); }
  catch { return []; }
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
  const i = list.findIndex(a => a.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
  }
}
export function removeAvantage(id: string): void {
  const list = loadAvantages().filter(a => a.id !== id);
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
}
