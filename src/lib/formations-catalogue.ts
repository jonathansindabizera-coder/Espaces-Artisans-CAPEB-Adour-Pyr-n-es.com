export type FormationCapeb = {
  external_id: string;
  titre: string;
  lieu: string | null;
  theme: string;
  date_debut: string | null;
  duree_texte: string | null;
  description: string | null;
  url_programme_pdf: string | null;
  url_ics: string;
};

function session(
  external_id: string,
  titre: string,
  lieu: string,
  date_debut: string,
): FormationCapeb {
  return {
    external_id,
    titre,
    lieu,
    theme: "",
    date_debut: `${date_debut}T09:00:00`,
    duree_texte: null,
    description: null,
    url_programme_pdf: null,
    url_ics: "",
  };
}

// Catalogue 2026 - CAPEB Adour-Pyrénées (déjà trié par date croissante)
export const FORMATIONS_CATALOGUE: FormationCapeb[] = [
  session("cat-2026-01", "INFORMATIQUE POUR LES ARTISANS CAPEB LESCAR", "Lescar", "2026-06-17"),
  session("cat-2026-02", "QUALIPAC POMPE A CHALEUR CAPEB LESCAR", "Lescar", "2026-06-23"),
  session("cat-2026-03", "FACTURATION ELECTRONIQUE POUR LES TPE ARTISANALES CAPEB ANGLET", "Anglet", "2026-06-30"),
  session("cat-2026-04", "SOUDURE SUR CUIVRE ET ACIER PAU", "Pau", "2026-07-06"),
  session("cat-2026-05", "HANDIBAT CAPEB LESCAR", "Lescar", "2026-09-07"),
  session("cat-2026-06", "HABILITATION ELECTRIQUE NON ELECTRICIEN CAPEB ANGLET", "Anglet", "2026-09-07"),
  session("cat-2026-07", "QUALIPV ELEC CAPEB LESCAR", "Lescar", "2026-09-08"),
  session("cat-2026-08", "RGE RENOPERF CAPEB LESCAR", "Lescar", "2026-09-16"),
  session("cat-2026-09", "HABILITATION ELECTRIQUE NON-ELECTRICIEN CAPEB TARBES", "Tarbes", "2026-09-17"),
  session("cat-2026-10", "PILOTER EFFICACEMENT SON ENTREPRISE ARTISANALE CAPEB LESCAR", "Lescar", "2026-09-28"),
  session("cat-2026-11", "QUALIGAZ CAPEB LESCAR", "Lescar", "2026-09-29"),
  session("cat-2026-12", "Se faire connaître et reconnaître grâce aux réseaux sociaux CAPEB LESCAR", "Lescar", "2026-10-05"),
  session("cat-2026-13", "RGE RENOPERF CAPEB ANGLET", "Anglet", "2026-10-05"),
  session("cat-2026-14", "SST (Sauveteur secouriste du travail) CAPEB ANGLET", "Anglet", "2026-10-05"),
  session("cat-2026-15", "DEPANNAGE ET PERFECTIONNEMENT CLIMATISATION ET POMPES A CHALEUR CAPEB LESCAR", "Lescar", "2026-10-06"),
  session("cat-2026-16", "QUALIPV BAT CAPEB LESCAR", "Lescar", "2026-10-07"),
  session("cat-2026-17", "QUALIBOIS AIR CAPEB LESCAR", "Lescar", "2026-10-14"),
  session("cat-2026-18", "SST (Secouriste sauveteur du travail) CAPEB TARBES", "Tarbes", "2026-10-19"),
  session("cat-2026-19", "SOUDURE SUR CUIVRE ET ACIER PAU", "Pau", "2026-10-26"),
  session("cat-2026-20", "FLUIDES FRIGORIGENES CAPEB LESCAR", "Lescar", "2026-10-27"),
  session("cat-2026-21", "QUALIGAZ CAPEB ANGLET", "Anglet", "2026-10-28"),
  session("cat-2026-22", "HABILITATION ELECTRIQUE ELECTRICIEN CAPEB ANGLET", "Anglet", "2026-11-03"),
  session("cat-2026-23", "QUALIPAC POMPE A CHALEUR CAPEB LESCAR", "Lescar", "2026-11-05"),
  session("cat-2026-24", "RGE RENOPERF CAPEB TARBES", "Tarbes", "2026-11-16"),
  session("cat-2026-25", "QUALIBOIS EAU CAPEB LESCAR", "Lescar", "2026-11-17"),
  session("cat-2026-26", "HABILITATION ELECTRIQUE ELECTRICIEN TARBES", "Tarbes", "2026-11-18"),
  session("cat-2026-27", "SST (Sauveteur secouriste du travail) CAPEB LESCAR", "Lescar", "2026-11-23"),
  session("cat-2026-28", "QUALIGAZ CAPEB TARBES", "Tarbes", "2026-11-25"),
  session("cat-2026-29", "IRVE NIVEAU 1 et 2 CAPEB LESCAR", "Lescar", "2026-12-01"),
  session("cat-2026-30", "TRAVAIL EN HAUTEUR CAPEB TARBES", "Tarbes", "2026-12-04"),
  session("cat-2026-31", "RGE RENOPERF CAPEB LESCAR", "Lescar", "2026-12-07"),
  session("cat-2026-32", "QUALIPV ELEC CAPEB LESCAR", "Lescar", "2026-12-08"),
];
