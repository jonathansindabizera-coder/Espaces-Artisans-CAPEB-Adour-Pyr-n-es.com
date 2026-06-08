import jsPDF from "jspdf";

export type PvData = {
  entreprise: string;
  entrepriseAdresse?: string | null;
  clientNom: string;
  clientAdresse?: string | null;
  natureTravaux: string;
  typeReception: "sans_reserve" | "avec_reserve";
  dateEffet?: string | null;
  reservesNature?: string | null;
  reservesTravaux?: string | null;
  reservesDelai?: string | null;
  lieu?: string | null;
  dateSignature?: string | null;
  dateMarche?: string | null;
  representant?: string | null;
  nbExemplaires?: number;
  signatureClient?: string | null;
  signatureEntreprise?: string | null;
};

function toFrDate(iso: string | null | undefined): string {
  if (!iso) return "__________";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function generatePvPdf(d: PvData): jsPDF {
  const doc = new jsPDF();
  const margin = 22;
  const maxW = 210 - margin * 2;
  let y = margin;

  const addPage = () => { doc.addPage(); y = margin; };
  const checkPage = (needed = 20) => { if (y + needed > 275) addPage(); };

  const text = (
    txt: string,
    size = 11,
    style: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    indent = 0,
  ) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(txt, maxW - indent);
    checkPage(lines.length * size * 0.45 + 4);
    doc.text(lines, margin + indent, y, { align: "justify", maxWidth: maxW - indent });
    y += lines.length * (size * 0.45) + 2.5;
  };

  const h = (txt: string, size = 12, underline = false) => {
    checkPage(12);
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.text(txt, margin, y);
    if (underline) {
      const w = doc.getTextWidth(txt);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1, margin + w, y + 1);
    }
    y += size * 0.5 + 3;
  };

  const hr = () => {
    checkPage(8);
    doc.setDrawColor(160);
    doc.setLineWidth(0.25);
    doc.line(margin, y, 210 - margin, y);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    y += 6;
  };

  const sigBoxes = (sig1: string | null | undefined, sig2: string | null | undefined) => {
    checkPage(48);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Le maître de l'ouvrage", margin, y);
    doc.text("L'entreprise", 127, y);
    y += 4;
    if (sig1) {
      try { doc.addImage(sig1, "PNG", margin, y, 75, 32); } catch { /* ignore */ }
    }
    if (sig2) {
      try { doc.addImage(sig2, "PNG", 125, y, 75, 32); } catch { /* ignore */ }
    }
    doc.setDrawColor(140);
    doc.rect(margin, y, 75, 32);
    doc.rect(125, y, 75, 32);
    doc.setDrawColor(0);
    y += 38;
  };

  // ─── EN-TÊTE ──────────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.text("PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX", 105, y, { align: "center" });
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text("CAPEB Adour-Pyrénées — Espace Artisan", 105, y, { align: "center" });
  y += 10;
  hr();

  // ─── PARTIE 1 — RÉCEPTION DES TRAVAUX ────────────────────────────────────
  h("Réception des travaux", 12);
  y += 1;

  const dateMarche = toFrDate(d.dateMarche);
  const dateEffet  = toFrDate(d.dateEffet);
  const dateSig    = toFrDate(d.dateSignature);
  const lieu       = d.lieu || "__________";
  const n          = d.nbExemplaires ?? 2;
  const repr       = d.representant ?? d.entreprise;

  text(
    `Je soussigné(e) ${d.clientNom}, maître de l'ouvrage, après avoir procédé à la visite des travaux effectués par ${d.entreprise}, au titre du marché en date du ${dateMarche} et relatif à ${d.natureTravaux}, en présence du représentant de ${repr} (l'entreprise et le maître d'œuvre le cas échéant).`,
  );
  y += 2;
  text("Déclare que :", 11, "bold");
  y += 1;

  if (d.typeReception === "sans_reserve") {
    text(`— la réception est prononcée SANS réserve avec effet en date du ${dateEffet}.`, 11, "normal", 5);
  } else {
    text(
      `— la réception est prononcée AVEC réserve avec effet en date du ${dateEffet}, assortie des réserves mentionnées ci-dessous.`,
      11, "normal", 5,
    );
    y += 3;
    h("État des réserves", 11, true);
    text(`Nature des réserves : ${d.reservesNature || "__________"}`, 11, "normal", 5);
    y += 2;
    text(`Travaux à exécuter : ${d.reservesTravaux || "__________"}`, 11, "normal", 5);
    y += 3;
    text(
      `L'entreprise et le maître d'ouvrage conviennent que les travaux nécessités par les réserves seront exécutés dans un délai global de ${d.reservesDelai || "__________"} à compter de ce jour.`,
    );
  }

  y += 4;
  text(`Fait à ${lieu}, le ${dateSig}, en ${n} exemplaires dont un remis à chacune des parties.`);
  y += 6;
  sigBoxes(d.signatureClient, d.signatureEntreprise);

  // ─── PARTIE 2 — LEVÉE DES RÉSERVES (si avec réserves) ────────────────────
  if (d.typeReception === "avec_reserve") {
    y += 8;
    hr();
    h("Procès-verbal de levée des réserves", 12);
    y += 1;
    text(
      `Le maître de l'ouvrage et l'entreprise constatent qu'il a été valablement remédié aux réserves mentionnées dans le PV de réception en date du ${dateEffet}.`,
    );
    y += 4;
    text(`Fait à ${lieu}, le __________, en ${n} exemplaires dont un remis à chaque signataire.`);
    y += 6;
    sigBoxes(null, null);
  }

  return doc;
}
