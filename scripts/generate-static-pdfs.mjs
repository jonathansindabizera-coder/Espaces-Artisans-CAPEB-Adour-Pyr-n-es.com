/**
 * Génère les 3 PDF statiques du module "Mes documents".
 * Usage : node scripts/generate-static-pdfs.mjs
 * Sortie : public/documents/*.pdf
 */

import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "documents");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUGE = [226, 0, 26];
const ENCRE = [22, 19, 15];
const GRIS = [110, 100, 90];
const FOND_GRIS = [245, 243, 240];

function creerDoc() {
  return new jsPDF();
}

function enTete(doc, titre, sousTitre) {
  let y = 18;
  const pageW = 210;
  const margin = 18;

  // Bande rouge titre
  doc.setFillColor(...ROUGE);
  doc.rect(margin, y, pageW - margin * 2, 14, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(titre.toUpperCase(), pageW / 2, y + 9, { align: "center" });
  y += 18;

  if (sousTitre) {
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text(sousTitre, pageW / 2, y, { align: "center" });
    y += 6;
  }

  // Filet
  doc.setDrawColor(...ROUGE);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(...ENCRE);
  return y;
}

function paginaion(doc) {
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 155, 148);
    doc.text(`${p} / ${total}`, 105, 292, { align: "center" });
    doc.setTextColor(...ENCRE);
  }
}

function newPageIfNeeded(doc, y, needed = 14) {
  if (y + needed > 278) { doc.addPage(); return 18; }
  return y;
}

function ligne(doc, texte, y, { size = 10, style = "normal", indent = 0, color = ENCRE, align = "left" } = {}) {
  const margin = 18;
  const pageW = 210;
  const maxW = pageW - margin * 2 - indent;
  doc.setFont("times", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(texte, maxW);
  const lh = size * 0.42 + 1.2;
  y = newPageIfNeeded(doc, y, lines.length * lh + 2);
  if (align === "center") {
    doc.text(lines, pageW / 2, y, { align: "center" });
  } else {
    doc.text(lines, margin + indent, y);
  }
  return y + lines.length * lh + 1;
}

function saut(y, n = 3) { return y + n; }

function section(doc, titre, y) {
  y = newPageIfNeeded(doc, y, 16);
  doc.setFillColor(...ROUGE);
  doc.rect(18, y, 174, 7, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(titre.toUpperCase(), 21, y + 5);
  doc.setTextColor(...ENCRE);
  return y + 10;
}

// ─── 1. CARNET DE CHANTIER ───────────────────────────────────────────────────

function genCarnetChantier() {
  const doc = creerDoc();
  let y = enTete(doc, "Carnet de chantier", "CAPEB Adour-Pyrénées — Outil interne — Document à compléter sur le chantier");

  // Bandeau légal
  doc.setFillColor(...FOND_GRIS);
  doc.rect(18, y, 174, 11, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS);
  doc.text("Ce carnet constitue un journal de chantier. Conservez-le jusqu'à l'expiration de la garantie décennale (10 ans après réception).", 20, y + 4);
  doc.text("En cas de litige, il peut servir de preuve de la bonne exécution des travaux.", 20, y + 8);
  doc.setTextColor(...ENCRE);
  y += 15;

  // Identification du chantier
  y = section(doc, "Identification du chantier", y);
  const champs = [
    ["Nom / Raison sociale entreprise", ""],
    ["Adresse du chantier", ""],
    ["Client / Maître d'ouvrage", ""],
    ["Nature des travaux", ""],
    ["Date de début prévue", ""],
    ["Date de fin prévue", ""],
    ["Chef de chantier", ""],
    ["N° de devis / contrat", ""],
    ["Assureur (décennale)", ""],
    ["N° de police", ""],
  ];
  for (const [label] of champs) {
    y = newPageIfNeeded(doc, y, 12);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ENCRE);
    doc.text(label + " :", 20, y);
    doc.setDrawColor(200, 195, 188);
    doc.setLineWidth(0.3);
    doc.line(20, y + 4, 192, y + 4);
    y += 8;
  }
  y += 4;

  // Pages de suivi (on génère 10 pages de suivi journalier)
  const JOURS_PAR_PAGE = 1;
  for (let j = 0; j < 10; j++) {
    doc.addPage();
    y = 18;

    // En-tête compact
    doc.setFillColor(...ROUGE);
    doc.rect(18, y, 174, 7, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("RELEVÉ JOURNALIER", 105, y + 5, { align: "center" });
    doc.setTextColor(...ENCRE);
    y += 11;

    // Date + météo
    doc.setFont("times", "bold"); doc.setFontSize(9);
    doc.text("Date :", 20, y);
    doc.setDrawColor(200, 195, 188); doc.line(35, y + 1, 120, y + 1);
    doc.text("Météo :", 125, y);
    doc.line(140, y + 1, 192, y + 1);
    y += 8;

    // Chantier (rappel)
    doc.setFont("times", "normal"); doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text("Chantier : ___________________________________   Chef de chantier : ___________________________", 20, y);
    doc.setTextColor(...ENCRE);
    y += 8;

    const blocs = [
      { titre: "Intervenants présents (nom, entreprise, heures)", lignes: 5 },
      { titre: "Travaux réalisés dans la journée", lignes: 6 },
      { titre: "Matériaux / matériels livrés ou utilisés", lignes: 3 },
      { titre: "Aléas, incidents, retards", lignes: 4 },
      { titre: "Réserves / observations du maître d'ouvrage", lignes: 3 },
      { titre: "Décisions prises", lignes: 3 },
    ];

    for (const b of blocs) {
      y = newPageIfNeeded(doc, y, 14 + b.lignes * 6);
      doc.setFont("times", "bold"); doc.setFontSize(8.5);
      doc.setFillColor(242, 239, 235);
      doc.rect(18, y, 174, 6, "F");
      doc.text(b.titre, 20, y + 4.5);
      y += 8;
      for (let l = 0; l < b.lignes; l++) {
        doc.setDrawColor(220, 215, 208);
        doc.setLineWidth(0.25);
        doc.line(20, y, 192, y);
        y += 5.5;
      }
      y += 3;
    }

    // Signature
    y = newPageIfNeeded(doc, y, 24);
    doc.setFont("times", "bold"); doc.setFontSize(8.5);
    doc.text("Signature chef de chantier", 20, y);
    doc.text("Visa maître d'ouvrage (si présent)", 115, y);
    y += 3;
    doc.setDrawColor(180, 175, 168); doc.setLineWidth(0.3);
    doc.rect(20, y, 80, 18);
    doc.rect(115, y, 77, 18);
  }

  paginaion(doc);
  return doc;
}

// ─── 2. FORMULAIRE DE RÉTRACTATION ───────────────────────────────────────────

function genFormulaireRetractation() {
  const doc = creerDoc();
  let y = enTete(doc, "Formulaire de rétractation", "Code de la consommation — Art. L.221-18 et suivants");

  // Bandeau légal
  doc.setFillColor(...FOND_GRIS);
  doc.rect(18, y, 174, 11, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS);
  doc.text("⚠ Ce formulaire doit être joint à TOUT devis signé au domicile du client ou hors établissement.", 20, y + 4);
  doc.text("Sans ce formulaire annexé, le délai de rétractation du consommateur passe automatiquement de 14 jours à 12 mois (art. L.242-3 C. conso.).", 20, y + 8);
  doc.setTextColor(...ENCRE);
  y += 15;

  // Cadre d'information (à remettre au client)
  y = section(doc, "Notice d'information — À conserver par le client", y);
  const notice = [
    "Vous avez le droit de vous rétracter du présent contrat sans donner de motif, dans un délai de 14 jours.",
    "",
    "Le délai de rétractation expire 14 jours après le jour de la signature du présent contrat.",
    "",
    "Pour exercer le droit de rétractation, vous devez nous notifier votre décision à l'aide du formulaire ci-dessous ou par tout autre déclaration dénuée d'ambiguïté, exprimant votre volonté de vous rétracter. Vous pouvez utiliser le modèle de formulaire de rétractation ci-dessous, mais ce n'est pas obligatoire.",
    "",
    "Adresse à laquelle envoyer le formulaire de rétractation :",
    "Raison sociale : _________________________________",
    "Adresse : ________________________________________",
    "____________________________________________",
    "Email (optionnel) : ________________________________",
    "",
    "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.",
    "",
    "Effets de la rétractation : En cas de rétractation de votre part, nous vous rembourserons tous les paiements reçus de vous, sans retard excessif et, en tout état de cause, au plus tard 14 jours à compter du jour où nous sommes informés de votre décision de rétractation.",
    "",
    "⚠ Si vous avez demandé d'expressément commencer l'exécution des travaux avant la fin du délai de rétractation, vous devrez payer un montant proportionnel à la prestation accomplie jusqu'à la communication de votre décision de vous rétracter.",
  ];
  for (const para of notice) {
    y = ligne(doc, para, y, { size: 9 });
    if (para === "") y = saut(y, 1);
  }
  y = saut(y, 5);

  // ─ Le formulaire à découper ─
  // Ligne de découpe
  doc.setDrawColor(...ROUGE);
  doc.setLineWidth(0.5);
  doc.setLineDash([2, 2]);
  doc.line(18, y, 192, y);
  doc.setLineDash([]);
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text("✂  Formulaire à découper et à renvoyer à l'entreprise en cas de rétractation", 105, y + 4, { align: "center" });
  doc.setTextColor(...ENCRE);
  y += 10;

  y = section(doc, "Formulaire de rétractation — À renvoyer à l'entreprise", y);

  y = ligne(doc, "À l'attention de :", y, { size: 9, style: "bold" });
  y = ligne(doc, "Raison sociale :  _______________________________________________", y, { size: 9, indent: 4 });
  y = ligne(doc, "Adresse :  ______________________________________________________", y, { size: 9, indent: 4 });
  y = saut(y, 4);

  y = ligne(doc, "Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la prestation de services ci-dessous :", y, { size: 9 });
  y = saut(y, 3);
  y = ligne(doc, "Description de la prestation : ________________________________________", y, { size: 9, indent: 4 });
  y = ligne(doc, "_____________________________________________________________________", y, { size: 9, indent: 4 });
  y = saut(y, 3);
  y = ligne(doc, "Commandé le (*) / reçu le (*) :  ________________________________________", y, { size: 9, indent: 4 });
  y = saut(y, 3);
  y = ligne(doc, "Nom et prénom du (des) consommateur(s) :", y, { size: 9, style: "bold" });
  y = ligne(doc, "______________________________________________________________________", y, { size: 9, indent: 4 });
  y = saut(y, 3);
  y = ligne(doc, "Adresse du (des) consommateur(s) :", y, { size: 9, style: "bold" });
  y = ligne(doc, "______________________________________________________________________", y, { size: 9, indent: 4 });
  y = ligne(doc, "______________________________________________________________________", y, { size: 9, indent: 4 });
  y = saut(y, 5);
  y = ligne(doc, "Signature du (des) consommateur(s) :", y, { size: 9, style: "bold" });
  y = saut(y, 3);
  doc.rect(20, y, 80, 18);
  y += 22;
  y = ligne(doc, "Date : ___________________________", y, { size: 9 });
  y = saut(y, 4);
  y = ligne(doc, "(*) Rayez la mention inutile.", y, { size: 8, style: "italic", color: GRIS });

  paginaion(doc);
  return doc;
}

// ─── 3. MENTIONS OBLIGATOIRES DEVIS & FACTURE ────────────────────────────────

function genMentionsObligatoires() {
  const doc = creerDoc();
  let y = enTete(doc, "Mentions obligatoires — Devis & Factures", "Aide-mémoire de contrôle — Mise à jour juin 2026");

  doc.setFillColor(...FOND_GRIS);
  doc.rect(18, y, 174, 11, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS);
  doc.text("Ce document est un aide-mémoire de contrôle, pas un modèle de devis/facture. Vérifiez chaque point avant d'envoyer vos documents à vos clients.", 20, y + 4);
  doc.text("Réglementation applicable au 1er janvier 2026. À vérifier périodiquement avec le pôle Juridique & Social CAPEB.", 20, y + 8);
  doc.setTextColor(...ENCRE);
  y += 16;

  function ligne2(texte, indent = 0, bold = false) {
    y = ligne(doc, texte, y, { size: 9, style: bold ? "bold" : "normal", indent });
  }
  function checkbox(texte, commentaire = "") {
    const checkY = y;
    doc.setDrawColor(180, 175, 168); doc.setLineWidth(0.3);
    doc.rect(20, checkY - 3.5, 3.5, 3.5);
    y = ligne(doc, texte, y, { size: 9, indent: 7 });
    if (commentaire) {
      y = ligne(doc, commentaire, y, { size: 7.5, indent: 7, color: GRIS, style: "italic" });
    }
  }

  // ─ DEVIS ─
  y = section(doc, "1. Mentions obligatoires sur le devis (art. L.111-1 et R.111-1 C. conso.)", y);

  const mentionsDevis = [
    ["Date d'établissement et numéro du devis", "Numérotation séquentielle, sans rupture de séquence"],
    ["Nom/raison sociale, adresse et SIRET de l'entreprise", ""],
    ["Nom et adresse du client (ou dénomination si professionnel)", ""],
    ["Adresse du chantier (si différente de l'adresse du client)", ""],
    ["Description précise des travaux (nature, quantité, prix unitaire HT)", "Chaque prestation détaillée ; les forfaits doivent être justifiés"],
    ["Prix unitaire et total HT de chaque prestation", ""],
    ["Taux de TVA applicable à chaque prestation", "5,5 % / 10 % / 20 % selon les travaux et le logement"],
    ["Montant total HT, montant de la TVA et total TTC", ""],
    ["Durée de validité du devis", "Recommandé : 30 jours"],
    ["Délai d'exécution prévisionnel", ""],
    ["Conditions de paiement (acompte, délai, pénalités)", "Référencer les CGV ou les indiquer directement sur le devis"],
    ["Garanties légales (mention de la décennale et de la RC pro)", "Nom de l'assureur, numéro de police, références décennale"],
    ["Mention RGE si travaux éligibles aux aides (MaPrimeRénov'…)", "Obligatoire si le client souhaite bénéficier d'aides"],
    ["Formulaire de rétractation annexé (contrat hors établissement)", "⚠ Obligatoire si signature au domicile du client — voir doc. dédié"],
    ["Signature du client avec mention « Bon pour accord »", "Conserver un exemplaire signé"],
  ];

  for (const [texte, commentaire] of mentionsDevis) {
    checkbox(texte, commentaire);
  }
  y = saut(y, 4);

  // ─ FACTURE ─
  y = section(doc, "2. Mentions obligatoires sur la facture (art. L.441-9 C. com.)", y);

  const mentionsFacture = [
    ["Date d'émission et numéro de facture", "Numérotation chronologique continue, sans trou ni doublon"],
    ["Nom/raison sociale, adresse, SIRET et RCS ou RM de l'entreprise", "Vérifier que le N° d'immatriculation est correct"],
    ["Forme juridique et capital social (EI, SARL, SAS…)", "EI : indiquer « Entrepreneur individuel »"],
    ["Numéro de TVA intracommunautaire", "Même si TVA à 0 % (auto-entrepreneur sous seuil)"],
    ["Nom, adresse et SIRET du client professionnel", "Pour un particulier : nom + adresse suffisent"],
    ["Date de la vente ou de la prestation", "Date de fin des travaux ou de livraison"],
    ["Numéro du bon de commande ou du devis", "Si référencé par le client"],
    ["Description précise des travaux / prestations réalisées", "Renvoi possible au devis accepté si cohérent"],
    ["Prix unitaire HT, quantité, réductions accordées", ""],
    ["Taux de TVA applicable à chaque ligne", "Décomposer si plusieurs taux sur la même facture"],
    ["Total HT, TVA détaillée par taux, total TTC", ""],
    ["Adresse de livraison (chantier) si différente de la facturation", ""],
    ["Date d'échéance de paiement", "Délais légaux : 30 j (B2B) / immédiat à réception (particuliers)"],
    ["Conditions et délais de paiement, taux des pénalités de retard", "Taux légal majoré de 3 points au minimum"],
    ["Indemnité forfaitaire pour frais de recouvrement : 40 €", "Obligatoire pour B2B (art. D.441-5 C. com.)"],
    ["Mode de règlement acceptés", "Chèque, virement, espèces (plafond espèces : 1 000 € pour professionnels)"],
    ["Coordonnées bancaires (IBAN + BIC) si paiement par virement", ""],
    ["Attestation de décennale (nom assureur, n° de police, validité)", "À reprendre depuis le devis ou joindre l'attestation en cours"],
  ];

  for (const [texte, commentaire] of mentionsFacture) {
    checkbox(texte, commentaire);
  }
  y = saut(y, 4);

  // ─ CAS PARTICULIERS ─
  y = section(doc, "3. Cas particuliers à ne pas oublier", y);
  const casParticuliers = [
    ["TVA à 5,5 % : travaux d'économie d'énergie + isolation", "Attestation TVA simplifiée signée par le client (Cerfa 13948)"],
    ["TVA à 10 % : travaux de rénovation logement > 2 ans", "Attestation signée par le client"],
    ["Auto-entrepreneur sous le seuil : « TVA non applicable, art. 293B du CGI »", ""],
    ["Sous-traitance : mention du sous-traitant et de son assureur", "Obligatoire sur la facture si sous-traitant sur le chantier"],
    ["Chantier en copropriété : préciser le numéro de lot / le bâtiment", ""],
    ["Devis de travaux > 150 € au domicile du client : formulaire de rétractation obligatoire", "Sans lui, le délai passe à 12 mois"],
    ["Clients professionnels : conditions de règlement des pénalités dans les CGV", ""],
  ];
  for (const [texte, commentaire] of casParticuliers) {
    checkbox(texte, commentaire);
  }
  y = saut(y, 4);

  // ─ CONTACTS CAPEB ─
  y = section(doc, "4. En cas de doute — Contacts CAPEB Adour-Pyrénées", y);
  y = ligne(doc, "Pôle Juridique & Social — Nicolas SOUARD : nicolas.souard@capeb-adour-pyrenees.fr", y, { size: 9 });
  y = ligne(doc, "Pôle Technique & Éco. — Guillaume PIGUÉ : guillaume.pigue@capeb-adour-pyrenees.fr", y, { size: 9 });

  paginaion(doc);
  return doc;
}

// ─── Exécution ────────────────────────────────────────────────────────────────

const docs = [
  { fn: genCarnetChantier,        file: "carnet-de-chantier.pdf" },
  { fn: genFormulaireRetractation, file: "formulaire-retractation.pdf" },
  { fn: genMentionsObligatoires,  file: "mentions-obligatoires-devis-facture.pdf" },
];

for (const { fn, file } of docs) {
  const doc = fn();
  const outPath = path.join(OUT_DIR, file);
  const buf = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(outPath, buf);
  console.log(`✓  ${file}  (${Math.round(buf.length / 1024)} Ko)`);
}

console.log("\nFichiers générés dans public/documents/");
