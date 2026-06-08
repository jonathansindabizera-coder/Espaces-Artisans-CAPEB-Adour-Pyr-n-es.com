import jsPDF from "jspdf";

type PvData = {
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

export function generatePvPdf(d: PvData): jsPDF {
  const doc = new jsPDF();
  const margin = 20;
  const maxW = 210 - margin * 2;
  let y = margin;

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX", 105, y, { align: "center" });
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text("CAPEB Adour-Pyrénées – Espace Artisan", 105, y, { align: "center" });
  y += 10;

  const para = (txt: string, size = 11) => {
    doc.setFont("times", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(txt, maxW);
    doc.text(lines, margin, y, { align: "justify", maxWidth: maxW });
    y += lines.length * (size * 0.45) + 3;
  };
  const h = (txt: string) => {
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(txt, margin, y);
    y += 6;
  };

  h("Réception des travaux");
  const dateEffet = d.dateEffet ?? "__________";
  const lieu = d.lieu ?? "__________";
  const dateSig = d.dateSignature ?? "__________";
  const n = d.nbExemplaires ?? 2;
  const dateMarche = d.dateMarche ?? "__________";
  const repr = d.representant ?? d.entreprise;

  para(
    `Je soussigné(e) ${d.clientNom}, maître de l'ouvrage, après avoir procédé à la visite des travaux effectués par l'entreprise ${d.entreprise}, au titre du marché en date du ${dateMarche}, et relatif à ${d.natureTravaux}, en présence du représentant de ${repr},`,
  );
  para("déclare que :");

  if (d.typeReception === "sans_reserve") {
    para(`(A) la réception est prononcée sans réserve avec effet en date du ${dateEffet}.`);
  } else {
    para(`(B) la réception est prononcée avec effet en date du ${dateEffet}, assortie des réserves ci-dessous.`);
    y += 2;
    h("État des réserves");
    para(`Nature des réserves : ${d.reservesNature ?? "—"}`);
    para(`Travaux à exécuter : ${d.reservesTravaux ?? "—"}`);
    para(
      `Les travaux nécessités par ces réserves seront exécutés dans un délai global de ${d.reservesDelai ?? "—"} à compter de ce jour.`,
    );
  }

  y += 4;
  para(`Fait à ${lieu}, le ${dateSig}, en ${n} exemplaires dont un remis à chacune des parties.`);

  y += 6;
  if (y > 220) { doc.addPage(); y = margin; }
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Signature du maître de l'ouvrage", margin, y);
  doc.text("Signature de l'entreprise", 110, y);
  y += 3;
  if (d.signatureClient) {
    try { doc.addImage(d.signatureClient, "PNG", margin, y, 70, 30); } catch {}
  }
  if (d.signatureEntreprise) {
    try { doc.addImage(d.signatureEntreprise, "PNG", 110, y, 70, 30); } catch {}
  }
  doc.rect(margin, y, 70, 30);
  doc.rect(110, y, 70, 30);
  y += 36;

  if (d.typeReception === "avec_reserve") {
    if (y > 230) { doc.addPage(); y = margin; }
    h("Procès-verbal de levée des réserves");
    para(
      `Le maître de l'ouvrage et l'entreprise ${d.entreprise} constatent qu'il a été valablement remédié aux réserves mentionnées au PV de réception en date du ${dateEffet}.`,
    );
    para(`Fait à ${lieu}, le __________, en ${n} exemplaires.`);
    y += 6;
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Signature du maître de l'ouvrage", margin, y);
    doc.text("Signature de l'entreprise", 110, y);
    y += 3;
    doc.rect(margin, y, 70, 30);
    doc.rect(110, y, 70, 30);
  }

  return doc;
}