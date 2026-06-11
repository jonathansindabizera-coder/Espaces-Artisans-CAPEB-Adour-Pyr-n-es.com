// Module « Marchés porteurs / Infos métier » — CAPEB Adour-Pyrénées.
// Contenu d'orientation : on informe et on renvoie vers la formation + le pôle CAPEB.
// PRINCIPE : aucune aide n'est présentée comme un montant garanti — toujours indicatif et « à vérifier ».
// Données réglementaires à jour : juin 2026 (à réviser périodiquement).

export type EtapeFiche = { label: string; detail: string };
export type LienPole = { pole: string; referent: string; email: string };

export type MarchePorteur = {
  id: string;
  titre: string;
  accroche: string;
  icone: string;   // nom d'icône lucide-react (fallback proche si introuvable)
  accent: string;  // couleur d'accent de la fiche (hex)
  marcheEnBref: string[];
  prerequis: string[];      // qualifications / obligations pour se positionner
  aides: string[];          // aides mobilisables — INDICATIVES
  aidesDisclaimer: string;  // avertissement obligatoire affiché près des aides
  vigilance: string[];      // pièges et points d'attention
  prochainesEtapes: EtapeFiche[];
  formations: string[];     // titres EXACTS correspondant au catalogue formations (pour lier)
  poles: LienPole[];        // pôles CAPEB à contacter
};

const POLE_QUALIF: LienPole = { pole: "Qualification", referent: "Virginie BORGES", email: "virginie.borges@capeb-adour-pyrenees.fr" };
const POLE_TECH: LienPole   = { pole: "Technique & Éco.", referent: "Guillaume PIGUÉ", email: "guillaume.pigue@capeb-adour-pyrenees.fr" };
const POLE_JURIDIQUE: LienPole = { pole: "Juridique & Social", referent: "Nicolas SOUARD", email: "nicolas.souard@capeb-adour-pyrenees.fr" };

export const MARCHES_PORTEURS: MarchePorteur[] = [
  // ───────────────────────────────────────── IRVE
  {
    id: "irve",
    titre: "Bornes de recharge (IRVE)",
    accroche: "Un marché réglementé et en forte croissance, où la qualification fait la différence.",
    icone: "Zap",
    accent: "#1E88E5",
    marcheEnBref: [
      "Le parc de véhicules électriques et hybrides rechargeables progresse vite, ce qui tire la demande de bornes chez les particuliers, en copropriété et en entreprise.",
      "La quasi-totalité des chantiers est concernée par l'obligation de qualification : une wallbox standard de 7 ou 11 kW dépasse déjà le seuil de 3,7 kW.",
      "Marché idéal pour diversifier et augmenter le panier moyen en le couplant au photovoltaïque, à la pompe à chaleur et au stockage.",
    ],
    prerequis: [
      "Qualification IRVE (mention) OBLIGATOIRE pour toute installation > 3,7 kW (arrêté du 27 octobre 2021, toujours en vigueur).",
      "Trois niveaux : P1 et P2 (jusqu'à 22 kW), P3 (charge rapide > 22 kW). Mention valable 4 ans, avec certificat annuel.",
      "Délivrée par un organisme accrédité : Qualifelec, AFNOR ou Qualit'EnR.",
      "Sans elle : responsabilité civile et pénale en cas de sinistre, assurance décennale potentiellement invalidée, et le client perd l'accès aux aides et à la TVA à 5,5 %.",
    ],
    aides: [
      "ADVENIR est la principale aide active en 2026, pour la copropriété et le collectif (le crédit d'impôt à domicile a pris fin le 31 décembre 2025).",
      "En copropriété, le plafond pour une borne individuelle a été revalorisé au 1er avril 2026 (jusqu'à 1 000 € HT par point, dans la limite de 50 % du coût).",
      "Programme prolongé jusqu'en 2027. TVA à 5,5 % sous conditions. Les maisons individuelles ne sont pas éligibles à ADVENIR.",
    ],
    aidesDisclaimer:
      "Barèmes ADVENIR indicatifs et révisés régulièrement (dernière revalorisation le 1er avril 2026). À confirmer sur la plateforme officielle ADVENIR et auprès de votre pôle CAPEB avant chaque devis.",
    vigilance: [
      "La copropriété est le principal frein : le devis doit être voté en AG avant toute demande de prime, et le « droit à la prise » individuel ne déclenche pas automatiquement l'éligibilité collective.",
      "Bien dater le dossier (la prime dépend de la date de signature) et anticiper l'adaptation éventuelle du contrat d'électricité du client.",
      "Savoir justifier un prix d'installation certifiée face à un concurrent non qualifié souvent moins cher.",
    ],
    prochainesEtapes: [
      { label: "Obtenir ou renouveler la mention IRVE", detail: "Se former au niveau adapté (P1/P2) via la CAPEB." },
      { label: "Monter le dossier de qualification", detail: "Se faire accompagner par le pôle Qualification." },
      { label: "Débloquer une copropriété", detail: "Préparer le courrier au syndic et sécuriser la procédure avec le pôle Juridique." },
    ],
    formations: ["IRVE NIVEAU 1 et 2 CAPEB LESCAR"],
    poles: [POLE_QUALIF, POLE_TECH, POLE_JURIDIQUE],
  },

  // ───────────────────────────────────────── RÉNOVATION D'AMPLEUR / RGE
  {
    id: "renovation-rge",
    titre: "Rénovation d'ampleur & RGE",
    accroche: "La clé d'accès à MaPrimeRénov' et au plus gros marché de la rénovation énergétique.",
    icone: "Home",
    accent: "#1E8E55",
    marcheEnBref: [
      "La rénovation énergétique est un marché massif et durable, soutenu par les politiques publiques.",
      "Depuis 2015, seuls les artisans certifiés RGE peuvent réaliser les travaux ouvrant droit à MaPrimeRénov' : sans RGE, ces marchés sont inaccessibles.",
      "La demande est aussi poussée par le calendrier : à horizon 2034, les logements classés E, F et G seront interdits à la location.",
    ],
    prerequis: [
      "Qualification RGE selon le métier (Qualibat, Qualifelec, QualiPAC, Qualibois, RGE Études…).",
      "Pour une rénovation d'ampleur, l'accompagnement par Mon Accompagnateur Rénov' est obligatoire avant le dépôt du dossier.",
      "Devis RGE conforme et précis ; un rendez-vous France Rénov' est requis pour le parcours accompagné.",
    ],
    aides: [
      "MaPrimeRénov' en deux parcours : « par geste » (travaux simples) et « accompagné » (rénovation d'ampleur, gain énergétique visé ≥ 35 %).",
      "Cumulable avec les CEE / prime énergie, l'éco-PTZ, la TVA à 5,5 % et les aides locales, dans la limite des règles d'écrêtement.",
      "Revenus retenus : ceux de l'année N-1 (avis d'imposition 2025 pour une demande en 2026).",
    ],
    aidesDisclaimer:
      "Barèmes MaPrimeRénov' révisés chaque année et variables selon les revenus et la zone. Les délais de versement de l'Anah sont allongés en 2026. Montants à vérifier sur maprimerenov.gouv.fr et avec France Rénov'.",
    vigilance: [
      "Depuis le 1er janvier 2026, l'isolation des murs et les chaudières biomasse/gaz sont sorties du « geste simple » (à intégrer dans une rénovation globale).",
      "En cas de travaux non conformes au dossier, l'Anah peut demander le remboursement de la prime et engager la responsabilité de l'artisan : d'où un devis technique très précis.",
      "Anticiper la trésorerie : le client peut devoir avancer la somme, les délais de versement étant longs.",
    ],
    prochainesEtapes: [
      { label: "Obtenir / renouveler la qualification RGE", detail: "Identifier la bonne certification métier avec le pôle Qualification." },
      { label: "Se former à la rénovation performante", detail: "Suivre RGE RENOPERF via la CAPEB." },
      { label: "Cadrer un dossier de rénovation d'ampleur", detail: "Échanger avec le pôle Technique et orienter le client vers France Rénov'." },
    ],
    formations: ["RGE RENOPERF CAPEB LESCAR"],
    poles: [POLE_QUALIF, POLE_TECH],
  },

  // ───────────────────────────────────────── POMPE À CHALEUR
  {
    id: "pompe-a-chaleur",
    titre: "Pompe à chaleur",
    accroche: "Le cœur du marché de la rénovation, recentré sur la PAC en 2026.",
    icone: "Thermometer",
    accent: "#FB8C00",
    marcheEnBref: [
      "La PAC est privilégiée par la politique d'aides : depuis le 1er janvier 2026, les chaudières gaz et biomasse ne bénéficient plus d'aides isolées.",
      "Forte demande de remplacement des anciennes chaudières fioul et gaz.",
      "La PAC air/eau et la géothermie sont éligibles « par geste » ; la PAC air/air uniquement dans une rénovation d'ampleur.",
    ],
    prerequis: [
      "Qualification RGE QualiPAC obligatoire pour que le client accède aux aides.",
      "Visite préalable du chantier obligatoire depuis 2026 : sa date doit figurer sur le devis.",
      "Si l'intervention touche au circuit frigorifique, l'attestation de capacité « fluides » est requise (voir fiche Climatisation & fluides).",
    ],
    aides: [
      "MaPrimeRénov' (ordre de grandeur indicatif de 2 000 à 10 000 € selon les revenus), CEE, éco-PTZ, TVA à 5,5 %.",
      "La PAC air/air n'est pas éligible au parcours « par geste » (seulement en rénovation d'ampleur).",
    ],
    aidesDisclaimer:
      "Montants indicatifs, dépendant des revenus, de la zone et révisés chaque année. À vérifier sur maprimerenov.gouv.fr et avec votre pôle CAPEB.",
    vigilance: [
      "Bien distinguer air/eau (éligible par geste) et air/air (réno d'ampleur uniquement) pour ne pas induire le client en erreur.",
      "Dimensionnement et devis techniques précis : un dossier non conforme expose au remboursement de la prime.",
    ],
    prochainesEtapes: [
      { label: "Obtenir la qualification RGE QualiPAC", detail: "Se faire accompagner par le pôle Qualification." },
      { label: "Se former / se perfectionner", detail: "Suivre QUALIPAC via la CAPEB." },
      { label: "Sécuriser le volet fluides", detail: "Vérifier l'attestation de capacité avec le pôle Technique." },
    ],
    formations: ["QUALIPAC POMPE A CHALEUR CAPEB LESCAR"],
    poles: [POLE_QUALIF, POLE_TECH],
  },

  // ───────────────────────────────────────── PHOTOVOLTAÏQUE / AUTOCONSOMMATION
  {
    id: "photovoltaique",
    titre: "Photovoltaïque & autoconsommation",
    accroche: "Un marché tiré par la hausse de l'électricité et l'envie d'autonomie des clients.",
    icone: "Sun",
    accent: "#F4B400",
    marcheEnBref: [
      "L'autoconsommation séduit des clients qui cherchent à réduire durablement leur facture d'électricité.",
      "Synergie naturelle avec la borne de recharge et le stockage, pour des offres couplées à plus forte valeur.",
    ],
    prerequis: [
      "Qualification RGE (QualiPV) requise pour que le client accède aux aides.",
      "Démarches de raccordement au réseau (Enedis) et attestation de conformité (Consuel).",
    ],
    aides: [
      "Aides photovoltaïques mobilisables selon le projet : prime à l'autoconsommation, TVA réduite selon la puissance, valorisation du surplus.",
      "Les barèmes (prime, tarif de rachat) évoluent fréquemment, souvent par trimestre.",
    ],
    aidesDisclaimer:
      "Les dispositifs photovoltaïques sont révisés très régulièrement (souvent chaque trimestre). Aucun montant ne doit être annoncé comme garanti : à vérifier au moment du devis et avec votre pôle CAPEB.",
    vigilance: [
      "Secteur exposé au démarchage abusif : la rigueur et la transparence du devis sont un argument commercial fort.",
      "Dimensionnement réaliste de l'installation et respect des étapes Consuel / raccordement.",
    ],
    prochainesEtapes: [
      { label: "Obtenir la qualification RGE QualiPV", detail: "Se faire accompagner par le pôle Qualification." },
      { label: "Se former à l'installation PV", detail: "Suivre QUALIPV (ELEC ou BAT) via la CAPEB." },
      { label: "Construire une offre couplée PV + borne + stockage", detail: "En parler au pôle Technique." },
    ],
    formations: ["QUALIPV ELEC CAPEB LESCAR", "QUALIPV BAT CAPEB LESCAR"],
    poles: [POLE_TECH, POLE_QUALIF],
  },

  // ───────────────────────────────────────── CLIMATISATION & FLUIDES FRIGORIGÈNES
  {
    id: "climatisation-fluides",
    titre: "Climatisation & fluides frigorigènes",
    accroche: "Un marché porté par les canicules, mais très encadré côté fluides.",
    icone: "Snowflake",
    accent: "#00897B",
    marcheEnBref: [
      "La demande de climatisation progresse avec les épisodes de chaleur, en résidentiel comme en tertiaire.",
      "Activité fortement réglementée : c'est justement là que l'artisan a besoin d'être accompagné pour rester en conformité.",
    ],
    prerequis: [
      "Attestation de capacité OBLIGATOIRE pour l'entreprise + attestation d'aptitude pour chaque technicien : sans elles, impossible d'exercer légalement la manipulation des fluides.",
      "Catégories d'activité I à IV selon la charge et le type d'intervention. Réforme F-Gas en cours (nouveaux arrêtés publiés fin 2025).",
    ],
    aides: [
      "Pas d'aide MaPrimeRénov' pour la climatisation seule ; la PAC air/air n'est éligible que dans une rénovation d'ampleur.",
      "Selon les cas, CEE et TVA à 5,5 % peuvent rester mobilisables.",
    ],
    aidesDisclaimer:
      "Réglementation fluides en pleine évolution (règlement F-Gas 2024/573 et arrêtés 2025). Points techniques et obligations à vérifier auprès de la CAPEB, qui publie une veille dédiée.",
    vigilance: [
      "Interdiction d'usage de certains fluides vierges (PRP/GWP ≥ 2500) pour la climatisation et la PAC depuis le 1er janvier 2026.",
      "Déclaration annuelle des fluides à réaliser avant le 31 janvier, même si aucun fluide n'a été manipulé (déclaration à zéro).",
      "Tenir à jour le registre des bouteilles, la récupération et les fiches de données de sécurité (contrôlés lors de l'audit).",
    ],
    prochainesEtapes: [
      { label: "Obtenir / renouveler l'attestation de capacité", detail: "Vérifier la catégorie adaptée avec le pôle Technique." },
      { label: "Se former / se perfectionner", detail: "Suivre FLUIDES FRIGORIGENES ou le perfectionnement clim/PAC via la CAPEB." },
      { label: "Sécuriser ses obligations déclaratives", detail: "Faire le point sur la conformité avec le pôle Juridique." },
    ],
    formations: [
      "FLUIDES FRIGORIGENES CAPEB LESCAR",
      "DEPANNAGE ET PERFECTIONNEMENT CLIMATISATION ET POMPES A CHALEUR CAPEB LESCAR",
    ],
    poles: [POLE_TECH, POLE_JURIDIQUE],
  },
];
