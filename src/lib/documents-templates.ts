export type DocumentTemplate = {
  id: string;
  titre: string;
  texte: string;
  champsAutoRemplissables: string[];
  champsManuels: {
    key: string;
    label: string;
    type?: string;
    defaut?: string;
    options?: string[];
  }[];
};

export const DOCUMENTS_TEMPLATES: DocumentTemplate[] = [
  // ── CGV ─────────────────────────────────────────────────────────────────────
  {
    id: "cgv",
    titre: "Conditions Générales de Vente — Marché privé de travaux",
    champsAutoRemplissables: [
      "entreprise_nom", "entreprise_siret", "entreprise_adresse",
      "forme_juridique", "nom_assureur", "num_police",
    ],
    champsManuels: [
      { key: "zone_couverture",       label: "Zone de couverture géographique",    type: "text",   defaut: "Pyrénées-Atlantiques (64) et Hautes-Pyrénées (65)" },
      { key: "activites_couvertes",   label: "Activités couvertes",                type: "text",   defaut: "Travaux de bâtiment, second œuvre et rénovation" },
      { key: "duree_validite_devis",  label: "Durée de validité des devis (jours)",type: "number", defaut: "30" },
      { key: "taux_acompte",          label: "Taux d'acompte (%)",                 type: "number", defaut: "30" },
      { key: "coordonnees_mediateur", label: "Coordonnées du médiateur",           type: "text",   defaut: "Médiateur de la Consommation CAPEB — mediation@capeb.fr" },
      { key: "ville_tribunal",        label: "Ville du tribunal compétent",        type: "text",   defaut: "Pau" },
      { key: "lieu",                  label: "Lieu de signature",                  type: "text" },
      { key: "date_signature",        label: "Date",                               type: "date" },
    ],
    texte: `CONDITIONS GÉNÉRALES DE VENTE
Marché privé de travaux de bâtiment

{{entreprise_nom}} — {{forme_juridique}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}

Article 1 — Objet et champ d'application
Les présentes conditions générales de vente (CGV) s'appliquent à toute relation commerciale entre {{entreprise_nom}} (ci-après « l'Entreprise ») et tout client pour des travaux de bâtiment dans la zone suivante : {{zone_couverture}}, dans les corps de métier suivants : {{activites_couvertes}}.
Toute commande implique l'acceptation sans réserve de ces CGV.

Article 2 — Devis
Tout devis est valable {{duree_validite_devis}} jours à compter de sa date d'émission. Passé ce délai, l'Entreprise peut réviser ses tarifs. La signature du devis par le Client, avec la mention « Bon pour accord », vaut acceptation des présentes CGV.

Article 3 — Prix et TVA
Les prix sont exprimés en euros hors taxes (HT). La TVA applicable est celle en vigueur au jour de la réalisation des travaux. Toute modification légale de la TVA sera répercutée sur la facture.

Article 4 — Acompte et modalités de paiement
Un acompte de {{taux_acompte}} % du montant HT est exigible à la signature du devis. Le solde est dû à la réception des travaux. Tout retard de paiement entraîne, de plein droit, des intérêts de retard au taux légal majoré de 3 points, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L.441-10 C. com.).

Article 5 — Délai d'exécution
Les délais indiqués dans le devis sont donnés à titre indicatif. L'Entreprise ne saurait être tenue responsable d'un retard dû à des causes extérieures (intempéries, approvisionnement, décision administrative, cas de force majeure).

Article 6 — Réception des travaux
À l'achèvement des travaux, une réception contradictoire est organisée. Les réserves éventuelles sont consignées dans un procès-verbal. La réception marque le point de départ des garanties légales.

Article 7 — Assurance de responsabilité décennale
Conformément à l'article L.241-1 du Code des assurances, l'Entreprise est couverte par une assurance décennale auprès de {{nom_assureur}}, police n° {{num_police}}, pour les activités des présentes CGV.

Article 8 — Droit de rétractation (contrats hors établissement)
Conformément aux articles L.221-18 et s. du Code de la consommation, si le contrat est conclu au domicile du Client ou hors établissement, le Client dispose d'un délai de rétractation de 14 jours. Un formulaire de rétractation lui est remis conformément à l'article L.221-9.

Article 9 — Garanties légales
L'Entreprise est tenue aux garanties légales de parfait achèvement (1 an), biennale des éléments d'équipement (2 ans) et décennale (10 ans), à compter de la date de réception.

Article 10 — Responsabilité
La responsabilité de l'Entreprise ne peut être engagée qu'en cas de faute prouvée. Elle ne couvre pas les dommages résultant d'une mauvaise utilisation par le Client, d'une intervention extérieure ou d'un cas de force majeure.

Article 11 — Litiges — Médiation
En cas de différend, les parties tenteront une résolution amiable. Le Client consommateur peut saisir le médiateur désigné : {{coordonnees_mediateur}}. À défaut de solution amiable, le tribunal compétent sera celui de {{ville_tribunal}}.

Fait à {{lieu}}, le {{date_signature}}.

{{entreprise_nom}}`,
  },

  // ── MISE EN DEMEURE ─────────────────────────────────────────────────────────
  {
    id: "mise_en_demeure",
    titre: "Mise en demeure de payer",
    champsAutoRemplissables: [
      "entreprise_nom", "entreprise_siret", "entreprise_adresse",
      "client_nom", "client_adresse", "description_travaux",
    ],
    champsManuels: [
      { key: "numero_facture",    label: "Numéro de facture",                  type: "text" },
      { key: "montant_facture",   label: "Montant de la facture (€ TTC)",       type: "text" },
      { key: "date_facture",      label: "Date de la facture",                  type: "date" },
      { key: "nombre_jours_retard", label: "Nombre de jours de retard",         type: "number" },
      { key: "montant_total_du",  label: "Montant total dû (€ TTC)",             type: "text" },
      { key: "lieu",              label: "Lieu de rédaction",                   type: "text" },
      { key: "date_signature",    label: "Date",                                type: "date" },
    ],
    texte: `MISE EN DEMEURE DE PAYER
À envoyer en lettre recommandée avec accusé de réception

{{entreprise_nom}}
SIRET : {{entreprise_siret}}
{{entreprise_adresse}}

À l'attention de :
{{client_nom}}
{{client_adresse}}

{{lieu}}, le {{date_signature}}

Objet : Mise en demeure — Facture n° {{numero_facture}} — Montant dû : {{montant_total_du}} €

Madame, Monsieur,

Sauf erreur ou omission de notre part, nous constatons que la facture n° {{numero_facture}} du {{date_facture}}, d'un montant de {{montant_facture}} €, relative aux travaux de {{description_travaux}}, demeure impayée à ce jour, soit un retard de {{nombre_jours_retard}} jours.

Malgré nos relances amiables restées sans suite, nous nous voyons dans l'obligation de vous METTRE EN DEMEURE de nous régler la somme de {{montant_total_du}} € dans un délai de HUIT (8) JOURS à compter de la réception du présent courrier.

Conformément aux dispositions légales en vigueur (art. L.441-10 du Code de commerce), ce retard de paiement entraîne, de plein droit et sans mise en demeure préalable :
— des pénalités de retard au taux légal majoré de 3 points ;
— une indemnité forfaitaire pour frais de recouvrement de 40 € minimum.

À défaut de règlement dans le délai susmentionné, nous nous réserverons le droit d'engager toute procédure judiciaire nécessaire au recouvrement de notre créance, dont les frais et dépens resteront à votre charge.

Nous espérons que ce règlement interviendra sans qu'il soit nécessaire de recourir à de telles mesures.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

{{entreprise_nom}}`,
  },

  // ── CONTRAT DE SOUS-TRAITANCE ────────────────────────────────────────────────
  {
    id: "sous_traitance",
    titre: "Contrat de sous-traitance BTP — Marché privé",
    champsAutoRemplissables: [
      "entreprise_nom", "entreprise_siret", "entreprise_adresse",
      "adresse_chantier", "description_travaux",
    ],
    champsManuels: [
      { key: "sous_traitant_nom",              label: "Nom du sous-traitant",                 type: "text" },
      { key: "sous_traitant_forme_juridique",  label: "Forme juridique du sous-traitant",     type: "text" },
      { key: "sous_traitant_siret",            label: "SIRET du sous-traitant",               type: "text" },
      { key: "sous_traitant_adresse",          label: "Adresse du sous-traitant",             type: "text" },
      { key: "sous_traitant_gerant",           label: "Représentant du sous-traitant",        type: "text" },
      { key: "maitre_ouvrage_nom",             label: "Nom du maître d'ouvrage",              type: "text" },
      { key: "numero_devis_sous_traitant",     label: "N° devis sous-traitant",               type: "text" },
      { key: "date_devis_sous_traitant",       label: "Date du devis sous-traitant",          type: "date" },
      { key: "montant_travaux",                label: "Montant des travaux HT (€)",            type: "text" },
      { key: "modalites_paiement",             label: "Modalités de paiement",                type: "text", defaut: "Situations mensuelles à l'avancement" },
      { key: "date_debut",                     label: "Date de début des travaux",             type: "date" },
      { key: "date_fin",                       label: "Date de fin prévue des travaux",        type: "date" },
      { key: "ville_tribunal",                 label: "Ville du tribunal compétent",           type: "text", defaut: "Pau" },
      { key: "lieu",                           label: "Lieu de signature",                    type: "text" },
      { key: "date_signature",                 label: "Date de signature",                    type: "date" },
    ],
    texte: `CONTRAT DE SOUS-TRAITANCE
Marché privé de travaux

⚠ ATTENTION : la sous-traitance dans le BTP est encadrée par la loi n° 75-1334 du 31 décembre 1975, dont plusieurs obligations sont d'ordre public (agrément du maître d'ouvrage, garantie de paiement). Le non-respect de ces règles peut entraîner la nullité du contrat. Des modèles types existent auprès de la CAPEB et de la FFB : contactez votre pôle Juridique & Social avant d'utiliser ce modèle générique pour un chantier réel.

ENTRE LES SOUSSIGNÉS :

L'entrepreneur principal :
{{entreprise_nom}}, SIRET {{entreprise_siret}}
{{entreprise_adresse}}
ci-après désigné « l'Entrepreneur principal »,

ET

Le sous-traitant :
{{sous_traitant_nom}}, {{sous_traitant_forme_juridique}}, SIRET {{sous_traitant_siret}}
{{sous_traitant_adresse}}
représenté par {{sous_traitant_gerant}}
ci-après désigné « le Sous-traitant »,

IL EST CONVENU CE QUI SUIT :

Article 1 — Objet du contrat
L'Entrepreneur principal confie au Sous-traitant l'exécution des travaux suivants, dans le cadre du marché principal conclu avec {{maitre_ouvrage_nom}} pour le chantier situé {{adresse_chantier}} :

{{description_travaux}}

Article 2 — Pièces contractuelles
Le présent contrat est complété par les pièces suivantes : devis du Sous-traitant n° {{numero_devis_sous_traitant}} daté du {{date_devis_sous_traitant}}, plans et documents techniques annexés, le cas échéant copie des clauses applicables du marché principal.

Article 3 — Agrément du maître d'ouvrage (obligatoire — art. 3 de la loi du 31 décembre 1975)
Conformément à la loi du 31 décembre 1975, l'Entrepreneur principal s'engage à faire accepter le Sous-traitant et agréer ses conditions de paiement par le maître d'ouvrage AVANT le début d'exécution des travaux sous-traités. Le présent contrat ne peut produire effet sans cet agrément.

Article 4 — Garantie de paiement (obligatoire — art. 14 de la loi du 31 décembre 1975)
L'Entrepreneur principal s'engage à fournir au Sous-traitant, au plus tard à la conclusion du présent contrat, une caution bancaire personnelle et solidaire ou une délégation de paiement du maître d'ouvrage. À défaut, le présent contrat est nul de plein droit.

Article 5 — Prix et modalités de paiement
Le prix des travaux sous-traités est fixé à {{montant_travaux}} € HT. Modalités : {{modalites_paiement}}.

Article 6 — Délai d'exécution
Les travaux sous-traités seront exécutés du {{date_debut}} au {{date_fin}}, sous réserve des aléas du chantier principal et des contraintes de coordination avec les autres intervenants.

Article 7 — Assurances
Le Sous-traitant déclare être couvert par une assurance responsabilité civile décennale pour les activités objet du présent contrat et s'engage à en justifier sur demande.

Article 8 — Qualifications et obligations réglementaires
Le Sous-traitant déclare disposer des qualifications professionnelles requises (le cas échéant : RGE, Qualibat, Qualifelec…) et s'engage à fournir la carte d'identification professionnelle BTP de ses salariés ainsi que tout document de vigilance requis.

Article 9 — Responsabilité et garanties
Le Sous-traitant reste responsable de la bonne exécution des travaux qui lui sont confiés et des garanties légales afférentes (parfait achèvement, biennale, décennale).

Article 10 — Litiges
En cas de différend, les parties s'efforceront de trouver une solution amiable. À défaut, le tribunal compétent sera celui de {{ville_tribunal}}.

Fait à {{lieu}}, le {{date_signature}}, en deux exemplaires originaux.

L'Entrepreneur principal                     Le Sous-traitant
(Signature + cachet)                         (Signature + cachet)`,
  },
];
