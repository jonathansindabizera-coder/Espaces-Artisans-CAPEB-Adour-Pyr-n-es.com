export type ContratTemplate = {
  id: string;
  titre: string;
  description: string;
  champsSpecifiques: string[];
  texte: string;
};

const DISCLAIMER =
  "MODÈLE INDICATIF — À personnaliser et à faire valider par un juriste avant signature. " +
  "La CAPEB et cette application déclinent toute responsabilité quant à l'usage de ce document. " +
  "En cas de doute, contactez le service juridique CAPEB Adour-Pyrénées.";

export const CONTRAT_TEMPLATES: ContratTemplate[] = [
  // ── CDI Ouvrier ────────────────────────────────────────────────────────────
  {
    id: "cdi_ouvrier",
    titre: "CDI Ouvrier du bâtiment",
    description: "Convention Collective Nationale du Bâtiment – Ouvriers (IDCC 1596 / 1597)",
    champsSpecifiques: [],
    texte: `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE
Convention Collective Nationale du Bâtiment — Ouvriers

[${DISCLAIMER}]

ENTRE :

{{entreprise_nom}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}
ci-après désignée « l'Employeur »,

ET :

M./Mme {{salarie_prenom}} {{salarie_nom}}
Demeurant : {{salarie_adresse}}
ci-après désigné(e) « le Salarié »,

IL EST CONVENU CE QUI SUIT :

Article 1 — Engagement
L'employeur engage M./Mme {{salarie_prenom}} {{salarie_nom}} à compter du {{date_debut}}, pour une durée indéterminée, en qualité de {{poste}}, coefficient {{qualification}}, conformément aux dispositions de la Convention Collective Nationale des Ouvriers du Bâtiment.

Article 2 — Durée du travail
La durée hebdomadaire de travail est fixée à {{duree_hebdo}} heures.

Article 3 — Rémunération
La rémunération brute mensuelle est fixée à {{salaire_brut_mensuel}} € pour {{duree_hebdo}} heures hebdomadaires.

Article 4 — Période d'essai
Une période d'essai de deux (2) mois est convenue. Elle est renouvelable une fois, par accord écrit des parties.

Article 5 — Lieu de travail
Le lieu de travail est celui des chantiers désignés par l'employeur dans le cadre de l'activité de l'entreprise.

Article 6 — Convention collective
Le présent contrat est soumis aux dispositions de la Convention Collective Nationale du Bâtiment applicable aux ouvriers (IDCC 1596 et 1597), ainsi qu'aux accords régionaux en vigueur.

Article 7 — Congés payés
Le Salarié bénéficie des congés payés légaux et conventionnels, gérés par la caisse de congés payés du bâtiment compétente.

Fait à {{lieu}}, le {{date_signature}}, en deux exemplaires originaux.

L'Employeur                                          Le Salarié
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`,
  },

  // ── CDD Ouvrier ────────────────────────────────────────────────────────────
  {
    id: "cdd_ouvrier",
    titre: "CDD Ouvrier du bâtiment",
    description: "Contrat à durée déterminée — Convention Collective Bâtiment Ouvriers",
    champsSpecifiques: ["motif_cdd", "date_fin_cdd"],
    texte: `CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE
Convention Collective Nationale du Bâtiment — Ouvriers

[${DISCLAIMER}]

ENTRE :

{{entreprise_nom}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}
ci-après désignée « l'Employeur »,

ET :

M./Mme {{salarie_prenom}} {{salarie_nom}}
Demeurant : {{salarie_adresse}}
ci-après désigné(e) « le Salarié »,

IL EST CONVENU CE QUI SUIT :

Article 1 — Objet et motif du recours au CDD
Le présent contrat est conclu pour une durée déterminée, conformément à l'article L. 1242-2 du Code du travail.
Motif de recours : {{motif_cdd}}

Article 2 — Durée du contrat
Le contrat prend effet le {{date_debut}} et prend fin le {{date_fin_cdd}}.

Article 3 — Emploi et qualification
Le Salarié est engagé en qualité de {{poste}}, coefficient {{qualification}}.

Article 4 — Durée du travail
La durée hebdomadaire de travail est fixée à {{duree_hebdo}} heures.

Article 5 — Rémunération
La rémunération brute mensuelle est fixée à {{salaire_brut_mensuel}} € pour {{duree_hebdo}} heures hebdomadaires.

Article 6 — Indemnité de fin de contrat
À l'issue du présent contrat, le Salarié bénéficiera d'une indemnité de fin de contrat égale à 10 % de la rémunération totale brute perçue (sauf si embauche en CDI ou si le contrat est rompu pour faute grave).

Article 7 — Convention collective
La Convention Collective Nationale du Bâtiment Ouvriers (IDCC 1596 et 1597) est applicable au présent contrat.

Fait à {{lieu}}, le {{date_signature}}, en deux exemplaires originaux.

L'Employeur                                          Le Salarié
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`,
  },

  // ── Contrat d'apprentissage ────────────────────────────────────────────────
  {
    id: "apprentissage",
    titre: "Contrat d'apprentissage",
    description: "Formation en alternance – Art. L. 6221-1 et suivants du Code du travail",
    champsSpecifiques: ["date_naissance", "date_fin_cdd", "nom_cfa"],
    texte: `CONTRAT D'APPRENTISSAGE
[Art. L. 6221-1 et suivants du Code du travail]

[${DISCLAIMER}]

ENTRE :

{{entreprise_nom}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}
ci-après désignée « l'Entreprise »,

ET :

M./Mme {{salarie_prenom}} {{salarie_nom}}
Né(e) le {{date_naissance}}
Demeurant : {{salarie_adresse}}
ci-après désigné(e) « l'Apprenti(e) »,

IL EST CONVENU CE QUI SUIT :

Article 1 — Objet
Le présent contrat a pour objet de préparer l'apprenti(e) à l'obtention du diplôme/titre : {{qualification}}.
Centre de Formation des Apprentis (CFA) : {{nom_cfa}}

Article 2 — Durée du contrat
Le contrat d'apprentissage est conclu pour la durée de la formation, du {{date_debut}} au {{date_fin_cdd}}.

Article 3 — Maître d'apprentissage
Le maître d'apprentissage désigné au sein de l'entreprise est : {{poste}}.
Il accompagne l'apprenti(e) dans l'acquisition des compétences professionnelles tout au long de la formation.

Article 4 — Durée du travail
La durée hebdomadaire de travail est fixée à {{duree_hebdo}} heures, dont une partie en entreprise et une partie au CFA.

Article 5 — Rémunération
La rémunération brute mensuelle est fixée à {{salaire_brut_mensuel}} €, conformément aux dispositions légales et conventionnelles applicables aux apprentis.

Article 6 — Convention collective
La Convention Collective Nationale du Bâtiment Ouvriers (IDCC 1596 et 1597) est applicable au présent contrat.

Fait à {{lieu}}, le {{date_signature}}, en deux exemplaires originaux.

L'Entreprise                                         L'Apprenti(e) (ou son représentant légal)
(Signature + cachet)                                 (Signature précédée de « Lu et approuvé »)`,
  },

  // ── Avenant ───────────────────────────────────────────────────────────────
  {
    id: "avenant",
    titre: "Avenant au contrat de travail",
    description: "Modification des conditions du contrat en cours",
    champsSpecifiques: [],
    texte: `AVENANT AU CONTRAT DE TRAVAIL

[${DISCLAIMER}]

ENTRE :

{{entreprise_nom}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}
ci-après désignée « l'Employeur »,

ET :

M./Mme {{salarie_prenom}} {{salarie_nom}}
Demeurant : {{salarie_adresse}}
ci-après désigné(e) « le Salarié »,

IL EST CONVENU CE QUI SUIT :

Article 1 — Objet de l'avenant
Le présent avenant modifie les conditions du contrat de travail à compter du {{date_debut}}.

Article 2 — Modifications apportées

Intitulé du poste : {{poste}}
Qualification / coefficient : {{qualification}}
Rémunération brute mensuelle : {{salaire_brut_mensuel}} €
Durée hebdomadaire de travail : {{duree_hebdo}} heures

Article 3 — Dispositions maintenues
Toutes les autres clauses du contrat de travail initial et de ses éventuels avenants antérieurs demeurent inchangées et restent pleinement en vigueur.

Fait à {{lieu}}, le {{date_signature}}, en deux exemplaires originaux.

L'Employeur                                          Le Salarié
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`,
  },
];
