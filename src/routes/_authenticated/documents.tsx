import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  FileSignature, ScrollText, BookOpen, RotateCcw, ClipboardCheck,
  AlertTriangle, Handshake, FolderOpen, ExternalLink, Download, Mail,
  ArrowRight, X, ChevronDown, BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import { loadProfilEntreprise, loadChantiers, loadClients, type ProfilEntreprise, type Chantier, type Client } from "@/lib/local-data";
import { DOCUMENTS_CATALOGUE, DTU_REFERENCE, type ModeleDocument, type CategorieDocument } from "@/lib/documents-catalogue";
import { DOCUMENTS_TEMPLATES } from "@/lib/documents-templates";
import { generateContratPdf } from "@/lib/contrat-pdf";

export const Route = createFileRoute("/_authenticated/documents")({
  ssr: false,
  head: () => ({ meta: [{ title: "Mes documents" }] }),
  component: DocumentsPage,
});

// ── Icônes dynamiques ─────────────────────────────────────────────────────────

const ICONES: Record<string, React.ElementType> = {
  FileSignature, ScrollText, BookOpen, RotateCcw, ClipboardCheck,
  AlertTriangle, Handshake, FolderOpen,
};
function Icone({ nom, className }: { nom: string; className?: string }) {
  const Comp = ICONES[nom] ?? FolderOpen;
  return <Comp className={className} />;
}

// ── Labels catégories ─────────────────────────────────────────────────────────

const CATEGORIE_LABELS: Record<CategorieDocument | "tous", string> = {
  tous: "Tous",
  contrat: "Contrats",
  "suivi-chantier": "Suivi chantier",
  legal: "Légal",
  recouvrement: "Recouvrement",
  reference: "Référence",
};

const CATEGORIE_COULEURS: Record<CategorieDocument, { bg: string; text: string }> = {
  contrat:        { bg: "rgba(43,108,176,.1)",   text: "#2B6CB0" },
  "suivi-chantier": { bg: "rgba(30,142,85,.1)",  text: "#1E6B3F" },
  legal:          { bg: "rgba(217,138,0,.1)",    text: "#9A6200" },
  recouvrement:   { bg: "rgba(226,0,26,.1)",     text: "#B00012" },
  reference:      { bg: "rgba(100,100,100,.1)",  text: "#4A453F" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Page principale ───────────────────────────────────────────────────────────

function DocumentsPage() {
  const [onglet, setOnglet] = useState<"bibliotheque" | "dtu">("bibliotheque");
  const [filtre, setFiltre] = useState<CategorieDocument | "tous">("tous");
  const [docGenId, setDocGenId] = useState<string | null>(null);

  const [profil, setProfil] = useState<ProfilEntreprise>({ nom: "", siret: "", adresse: "", telephone: "", email: "" });
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setProfil(loadProfilEntreprise());
    setChantiers(loadChantiers());
    setClients(loadClients());
  }, []);

  const docsFiltres = useMemo(() =>
    filtre === "tous"
      ? DOCUMENTS_CATALOGUE
      : DOCUMENTS_CATALOGUE.filter((d) => d.categorie === filtre),
    [filtre]
  );

  const docGenOuvert = docGenId ? DOCUMENTS_CATALOGUE.find((d) => d.id === docGenId) ?? null : null;

  const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-all";
  const inputSt = { background: "white", border: "1px solid #E5E0DA", color: "#1A1714" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Mes documents
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Tous les modèles dont vous avez besoin, prêts à l'emploi
        </p>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-1 p-1 rounded-[12px] w-fit" style={{ background: "rgba(26,23,20,.06)" }}>
        {(["bibliotheque", "dtu"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className="px-4 py-2 rounded-[9px] text-[13px] font-semibold transition-all"
            style={{
              background: onglet === o ? "white" : "transparent",
              color: onglet === o ? "#1A1714" : "#8B847D",
              boxShadow: onglet === o ? "0 1px 4px rgba(26,23,20,.12)" : "none",
            }}
          >
            {o === "bibliotheque" ? "Bibliothèque de modèles" : "DTU & normes"}
          </button>
        ))}
      </div>

      {/* ── Bibliothèque ── */}
      {onglet === "bibliotheque" && (
        <div className="space-y-4">
          {/* Filtres catégorie */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORIE_LABELS) as (CategorieDocument | "tous")[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltre(cat)}
                className="px-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-all"
                style={{
                  background: filtre === cat ? "#E2001A" : "white",
                  color: filtre === cat ? "white" : "#4A453F",
                  border: filtre === cat ? "1px solid #E2001A" : "1px solid #E5E0DA",
                }}
              >
                {CATEGORIE_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Grille de cartes */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {docsFiltres.map((doc) => (
              <CarteDocument
                key={doc.id}
                doc={doc}
                profil={profil}
                onGenerer={() => setDocGenId(doc.id)}
                inputCls={inputCls}
                inputSt={inputSt}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── DTU & normes ── */}
      {onglet === "dtu" && (
        <SectionDTU />
      )}

      {/* ── Modal de génération ── */}
      {docGenOuvert && (
        <ModalGeneration
          doc={docGenOuvert}
          profil={profil}
          chantiers={chantiers}
          clients={clients}
          onClose={() => setDocGenId(null)}
          inputCls={inputCls}
          inputSt={inputSt}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </div>
  );
}

// ── Carte document ────────────────────────────────────────────────────────────

function CarteDocument({
  doc, profil, onGenerer, inputCls, inputSt, onFocus, onBlur,
}: {
  doc: ModeleDocument;
  profil: ProfilEntreprise;
  onGenerer: () => void;
  inputCls: string;
  inputSt: React.CSSProperties;
  onFocus: (e: React.FocusEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
}) {
  const navigate = useNavigate();
  const cat = CATEGORIE_COULEURS[doc.categorie];

  const mailtoEnvoyer = () => {
    const dest = profil.email ?? "";
    const sujet = encodeURIComponent(`Modèle CAPEB — ${doc.titre}`);
    const corps = encodeURIComponent(
      `Bonjour,\n\nVous trouverez ci-joint le modèle "${doc.titre}" téléchargé depuis votre Espace Artisan CAPEB.\n\n⚠️ IMPORTANT : vous devez joindre manuellement le fichier PDF téléchargé à cet email avant de l'envoyer. Les liens mailto ne permettent pas de joindre des fichiers automatiquement.\n\nCordialement`
    );
    window.open(`mailto:${dest}?subject=${sujet}&body=${corps}`);
  };

  return (
    <div
      className="bg-white rounded-[14px] border border-[#ECE7E1] p-[18px] flex flex-col gap-3"
      style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}
    >
      {/* Icône + titre */}
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center rounded-[10px] flex-shrink-0 mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(226,0,26,.08)" }}
        >
          <Icone nom={doc.icone} className="h-[18px] w-[18px] text-[#E2001A]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[15.5px] font-semibold leading-tight text-[#1A1714]">
            {doc.titre}
          </h3>
          <span
            className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: cat.bg, color: cat.text }}
          >
            {CATEGORIE_LABELS[doc.categorie]}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] text-[#4A453F] leading-relaxed">{doc.description}</p>

      {/* Avertissement */}
      {doc.avertissement && (
        <div
          className="rounded-[8px] px-3 py-2 text-[12px] leading-snug"
          style={{ background: "rgba(217,138,0,.08)", border: "1px solid rgba(217,138,0,.2)", color: "#7A5500" }}
        >
          {doc.avertissement}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-[#F0EBE4] flex flex-wrap gap-2">
        {doc.typeAction === "lien-interne" && (
          <button
            onClick={() => navigate({ to: doc.lienInterne as any })}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white rounded-[9px] px-3 py-2 flex-1 justify-center transition-colors"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            Ouvrir le module PV
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}

        {doc.typeAction === "lecture" && doc.fichierSource && (
          <>
            <a
              href={doc.fichierSource}
              download
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white rounded-[9px] px-3 py-2 flex-1 justify-center transition-colors"
              style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger
            </a>
            {doc.estEnvoyableParMail && (
              <button
                onClick={mailtoEnvoyer}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold rounded-[9px] px-3 py-2 transition-colors"
                style={{ background: "white", border: "1px solid #E5E0DA", color: "#4A453F" }}
              >
                <Mail className="h-3.5 w-3.5" />
                Recevoir par mail
              </button>
            )}
          </>
        )}

        {doc.typeAction === "generation" && (
          <button
            onClick={onGenerer}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white rounded-[9px] px-3 py-2 flex-1 justify-center transition-colors"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            <Download className="h-3.5 w-3.5" />
            Générer le document
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal de génération ───────────────────────────────────────────────────────

function ModalGeneration({
  doc, profil, chantiers, clients, onClose, inputCls, inputSt, onFocus, onBlur,
}: {
  doc: ModeleDocument;
  profil: ProfilEntreprise;
  chantiers: Chantier[];
  clients: Client[];
  onClose: () => void;
  inputCls: string;
  inputSt: React.CSSProperties;
  onFocus: (e: React.FocusEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
}) {
  const template = DOCUMENTS_TEMPLATES.find((t) => t.id === doc.templateId);
  const [donnees, setDonnees] = useState<Record<string, string>>({});
  const [chantierSelId, setChantierSelId] = useState("");
  const [generating, setGenerating] = useState(false);

  const chantierSel = chantiers.find((c) => c.id === chantierSelId);
  const clientSel = chantierSel ? clients.find((c) => c.id === chantierSel.client_id) : undefined;

  const autoFilled = useMemo<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    if (profil.nom)           d.entreprise_nom     = profil.nom;
    if (profil.siret)         d.entreprise_siret   = profil.siret;
    if (profil.adresse)       d.entreprise_adresse = profil.adresse;
    if (profil.forme_juridique) d.forme_juridique  = profil.forme_juridique;
    if (profil.assurance)     d.nom_assureur       = profil.assurance;
    if (profil.num_police)    d.num_police         = profil.num_police;
    d.date_signature = today();

    if (chantierSel) {
      d.description_travaux = chantierSel.nature_travaux ?? "";
    }
    if (clientSel) {
      d.client_nom     = clientSel.nom ?? "";
      d.client_adresse = clientSel.adresse ?? "";
      // L'adresse du chantier n'est pas stockée séparément : on utilise celle du client
      d.adresse_chantier = clientSel.adresse ?? "";
    }
    return d;
  }, [profil, chantierSel, clientSel]);

  const set = (k: string, v: string) => setDonnees((d) => ({ ...d, [k]: v }));
  const val = (k: string) => donnees[k] ?? autoFilled[k] ?? "";

  const handleGenerate = () => {
    if (!template) { toast.error("Template introuvable"); return; }
    setGenerating(true);
    try {
      const merged: Record<string, string> = {};
      for (const champ of template.champsManuels) {
        merged[champ.key] = val(champ.key) || (champ.defaut ?? "");
      }
      const final = { ...autoFilled, ...donnees, ...merged };
      const pdf = generateContratPdf(template.titre, template.texte, final, profil);
      const fileName = `${doc.id}_${today()}.pdf`;
      pdf.save(fileName);
      toast.success("Document généré et téléchargé !");
      onClose();
    } catch (err) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (!template) return null;

  const peutSelChantier = ["mise_en_demeure", "sous_traitance"].includes(template.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(22,19,15,.5)", backdropFilter: "blur(4px)" }}>
      <div
        className="bg-white rounded-[18px] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(26,23,20,.2)" }}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F0EBE4]">
          <div>
            <h2 className="font-display text-[17px] font-semibold text-[#1A1714]">{doc.titre}</h2>
            <p className="text-[12px] text-[#8B847D] mt-0.5">
              Les champs en gris sont pré-remplis depuis votre profil
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F5F2EE] transition-colors">
            <X className="h-4 w-4 text-[#8B847D]" />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Avertissement si présent */}
          {doc.avertissement && (
            <div className="rounded-[10px] px-3 py-2.5 text-[12.5px] leading-snug"
              style={{ background: "rgba(217,138,0,.08)", border: "1px solid rgba(217,138,0,.2)", color: "#7A5500" }}>
              {doc.avertissement}
            </div>
          )}

          {/* Sélecteur de chantier (optionnel) */}
          {peutSelChantier && chantiers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-semibold text-[#4A453F]">
                Partir d'un dossier existant <span className="text-[#8B847D] font-normal">(optionnel — pré-remplit client et travaux)</span>
              </label>
              <div className="relative">
                <select
                  value={chantierSelId}
                  onChange={(e) => setChantierSelId(e.target.value)}
                  className={inputCls}
                  style={{ ...inputSt, appearance: "none", paddingRight: 32 }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="">— Aucun dossier sélectionné —</option>
                  {chantiers.map((c) => {
                    const cl = clients.find((cl) => cl.id === c.client_id);
                    return (
                      <option key={c.id} value={c.id}>
                        {cl?.nom ?? "Client inconnu"} — {c.nature_travaux}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B847D] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Champs auto-remplis (affichage en lecture) */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-semibold text-[#8B847D] uppercase tracking-wide">
              Pré-rempli depuis votre profil
            </p>
            <div className="rounded-[10px] p-3 space-y-2" style={{ background: "rgba(26,23,20,.03)", border: "1px solid #EDE8E2" }}>
              {template.champsAutoRemplissables.map((k) => (
                autoFilled[k] ? (
                  <div key={k} className="flex gap-2 text-[12.5px]">
                    <span className="text-[#8B847D] min-w-[120px] flex-shrink-0 capitalize">{k.replace(/_/g, " ")} :</span>
                    <span className="text-[#1A1714] font-medium truncate">{autoFilled[k]}</span>
                  </div>
                ) : null
              ))}
              {template.champsAutoRemplissables.every((k) => !autoFilled[k]) && (
                <p className="text-[12px] text-[#8B847D] italic">
                  Profil d'entreprise non renseigné. Complétez-le dans RH & Juridique.
                </p>
              )}
            </div>
          </div>

          {/* Champs manuels */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-[#8B847D] uppercase tracking-wide">
              Champs à compléter
            </p>
            {template.champsManuels.map((champ) => {
              const autoVal = autoFilled[champ.key];
              const isAutoFilled = Boolean(autoVal);
              return (
                <div key={champ.key} className="space-y-1">
                  <label className="text-[12.5px] font-semibold text-[#4A453F]">
                    {champ.label}
                    {isAutoFilled && (
                      <span className="ml-1.5 text-[11px] font-normal text-[#8B847D]">(pré-rempli)</span>
                    )}
                  </label>
                  {champ.options ? (
                    <div className="relative">
                      <select
                        value={val(champ.key)}
                        onChange={(e) => set(champ.key, e.target.value)}
                        className={inputCls}
                        style={{ ...inputSt, appearance: "none", paddingRight: 32, ...(isAutoFilled ? { background: "rgba(26,23,20,.03)" } : {}) }}
                        onFocus={onFocus} onBlur={onBlur}
                      >
                        {champ.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B847D] pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={champ.type ?? "text"}
                      value={val(champ.key)}
                      placeholder={champ.defaut ?? ""}
                      onChange={(e) => set(champ.key, e.target.value)}
                      className={inputCls}
                      style={{ ...inputSt, ...(isAutoFilled ? { background: "rgba(26,23,20,.03)" } : {}) }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 border-t border-[#F0EBE4] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[10px] py-2.5 text-[13px] font-semibold text-[#4A453F] transition-colors"
            style={{ background: "white", border: "1px solid #E5E0DA" }}
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-[2] flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-semibold text-white transition-all"
            style={{
              background: generating ? "#ccc" : "linear-gradient(180deg,#EA1227,#D2001A)",
              boxShadow: generating ? "none" : "0 3px 10px rgba(226,0,26,.3)",
            }}
          >
            <Download className="h-4 w-4" />
            {generating ? "Génération…" : "Générer le PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section DTU ───────────────────────────────────────────────────────────────

function SectionDTU() {
  return (
    <div className="space-y-4">
      {/* Bandeau explicatif */}
      <div
        className="rounded-[14px] px-5 py-4 flex gap-4"
        style={{ background: "rgba(43,108,176,.06)", border: "1px solid rgba(43,108,176,.18)" }}
      >
        <BookMarked className="h-5 w-5 text-[#2B6CB0] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[13.5px] font-semibold text-[#1A3A5C]">
            Les DTU sont des normes NF protégées par le droit d'auteur AFNOR
          </p>
          <p className="text-[12.5px] text-[#2B6CB0] leading-relaxed">
            Il est interdit de diffuser ou télécharger un DTU sans licence, même à usage interne.
            Vous pouvez les acheter sur les boutiques officielles CSTB et AFNOR.
            Besoin d'aide pour vous y retrouver ?{" "}
            <a
              href="mailto:guillaume.pigue@capeb-adour-pyrenees.fr?subject=Aide%20DTU%20%26%20normes"
              className="underline font-semibold"
            >
              Contactez Guillaume Pigué (pôle Technique & Éco.)
            </a>
          </p>
        </div>
      </div>

      {/* Table DTU */}
      <div
        className="bg-white rounded-[14px] border border-[#ECE7E1] overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06)" }}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "rgba(226,0,26,.05)" }}>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1714] border-b border-[#ECE7E1] w-[160px]">Référence</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1714] border-b border-[#ECE7E1]">Titre</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1714] border-b border-[#ECE7E1] w-[160px] hidden md:table-cell">Métier</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1A1714] border-b border-[#ECE7E1] w-[160px]">Acheter</th>
            </tr>
          </thead>
          <tbody>
            {DTU_REFERENCE.map((dtu, i) => (
              <tr key={dtu.numero} style={{ background: i % 2 === 0 ? "white" : "rgba(26,23,20,.015)" }}>
                <td className="px-4 py-3 font-semibold text-[#E2001A] border-b border-[#F5F2EE] whitespace-nowrap">
                  {dtu.numero}
                </td>
                <td className="px-4 py-3 text-[#1A1714] border-b border-[#F5F2EE]">{dtu.titre}</td>
                <td className="px-4 py-3 text-[#8B847D] border-b border-[#F5F2EE] hidden md:table-cell">{dtu.metier}</td>
                <td className="px-4 py-3 border-b border-[#F5F2EE]">
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href="https://boutique.cstb.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-[6px] transition-colors whitespace-nowrap"
                      style={{ background: "rgba(30,142,85,.1)", color: "#1E6B3F" }}
                    >
                      CSTB <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="https://www.boutique.afnor.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-[6px] transition-colors whitespace-nowrap"
                      style={{ background: "rgba(43,108,176,.1)", color: "#2B6CB0" }}
                    >
                      AFNOR <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
