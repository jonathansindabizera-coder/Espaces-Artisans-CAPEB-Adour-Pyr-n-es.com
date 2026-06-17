export type CategorieDocument = "contrat" | "suivi-chantier" | "legal" | "recouvrement" | "reference";
export type TypeAction = "lecture" | "generation" | "lien-interne";

export type ModeleDocument = {
  id: string;
  titre: string;
  description: string;
  categorie: CategorieDocument;
  icone: string;
  typeAction: TypeAction;
  fichierSource: string | null;
  templateId: string | null;
  lienInterne: string | null;
  estEnvoyableParMail: boolean;
  avertissement: string | null;
};

export const DOCUMENTS_CATALOGUE: ModeleDocument[] = [
  {
    id: "pv",
    titre: "PV de réception de travaux",
    description:
      "Rédigez, faites signer et archivez les procès-verbaux de réception de vos chantiers directement depuis le module dédié.",
    categorie: "suivi-chantier",
    icone: "FileSignature",
    typeAction: "lien-interne",
    fichierSource: null,
    templateId: null,
    lienInterne: "/pv",
    estEnvoyableParMail: false,
    avertissement: null,
  },
  {
    id: "cgv",
    titre: "Conditions Générales de Vente (CGV)",
    description:
      "Modèle de CGV pour le secteur du bâtiment, pré-rempli avec vos informations d'entreprise : devis, assurance décennale, paiement, rétractation, garanties légales.",
    categorie: "legal",
    icone: "ScrollText",
    typeAction: "generation",
    fichierSource: null,
    templateId: "cgv",
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement:
      "Document généré à partir de vos informations. Faites-le valider par un professionnel du droit avant diffusion à vos clients.",
  },
  {
    id: "carnet-chantier",
    titre: "Carnet de chantier",
    description:
      "Suivi journalier du chantier : intervenants, travaux réalisés, aléas, réserves. Sert de preuve en cas de litige.",
    categorie: "suivi-chantier",
    icone: "BookOpen",
    typeAction: "lecture",
    fichierSource: "/documents/carnet-de-chantier.pdf",
    templateId: null,
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement: null,
  },
  {
    id: "retractation",
    titre: "Formulaire de rétractation",
    description:
      "À joindre obligatoirement à tout devis signé au domicile du client. Sans ce formulaire, le délai de rétractation passe de 14 jours à 12 mois.",
    categorie: "legal",
    icone: "RotateCcw",
    typeAction: "lecture",
    fichierSource: "/documents/formulaire-retractation.pdf",
    templateId: null,
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement:
      "Modèle basé sur le Code de la consommation (art. L.221-18 et s.), à faire valider par un juriste.",
  },
  {
    id: "mentions-obligatoires",
    titre: "Mentions obligatoires devis & facture",
    description:
      "Aide-mémoire pour vérifier que vos devis et factures contiennent toutes les mentions légales 2026 (assurance décennale, TVA, numérotation...).",
    categorie: "legal",
    icone: "ClipboardCheck",
    typeAction: "lecture",
    fichierSource: "/documents/mentions-obligatoires-devis-facture.pdf",
    templateId: null,
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement: null,
  },
  {
    id: "mise-en-demeure",
    titre: "Mise en demeure de payer",
    description:
      "Générez une lettre de mise en demeure pré-remplie depuis un dossier client, pour relancer une facture impayée.",
    categorie: "recouvrement",
    icone: "AlertTriangle",
    typeAction: "generation",
    fichierSource: null,
    templateId: "mise_en_demeure",
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement: null,
  },
  {
    id: "sous-traitance",
    titre: "Contrat de sous-traitance BTP",
    description:
      "Modèle de contrat conforme à la loi de 1975 sur la sous-traitance (agrément du maître d'ouvrage, garantie de paiement), pré-rempli avec vos informations d'entreprise.",
    categorie: "contrat",
    icone: "Handshake",
    typeAction: "generation",
    fichierSource: null,
    templateId: "sous_traitance",
    lienInterne: null,
    estEnvoyableParMail: true,
    avertissement:
      "⚠️ Document juridiquement sensible. Des modèles déjà validés existent auprès de la CAPEB et de la FFB — contactez Nicolas Souard avant utilisation sur un chantier réel.",
  },
];

export type FicheDTU = {
  numero: string;
  titre: string;
  metier: string;
};

export const DTU_REFERENCE: FicheDTU[] = [
  { numero: "DTU 13.1 / 13.2", titre: "Fondations superficielles / profondes", metier: "Gros œuvre, maçonnerie" },
  { numero: "DTU 20.1", titre: "Ouvrages en maçonnerie de petits éléments", metier: "Maçonnerie" },
  { numero: "DTU 21", titre: "Exécution des ouvrages en béton", metier: "Gros œuvre" },
  { numero: "DTU 23.1", titre: "Murs en béton banché", metier: "Gros œuvre" },
  { numero: "DTU 24.1", titre: "Travaux de fumisterie (conduits de fumée)", metier: "Chauffage, fumisterie" },
  { numero: "DTU 25.1 / 25.41", titre: "Ouvrages en plaques de plâtre", metier: "Plâtrerie, second œuvre" },
  { numero: "DTU 26.1", titre: "Travaux d'enduits de mortiers", metier: "Maçonnerie, façade" },
  { numero: "DTU 31.2", titre: "Construction de maisons à structure en bois", metier: "Charpente, ossature bois" },
  { numero: "DTU 36.5", titre: "Mise en œuvre des fenêtres et portes extérieures", metier: "Menuiserie" },
  { numero: "DTU 40.x", titre: "Couverture (tuiles, ardoises, étanchéité)", metier: "Couverture, étanchéité" },
  { numero: "DTU 41.2", titre: "Revêtements extérieurs en bois (bardages)", metier: "Bardage, façade bois" },
  { numero: "DTU 43.x", titre: "Étanchéité des toitures-terrasses", metier: "Étanchéité" },
  { numero: "DTU 45.x", titre: "Isolation thermique des bâtiments", metier: "Isolation" },
  { numero: "DTU 51.x", titre: "Parquets et revêtements de sol bois", metier: "Sols, parquet" },
  { numero: "DTU 52.x", titre: "Revêtements de sols scellés (carrelage)", metier: "Carrelage, sols durs" },
  { numero: "DTU 59.x / 60.x", titre: "Peinture / Plomberie sanitaire", metier: "Peinture, plomberie" },
  { numero: "DTU 65.x", titre: "Chauffage, climatisation, génie climatique", metier: "Chauffage, climatisation" },
  { numero: "DTU 70.1", titre: "Installations électriques (avec NF C 15-100)", metier: "Électricité" },
];
