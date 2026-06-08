import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Users, FileText, Calculator, Phone, Mail, Calendar, Plus, ChevronDown, ChevronUp, Pencil, Download, X } from "lucide-react";
import {
  loadProfilEntreprise, saveProfilEntreprise,
  loadEmployesRH, addEmployeRH,
  loadContratsGeneres, addContratGenere,
  loadParametresCharges, saveParametresCharges,
  notifyUpdate, DATA_EVENT,
  PARAMETRES_CHARGES_DEFAUT,
  type ProfilEntreprise, type EmployeRH, type ContratGenere, type ParametresCharges,
} from "@/lib/local-data";
import { CONTRAT_TEMPLATES } from "@/lib/contrat-templates";
import { generateContratPdf } from "@/lib/contrat-pdf";

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/rh")({
  ssr: false,
  component: RhPage,
});

// ── Types locaux ──────────────────────────────────────────────────────────────

type OngletRH = "modeles" | "cout" | "juriste";

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return iso; }
}

// ── Page principale ───────────────────────────────────────────────────────────

function RhPage() {
  const [onglet, setOnglet] = useState<OngletRH>("modeles");
  const [profil, setProfil] = useState<ProfilEntreprise>(() => loadProfilEntreprise());
  const [employes, setEmployes] = useState<EmployeRH[]>(() => loadEmployesRH());
  const [contrats, setContrats] = useState<ContratGenere[]>(() => loadContratsGeneres());
  const [showProfilModal, setShowProfilModal] = useState(false);

  const refreshAll = () => {
    setProfil(loadProfilEntreprise());
    setEmployes(loadEmployesRH());
    setContrats(loadContratsGeneres());
  };

  useEffect(() => {
    window.addEventListener(DATA_EVENT, refreshAll);
    return () => window.removeEventListener(DATA_EVENT, refreshAll);
  }, []);

  const ONGLETS: { id: OngletRH; label: string; icon: React.ElementType }[] = [
    { id: "modeles",  label: "Modèles de contrats", icon: FileText },
    { id: "cout",     label: "Coût d'embauche",     icon: Calculator },
    { id: "juriste",  label: "Besoin d'un juriste ?", icon: Phone },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="font-display text-[26px] font-bold tracking-wide"
            style={{ color: "#1A1714" }}
          >
            RH &amp; Juridique
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B847D" }}>
            Contrats, calcul de coût d'embauche et contact juridique CAPEB
          </p>
        </div>

        {/* Bouton configurer profil */}
        <button
          onClick={() => setShowProfilModal(true)}
          className="flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: profil.nom ? "rgba(226,0,26,.08)" : "#E2001A",
            color: profil.nom ? "#E2001A" : "white",
            border: profil.nom ? "1px solid rgba(226,0,26,.2)" : "none",
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
          {profil.nom ? "Mon entreprise" : "Configurer mon entreprise"}
        </button>
      </div>

      {/* Bandeau d'avertissement si profil vide */}
      {!profil.nom && (
        <div
          className="rounded-[10px] p-3 flex items-center gap-3 text-sm"
          style={{ background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E" }}
        >
          <span>⚠</span>
          <span>
            Configurez d'abord votre profil entreprise pour que les contrats soient pré-remplis avec vos coordonnées.
          </span>
          <button
            onClick={() => setShowProfilModal(true)}
            className="ml-auto font-semibold underline shrink-0"
          >
            Configurer
          </button>
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex gap-1 p-1 rounded-[12px]" style={{ background: "rgba(26,23,20,.06)" }}>
        {ONGLETS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setOnglet(id)}
            className="flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-sm font-medium transition-all flex-1 justify-center"
            style={{
              background: onglet === id ? "white" : "transparent",
              color: onglet === id ? "#E2001A" : "#4A453F",
              boxShadow: onglet === id ? "0 1px 6px rgba(0,0,0,.1)" : "none",
              fontWeight: onglet === id ? 600 : 500,
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Contenu de l'onglet ── */}
      {onglet === "modeles" && (
        <OngletModeles
          profil={profil}
          employes={employes}
          contrats={contrats}
          onDataChange={refreshAll}
        />
      )}
      {onglet === "cout" && <OngletCout />}
      {onglet === "juriste" && <OngletJuriste />}

      {/* ── Modal profil ── */}
      {showProfilModal && (
        <ProfilModal
          profil={profil}
          onClose={() => setShowProfilModal(false)}
          onSave={(p) => {
            saveProfilEntreprise(p);
            setProfil(p);
            notifyUpdate();
            setShowProfilModal(false);
            toast.success("Profil entreprise sauvegardé");
          }}
        />
      )}
    </div>
  );
}

// ── Bandeau légal (contrats) ──────────────────────────────────────────────────

function BandeauLegal() {
  return (
    <div
      className="rounded-[10px] p-3 text-xs leading-relaxed"
      style={{ background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412" }}
    >
      <strong>⚠ Modèles indicatifs</strong> — Ces contrats sont fournis à titre d'exemple.
      Ils doivent être personnalisés et validés par un juriste avant signature.
      La CAPEB et cette application déclinent toute responsabilité quant à leur usage.
      En cas de doute, contactez le{" "}
      <a
        href="mailto:juriste@capeb-adour-pyrenees.fr"
        className="underline font-medium"
      >
        service juridique CAPEB
      </a>.
    </div>
  );
}

// ── Bandeau avertissement (calcul de coût) ────────────────────────────────────

function BandeauCout() {
  return (
    <div
      className="rounded-[10px] p-3 text-xs leading-relaxed"
      style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1E40AF" }}
    >
      <strong>ℹ Estimation indicative</strong> — Les taux exacts (AT/MP, caisse congés payés régionale,
      indemnités de zone) dépendent de votre situation. Pour un chiffre certifié,
      rapprochez-vous de votre expert-comptable ou du service social CAPEB.
    </div>
  );
}

// ── Carte contact juriste ─────────────────────────────────────────────────────

function JuristeCard() {
  const profil = loadProfilEntreprise();

  const mailtoContact = `mailto:nicolas.souard@capeb-adour-pyrenees.fr?subject=${encodeURIComponent(
    "Demande d'accompagnement RH/juridique",
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nEntreprise : ${profil.nom || "—"}\nSIRET : ${profil.siret || "—"}\n\nMerci de me contacter pour une question RH/juridique.\n\nCordialement.`,
  )}`;

  const mailtoRdv = `mailto:nicolas.souard@capeb-adour-pyrenees.fr?subject=${encodeURIComponent(
    "Demande de rendez-vous",
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nEntreprise : ${profil.nom || "—"}\nSIRET : ${profil.siret || "—"}\n\nDemande de rendez-vous.\n\nCréneaux souhaités : \n\nCordialement.`,
  )}`;

  return (
    <div
      className="rounded-[14px] p-5 text-white"
      style={{ background: "linear-gradient(135deg, #E2001A 0%, #A30012 100%)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-white/20 p-2.5">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display text-lg font-bold tracking-wide">Service Juridique CAPEB</div>
          <div className="text-white/75 text-sm">Nicolas Souard — CAPEB Adour-Pyrénées</div>
        </div>
      </div>
      <p className="text-sm text-white/85 mb-5 leading-relaxed">
        Besoin d'aide pour rédiger, valider ou comprendre un contrat ?
        Notre service juridique est là pour vous accompagner dans toutes vos démarches RH.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="tel:+33562343008"
          className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors bg-white text-[#E2001A]"
        >
          <Phone className="h-4 w-4" />
          05 62 34 30 08
        </a>
        <a
          href={mailtoContact}
          className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <Mail className="h-4 w-4" />
          Envoyer un email
        </a>
        <a
          href={mailtoRdv}
          className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <Calendar className="h-4 w-4" />
          Prendre RDV
        </a>
      </div>
    </div>
  );
}

// ── Modal : profil entreprise ─────────────────────────────────────────────────

function ProfilModal({
  profil,
  onClose,
  onSave,
}: {
  profil: ProfilEntreprise;
  onClose: () => void;
  onSave: (p: ProfilEntreprise) => void;
}) {
  const [form, setForm] = useState<ProfilEntreprise>({ ...profil });

  const set = (k: keyof ProfilEntreprise, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-[16px] p-6 shadow-2xl"
        style={{ background: "#FAF8F5" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold" style={{ color: "#1A1714" }}>
            Mon entreprise
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/8">
            <X className="h-5 w-5 text-[#8B847D]" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.nom.trim()) { toast.error("Le nom est requis"); return; }
            onSave(form);
          }}
          className="space-y-3"
        >
          {(
            [
              { key: "nom",       label: "Nom de l'entreprise *", placeholder: "SARL Dupont BTP" },
              { key: "siret",     label: "SIRET",                  placeholder: "123 456 789 00012" },
              { key: "adresse",   label: "Adresse",                placeholder: "12 rue des Artisans, 64000 Pau" },
              { key: "telephone", label: "Téléphone",              placeholder: "05 59 00 00 00" },
              { key: "email",     label: "Email",                  placeholder: "contact@votreentreprise.fr" },
            ] as { key: keyof ProfilEntreprise; label: string; placeholder: string }[]
          ).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
                {label}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "white",
                  border: "1px solid #E5E0DA",
                  color: "#1A1714",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid #E2001A";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid #E5E0DA";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] py-2.5 text-sm font-medium"
              style={{ background: "rgba(26,23,20,.08)", color: "#4A453F" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white"
              style={{ background: "#E2001A" }}
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal : nouvel employé ────────────────────────────────────────────────────

function NouvelEmployeDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (e: EmployeRH) => void;
}) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [numSecu, setNumSecu] = useState("");
  const [qualification, setQualification] = useState("");
  const [adresse, setAdresse] = useState("");
  const [statut, setStatut] = useState<"ouvrier" | "etam" | "cadre">("ouvrier");

  const inputStyle = {
    background: "white",
    border: "1px solid #E5E0DA",
    color: "#1A1714",
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) { toast.error("Nom et prénom requis"); return; }
    const emp = addEmployeRH({
      nom: nom.trim(),
      prenom: prenom.trim(),
      date_naissance: dateNaissance || null,
      num_secu: numSecu || null,
      qualification: qualification || null,
      salarie_adresse: adresse || null,
      statut,
      actif: true,
    });
    notifyUpdate();
    toast.success(`${prenom} ${nom} ajouté(e)`);
    onCreated(emp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-[16px] p-6 shadow-2xl"
        style={{ background: "#FAF8F5" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold" style={{ color: "#1A1714" }}>
            Ajouter un employé
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/8">
            <X className="h-5 w-5 text-[#8B847D]" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Prénom *", val: prenom, set: setPrenom, placeholder: "Jean" },
              { label: "Nom *",    val: nom,    set: setNom,    placeholder: "MARTIN" },
            ].map(({ label, val, set: setFn, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>{label}</label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setFn(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Statut</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as "ouvrier" | "etam" | "cadre")}
              className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none"
              style={inputStyle}
              onFocus={inputFocus}
              onBlur={inputBlur}
            >
              <option value="ouvrier">Ouvrier</option>
              <option value="etam">ETAM</option>
              <option value="cadre">Cadre</option>
            </select>
          </div>

          {[
            { label: "Date de naissance",         val: dateNaissance, set: setDateNaissance, type: "date",  placeholder: "" },
            { label: "Qualification / coefficient", val: qualification, set: setQualification, type: "text",  placeholder: "N3P1 – Ouvrier qualifié" },
            { label: "Adresse",                   val: adresse,       set: setAdresse,       type: "text",  placeholder: "12 rue de la Paix, 64000 Pau" },
            { label: "N° sécurité sociale",        val: numSecu,       set: setNumSecu,       type: "text",  placeholder: "1 XX XX XX XXX XXX XX" },
          ].map(({ label, val, set: setFn, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>{label}</label>
              <input
                type={type}
                value={val}
                onChange={(e) => setFn(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] py-2.5 text-sm font-medium"
              style={{ background: "rgba(26,23,20,.08)", color: "#4A453F" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white"
              style={{ background: "#E2001A" }}
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Onglet 1 : Modèles de contrats ────────────────────────────────────────────

function OngletModeles({
  profil,
  employes,
  contrats,
  onDataChange,
}: {
  profil: ProfilEntreprise;
  employes: EmployeRH[];
  contrats: ContratGenere[];
  onDataChange: () => void;
}) {
  const [typeId, setTypeId] = useState("");
  const [employeId, setEmployeId] = useState("");
  const [showNouvelEmploye, setShowNouvelEmploye] = useState(false);
  const [donnees, setDonnees] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const template = CONTRAT_TEMPLATES.find((t) => t.id === typeId);
  const employe = employes.find((e) => e.id === employeId);

  // Champs auto-remplis depuis profil & employé
  const autoFilled = useMemo<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    if (profil.nom)      d.entreprise_nom     = profil.nom;
    if (profil.siret)    d.entreprise_siret   = profil.siret;
    if (profil.adresse)  d.entreprise_adresse = profil.adresse;
    if (employe) {
      d.salarie_nom    = employe.nom;
      d.salarie_prenom = employe.prenom;
      if (employe.qualification)   d.qualification   = employe.qualification;
      if (employe.salarie_adresse) d.salarie_adresse = employe.salarie_adresse;
      if (employe.date_naissance)  d.date_naissance  = fmtDate(employe.date_naissance);
    }
    d.date_signature = today();
    return d;
  }, [profil, employe]);

  // Champs manuels à afficher dans le formulaire
  const CHAMPS_MANUELS: { key: string; label: string; type?: string; options?: string[] }[] = [
    { key: "poste",               label: "Intitulé du poste",          type: "text" },
    { key: "salaire_brut_mensuel",label: "Salaire brut mensuel (€)",   type: "number" },
    { key: "date_debut",          label: "Date de début",              type: "date" },
    { key: "duree_hebdo",         label: "Durée hebdomadaire",         options: ["35", "39"] },
    { key: "lieu",                label: "Lieu de signature",          type: "text" },
    { key: "date_signature",      label: "Date de signature",          type: "date" },
    ...(template?.champsSpecifiques.includes("motif_cdd")
      ? [{ key: "motif_cdd", label: "Motif du CDD", type: "text" }] : []),
    ...(template?.champsSpecifiques.includes("date_fin_cdd")
      ? [{ key: "date_fin_cdd", label: "Date de fin du contrat", type: "date" }] : []),
    ...(template?.champsSpecifiques.includes("date_naissance") && !employe?.date_naissance
      ? [{ key: "date_naissance", label: "Date de naissance", type: "date" }] : []),
    ...(template?.champsSpecifiques.includes("nom_cfa")
      ? [{ key: "nom_cfa", label: "Nom du CFA", type: "text" }] : []),
    ...(!employe?.salarie_adresse
      ? [{ key: "salarie_adresse", label: "Adresse du salarié", type: "text" }] : []),
    ...(!employe?.qualification
      ? [{ key: "qualification", label: "Qualification / coefficient", type: "text" }] : []),
  ];

  const set = (k: string, v: string) => setDonnees((d) => ({ ...d, [k]: v }));

  const val = (k: string): string => donnees[k] ?? autoFilled[k] ?? "";

  const handleGenerate = () => {
    if (!template) { toast.error("Choisissez un type de contrat"); return; }
    if (!employe)  { toast.error("Sélectionnez un employé"); return; }
    if (!val("poste")) { toast.error("L'intitulé du poste est requis"); return; }
    if (!val("salaire_brut_mensuel")) { toast.error("Le salaire brut est requis"); return; }

    setGenerating(true);
    try {
      const merged = { ...autoFilled, ...donnees };
      if (!merged.duree_hebdo) merged.duree_hebdo = "35";

      const pdf = generateContratPdf(template.titre, template.texte, merged, profil);
      const fileName = `${template.id}_${employe.nom}_${employe.prenom}_${today()}.pdf`;
      pdf.save(fileName);

      addContratGenere({
        employe_id: employe.id,
        employe_nom: `${employe.prenom} ${employe.nom}`,
        type_contrat: template.id,
        titre_contrat: template.titre,
        donnees: merged,
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
  const inputSt = { background: "white", border: "1px solid #E5E0DA", color: "#1A1714" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="space-y-5">
      <BandeauLegal />

      <div
        className="rounded-[16px] p-5 space-y-5"
        style={{ background: "white", border: "1px solid #E5E0DA" }}
      >
        <h2 className="font-display text-lg font-bold" style={{ color: "#1A1714" }}>
          Générer un contrat
        </h2>

        {/* Type de contrat */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A453F" }}>
            Type de contrat
          </label>
          <select
            value={typeId}
            onChange={(e) => { setTypeId(e.target.value); setDonnees({}); }}
            className={inputCls}
            style={inputSt}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">-- Choisir un modèle --</option>
            {CONTRAT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.titre}</option>
            ))}
          </select>
          {template && (
            <p className="mt-1 text-xs" style={{ color: "#8B847D" }}>{template.description}</p>
          )}
        </div>

        {/* Sélection employé */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: "#4A453F" }}>
              Employé(e)
            </label>
            <button
              type="button"
              onClick={() => setShowNouvelEmploye(true)}
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#E2001A" }}
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter un employé
            </button>
          </div>
          <select
            value={employeId}
            onChange={(e) => setEmployeId(e.target.value)}
            className={inputCls}
            style={inputSt}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">-- Sélectionner --</option>
            {employes.filter((e) => e.actif).map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom} — {e.statut}
              </option>
            ))}
          </select>
          {employes.length === 0 && (
            <p className="mt-1 text-xs" style={{ color: "#8B847D" }}>
              Aucun employé enregistré. Cliquez sur « Ajouter un employé » pour commencer.
            </p>
          )}
        </div>

        {/* Champs du contrat */}
        {typeId && employeId && (
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: "#F0EBE4" }}>
            <p className="text-xs" style={{ color: "#8B847D" }}>
              Les champs en grisé sont pré-remplis automatiquement.
            </p>

            {/* Champs auto (lecture seule) */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "entreprise_nom",     l: "Entreprise" },
                { k: "salarie_prenom",     l: "Prénom salarié" },
                { k: "salarie_nom",        l: "Nom salarié" },
                { k: "qualification",      l: "Qualification" },
              ].map(({ k, l }) =>
                autoFilled[k] ? (
                  <div key={k}>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#8B847D" }}>{l}</label>
                    <div
                      className="rounded-[10px] px-3 py-2.5 text-sm"
                      style={{ background: "rgba(26,23,20,.04)", color: "#8B847D", border: "1px solid #E5E0DA" }}
                    >
                      {autoFilled[k]}
                    </div>
                  </div>
                ) : null,
              )}
            </div>

            {/* Champs manuels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHAMPS_MANUELS.map(({ key, label, type, options }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
                    {label}
                  </label>
                  {options ? (
                    <select
                      value={val(key)}
                      onChange={(e) => set(key, e.target.value)}
                      className={inputCls}
                      style={inputSt}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      {options.map((o) => (
                        <option key={o} value={o}>{o}h / semaine</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type || "text"}
                      value={val(key)}
                      onChange={(e) => set(key, e.target.value)}
                      className={inputCls}
                      style={inputSt}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition-opacity"
              style={{ background: "#E2001A", opacity: generating ? 0.6 : 1 }}
            >
              <Download className="h-4 w-4" />
              {generating ? "Génération…" : "Générer le PDF"}
            </button>
          </div>
        )}
      </div>

      {/* ── Historique des contrats ── */}
      {contrats.length > 0 && (
        <div
          className="rounded-[16px] p-5"
          style={{ background: "white", border: "1px solid #E5E0DA" }}
        >
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "#1A1714" }}>
            Contrats générés
          </h2>
          <div className="space-y-2">
            {contrats.slice(0, 10).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-[10px] px-4 py-3"
                style={{ background: "rgba(26,23,20,.03)", border: "1px solid #F0EBE4" }}
              >
                <FileText className="h-4 w-4 shrink-0" style={{ color: "#8B847D" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#1A1714" }}>
                    {c.titre_contrat}
                  </div>
                  <div className="text-xs" style={{ color: "#8B847D" }}>
                    {c.employe_nom} · {fmtDate(c.date_generation)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <JuristeCard />

      {showNouvelEmploye && (
        <NouvelEmployeDialog
          onClose={() => setShowNouvelEmploye(false)}
          onCreated={(e) => {
            setEmployeId(e.id);
            setShowNouvelEmploye(false);
          }}
        />
      )}
    </div>
  );
}

// ── Calcul du coût d'embauche ─────────────────────────────────────────────────

function calculerCout(
  salaireBrut: number,
  dureeHebdo: 35 | 39,
  params: ParametresCharges,
) {
  // Pour 39h : supplément heures supplémentaires (4h/sem × 52/12 = 17.33h)
  const heuresSup = dureeHebdo === 39
    ? (salaireBrut / 151.67) * (4 * 52 / 12) * 0.25
    : 0;
  const salaireTotal = salaireBrut + heuresSup;

  const patronal   = salaireTotal * params.taux_patronal / 100;
  const cibtp      = salaireTotal * params.cotisation_cibtp / 100;
  const oppbtp     = salaireTotal * params.oppbtp / 100;
  const chomage    = salaireTotal * params.chomage_intemp / 100;
  const prevoyance = salaireTotal * params.prevoyance_probtp / 100;
  const atmp       = salaireTotal * params.atmp / 100;

  const totalCharges = patronal + cibtp + oppbtp + chomage + prevoyance + atmp;
  const totalFrais   = params.mutuelle_mensuelle + params.indemnite_trajet + params.indemnite_repas;

  const coutMensuel = salaireTotal + totalCharges + totalFrais;
  const coutAnnuel  = coutMensuel * 12 + params.cout_premier_embauche;
  const coefficient = coutMensuel / salaireBrut;

  return {
    heuresSup, salaireTotal, patronal, cibtp, oppbtp, chomage, prevoyance, atmp,
    totalCharges, totalFrais, coutMensuel, coutAnnuel, coefficient,
  };
}

// ── Onglet 2 : Coût d'embauche ────────────────────────────────────────────────

function OngletCout() {
  const [params, setParams] = useState<ParametresCharges>(() => loadParametresCharges());
  const [showParams, setShowParams] = useState(false);
  const [salaireBrut, setSalaireBrut] = useState(1867.02);
  const [dureeHebdo, setDureeHebdo] = useState<35 | 39>(35);

  const r = useMemo(
    () => calculerCout(salaireBrut, dureeHebdo, params),
    [salaireBrut, dureeHebdo, params],
  );

  const inputSt = { background: "white", border: "1px solid #E5E0DA", color: "#1A1714" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };

  const lignesCharges: { label: string; val: number; pct: number }[] = [
    { label: "Charges patronales générales", val: r.patronal,   pct: params.taux_patronal },
    { label: "Cotisation CIBTP (congés payés)", val: r.cibtp,   pct: params.cotisation_cibtp },
    { label: "OPPBTP (prévention sécurité)",  val: r.oppbtp,    pct: params.oppbtp },
    { label: "Chômage intempéries",           val: r.chomage,   pct: params.chomage_intemp },
    { label: "Prévoyance PRO.BTP",            val: r.prevoyance, pct: params.prevoyance_probtp },
    { label: "Cotisation AT/MP",              val: r.atmp,       pct: params.atmp },
  ];

  const ligneFrais: { label: string; val: number }[] = [
    { label: "Mutuelle mensuelle", val: params.mutuelle_mensuelle },
    { label: "Indemnités de trajet (mois)", val: params.indemnite_trajet },
    { label: "Indemnités de repas (mois)",  val: params.indemnite_repas },
  ];

  // Barre de visualisation
  const barSalaire  = (r.salaireTotal / r.coutMensuel) * 100;
  const barCharges  = (r.totalCharges / r.coutMensuel) * 100;
  const barFrais    = (r.totalFrais   / r.coutMensuel) * 100;

  return (
    <div className="space-y-5">
      <BandeauCout />

      <div
        className="rounded-[16px] p-5 space-y-5"
        style={{ background: "white", border: "1px solid #E5E0DA" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-lg font-bold" style={{ color: "#1A1714" }}>
            Simulateur de coût
          </h2>
          <button
            onClick={() => setShowParams(!showParams)}
            className="flex items-center gap-1.5 text-xs font-medium rounded-[8px] px-3 py-1.5"
            style={{ background: "rgba(226,0,26,.08)", color: "#E2001A", border: "1px solid rgba(226,0,26,.2)" }}
          >
            {showParams ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Réglages des taux
          </button>
        </div>

        {/* Paramètres modifiables */}
        {showParams && (
          <ParametresPanel
            params={params}
            onSave={(p) => {
              saveParametresCharges(p);
              setParams(p);
              toast.success("Taux sauvegardés");
              setShowParams(false);
            }}
          />
        )}

        {/* Saisie */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A453F" }}>
              Salaire brut mensuel (base 35h) — €
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={salaireBrut}
              onChange={(e) => setSalaireBrut(Number(e.target.value))}
              className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none"
              style={inputSt}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A453F" }}>
              Durée hebdo
            </label>
            <select
              value={dureeHebdo}
              onChange={(e) => setDureeHebdo(Number(e.target.value) as 35 | 39)}
              className="w-full rounded-[10px] px-3 py-2.5 text-sm outline-none"
              style={inputSt}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value={35}>35h / semaine</option>
              <option value={39}>39h / semaine</option>
            </select>
          </div>
        </div>

        {/* Résultat principal */}
        <div
          className="grid grid-cols-3 gap-3 rounded-[12px] p-4"
          style={{ background: "#FBF1F2" }}
        >
          {[
            { label: "Coût mensuel total", val: `${fmt(r.coutMensuel)} €`, accent: true },
            { label: "Coût annuel estimé",  val: `${fmt(r.coutAnnuel)} €`,  accent: false },
            { label: "Coefficient chargé",  val: `×${r.coefficient.toFixed(2)}`, accent: false },
          ].map(({ label, val: v, accent }) => (
            <div key={label} className="text-center">
              <div
                className="font-display text-2xl font-bold"
                style={{ color: accent ? "#E2001A" : "#1A1714" }}
              >
                {v}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8B847D" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Barre visuelle */}
        <div>
          <div className="flex h-6 w-full rounded-full overflow-hidden" style={{ gap: 2 }}>
            <div style={{ width: `${barSalaire}%`, background: "#3B82F6", borderRadius: "9999px 0 0 9999px" }} />
            <div style={{ width: `${barCharges}%`, background: "#F97316" }} />
            <div style={{ width: `${barFrais}%`,   background: "#8B5CF6", borderRadius: "0 9999px 9999px 0" }} />
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {[
              { color: "#3B82F6", label: "Salaire brut",    val: fmt(r.salaireTotal) + " €" },
              { color: "#F97316", label: "Charges patron.", val: fmt(r.totalCharges) + " €" },
              { color: "#8B5CF6", label: "Frais fixes",     val: fmt(r.totalFrais)  + " €" },
            ].map(({ color, label, val: v }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                <span style={{ color: "#4A453F" }}>{label}</span>
                <span className="font-semibold" style={{ color: "#1A1714" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau détaillé */}
        <details>
          <summary
            className="cursor-pointer text-sm font-medium select-none"
            style={{ color: "#E2001A" }}
          >
            Voir le détail ligne par ligne
          </summary>
          <div className="mt-3 space-y-1">
            {/* Salaire */}
            <div className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor: "#F0EBE4" }}>
              <span style={{ color: "#4A453F" }}>Salaire brut (base)</span>
              <span className="font-medium" style={{ color: "#1A1714" }}>{fmt(salaireBrut)} €</span>
            </div>
            {dureeHebdo === 39 && (
              <div className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor: "#F0EBE4" }}>
                <span style={{ color: "#4A453F" }}>Supplément heures sup. (4h × 25%)</span>
                <span className="font-medium" style={{ color: "#1A1714" }}>+ {fmt(r.heuresSup)} €</span>
              </div>
            )}
            {/* Charges */}
            <div className="pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B847D" }}>
              Charges patronales
            </div>
            {lignesCharges.map(({ label, val: v, pct }) => (
              <div key={label} className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor: "#F0EBE4" }}>
                <span style={{ color: "#4A453F" }}>{label} ({pct}%)</span>
                <span className="font-medium" style={{ color: "#1A1714" }}>+ {fmt(v)} €</span>
              </div>
            ))}
            {/* Frais fixes */}
            <div className="pt-1 pb-0.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B847D" }}>
              Frais fixes mensuels
            </div>
            {ligneFrais.map(({ label, val: v }) => (
              <div key={label} className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor: "#F0EBE4" }}>
                <span style={{ color: "#4A453F" }}>{label}</span>
                <span className="font-medium" style={{ color: "#1A1714" }}>+ {fmt(v)} €</span>
              </div>
            ))}
            {/* Total */}
            <div className="flex justify-between text-sm font-bold py-2">
              <span style={{ color: "#1A1714" }}>Coût mensuel total</span>
              <span style={{ color: "#E2001A" }}>{fmt(r.coutMensuel)} €</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span style={{ color: "#4A453F" }}>
                + Coût 1ère embauche (visite médicale, DPAE…)
              </span>
              <span className="font-medium" style={{ color: "#1A1714" }}>+ {fmt(params.cout_premier_embauche)} €</span>
            </div>
            <div className="flex justify-between text-sm font-bold py-2 border-t-2" style={{ borderColor: "#E5E0DA" }}>
              <span style={{ color: "#1A1714" }}>Coût annuel estimé</span>
              <span style={{ color: "#E2001A" }}>{fmt(r.coutAnnuel)} €</span>
            </div>
          </div>
        </details>
      </div>

      <JuristeCard />
    </div>
  );
}

// ── Panneau paramètres de taux ─────────────────────────────────────────────────

function ParametresPanel({
  params,
  onSave,
}: {
  params: ParametresCharges;
  onSave: (p: ParametresCharges) => void;
}) {
  const [form, setForm] = useState<ParametresCharges>({ ...params });
  const set = (k: keyof ParametresCharges, v: string) =>
    setForm((f) => ({ ...f, [k]: Number(v) || 0 }));

  const inputSt = { background: "rgba(26,23,20,.04)", border: "1px solid #E5E0DA", color: "#1A1714" };

  const champs: { key: keyof ParametresCharges; label: string; unit: string }[] = [
    { key: "taux_patronal",      label: "Charges patronales générales", unit: "%" },
    { key: "cotisation_cibtp",   label: "CIBTP (congés payés)",         unit: "%" },
    { key: "oppbtp",             label: "OPPBTP",                       unit: "%" },
    { key: "chomage_intemp",     label: "Chômage intempéries",          unit: "%" },
    { key: "prevoyance_probtp",  label: "Prévoyance PRO.BTP",           unit: "%" },
    { key: "atmp",               label: "AT/MP",                        unit: "%" },
    { key: "mutuelle_mensuelle", label: "Mutuelle mensuelle",           unit: "€" },
    { key: "indemnite_trajet",   label: "Indemnités trajet / mois",     unit: "€" },
    { key: "indemnite_repas",    label: "Indemnités repas / mois",      unit: "€" },
    { key: "cout_premier_embauche", label: "Coût 1ère embauche",        unit: "€" },
  ];

  return (
    <div
      className="rounded-[12px] p-4 space-y-4"
      style={{ background: "rgba(26,23,20,.03)", border: "1px solid #E5E0DA" }}
    >
      <p className="text-xs font-medium" style={{ color: "#4A453F" }}>
        Personnalisez les taux selon votre situation réelle. Les valeurs par défaut sont celles indiquées par la CAPEB pour le département 64.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {champs.map(({ key, label, unit }) => (
          <div key={key}>
            <label className="block text-xs mb-1" style={{ color: "#4A453F" }}>
              {label} ({unit})
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full rounded-[8px] px-2.5 py-2 text-sm outline-none"
              style={inputSt}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setForm({ ...PARAMETRES_CHARGES_DEFAUT })}
          className="rounded-[8px] px-3 py-2 text-xs font-medium"
          style={{ background: "rgba(26,23,20,.08)", color: "#4A453F" }}
        >
          Réinitialiser
        </button>
        <button
          onClick={() => onSave(form)}
          className="rounded-[8px] px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "#E2001A" }}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ── Onglet 3 : Besoin d'un juriste ────────────────────────────────────────────

function OngletJuriste() {
  return (
    <div className="space-y-5 max-w-xl">
      <JuristeCard />

      <div
        className="rounded-[16px] p-5 space-y-3"
        style={{ background: "white", border: "1px solid #E5E0DA" }}
      >
        <h2 className="font-display text-lg font-bold" style={{ color: "#1A1714" }}>
          Nos services juridiques
        </h2>
        <ul className="space-y-2.5">
          {[
            "Rédaction et validation de contrats de travail",
            "Conseils en droit du travail (rupture, licenciement, démission)",
            "Gestion des difficultés sociales et négociations",
            "Application des conventions collectives du bâtiment",
            "Procédures disciplinaires et contentieux prud'homal",
            "Assistance lors d'un contrôle URSSAF ou inspection du travail",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#4A453F" }}>
              <span className="mt-0.5 shrink-0 text-[#E2001A]">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
