import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Hammer, Building2, MapPin, ShieldCheck, Users,
  Check, ArrowRight, ArrowLeft, Trash2, UserPlus,
} from "lucide-react";
import {
  loadProfilEntreprise, saveProfilEntreprise,
  loadEmployesRH, addEmployeRH, removeEmployeRH,
  notifyUpdate,
  type ProfilEntreprise, type EmployeRH,
} from "@/lib/local-data";

export const Route = createFileRoute("/_authenticated/bienvenue")({
  ssr: false,
  head: () => ({ meta: [{ title: "Bienvenue – Espace Artisan CAPEB" }] }),
  component: BienvenuePage,
});

// ── Constantes ────────────────────────────────────────────────────────────────

const FORMES_JURIDIQUES = ["Auto-entrepreneur", "EI", "EIRL", "EURL", "SARL", "SAS", "SASU", "SA", "SCOP", "Autre"];
const METIERS = ["Maçonnerie", "Charpente", "Couverture", "Plomberie", "Électricité", "Menuiserie", "Carrelage", "Peinture", "Isolation", "Autre"];
const PALETTE = ["#E2001A", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#00897B", "#F4511E", "#3949AB", "#6D4C41", "#00838F"];

// ── Styles partagés ───────────────────────────────────────────────────────────

const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-all";
const inputSt = { background: "white", border: "1px solid #E5E0DA", color: "#1A1714" };

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.border = "1px solid #E2001A";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.border = "1px solid #E5E0DA";
  e.currentTarget.style.boxShadow = "none";
}

// ── Page principale ───────────────────────────────────────────────────────────

function BienvenuePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [profil, setProfil] = useState<ProfilEntreprise>(() => loadProfilEntreprise());
  const [equipe, setEquipe] = useState<EmployeRH[]>(() => loadEmployesRH());

  const set = (k: keyof ProfilEntreprise, v: string) =>
    setProfil((p) => ({ ...p, [k]: v }));

  const handleContinue = () => {
    if (!profil.nom.trim()) { toast.error("Le nom de l'entreprise est requis"); return; }
    saveProfilEntreprise(profil);
    notifyUpdate();
    toast.success("Profil entreprise enregistré");
    setStep(2);
  };

  const handleAddEmploye = (e: EmployeRH) => {
    setEquipe((list) => [e, ...list]);
  };

  const handleRemoveEmploye = (id: string) => {
    removeEmployeRH(id);
    notifyUpdate();
    setEquipe((list) => list.filter((e) => e.id !== id));
  };

  const handleFinish = () => {
    navigate({ to: "/tableau-de-bord" });
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center py-6 sm:py-10">
      <div className="w-full max-w-4xl space-y-8">

        {/* ── En-tête ── */}
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className="flex shrink-0 items-center justify-center rounded-[14px]"
            style={{ width: 56, height: 56, background: "#E2001A", boxShadow: "0 4px 14px rgba(226,0,26,.25)" }}
          >
            <Hammer className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-wide" style={{ color: "#1A1714" }}>
              BIENVENUE SUR ESPACE ARTISAN
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8B847D" }}>
              Avant de commencer, configurons votre espace en deux petites étapes.
            </p>
          </div>
        </div>

        <Stepper step={step} />

        {step === 1 ? (
          <EtapeEntreprise profil={profil} set={set} />
        ) : (
          <EtapeEquipe equipe={equipe} onAdd={handleAddEmploye} onRemove={handleRemoveEmploye} />
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium transition-colors"
              style={{ background: "rgba(26,23,20,.06)", color: "#4A453F" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          ) : (
            <span />
          )}

          {step === 1 ? (
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#E2001A" }}
            >
              Continuer
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#E2001A" }}
            >
              <Check className="h-4 w-4" />
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stepper visuel ────────────────────────────────────────────────────────────

function Stepper({ step }: { step: 1 | 2 }) {
  const steps: { n: 1 | 2; label: string }[] = [
    { n: 1, label: "Mon entreprise" },
    { n: 2, label: "Mon équipe" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="flex items-center justify-center rounded-full font-display font-bold transition-colors"
              style={{
                width: 40,
                height: 40,
                background: step >= s.n ? "#E2001A" : "rgba(26,23,20,.06)",
                color: step >= s.n ? "white" : "#8B847D",
                boxShadow: step === s.n ? "0 0 0 4px rgba(226,0,26,.12)" : "none",
              }}
            >
              {step > s.n ? <Check className="h-5 w-5" /> : s.n}
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: step >= s.n ? "#1A1714" : "#8B847D" }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="h-0.5 w-12 sm:w-28 rounded-full mb-5"
              style={{ background: step > s.n ? "#E2001A" : "rgba(26,23,20,.08)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Carte générique ───────────────────────────────────────────────────────────

function Carte({
  icon: Icon, title, children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] p-5 space-y-3" style={{ background: "white", border: "1px solid #E5E0DA" }}>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex shrink-0 items-center justify-center rounded-[10px]" style={{ width: 32, height: 32, background: "rgba(226,0,26,.08)" }}>
          <Icon className="h-4 w-4" style={{ color: "#E2001A" }} />
        </div>
        <h3 className="font-display text-base font-bold tracking-wide" style={{ color: "#1A1714" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ── Champ texte ───────────────────────────────────────────────────────────────

function Champ({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
        style={inputSt}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

// ── Étape 1 : Mon entreprise ──────────────────────────────────────────────────

function EtapeEntreprise({
  profil, set,
}: {
  profil: ProfilEntreprise;
  set: (k: keyof ProfilEntreprise, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Identité */}
      <Carte icon={Building2} title="Identité">
        <Champ label="Nom de l'entreprise *" value={profil.nom} onChange={(v) => set("nom", v)} placeholder="SARL Dupont BTP" />
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Forme juridique</label>
          <select
            value={profil.forme_juridique ?? ""}
            onChange={(e) => set("forme_juridique", e.target.value)}
            className={inputCls}
            style={inputSt}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            <option value="">-- Choisir --</option>
            {FORMES_JURIDIQUES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <Champ label="SIRET" value={profil.siret} onChange={(v) => set("siret", v)} placeholder="123 456 789 00012" />
        <Champ label="Code APE / NAF" value={profil.code_ape ?? ""} onChange={(v) => set("code_ape", v)} placeholder="4120A" />
        <Champ label="N° TVA intracommunautaire" value={profil.tva ?? ""} onChange={(v) => set("tva", v)} placeholder="FR12 345678901" />
        <Champ label="Gérant" value={profil.gerant ?? ""} onChange={(v) => set("gerant", v)} placeholder="Jean Dupont" />
      </Carte>

      {/* Coordonnées */}
      <Carte icon={MapPin} title="Coordonnées">
        <Champ label="Adresse" value={profil.adresse} onChange={(v) => set("adresse", v)} placeholder="12 rue des Artisans" />
        <div className="grid grid-cols-2 gap-3">
          <Champ label="Code postal" value={profil.code_postal ?? ""} onChange={(v) => set("code_postal", v)} placeholder="64000" />
          <Champ label="Ville" value={profil.ville ?? ""} onChange={(v) => set("ville", v)} placeholder="Pau" />
        </div>
        <Champ label="Téléphone" value={profil.telephone} onChange={(v) => set("telephone", v)} placeholder="05 59 00 00 00" />
        <Champ label="Email" value={profil.email} onChange={(v) => set("email", v)} placeholder="contact@votreentreprise.fr" type="email" />
        <Champ label="Site web" value={profil.site_web ?? ""} onChange={(v) => set("site_web", v)} placeholder="www.votreentreprise.fr" />
      </Carte>

      {/* Assurance & qualifications */}
      <Carte icon={ShieldCheck} title="Assurance & qualifications">
        <Champ label="Assureur décennale" value={profil.assurance ?? ""} onChange={(v) => set("assurance", v)} placeholder="MAAF Pro" />
        <Champ label="N° de police" value={profil.num_police ?? ""} onChange={(v) => set("num_police", v)} placeholder="123456789" />
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Qualifications / labels (RGE…)</label>
          <textarea
            value={profil.qualifications ?? ""}
            onChange={(e) => set("qualifications", e.target.value)}
            placeholder="RGE Qualibat, Qualifelec…"
            rows={4}
            className={inputCls}
            style={{ ...inputSt, resize: "vertical" }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </Carte>
    </div>
  );
}

// ── Étape 2 : Mon équipe ──────────────────────────────────────────────────────

function EtapeEquipe({
  equipe, onAdd, onRemove,
}: {
  equipe: EmployeRH[];
  onAdd: (e: EmployeRH) => void;
  onRemove: (id: string) => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState("");
  const [statut, setStatut] = useState<"ouvrier" | "etam" | "cadre">("ouvrier");
  const [couleur, setCouleur] = useState(PALETTE[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) { toast.error("Prénom et nom requis"); return; }
    const emp = addEmployeRH({
      nom: nom.trim(),
      prenom: prenom.trim(),
      date_naissance: null,
      num_secu: null,
      qualification: null,
      salarie_adresse: null,
      statut,
      actif: true,
      metier: metier || null,
      couleur,
    });
    notifyUpdate();
    toast.success(`${prenom} ${nom} ajouté(e) à l'équipe`);
    onAdd(emp);
    setPrenom("");
    setNom("");
    setMetier("");
    setStatut("ouvrier");
    setCouleur(PALETTE[0]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Formulaire d'ajout */}
      <Carte icon={UserPlus} title="Ajouter un salarié">
        <p className="text-xs -mt-1" style={{ color: "#8B847D" }}>
          Cette étape est facultative — vous pourrez ajouter votre équipe plus tard depuis RH &amp; Juridique.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Prénom *" value={prenom} onChange={setPrenom} placeholder="Jean" />
            <Champ label="Nom *" value={nom} onChange={setNom} placeholder="MARTIN" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Métier</label>
              <select
                value={metier}
                onChange={(e) => setMetier(e.target.value)}
                className={inputCls}
                style={inputSt}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="">-- Non renseigné --</option>
                {METIERS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as "ouvrier" | "etam" | "cadre")}
                className={inputCls}
                style={inputSt}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="ouvrier">Ouvrier</option>
                <option value="etam">ETAM</option>
                <option value="cadre">Cadre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A453F" }}>Couleur de planning</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCouleur(c)}
                  aria-label={`Couleur ${c}`}
                  className="rounded-full transition-transform"
                  style={{
                    width: 28,
                    height: 28,
                    background: c,
                    border: "none",
                    cursor: "pointer",
                    outline: couleur === c ? `3px solid ${c}` : "none",
                    outlineOffset: 2,
                    transform: couleur === c ? "scale(1.05)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full rounded-[10px] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#E2001A" }}
          >
            <UserPlus className="h-4 w-4" />
            Ajouter à l'équipe
          </button>
        </form>
      </Carte>

      {/* Liste de l'équipe */}
      <Carte icon={Users} title={`Mon équipe${equipe.length > 0 ? ` (${equipe.length})` : ""}`}>
        {equipe.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: "#8B847D" }}>
            Aucun salarié ajouté pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {equipe.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                style={{ background: "rgba(26,23,20,.03)", border: "1px solid #F0EBE4" }}
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-full text-white font-semibold"
                  style={{ width: 32, height: 32, background: e.couleur || "#8B847D", fontSize: 12 }}
                >
                  {`${e.prenom[0] ?? ""}${e.nom[0] ?? ""}`.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#1A1714" }}>
                    {e.prenom} {e.nom}
                  </div>
                  <div className="text-xs" style={{ color: "#8B847D" }}>
                    {e.metier ? `${e.metier} · ` : ""}{e.statut}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(e.id)}
                  className="flex shrink-0 items-center justify-center rounded-[8px] p-1.5 transition-colors hover:bg-black/6"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" style={{ color: "#8B847D" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Carte>
    </div>
  );
}
