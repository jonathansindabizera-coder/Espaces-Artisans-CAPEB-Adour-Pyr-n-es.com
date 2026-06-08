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
