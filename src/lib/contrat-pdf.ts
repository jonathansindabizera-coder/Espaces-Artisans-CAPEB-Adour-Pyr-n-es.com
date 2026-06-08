import jsPDF from "jspdf";
import type { ProfilEntreprise } from "@/lib/local-data";

export function generateContratPdf(
  titre: string,
  texte: string,
  donnees: Record<string, string>,
  profil: ProfilEntreprise,
): jsPDF {
  const doc = new jsPDF();
  const margin = 18;
  const pageW = 210;
  const maxW = pageW - margin * 2;
  let y = margin;

  const newPageIfNeeded = (needed = 14) => {
    if (y + needed > 282) { doc.addPage(); y = margin; }
  };

  const writeLine = (
    content: string,
    size = 10,
    style: "normal" | "bold" | "italic" = "normal",
    indent = 0,
    align: "left" | "center" = "left",
  ) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(content, maxW - indent);
    const lineH = size * 0.42 + 1.2;
    newPageIfNeeded(lines.length * lineH + 2);
    if (align === "center") {
      doc.text(lines, pageW / 2, y, { align: "center" });
    } else {
      doc.text(lines, margin + indent, y);
    }
    y += lines.length * lineH + 1;
  };

  // ── Bandeau légal (fond gris, texte petit) ────────────────────────────────
  const bandeauH = 16;
  doc.setFillColor(245, 243, 240);
  doc.setDrawColor(200, 195, 188);
  doc.rect(margin, y, maxW, bandeauH, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(110, 100, 90);
  const bandeauLines = doc.splitTextToSize(
    "⚠ Modèle indicatif fourni à titre d'exemple. À personnaliser et à faire valider par un juriste avant signature. " +
    "La CAPEB et cette application déclinent toute responsabilité quant à l'usage de ce document. " +
    "En cas de doute, contactez le service juridique CAPEB Adour-Pyrénées.",
    maxW - 4,
  );
  doc.text(bandeauLines, margin + 2, y + 5);
  y += bandeauH + 5;
  doc.setTextColor(0, 0, 0);

  // ── En-tête entreprise ────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text(profil.nom || "—", margin, y);
  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  const infoLines: string[] = [];
  if (profil.siret)    infoLines.push(`SIRET : ${profil.siret}`);
  if (profil.adresse)  infoLines.push(profil.adresse);
  if (profil.telephone) infoLines.push(`Tél. : ${profil.telephone}`);
  if (profil.email)    infoLines.push(profil.email);
  for (const line of infoLines) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  y += 3;

  // ── Ligne CAPEB rouge ─────────────────────────────────────────────────────
  doc.setDrawColor(226, 0, 26);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  // ── Titre du contrat ──────────────────────────────────────────────────────
  writeLine(titre.toUpperCase(), 14, "bold", 0, "center");
  y += 4;

  // ── Corps : remplacement des champs de fusion ─────────────────────────────
  let corps = texte;

  // supprimer le [DISCLAIMER...] inline si présent (déjà dans le bandeau)
  corps = corps.replace(/\[MODÈLE INDICATIF[^\]]*\]/g, "");
  corps = corps.replace(/\[Modèle indicatif[^\]]*\]/g, "");

  for (const [key, val] of Object.entries(donnees)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    corps = corps.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, "g"), val || `[${key}]`);
  }
  // Champs non remplis → placeholder entre crochets
  corps = corps.replace(/\{\{([^}]+)\}\}/g, (_m, k) => `[${k}]`);

  const paragraphs = corps.split("\n");
  for (const raw of paragraphs) {
    const para = raw.trim();
    if (para === "") { y += 2.5; continue; }

    const isBold =
      /^Article\s+\d/i.test(para) ||
      /^ENTRE\s*:/i.test(para) ||
      /^ET\s*:/i.test(para) ||
      /^IL EST CONVENU/i.test(para) ||
      /^Fait à/i.test(para) ||
      /^CONTRAT DE/i.test(para) ||
      /^AVENANT AU/i.test(para) ||
      /^L'Employeur|^L'Entreprise|^Le Salarié|^L'Apprenti/i.test(para);

    const isCenter =
      /^CONTRAT DE/i.test(para) ||
      /^AVENANT AU/i.test(para) ||
      /^Convention Collective/i.test(para) ||
      /^\[Art\./i.test(para);

    writeLine(para, 10, isBold ? "bold" : "normal", 0, isCenter ? "center" : "left");
  }

  // ── Page number ───────────────────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } })
    .internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 155, 148);
    doc.text(`${p} / ${totalPages}`, pageW / 2, 292, { align: "center" });
  }
  doc.setTextColor(0, 0, 0);

  return doc;
}
