import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Mail, Plus, ChevronDown, ChevronUp,
  Droplets, Zap, Building2, Paintbrush, Hammer, House, Grid3x3, Wrench, Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  getAffairesCAPEB, saveAffaireCAPEB, deleteAffaireCAPEB, markAffaireVue,
  notifyUpdate, DATA_EVENT,
  type AffaireCAPEB,
} from "@/lib/local-data";

export const Route = createFileRoute("/_authenticated/affaires-capeb")({
  ssr: false,
  head: () => ({ meta: [{ title: "Affaires CAPEB" }] }),
  component: AffairesCAPEBPage,
});

const CARD_SHADOW = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";

const TYPES_TRAVAUX = [
  "Plomberie", "Électricité", "Maçonnerie", "Peinture",
  "Menuiserie", "Couverture", "Carrelage", "Autre",
] as const;

function iconPourType(type: string) {
  switch (type) {
    case "Plomberie":    return Droplets;
    case "Électricité":  return Zap;
    case "Maçonnerie":   return Building2;
    case "Peinture":     return Paintbrush;
    case "Menuiserie":   return Hammer;
    case "Couverture":   return House;
    case "Carrelage":    return Grid3x3;
    default:             return Wrench;
  }
}

// ── Page principale ───────────────────────────────────────────────────────────

function AffairesCAPEBPage() {
  const [onglet, setOnglet] = useState<"disponibles" | "ajouter">("disponibles");
  const [affaires, setAffaires] = useState<AffaireCAPEB[]>([]);

  const recharger = () => setAffaires(getAffairesCAPEB());

  useEffect(() => {
    recharger();
    window.addEventListener(DATA_EVENT, recharger);
    return () => window.removeEventListener(DATA_EVENT, recharger);
  }, []);

  const nbNouvelles = affaires.filter(a => a.statut === "nouveau").length;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Affaires CAPEB
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Demandes de particuliers transmises par votre CAPEB Adour-Pyrénées
        </p>
      </div>

      {/* Sous-onglets */}
      <div className="flex gap-1 border-b border-[#ECE7E1]">
        <button
          onClick={() => setOnglet("disponibles")}
          className="flex items-center gap-2 text-[13.5px] font-semibold pb-[10px] px-2 border-b-2 transition-colors"
          style={onglet === "disponibles"
            ? { borderColor: "#E2001A", color: "#E2001A" }
            : { borderColor: "transparent", color: "#8B847D" }}
        >
          Affaires disponibles
          {nbNouvelles > 0 && (
            <span
              className="text-[11px] font-bold rounded-full px-[7px] py-[2px] text-white"
              style={{ background: "#E2001A" }}
            >
              {nbNouvelles}
            </span>
          )}
        </button>
        <button
          onClick={() => setOnglet("ajouter")}
          className="text-[13.5px] font-semibold pb-[10px] px-2 border-b-2 transition-colors"
          style={onglet === "ajouter"
            ? { borderColor: "#E2001A", color: "#E2001A" }
            : { borderColor: "transparent", color: "#8B847D" }}
        >
          Ajouter une affaire
        </button>
      </div>

      {onglet === "disponibles" ? (
        <VueDisponibles affaires={affaires} recharger={recharger} />
      ) : (
        <VueAjouter onSuccess={() => { recharger(); setOnglet("disponibles"); }} />
      )}
    </div>
  );
}

// ── Vue artisan — liste des affaires ─────────────────────────────────────────

function VueDisponibles({ affaires, recharger }: { affaires: AffaireCAPEB[]; recharger: () => void }) {
  return (
    <div className="space-y-4">
      {/* Bandeau contact */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[16px] flex flex-wrap items-center justify-between gap-3"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div>
          <p className="text-[13.5px] font-semibold text-[#1A1714]">Intéressé par une affaire ?</p>
          <p className="text-[12.5px] text-[#8B847D] mt-[2px]">
            Contactez votre chargé de développement : Guillaume PIGUÉ
          </p>
        </div>
        <a
          href="mailto:guillaume.pigue@capeb-adour-pyrenees.fr"
          className="flex items-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[14px] py-[10px] flex-shrink-0 transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
        >
          <Mail className="h-3.5 w-3.5" />
          Contacter
        </a>
      </div>

      {/* Liste des affaires */}
      {affaires.length === 0 ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm"
          style={{ boxShadow: CARD_SHADOW }}
        >
          Aucune affaire disponible pour le moment. Revenez bientôt.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {affaires.map(a => (
            <CarteAffaire key={a.id} affaire={a} recharger={recharger} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Carte affaire ─────────────────────────────────────────────────────────────

function CarteAffaire({ affaire, recharger }: { affaire: AffaireCAPEB; recharger: () => void }) {
  const [ouverte, setOuverte] = useState(false);
  const Icon = iconPourType(affaire.typesTravaux);

  const dateFormatee = (() => {
    try { return `Ajouté le ${format(parseISO(affaire.dateAjout), "d MMMM yyyy", { locale: fr })}`; }
    catch { return ""; }
  })();

  const sujet = encodeURIComponent(`Intérêt pour une affaire CAPEB — ${affaire.typesTravaux} ${affaire.commune}`);
  const mailtoContacter = `mailto:frederic.laplace@capeb-adour-pyrenees.fr?subject=${sujet}`;

  function handleOuvrir() {
    if (!ouverte && affaire.statut === "nouveau") {
      markAffaireVue(affaire.id);
      notifyUpdate();
      recharger();
    }
    setOuverte(v => !v);
  }

  function handleSupprimer(e: React.MouseEvent) {
    e.stopPropagation();
    deleteAffaireCAPEB(affaire.id);
    notifyUpdate();
    recharger();
    toast.success("Affaire supprimée");
  }

  const estNouveau = affaire.statut === "nouveau";

  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[2px]"
      style={{
        boxShadow: CARD_SHADOW,
        border: `1px solid ${estNouveau ? "#F6CFCB" : "#ECE7E1"}`,
      }}
    >
      {/* Bande couleur */}
      <div style={{ height: 5, background: estNouveau ? "#E2001A" : "#D1C9C1", flexShrink: 0 }} />

      <div className="p-[18px] flex-1 flex flex-col gap-[10px]">
        {/* Icône + type + badge statut */}
        <div className="flex items-center gap-[10px]">
          <div
            className="flex items-center justify-center rounded-[10px] shrink-0"
            style={{ width: 36, height: 36, background: "#FAF8F5", border: "1px solid #ECE7E1" }}
          >
            <Icon className="h-4 w-4" style={{ color: "#4A453F" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-[15px] font-semibold text-[#1A1714]">
                {affaire.typesTravaux}
              </span>
              {estNouveau ? (
                <span
                  className="text-[10.5px] font-bold uppercase tracking-wide px-[8px] py-[2px] rounded-full"
                  style={{ background: "#FDECEA", color: "#E2001A" }}
                >
                  Nouveau
                </span>
              ) : (
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-wide px-[8px] py-[2px] rounded-full"
                  style={{ background: "#F5F2EE", color: "#8B847D" }}
                >
                  Vu
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#8B847D] mt-[1px]">
              {affaire.commune}{affaire.codePostal ? ` — ${affaire.codePostal}` : ""}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className={`text-[13px] text-[#4A453F] leading-relaxed ${ouverte ? "" : "line-clamp-2"}`}>
          {affaire.description}
        </p>

        {/* Date */}
        <p className="text-[11.5px] text-[#8B847D]">{dateFormatee}</p>

        {/* Actions */}
        <div className="flex items-center gap-[8px] mt-auto pt-[2px]">
          <a
            href={mailtoContacter}
            onClick={() => {
              if (estNouveau) { markAffaireVue(affaire.id); notifyUpdate(); recharger(); }
            }}
            className="flex items-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[13px] py-[9px] transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            <Mail className="h-3.5 w-3.5" />
            Contacter la CAPEB
          </a>
          <button
            onClick={handleOuvrir}
            className="flex items-center gap-[5px] text-[12px] font-medium text-[#4A453F] rounded-[9px] px-[10px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
            style={{ background: "#FAF8F5" }}
          >
            {ouverte ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleSupprimer}
            className="ml-auto flex items-center justify-center rounded-[9px] p-[9px] border border-[#ECE7E1] hover:border-[#F6CFCB] hover:bg-[#FDECEA] transition-colors"
            style={{ background: "#FAF8F5" }}
            title="Supprimer cette affaire"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#8B847D]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vue admin — formulaire d'ajout ────────────────────────────────────────────

const FORM_DEFAUT = {
  typesTravaux: "Plomberie",
  commune: "",
  codePostal: "",
  description: "",
  corpsMetierCible: "Tous",
};

function VueAjouter({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ ...FORM_DEFAUT });

  function set(field: keyof typeof FORM_DEFAUT, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.commune.trim() || !form.description.trim()) return;
    const nouvelle: AffaireCAPEB = {
      id: crypto.randomUUID(),
      dateAjout: new Date().toISOString(),
      typesTravaux: form.typesTravaux,
      commune: form.commune.trim(),
      codePostal: form.codePostal.trim(),
      description: form.description.trim(),
      statut: "nouveau",
      corpsMetierCible: form.corpsMetierCible,
    };
    saveAffaireCAPEB(nouvelle);
    notifyUpdate();
    toast.success("Affaire publiée avec succès");
    setForm({ ...FORM_DEFAUT });
    onSuccess();
  }

  const inputCls = "w-full rounded-[10px] border border-[#ECE7E1] bg-[#FAF8F5] px-[12px] py-[10px] text-[13.5px] text-[#1A1714] placeholder:text-[#C4BDB5] focus:outline-none focus:border-[#E2001A] transition-colors";
  const labelCls = "block text-[11.5px] font-semibold text-[#4A453F] mb-[6px] uppercase tracking-[.08em]";

  return (
    <div className="max-w-xl">
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[24px]"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <h2 className="font-display text-[17px] font-semibold text-[#1A1714] uppercase mb-[20px]">
          Nouvelle affaire
        </h2>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          {/* Type de travaux */}
          <div>
            <label className={labelCls}>Type de travaux</label>
            <select
              value={form.typesTravaux}
              onChange={e => set("typesTravaux", e.target.value)}
              className={inputCls}
            >
              {TYPES_TRAVAUX.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Commune + Code postal */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={labelCls}>Commune</label>
              <input
                type="text"
                required
                value={form.commune}
                onChange={e => set("commune", e.target.value)}
                placeholder="ex : Pau"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Code postal</label>
              <input
                type="text"
                value={form.codePostal}
                onChange={e => set("codePostal", e.target.value)}
                placeholder="ex : 64000"
                maxLength={5}
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description de la demande</label>
            <textarea
              required
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Décrivez la demande du particulier…"
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Corps de métier ciblé */}
          <div>
            <label className={labelCls}>Corps de métier ciblé</label>
            <select
              value={form.corpsMetierCible}
              onChange={e => set("corpsMetierCible", e.target.value)}
              className={inputCls}
            >
              <option value="Tous">Tous les corps de métier</option>
              {TYPES_TRAVAUX.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Bouton soumettre */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-[8px] text-[13.5px] font-semibold text-white rounded-[10px] px-[16px] py-[12px] transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            <Plus className="h-4 w-4" />
            Publier l'affaire
          </button>
        </form>
      </div>
    </div>
  );
}
