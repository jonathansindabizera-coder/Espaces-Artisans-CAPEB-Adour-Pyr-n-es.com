const K_CLIENTS = "ea_clients";
const K_CHANTIERS = "ea_chantiers";
const DATA_EVENT = "ea_data_updated";
function loadClients() {
  try {
    return JSON.parse(localStorage.getItem(K_CLIENTS) ?? "[]");
  } catch {
    return [];
  }
}
function loadChantiers() {
  try {
    return JSON.parse(localStorage.getItem(K_CHANTIERS) ?? "[]");
  } catch {
    return [];
  }
}
function addClient(data) {
  const c = { id: crypto.randomUUID(), ...data };
  const list = loadClients();
  list.push(c);
  localStorage.setItem(K_CLIENTS, JSON.stringify(list));
  return c;
}
function addChantier(data) {
  const c = { id: crypto.randomUUID(), date_creation: (/* @__PURE__ */ new Date()).toISOString(), ...data };
  const list = loadChantiers();
  list.unshift(c);
  localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  return c;
}
function updateChantierStatut(id, statut) {
  const list = loadChantiers();
  const i = list.findIndex((c) => c.id === id);
  if (i !== -1) {
    list[i].statut = statut;
    localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  }
}
function updateChantier(id, data) {
  const list = loadChantiers();
  const i = list.findIndex((c) => c.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_CHANTIERS, JSON.stringify(list));
  }
}
function notifyUpdate() {
  window.dispatchEvent(new Event(DATA_EVENT));
}
const K_EMPLOYES_RH = "ea_employes_rh";
const K_CONTRATS = "ea_contrats_generes";
const K_PROFIL = "ea_profil_entreprise";
const K_PARAMS_CHARGES = "ea_params_charges";
const PARAMETRES_CHARGES_DEFAUT = {
  taux_patronal: 30,
  cotisation_cibtp: 20,
  oppbtp: 0.11,
  chomage_intemp: 0.65,
  prevoyance_probtp: 2.8,
  atmp: 3.5,
  mutuelle_mensuelle: 30,
  indemnite_trajet: 80,
  indemnite_repas: 200,
  cout_premier_embauche: 350
};
function loadProfilEntreprise() {
  try {
    const s = localStorage.getItem(K_PROFIL);
    return s ? JSON.parse(s) : { nom: "", siret: "", adresse: "", telephone: "", email: "" };
  } catch {
    return { nom: "", siret: "", adresse: "", telephone: "", email: "" };
  }
}
function saveProfilEntreprise(p) {
  localStorage.setItem(K_PROFIL, JSON.stringify(p));
}
function loadParametresCharges() {
  try {
    const s = localStorage.getItem(K_PARAMS_CHARGES);
    return s ? { ...PARAMETRES_CHARGES_DEFAUT, ...JSON.parse(s) } : PARAMETRES_CHARGES_DEFAUT;
  } catch {
    return PARAMETRES_CHARGES_DEFAUT;
  }
}
function saveParametresCharges(p) {
  localStorage.setItem(K_PARAMS_CHARGES, JSON.stringify(p));
}
function loadEmployesRH() {
  try {
    return JSON.parse(localStorage.getItem(K_EMPLOYES_RH) ?? "[]");
  } catch {
    return [];
  }
}
function addEmployeRH(data) {
  const e = { id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString(), ...data };
  const list = loadEmployesRH();
  list.unshift(e);
  localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  return e;
}
function updateEmployeRH(id, data) {
  const list = loadEmployesRH();
  const i = list.findIndex((e) => e.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_EMPLOYES_RH, JSON.stringify(list));
  }
}
function loadContratsGeneres() {
  try {
    return JSON.parse(localStorage.getItem(K_CONTRATS) ?? "[]");
  } catch {
    return [];
  }
}
function addContratGenere(data) {
  const c = { id: crypto.randomUUID(), date_generation: (/* @__PURE__ */ new Date()).toISOString(), ...data };
  const list = loadContratsGeneres();
  list.unshift(c);
  localStorage.setItem(K_CONTRATS, JSON.stringify(list));
  return c;
}
const K_AVANTAGES = "ea_avantages_capeb";
function loadAvantages() {
  try {
    return JSON.parse(localStorage.getItem(K_AVANTAGES) ?? "[]");
  } catch {
    return [];
  }
}
function replaceAvantages(list) {
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
}
function addAvantage(data) {
  const a = { id: crypto.randomUUID(), ...data };
  const list = loadAvantages();
  list.push(a);
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
  return a;
}
function updateAvantage(id, data) {
  const list = loadAvantages();
  const i = list.findIndex((a) => a.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...data };
    localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
  }
}
function removeAvantage(id) {
  const list = loadAvantages().filter((a) => a.id !== id);
  localStorage.setItem(K_AVANTAGES, JSON.stringify(list));
}
const K_ABSENCES = "ea_absences";
const K_AFFECTATIONS = "ea_affectations";
function loadAbsences() {
  try {
    return JSON.parse(localStorage.getItem(K_ABSENCES) ?? "[]");
  } catch {
    return [];
  }
}
function addAbsence(data) {
  const a = { id: crypto.randomUUID(), ...data };
  const list = loadAbsences();
  list.push(a);
  localStorage.setItem(K_ABSENCES, JSON.stringify(list));
  return a;
}
function removeAbsence(id) {
  const list = loadAbsences().filter((a) => a.id !== id);
  localStorage.setItem(K_ABSENCES, JSON.stringify(list));
}
function loadAffectations() {
  try {
    return JSON.parse(localStorage.getItem(K_AFFECTATIONS) ?? "[]");
  } catch {
    return [];
  }
}
function addAffectation(data) {
  const a = { id: crypto.randomUUID(), ...data };
  const list = loadAffectations();
  list.push(a);
  localStorage.setItem(K_AFFECTATIONS, JSON.stringify(list));
  return a;
}
function removeAffectation(id) {
  const list = loadAffectations().filter((a) => a.id !== id);
  localStorage.setItem(K_AFFECTATIONS, JSON.stringify(list));
}
export {
  removeAvantage as A,
  DATA_EVENT as D,
  PARAMETRES_CHARGES_DEFAUT as P,
  loadEmployesRH as a,
  loadContratsGeneres as b,
  loadParametresCharges as c,
  saveParametresCharges as d,
  addContratGenere as e,
  addEmployeRH as f,
  loadChantiers as g,
  loadClients as h,
  addClient as i,
  addChantier as j,
  loadAbsences as k,
  loadProfilEntreprise as l,
  loadAffectations as m,
  notifyUpdate as n,
  addAbsence as o,
  updateEmployeRH as p,
  updateChantier as q,
  removeAbsence as r,
  saveProfilEntreprise as s,
  addAffectation as t,
  updateChantierStatut as u,
  removeAffectation as v,
  loadAvantages as w,
  replaceAvantages as x,
  addAvantage as y,
  updateAvantage as z
};
