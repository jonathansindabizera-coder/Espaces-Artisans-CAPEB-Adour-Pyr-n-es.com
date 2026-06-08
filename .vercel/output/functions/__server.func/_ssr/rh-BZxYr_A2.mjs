import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadProfilEntreprise, a as loadEmployesRH, b as loadContratsGeneres, D as DATA_EVENT, s as saveProfilEntreprise, n as notifyUpdate, c as loadParametresCharges, d as saveParametresCharges, e as addContratGenere, P as PARAMETRES_CHARGES_DEFAUT, f as addEmployeRH } from "./local-data-CXnsCisz.mjs";
import { j as jsPDF } from "../_libs/jspdf.mjs";
import { c as Pencil, d as FileText, e as Calculator, f as Phone, P as Plus, D as Download, g as ChevronUp, h as ChevronDown, X, U as Users, i as Mail, C as Calendar } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "fs";
import "path";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
const DISCLAIMER = "MODÈLE INDICATIF — À personnaliser et à faire valider par un juriste avant signature. La CAPEB et cette application déclinent toute responsabilité quant à l'usage de ce document. En cas de doute, contactez le service juridique CAPEB Adour-Pyrénées.";
const CONTRAT_TEMPLATES = [
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
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`
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
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`
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
(Signature + cachet)                                 (Signature précédée de « Lu et approuvé »)`
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
(Signature + cachet de l'entreprise)                 (Signature précédée de « Lu et approuvé »)`
  }
];
function generateContratPdf(titre, texte, donnees, profil) {
  const doc = new jsPDF();
  const margin = 18;
  const pageW = 210;
  const maxW = pageW - margin * 2;
  let y = margin;
  const newPageIfNeeded = (needed = 14) => {
    if (y + needed > 282) {
      doc.addPage();
      y = margin;
    }
  };
  const writeLine = (content, size = 10, style = "normal", indent = 0, align = "left") => {
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
  const bandeauH = 16;
  doc.setFillColor(245, 243, 240);
  doc.setDrawColor(200, 195, 188);
  doc.rect(margin, y, maxW, bandeauH, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(110, 100, 90);
  const bandeauLines = doc.splitTextToSize(
    "⚠ Modèle indicatif fourni à titre d'exemple. À personnaliser et à faire valider par un juriste avant signature. La CAPEB et cette application déclinent toute responsabilité quant à l'usage de ce document. En cas de doute, contactez le service juridique CAPEB Adour-Pyrénées.",
    maxW - 4
  );
  doc.text(bandeauLines, margin + 2, y + 5);
  y += bandeauH + 5;
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text(profil.nom || "—", margin, y);
  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  const infoLines = [];
  if (profil.siret) infoLines.push(`SIRET : ${profil.siret}`);
  if (profil.adresse) infoLines.push(profil.adresse);
  if (profil.telephone) infoLines.push(`Tél. : ${profil.telephone}`);
  if (profil.email) infoLines.push(profil.email);
  for (const line of infoLines) {
    doc.text(line, margin, y);
    y += 4.5;
  }
  y += 3;
  doc.setDrawColor(226, 0, 26);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  writeLine(titre.toUpperCase(), 14, "bold", 0, "center");
  y += 4;
  let corps = texte;
  corps = corps.replace(/\[MODÈLE INDICATIF[^\]]*\]/g, "");
  corps = corps.replace(/\[Modèle indicatif[^\]]*\]/g, "");
  for (const [key, val] of Object.entries(donnees)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    corps = corps.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, "g"), val || `[${key}]`);
  }
  corps = corps.replace(/\{\{([^}]+)\}\}/g, (_m, k) => `[${k}]`);
  const paragraphs = corps.split("\n");
  for (const raw of paragraphs) {
    const para = raw.trim();
    if (para === "") {
      y += 2.5;
      continue;
    }
    const isBold = /^Article\s+\d/i.test(para) || /^ENTRE\s*:/i.test(para) || /^ET\s*:/i.test(para) || /^IL EST CONVENU/i.test(para) || /^Fait à/i.test(para) || /^CONTRAT DE/i.test(para) || /^AVENANT AU/i.test(para) || /^L'Employeur|^L'Entreprise|^Le Salarié|^L'Apprenti/i.test(para);
    const isCenter = /^CONTRAT DE/i.test(para) || /^AVENANT AU/i.test(para) || /^Convention Collective/i.test(para) || /^\[Art\./i.test(para);
    writeLine(para, 10, isBold ? "bold" : "normal", 0, isCenter ? "center" : "left");
  }
  const totalPages = doc.internal.getNumberOfPages();
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
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function fmt(n) {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}
function RhPage() {
  const [onglet, setOnglet] = reactExports.useState("modeles");
  const [profil, setProfil] = reactExports.useState(() => loadProfilEntreprise());
  const [employes, setEmployes] = reactExports.useState(() => loadEmployesRH());
  const [contrats, setContrats] = reactExports.useState(() => loadContratsGeneres());
  const [showProfilModal, setShowProfilModal] = reactExports.useState(false);
  const refreshAll = () => {
    setProfil(loadProfilEntreprise());
    setEmployes(loadEmployesRH());
    setContrats(loadContratsGeneres());
  };
  reactExports.useEffect(() => {
    window.addEventListener(DATA_EVENT, refreshAll);
    return () => window.removeEventListener(DATA_EVENT, refreshAll);
  }, []);
  const ONGLETS = [{
    id: "modeles",
    label: "Modèles de contrats",
    icon: FileText
  }, {
    id: "cout",
    label: "Coût d'embauche",
    icon: Calculator
  }, {
    id: "juriste",
    label: "Besoin d'un juriste ?",
    icon: Phone
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[26px] font-bold tracking-wide", style: {
          color: "#1A1714"
        }, children: "RH & Juridique" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-0.5", style: {
          color: "#8B847D"
        }, children: "Contrats, calcul de coût d'embauche et contact juridique CAPEB" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowProfilModal(true), className: "flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors", style: {
        background: profil.nom ? "rgba(226,0,26,.08)" : "#E2001A",
        color: profil.nom ? "#E2001A" : "white",
        border: profil.nom ? "1px solid rgba(226,0,26,.2)" : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        profil.nom ? "Mon entreprise" : "Configurer mon entreprise"
      ] })
    ] }),
    !profil.nom && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[10px] p-3 flex items-center gap-3 text-sm", style: {
      background: "#FEF3C7",
      border: "1px solid #F59E0B",
      color: "#92400E"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚠" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Configurez d'abord votre profil entreprise pour que les contrats soient pré-remplis avec vos coordonnées." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowProfilModal(true), className: "ml-auto font-semibold underline shrink-0", children: "Configurer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 p-1 rounded-[12px]", style: {
      background: "rgba(26,23,20,.06)"
    }, children: ONGLETS.map(({
      id,
      label,
      icon: Icon
    }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOnglet(id), className: "flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-sm font-medium transition-all flex-1 justify-center", style: {
      background: onglet === id ? "white" : "transparent",
      color: onglet === id ? "#E2001A" : "#4A453F",
      boxShadow: onglet === id ? "0 1px 6px rgba(0,0,0,.1)" : "none",
      fontWeight: onglet === id ? 600 : 500
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: label })
    ] }, id)) }),
    onglet === "modeles" && /* @__PURE__ */ jsxRuntimeExports.jsx(OngletModeles, { profil, employes, contrats, onDataChange: refreshAll }),
    onglet === "cout" && /* @__PURE__ */ jsxRuntimeExports.jsx(OngletCout, {}),
    onglet === "juriste" && /* @__PURE__ */ jsxRuntimeExports.jsx(OngletJuriste, {}),
    showProfilModal && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilModal, { profil, onClose: () => setShowProfilModal(false), onSave: (p) => {
      saveProfilEntreprise(p);
      setProfil(p);
      notifyUpdate();
      setShowProfilModal(false);
      toast.success("Profil entreprise sauvegardé");
    } })
  ] });
}
function BandeauLegal() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[10px] p-3 text-xs leading-relaxed", style: {
    background: "#FFF7ED",
    border: "1px solid #FED7AA",
    color: "#9A3412"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠ Modèles indicatifs" }),
    " — Ces contrats sont fournis à titre d'exemple. Ils doivent être personnalisés et validés par un juriste avant signature. La CAPEB et cette application déclinent toute responsabilité quant à leur usage. En cas de doute, contactez le",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:juriste@capeb-adour-pyrenees.fr", className: "underline font-medium", children: "service juridique CAPEB" }),
    "."
  ] });
}
function BandeauCout() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[10px] p-3 text-xs leading-relaxed", style: {
    background: "#EFF6FF",
    border: "1px solid #BFDBFE",
    color: "#1E40AF"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "ℹ Estimation indicative" }),
    " — Les taux exacts (AT/MP, caisse congés payés régionale, indemnités de zone) dépendent de votre situation. Pour un chiffre certifié, rapprochez-vous de votre expert-comptable ou du service social CAPEB."
  ] });
}
function JuristeCard() {
  const profil = loadProfilEntreprise();
  const mailtoContact = `mailto:nicolas.souard@capeb-adour-pyrenees.fr?subject=${encodeURIComponent("Demande d'accompagnement RH/juridique")}&body=${encodeURIComponent(`Bonjour,

Entreprise : ${profil.nom || "—"}
SIRET : ${profil.siret || "—"}

Merci de me contacter pour une question RH/juridique.

Cordialement.`)}`;
  const mailtoRdv = `mailto:nicolas.souard@capeb-adour-pyrenees.fr?subject=${encodeURIComponent("Demande de rendez-vous")}&body=${encodeURIComponent(`Bonjour,

Entreprise : ${profil.nom || "—"}
SIRET : ${profil.siret || "—"}

Demande de rendez-vous.

Créneaux souhaités : 

Cordialement.`)}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] p-5 text-white", style: {
    background: "linear-gradient(135deg, #E2001A 0%, #A30012 100%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-white/20 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-bold tracking-wide", children: "Service Juridique CAPEB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/75 text-sm", children: "Nicolas Souard — CAPEB Adour-Pyrénées" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/85 mb-5 leading-relaxed", children: "Besoin d'aide pour rédiger, valider ou comprendre un contrat ? Notre service juridique est là pour vous accompagner dans toutes vos démarches RH." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "tel:+33562343008", className: "flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors bg-white text-[#E2001A]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
        "05 62 34 30 08"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: mailtoContact, className: "flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors", style: {
        background: "rgba(255,255,255,0.2)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
        "Envoyer un email"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: mailtoRdv, className: "flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors", style: {
        background: "rgba(255,255,255,0.2)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
        "Prendre RDV"
      ] })
    ] })
  ] });
}
function ProfilModal({
  profil,
  onClose,
  onSave
}) {
  const [form, setForm] = reactExports.useState({
    ...profil
  });
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-[16px] p-6 shadow-2xl", style: {
    background: "#FAF8F5"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", style: {
        color: "#1A1714"
      }, children: "Mon entreprise" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 hover:bg-black/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 text-[#8B847D]" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      if (!form.nom.trim()) {
        toast.error("Le nom est requis");
        return;
      }
      onSave(form);
    }, className: "space-y-3", children: [
      [{
        key: "nom",
        label: "Nom de l'entreprise *",
        placeholder: "SARL Dupont BTP"
      }, {
        key: "siret",
        label: "SIRET",
        placeholder: "123 456 789 00012"
      }, {
        key: "adresse",
        label: "Adresse",
        placeholder: "12 rue des Artisans, 64000 Pau"
      }, {
        key: "telephone",
        label: "Téléphone",
        placeholder: "05 59 00 00 00"
      }, {
        key: "email",
        label: "Email",
        placeholder: "contact@votreentreprise.fr"
      }].map(({
        key,
        label,
        placeholder
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: form[key], onChange: (e) => set(key, e.target.value), placeholder, className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-all", style: {
          background: "white",
          border: "1px solid #E5E0DA",
          color: "#1A1714"
        }, onFocus: (e) => {
          e.currentTarget.style.border = "1px solid #E2001A";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
        }, onBlur: (e) => {
          e.currentTarget.style.border = "1px solid #E5E0DA";
          e.currentTarget.style.boxShadow = "none";
        } })
      ] }, key)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 rounded-[10px] py-2.5 text-sm font-medium", style: {
          background: "rgba(26,23,20,.08)",
          color: "#4A453F"
        }, children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white", style: {
          background: "#E2001A"
        }, children: "Sauvegarder" })
      ] })
    ] })
  ] }) });
}
function NouvelEmployeDialog({
  onClose,
  onCreated
}) {
  const [nom, setNom] = reactExports.useState("");
  const [prenom, setPrenom] = reactExports.useState("");
  const [dateNaissance, setDateNaissance] = reactExports.useState("");
  const [numSecu, setNumSecu] = reactExports.useState("");
  const [qualification, setQualification] = reactExports.useState("");
  const [adresse, setAdresse] = reactExports.useState("");
  const [statut, setStatut] = reactExports.useState("ouvrier");
  const inputStyle = {
    background: "white",
    border: "1px solid #E5E0DA",
    color: "#1A1714"
  };
  const inputFocus = (e) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const inputBlur = (e) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };
  const submit = (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      toast.error("Nom et prénom requis");
      return;
    }
    const emp = addEmployeRH({
      nom: nom.trim(),
      prenom: prenom.trim(),
      date_naissance: dateNaissance || null,
      num_secu: numSecu || null,
      qualification: qualification || null,
      salarie_adresse: adresse || null,
      statut,
      actif: true
    });
    notifyUpdate();
    toast.success(`${prenom} ${nom} ajouté(e)`);
    onCreated(emp);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-[16px] p-6 shadow-2xl", style: {
    background: "#FAF8F5"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", style: {
        color: "#1A1714"
      }, children: "Ajouter un employé" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 hover:bg-black/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 text-[#8B847D]" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [{
        label: "Prénom *",
        val: prenom,
        set: setPrenom,
        placeholder: "Jean"
      }, {
        label: "Nom *",
        val: nom,
        set: setNom,
        placeholder: "MARTIN"
      }].map(({
        label,
        val,
        set: setFn,
        placeholder
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: val, onChange: (e) => setFn(e.target.value), placeholder, className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none", style: inputStyle, onFocus: inputFocus, onBlur: inputBlur })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Statut" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: statut, onChange: (e) => setStatut(e.target.value), className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none", style: inputStyle, onFocus: inputFocus, onBlur: inputBlur, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ouvrier", children: "Ouvrier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "etam", children: "ETAM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cadre", children: "Cadre" })
        ] })
      ] }),
      [{
        label: "Date de naissance",
        val: dateNaissance,
        set: setDateNaissance,
        type: "date",
        placeholder: ""
      }, {
        label: "Qualification / coefficient",
        val: qualification,
        set: setQualification,
        type: "text",
        placeholder: "N3P1 – Ouvrier qualifié"
      }, {
        label: "Adresse",
        val: adresse,
        set: setAdresse,
        type: "text",
        placeholder: "12 rue de la Paix, 64000 Pau"
      }, {
        label: "N° sécurité sociale",
        val: numSecu,
        set: setNumSecu,
        type: "text",
        placeholder: "1 XX XX XX XXX XXX XX"
      }].map(({
        label,
        val,
        set: setFn,
        type,
        placeholder
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value: val, onChange: (e) => setFn(e.target.value), placeholder, className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none", style: inputStyle, onFocus: inputFocus, onBlur: inputBlur })
      ] }, label)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 rounded-[10px] py-2.5 text-sm font-medium", style: {
          background: "rgba(26,23,20,.08)",
          color: "#4A453F"
        }, children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white", style: {
          background: "#E2001A"
        }, children: "Ajouter" })
      ] })
    ] })
  ] }) });
}
function OngletModeles({
  profil,
  employes,
  contrats,
  onDataChange
}) {
  const [typeId, setTypeId] = reactExports.useState("");
  const [employeId, setEmployeId] = reactExports.useState("");
  const [showNouvelEmploye, setShowNouvelEmploye] = reactExports.useState(false);
  const [donnees, setDonnees] = reactExports.useState({});
  const [generating, setGenerating] = reactExports.useState(false);
  const template = CONTRAT_TEMPLATES.find((t) => t.id === typeId);
  const employe = employes.find((e) => e.id === employeId);
  const autoFilled = reactExports.useMemo(() => {
    const d = {};
    if (profil.nom) d.entreprise_nom = profil.nom;
    if (profil.siret) d.entreprise_siret = profil.siret;
    if (profil.adresse) d.entreprise_adresse = profil.adresse;
    if (employe) {
      d.salarie_nom = employe.nom;
      d.salarie_prenom = employe.prenom;
      if (employe.qualification) d.qualification = employe.qualification;
      if (employe.salarie_adresse) d.salarie_adresse = employe.salarie_adresse;
      if (employe.date_naissance) d.date_naissance = fmtDate(employe.date_naissance);
    }
    d.date_signature = today();
    return d;
  }, [profil, employe]);
  const CHAMPS_MANUELS = [{
    key: "poste",
    label: "Intitulé du poste",
    type: "text"
  }, {
    key: "salaire_brut_mensuel",
    label: "Salaire brut mensuel (€)",
    type: "number"
  }, {
    key: "date_debut",
    label: "Date de début",
    type: "date"
  }, {
    key: "duree_hebdo",
    label: "Durée hebdomadaire",
    options: ["35", "39"]
  }, {
    key: "lieu",
    label: "Lieu de signature",
    type: "text"
  }, {
    key: "date_signature",
    label: "Date de signature",
    type: "date"
  }, ...template?.champsSpecifiques.includes("motif_cdd") ? [{
    key: "motif_cdd",
    label: "Motif du CDD",
    type: "text"
  }] : [], ...template?.champsSpecifiques.includes("date_fin_cdd") ? [{
    key: "date_fin_cdd",
    label: "Date de fin du contrat",
    type: "date"
  }] : [], ...template?.champsSpecifiques.includes("date_naissance") && !employe?.date_naissance ? [{
    key: "date_naissance",
    label: "Date de naissance",
    type: "date"
  }] : [], ...template?.champsSpecifiques.includes("nom_cfa") ? [{
    key: "nom_cfa",
    label: "Nom du CFA",
    type: "text"
  }] : [], ...!employe?.salarie_adresse ? [{
    key: "salarie_adresse",
    label: "Adresse du salarié",
    type: "text"
  }] : [], ...!employe?.qualification ? [{
    key: "qualification",
    label: "Qualification / coefficient",
    type: "text"
  }] : []];
  const set = (k, v) => setDonnees((d) => ({
    ...d,
    [k]: v
  }));
  const val = (k) => donnees[k] ?? autoFilled[k] ?? "";
  const handleGenerate = () => {
    if (!template) {
      toast.error("Choisissez un type de contrat");
      return;
    }
    if (!employe) {
      toast.error("Sélectionnez un employé");
      return;
    }
    if (!val("poste")) {
      toast.error("L'intitulé du poste est requis");
      return;
    }
    if (!val("salaire_brut_mensuel")) {
      toast.error("Le salaire brut est requis");
      return;
    }
    setGenerating(true);
    try {
      const merged = {
        ...autoFilled,
        ...donnees
      };
      if (!merged.duree_hebdo) merged.duree_hebdo = "35";
      const pdf = generateContratPdf(template.titre, template.texte, merged, profil);
      const fileName = `${template.id}_${employe.nom}_${employe.prenom}_${today()}.pdf`;
      pdf.save(fileName);
      addContratGenere({
        employe_id: employe.id,
        employe_nom: `${employe.prenom} ${employe.nom}`,
        type_contrat: template.id,
        titre_contrat: template.titre,
        donnees: merged
      });
      notifyUpdate();
      onDataChange();
      toast.success("Contrat généré et téléchargé !");
      setDonnees({});
      setTypeId("");
      setEmployeId("");
    } catch (err) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-all";
  const inputSt = {
    background: "white",
    border: "1px solid #E5E0DA",
    color: "#1A1714"
  };
  const onFocus = (e) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onBlur = (e) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BandeauLegal, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] p-5 space-y-5", style: {
      background: "white",
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold", style: {
        color: "#1A1714"
      }, children: "Générer un contrat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1.5", style: {
          color: "#4A453F"
        }, children: "Type de contrat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: typeId, onChange: (e) => {
          setTypeId(e.target.value);
          setDonnees({});
        }, className: inputCls, style: inputSt, onFocus, onBlur, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Choisir un modèle --" }),
          CONTRAT_TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.id, children: t.titre }, t.id))
        ] }),
        template && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs", style: {
          color: "#8B847D"
        }, children: template.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", style: {
            color: "#4A453F"
          }, children: "Employé(e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setShowNouvelEmploye(true), className: "flex items-center gap-1 text-xs font-medium", style: {
            color: "#E2001A"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
            " Ajouter un employé"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: employeId, onChange: (e) => setEmployeId(e.target.value), className: inputCls, style: inputSt, onFocus, onBlur, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Sélectionner --" }),
          employes.filter((e) => e.actif).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: e.id, children: [
            e.prenom,
            " ",
            e.nom,
            " — ",
            e.statut
          ] }, e.id))
        ] }),
        employes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs", style: {
          color: "#8B847D"
        }, children: "Aucun employé enregistré. Cliquez sur « Ajouter un employé » pour commencer." })
      ] }),
      typeId && employeId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t", style: {
        borderColor: "#F0EBE4"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
          color: "#8B847D"
        }, children: "Les champs en grisé sont pré-remplis automatiquement." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [{
          k: "entreprise_nom",
          l: "Entreprise"
        }, {
          k: "salarie_prenom",
          l: "Prénom salarié"
        }, {
          k: "salarie_nom",
          l: "Nom salarié"
        }, {
          k: "qualification",
          l: "Qualification"
        }].map(({
          k,
          l
        }) => autoFilled[k] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#8B847D"
          }, children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-[10px] px-3 py-2.5 text-sm", style: {
            background: "rgba(26,23,20,.04)",
            color: "#8B847D",
            border: "1px solid #E5E0DA"
          }, children: autoFilled[k] })
        ] }, k) : null) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: CHAMPS_MANUELS.map(({
          key,
          label,
          type,
          options
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#4A453F"
          }, children: label }),
          options ? /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: val(key), onChange: (e) => set(key, e.target.value), className: inputCls, style: inputSt, onFocus, onBlur, children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: o, children: [
            o,
            "h / semaine"
          ] }, o)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: type || "text", value: val(key), onChange: (e) => set(key, e.target.value), className: inputCls, style: inputSt, onFocus, onBlur })
        ] }, key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGenerate, disabled: generating, className: "flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-opacity", style: {
          background: "#E2001A",
          opacity: generating ? 0.6 : 1
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          generating ? "Génération…" : "Générer le PDF"
        ] })
      ] })
    ] }),
    contrats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] p-5", style: {
      background: "white",
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold mb-4", style: {
        color: "#1A1714"
      }, children: "Contrats générés" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: contrats.slice(0, 10).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-[10px] px-4 py-3", style: {
        background: "rgba(26,23,20,.03)",
        border: "1px solid #F0EBE4"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 shrink-0", style: {
          color: "#8B847D"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", style: {
            color: "#1A1714"
          }, children: c.titre_contrat }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
            color: "#8B847D"
          }, children: [
            c.employe_nom,
            " · ",
            fmtDate(c.date_generation)
          ] })
        ] })
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JuristeCard, {}),
    showNouvelEmploye && /* @__PURE__ */ jsxRuntimeExports.jsx(NouvelEmployeDialog, { onClose: () => setShowNouvelEmploye(false), onCreated: (e) => {
      setEmployeId(e.id);
      setShowNouvelEmploye(false);
    } })
  ] });
}
function calculerCout(salaireBrut, dureeHebdo, params) {
  const heuresSup = dureeHebdo === 39 ? salaireBrut / 151.67 * (4 * 52 / 12) * 0.25 : 0;
  const salaireTotal = salaireBrut + heuresSup;
  const patronal = salaireTotal * params.taux_patronal / 100;
  const cibtp = salaireTotal * params.cotisation_cibtp / 100;
  const oppbtp = salaireTotal * params.oppbtp / 100;
  const chomage = salaireTotal * params.chomage_intemp / 100;
  const prevoyance = salaireTotal * params.prevoyance_probtp / 100;
  const atmp = salaireTotal * params.atmp / 100;
  const totalCharges = patronal + cibtp + oppbtp + chomage + prevoyance + atmp;
  const totalFrais = params.mutuelle_mensuelle + params.indemnite_trajet + params.indemnite_repas;
  const coutMensuel = salaireTotal + totalCharges + totalFrais;
  const coutAnnuel = coutMensuel * 12 + params.cout_premier_embauche;
  const coefficient = coutMensuel / salaireBrut;
  return {
    heuresSup,
    salaireTotal,
    patronal,
    cibtp,
    oppbtp,
    chomage,
    prevoyance,
    atmp,
    totalCharges,
    totalFrais,
    coutMensuel,
    coutAnnuel,
    coefficient
  };
}
function OngletCout() {
  const [params, setParams] = reactExports.useState(() => loadParametresCharges());
  const [showParams, setShowParams] = reactExports.useState(false);
  const [salaireBrut, setSalaireBrut] = reactExports.useState(1867.02);
  const [dureeHebdo, setDureeHebdo] = reactExports.useState(35);
  const r = reactExports.useMemo(() => calculerCout(salaireBrut, dureeHebdo, params), [salaireBrut, dureeHebdo, params]);
  const inputSt = {
    background: "white",
    border: "1px solid #E5E0DA",
    color: "#1A1714"
  };
  const onFocus = (e) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onBlur = (e) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };
  const lignesCharges = [{
    label: "Charges patronales générales",
    val: r.patronal,
    pct: params.taux_patronal
  }, {
    label: "Cotisation CIBTP (congés payés)",
    val: r.cibtp,
    pct: params.cotisation_cibtp
  }, {
    label: "OPPBTP (prévention sécurité)",
    val: r.oppbtp,
    pct: params.oppbtp
  }, {
    label: "Chômage intempéries",
    val: r.chomage,
    pct: params.chomage_intemp
  }, {
    label: "Prévoyance PRO.BTP",
    val: r.prevoyance,
    pct: params.prevoyance_probtp
  }, {
    label: "Cotisation AT/MP",
    val: r.atmp,
    pct: params.atmp
  }];
  const ligneFrais = [{
    label: "Mutuelle mensuelle",
    val: params.mutuelle_mensuelle
  }, {
    label: "Indemnités de trajet (mois)",
    val: params.indemnite_trajet
  }, {
    label: "Indemnités de repas (mois)",
    val: params.indemnite_repas
  }];
  const barSalaire = r.salaireTotal / r.coutMensuel * 100;
  const barCharges = r.totalCharges / r.coutMensuel * 100;
  const barFrais = r.totalFrais / r.coutMensuel * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BandeauCout, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] p-5 space-y-5", style: {
      background: "white",
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold", style: {
          color: "#1A1714"
        }, children: "Simulateur de coût" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowParams(!showParams), className: "flex items-center gap-1.5 text-xs font-medium rounded-[8px] px-3 py-1.5", style: {
          background: "rgba(226,0,26,.08)",
          color: "#E2001A",
          border: "1px solid rgba(226,0,26,.2)"
        }, children: [
          showParams ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }),
          "Réglages des taux"
        ] })
      ] }),
      showParams && /* @__PURE__ */ jsxRuntimeExports.jsx(ParametresPanel, { params, onSave: (p) => {
        saveParametresCharges(p);
        setParams(p);
        toast.success("Taux sauvegardés");
        setShowParams(false);
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1.5", style: {
            color: "#4A453F"
          }, children: "Salaire brut mensuel (base 35h) — €" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, step: 0.01, value: salaireBrut, onChange: (e) => setSalaireBrut(Number(e.target.value)), className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none", style: inputSt, onFocus, onBlur })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1.5", style: {
            color: "#4A453F"
          }, children: "Durée hebdo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: dureeHebdo, onChange: (e) => setDureeHebdo(Number(e.target.value)), className: "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none", style: inputSt, onFocus, onBlur, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 35, children: "35h / semaine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 39, children: "39h / semaine" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 rounded-[12px] p-4", style: {
        background: "#FBF1F2"
      }, children: [{
        label: "Coût mensuel total",
        val: `${fmt(r.coutMensuel)} €`,
        accent: true
      }, {
        label: "Coût annuel estimé",
        val: `${fmt(r.coutAnnuel)} €`,
        accent: false
      }, {
        label: "Coefficient chargé",
        val: `×${r.coefficient.toFixed(2)}`,
        accent: false
      }].map(({
        label,
        val: v,
        accent
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl font-bold", style: {
          color: accent ? "#E2001A" : "#1A1714"
        }, children: v }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5", style: {
          color: "#8B847D"
        }, children: label })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-6 w-full rounded-full overflow-hidden", style: {
          gap: 2
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: `${barSalaire}%`,
            background: "#3B82F6",
            borderRadius: "9999px 0 0 9999px"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: `${barCharges}%`,
            background: "#F97316"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: `${barFrais}%`,
            background: "#8B5CF6",
            borderRadius: "0 9999px 9999px 0"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 mt-2 flex-wrap", children: [{
          color: "#3B82F6",
          label: "Salaire brut",
          val: fmt(r.salaireTotal) + " €"
        }, {
          color: "#F97316",
          label: "Charges patron.",
          val: fmt(r.totalCharges) + " €"
        }, {
          color: "#8B5CF6",
          label: "Frais fixes",
          val: fmt(r.totalFrais) + " €"
        }].map(({
          color,
          label,
          val: v
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full shrink-0", style: {
            background: color
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "#4A453F"
          }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: {
            color: "#1A1714"
          }, children: v })
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-medium select-none", style: {
          color: "#E2001A"
        }, children: "Voir le détail ligne par ligne" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm py-1.5 border-b", style: {
            borderColor: "#F0EBE4"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#4A453F"
            }, children: "Salaire brut (base)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", style: {
              color: "#1A1714"
            }, children: [
              fmt(salaireBrut),
              " €"
            ] })
          ] }),
          dureeHebdo === 39 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm py-1.5 border-b", style: {
            borderColor: "#F0EBE4"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#4A453F"
            }, children: "Supplément heures sup. (4h × 25%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", style: {
              color: "#1A1714"
            }, children: [
              "+ ",
              fmt(r.heuresSup),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wide", style: {
            color: "#8B847D"
          }, children: "Charges patronales" }),
          lignesCharges.map(({
            label,
            val: v,
            pct
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm py-1.5 border-b", style: {
            borderColor: "#F0EBE4"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
              color: "#4A453F"
            }, children: [
              label,
              " (",
              pct,
              "%)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", style: {
              color: "#1A1714"
            }, children: [
              "+ ",
              fmt(v),
              " €"
            ] })
          ] }, label)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wide", style: {
            color: "#8B847D"
          }, children: "Frais fixes mensuels" }),
          ligneFrais.map(({
            label,
            val: v
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm py-1.5 border-b", style: {
            borderColor: "#F0EBE4"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#4A453F"
            }, children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", style: {
              color: "#1A1714"
            }, children: [
              "+ ",
              fmt(v),
              " €"
            ] })
          ] }, label)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-bold py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#1A1714"
            }, children: "Coût mensuel total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
              color: "#E2001A"
            }, children: [
              fmt(r.coutMensuel),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#4A453F"
            }, children: "+ Coût 1ère embauche (visite médicale, DPAE…)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", style: {
              color: "#1A1714"
            }, children: [
              "+ ",
              fmt(params.cout_premier_embauche),
              " €"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-bold py-2 border-t-2", style: {
            borderColor: "#E5E0DA"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              color: "#1A1714"
            }, children: "Coût annuel estimé" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
              color: "#E2001A"
            }, children: [
              fmt(r.coutAnnuel),
              " €"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JuristeCard, {})
  ] });
}
function ParametresPanel({
  params,
  onSave
}) {
  const [form, setForm] = reactExports.useState({
    ...params
  });
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: Number(v) || 0
  }));
  const inputSt = {
    background: "rgba(26,23,20,.04)",
    border: "1px solid #E5E0DA",
    color: "#1A1714"
  };
  const champs = [{
    key: "taux_patronal",
    label: "Charges patronales générales",
    unit: "%"
  }, {
    key: "cotisation_cibtp",
    label: "CIBTP (congés payés)",
    unit: "%"
  }, {
    key: "oppbtp",
    label: "OPPBTP",
    unit: "%"
  }, {
    key: "chomage_intemp",
    label: "Chômage intempéries",
    unit: "%"
  }, {
    key: "prevoyance_probtp",
    label: "Prévoyance PRO.BTP",
    unit: "%"
  }, {
    key: "atmp",
    label: "AT/MP",
    unit: "%"
  }, {
    key: "mutuelle_mensuelle",
    label: "Mutuelle mensuelle",
    unit: "€"
  }, {
    key: "indemnite_trajet",
    label: "Indemnités trajet / mois",
    unit: "€"
  }, {
    key: "indemnite_repas",
    label: "Indemnités repas / mois",
    unit: "€"
  }, {
    key: "cout_premier_embauche",
    label: "Coût 1ère embauche",
    unit: "€"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[12px] p-4 space-y-4", style: {
    background: "rgba(26,23,20,.03)",
    border: "1px solid #E5E0DA"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", style: {
      color: "#4A453F"
    }, children: "Personnalisez les taux selon votre situation réelle. Les valeurs par défaut sont celles indiquées par la CAPEB pour le département 64." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: champs.map(({
      key,
      label,
      unit
    }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs mb-1", style: {
        color: "#4A453F"
      }, children: [
        label,
        " (",
        unit,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: 0, value: form[key], onChange: (e) => set(key, e.target.value), className: "w-full rounded-[8px] px-2.5 py-2 text-sm outline-none", style: inputSt })
    ] }, key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setForm({
        ...PARAMETRES_CHARGES_DEFAUT
      }), className: "rounded-[8px] px-3 py-2 text-xs font-medium", style: {
        background: "rgba(26,23,20,.08)",
        color: "#4A453F"
      }, children: "Réinitialiser" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSave(form), className: "rounded-[8px] px-4 py-2 text-xs font-semibold text-white", style: {
        background: "#E2001A"
      }, children: "Sauvegarder" })
    ] })
  ] });
}
function OngletJuriste() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JuristeCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] p-5 space-y-3", style: {
      background: "white",
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold", style: {
        color: "#1A1714"
      }, children: "Nos services juridiques" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5", children: ["Rédaction et validation de contrats de travail", "Conseils en droit du travail (rupture, licenciement, démission)", "Gestion des difficultés sociales et négociations", "Application des conventions collectives du bâtiment", "Procédures disciplinaires et contentieux prud'homal", "Assistance lors d'un contrôle URSSAF ou inspection du travail"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm", style: {
        color: "#4A453F"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 shrink-0 text-[#E2001A]", children: "✓" }),
        item
      ] }, item)) })
    ] })
  ] });
}
export {
  RhPage as component
};
