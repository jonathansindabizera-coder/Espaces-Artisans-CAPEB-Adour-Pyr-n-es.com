import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Plus,
  ChevronDown,
  ChevronUp,
  Droplets,
  Zap,
  Building2,
  Paintbrush,
  Hammer,
  House,
  Grid3x3,
  Wrench,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  ClipboardList,
  Globe2,
  Filter,
  AlertTriangle,
  MapPin,
  Download,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  getAffairesCAPEB,
  saveAffaireCAPEB,
  deleteAffaireCAPEB,
  markAffaireVue,
  notifyUpdate,
  DATA_EVENT,
  type AffaireCAPEB,
} from "@/lib/local-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/affaires-capeb")({
  ssr: false,
  head: () => ({ meta: [{ title: "Demandes particuliers – CAPEB" }] }),
  component: AffairesCAPEBPage,
});

const CARD_SHADOW = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";
const INPUT_CLS =
  "w-full rounded-[10px] border border-[#ECE7E1] bg-[#FAF8F5] px-[12px] py-[10px] text-[13.5px] text-[#1A1714] placeholder:text-[#C4BDB5] focus:outline-none focus:border-[#E2001A] transition-colors";
const LABEL_CLS =
  "block text-[11.5px] font-semibold text-[#4A453F] mb-[6px] uppercase tracking-[.08em]";

const TYPES_TRAVAUX = [
  "Plomberie",
  "Électricité",
  "Maçonnerie",
  "Peinture",
  "Menuiserie",
  "Couverture",
  "Carrelage",
  "Autre",
] as const;

const ORIGINES = [
  { value: "depot_direct", label: "Dépôt direct" },
  { value: "capeb", label: "CAPEB" },
  { value: "veille_publique", label: "Veille publique" },
  { value: "partenaire", label: "Partenaire" },
  { value: "import_manuel", label: "Import manuel" },
] as const;

type AnnonceParticulier = {
  id: string;
  source: string;
  external_id: string;
  titre: string;
  description: string | null;
  ville: string | null;
  code_postal: string | null;
  departement: string | null;
  corps_metier: string;
  date_annonce: string | null;
  date_scraping: string;
  url_annonce: string;
  url_type: string;
  statut_import: string;
  created_at: string;
};

function sourceLabel(source: string): string {
  if (source === "allovoisins") return "AlloVoisins";
  if (source === "appeloffreduparticulier") return "Appel Offre Particulier";
  return source;
}

function iconPourType(type: string) {
  switch (type) {
    case "Plomberie":
      return Droplets;
    case "Électricité":
      return Zap;
    case "Maçonnerie":
      return Building2;
    case "Peinture":
      return Paintbrush;
    case "Menuiserie":
      return Hammer;
    case "Couverture":
      return House;
    case "Carrelage":
      return Grid3x3;
    default:
      return Wrench;
  }
}

function labelOrigine(origine: AffaireCAPEB["origine"]) {
  return ORIGINES.find((o) => o.value === origine)?.label ?? "Source non précisée";
}

function sourceAffaire(affaire: AffaireCAPEB) {
  return affaire.sourceNom?.trim() || labelOrigine(affaire.origine);
}

function sourceUrlValide(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function departementAffaire(affaire: AffaireCAPEB) {
  if (affaire.codePostal.startsWith("64")) return "64";
  if (affaire.codePostal.startsWith("65")) return "65";
  return "autre";
}

function typeLienSource(affaire: AffaireCAPEB): NonNullable<AffaireCAPEB["sourceUrlType"]> {
  return affaire.sourceUrlType ?? (affaire.sourceUrl ? "annonce_exacte" : "page_recherche");
}

// ── Page principale ───────────────────────────────────────────────────────────

function AffairesCAPEBPage() {
  const [onglet, setOnglet] = useState<"disponibles" | "ajouter" | "veille">("disponibles");
  const [affaires, setAffaires] = useState<AffaireCAPEB[]>([]);
  const [annoncesVeille, setAnnoncesVeille] = useState<AnnonceParticulier[]>([]);

  const recharger = () => setAffaires(getAffairesCAPEB());

  async function chargerVeille() {
    try {
      const { data } = await supabase
        .from("annonces_particuliers")
        .select("*")
        .eq("statut_import", "nouveau")
        .order("date_scraping", { ascending: false })
        .limit(50);
      setAnnoncesVeille((data as AnnonceParticulier[]) ?? []);
    } catch { /* Supabase indisponible — on affiche les affaires locales uniquement */ }
  }

  useEffect(() => {
    recharger();
    chargerVeille();
    window.addEventListener(DATA_EVENT, recharger);
    return () => window.removeEventListener(DATA_EVENT, recharger);
  }, []);

  const nbNouvelles = affaires.filter((a) => a.statut === "nouveau").length;
  const nbVeille = annoncesVeille.length;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Demandes particuliers
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Opportunités de particuliers à qualifier avant mise en relation avec un artisan
        </p>
      </div>

      {/* Sous-onglets */}
      <div className="flex gap-1 border-b border-[#ECE7E1]">
        <button
          onClick={() => setOnglet("disponibles")}
          className="flex items-center gap-2 text-[13.5px] font-semibold pb-[10px] px-2 border-b-2 transition-colors"
          style={
            onglet === "disponibles"
              ? { borderColor: "#E2001A", color: "#E2001A" }
              : { borderColor: "transparent", color: "#8B847D" }
          }
        >
          Demandes disponibles
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
          style={
            onglet === "ajouter"
              ? { borderColor: "#E2001A", color: "#E2001A" }
              : { borderColor: "transparent", color: "#8B847D" }
          }
        >
          Ajouter / importer
        </button>
        <button
          onClick={() => setOnglet("veille")}
          className="flex items-center gap-2 text-[13.5px] font-semibold pb-[10px] px-2 border-b-2 transition-colors"
          style={
            onglet === "veille"
              ? { borderColor: "#E2001A", color: "#E2001A" }
              : { borderColor: "transparent", color: "#8B847D" }
          }
        >
          Sources & veille
          {nbVeille > 0 && (
            <span
              className="text-[11px] font-bold rounded-full px-[7px] py-[2px] text-white"
              style={{ background: "#E65100" }}
            >
              {nbVeille}
            </span>
          )}
        </button>
      </div>

      {onglet === "disponibles" && <VueDisponibles affaires={affaires} recharger={recharger} />}
      {onglet === "ajouter" && (
        <VueAjouter
          onSuccess={() => {
            recharger();
            setOnglet("disponibles");
          }}
        />
      )}
      {onglet === "veille" && (
        <VueVeille
          annoncesVeille={annoncesVeille}
          recharger={recharger}
          rechargerVeille={chargerVeille}
        />
      )}
    </div>
  );
}

// ── Vue artisan — liste des affaires ─────────────────────────────────────────

function VueDisponibles({
  affaires,
  recharger,
}: {
  affaires: AffaireCAPEB[];
  recharger: () => void;
}) {
  const [recherche, setRecherche] = useState("");
  const [filtreDepartement, setFiltreDepartement] = useState<"Tous" | "64" | "65">("Tous");
  const [filtreType, setFiltreType] = useState("Tous");
  const [filtreSource, setFiltreSource] = useState("Toutes");

  const sources = useMemo(
    () => Array.from(new Set(affaires.map(sourceAffaire))).sort((a, b) => a.localeCompare(b, "fr")),
    [affaires],
  );

  const affairesFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return affaires.filter((affaire) => {
      const source = sourceAffaire(affaire);
      const matchDepartement =
        filtreDepartement === "Tous" || departementAffaire(affaire) === filtreDepartement;
      const matchType = filtreType === "Tous" || affaire.typesTravaux === filtreType;
      const matchSource = filtreSource === "Toutes" || source === filtreSource;
      const texte = [
        affaire.typesTravaux,
        affaire.commune,
        affaire.codePostal,
        affaire.description,
        affaire.corpsMetierCible,
        source,
      ]
        .join(" ")
        .toLowerCase();
      return matchDepartement && matchType && matchSource && (!q || texte.includes(q));
    });
  }, [affaires, filtreDepartement, filtreSource, filtreType, recherche]);

  const nbNouvelles = affaires.filter((a) => a.statut === "nouveau").length;
  const nbAValider = affaires.filter((a) => (a.validation ?? "validee") === "a_valider").length;
  const nb64 = affaires.filter((a) => departementAffaire(a) === "64").length;
  const nb65 = affaires.filter((a) => departementAffaire(a) === "65").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Demandes recensées"
          value={affaires.length}
          detail="Toutes sources confondues"
        />
        <StatCard
          label="Nouvelles"
          value={nbNouvelles}
          detail="Non ouvertes par l'artisan"
          accent="#E2001A"
        />
        <StatCard
          label="A qualifier"
          value={nbAValider}
          detail="Veille/imports à contrôler"
          accent="#D98A00"
        />
      </div>

      {/* Bandeau contact */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[16px] flex flex-wrap items-center justify-between gap-3"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div>
          <p className="text-[13.5px] font-semibold text-[#1A1714]">Intéressé par une demande ?</p>
          <p className="text-[12.5px] text-[#8B847D] mt-[2px]">
            La CAPEB qualifie les coordonnées avant toute mise en relation avec le particulier.
          </p>
        </div>
        <a
          href="mailto:guillaume.pigue@capeb-adour-pyrenees.fr"
          className="flex items-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[14px] py-[10px] flex-shrink-0 transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(180deg,#EA1227,#D2001A)",
            boxShadow: "0 3px 10px rgba(226,0,26,.3)",
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          Contacter la CAPEB
        </a>
      </div>

      {/* Filtre département */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[14px] flex flex-wrap items-center gap-2"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-2 mr-1 text-[12.5px] font-semibold text-[#4A453F]">
          <MapPin className="h-4 w-4 text-[#E2001A]" />
          Département
        </div>
        {[
          { value: "Tous", label: "Tous", count: affaires.length },
          { value: "64", label: "64", count: nb64 },
          { value: "65", label: "65", count: nb65 },
        ].map((departement) => {
          const active = filtreDepartement === departement.value;
          return (
            <button
              key={departement.value}
              type="button"
              onClick={() => setFiltreDepartement(departement.value as "Tous" | "64" | "65")}
              className="rounded-full px-[13px] py-[7px] text-[12.5px] font-semibold transition-colors"
              style={
                active
                  ? { background: "#E2001A", color: "white" }
                  : { background: "#FAF8F5", color: "#4A453F", border: "1px solid #ECE7E1" }
              }
            >
              {departement.label}
              <span className="ml-1 opacity-80">({departement.count})</span>
            </button>
          );
        })}
      </div>

      {/* Filtres */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[14px] grid gap-3 md:grid-cols-[1fr_180px_220px]"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <label className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B847D]" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une ville, un métier, une source..."
            className={`${INPUT_CLS} pl-9`}
          />
        </label>
        <label className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B847D]" />
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className={`${INPUT_CLS} pl-9`}
          >
            <option value="Tous">Tous les métiers</option>
            {TYPES_TRAVAUX.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="relative">
          <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B847D]" />
          <select
            value={filtreSource}
            onChange={(e) => setFiltreSource(e.target.value)}
            className={`${INPUT_CLS} pl-9`}
          >
            <option value="Toutes">Toutes les sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Liste des affaires */}
      {affaires.length === 0 ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm"
          style={{ boxShadow: CARD_SHADOW }}
        >
          Aucune demande disponible pour le moment. Ajoutez une demande ou configurez une veille
          autorisée.
        </div>
      ) : affairesFiltrees.length === 0 ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm"
          style={{ boxShadow: CARD_SHADOW }}
        >
          Aucune demande ne correspond aux filtres sélectionnés.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {affairesFiltrees.map((a) => (
            <CarteAffaire key={a.id} affaire={a} recharger={recharger} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent = "#1A1714",
}: {
  label: string;
  value: number;
  detail: string;
  accent?: string;
}) {
  return (
    <div
      className="bg-white rounded-[14px] border border-[#ECE7E1] p-[16px]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <p className="text-[11.5px] font-semibold uppercase tracking-[.08em] text-[#8B847D]">
        {label}
      </p>
      <p
        className="font-display text-[30px] font-semibold leading-none mt-2"
        style={{ color: accent }}
      >
        {value}
      </p>
      <p className="text-[12px] text-[#8B847D] mt-2">{detail}</p>
    </div>
  );
}

// ── Carte affaire ─────────────────────────────────────────────────────────────

function CarteAffaire({ affaire, recharger }: { affaire: AffaireCAPEB; recharger: () => void }) {
  const [ouverte, setOuverte] = useState(false);
  const [lienSource, setLienSource] = useState(affaire.sourceUrl ?? "");
  const [typeLien, setTypeLien] = useState<NonNullable<AffaireCAPEB["sourceUrlType"]>>(
    typeLienSource(affaire),
  );
  const Icon = iconPourType(affaire.typesTravaux);

  const dateFormatee = (() => {
    try {
      return `Ajouté le ${format(parseISO(affaire.dateAjout), "d MMMM yyyy", { locale: fr })}`;
    } catch {
      return "";
    }
  })();

  const sujet = encodeURIComponent(
    `Intérêt pour une demande particulier — ${affaire.typesTravaux} ${affaire.commune}`,
  );
  const mailtoContacter = `mailto:frederic.laplace@capeb-adour-pyrenees.fr?subject=${sujet}`;
  const source = sourceAffaire(affaire);
  const validation = affaire.validation ?? "validee";
  const lienExactDisponible =
    Boolean(affaire.sourceUrl) && typeLienSource(affaire) === "annonce_exacte";

  function handleOuvrir() {
    if (!ouverte && affaire.statut === "nouveau") {
      markAffaireVue(affaire.id);
      notifyUpdate();
      recharger();
    }
    setOuverte((v) => !v);
  }

  function handleSupprimer(e: React.MouseEvent) {
    e.stopPropagation();
    deleteAffaireCAPEB(affaire.id);
    notifyUpdate();
    recharger();
    toast.success("Demande supprimée");
  }

  function handleEnregistrerLien(e: React.FormEvent) {
    e.preventDefault();
    const url = lienSource.trim();
    if (!url) {
      saveAffaireCAPEB({ ...affaire, sourceUrl: undefined, sourceUrlType: undefined });
      notifyUpdate();
      recharger();
      toast.success("Lien source retiré");
      return;
    }
    if (!sourceUrlValide(url)) {
      toast.error("Le lien doit commencer par http:// ou https://");
      return;
    }
    saveAffaireCAPEB({ ...affaire, sourceUrl: url, sourceUrlType: typeLien });
    notifyUpdate();
    recharger();
    toast.success(
      typeLien === "annonce_exacte" ? "Lien exact enregistré" : "Page de recherche enregistrée",
    );
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
              <span
                className="text-[10.5px] font-semibold uppercase tracking-wide px-[8px] py-[2px] rounded-full"
                style={
                  validation === "a_valider"
                    ? { background: "#FBF1DE", color: "#D98A00" }
                    : { background: "#E7F4EC", color: "#1E8E55" }
                }
              >
                {validation === "a_valider" ? "A qualifier" : "Qualifiée"}
              </span>
            </div>
            <p className="text-[12px] text-[#8B847D] mt-[1px]">
              {affaire.commune}
              {affaire.codePostal ? ` — ${affaire.codePostal}` : ""}
            </p>
          </div>
        </div>

        {/* Description */}
        <p
          className={`text-[13px] text-[#4A453F] leading-relaxed ${ouverte ? "" : "line-clamp-2"}`}
        >
          {affaire.description}
        </p>

        {/* Date */}
        <p className="text-[11.5px] text-[#8B847D]">{dateFormatee}</p>

        {/* Source */}
        <div className="rounded-[10px] border border-[#ECE7E1] bg-[#FAF8F5] px-[11px] py-[9px]">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#8B847D]">
            Source
          </p>
          <div className="mt-[3px] flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5 text-[#4A453F]" />
            <span className="text-[12.5px] font-semibold text-[#1A1714]">{source}</span>
          </div>
          <div className="mt-[7px] flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-[8px] py-[2px] text-[10.5px] font-semibold uppercase tracking-wide"
              style={
                lienExactDisponible
                  ? { background: "#E7F4EC", color: "#1E8E55" }
                  : { background: "#FBF1DE", color: "#D98A00" }
              }
            >
              {lienExactDisponible ? "Lien annonce exact" : "Lien exact à compléter"}
            </span>
            {!lienExactDisponible && affaire.sourceUrl && (
              <span className="text-[11.5px] text-[#8B847D]">Page de recherche disponible</span>
            )}
          </div>
          {ouverte && affaire.contactConsigne && (
            <p className="mt-[6px] text-[12px] leading-relaxed text-[#4A453F]">
              {affaire.contactConsigne}
            </p>
          )}
          {ouverte && (
            <form onSubmit={handleEnregistrerLien} className="mt-[10px] space-y-[8px]">
              <label className={LABEL_CLS}>URL de l'annonce</label>
              <input
                type="url"
                value={lienSource}
                onChange={(e) => setLienSource(e.target.value)}
                placeholder="Collez ici l'URL exacte de l'annonce"
                className={INPUT_CLS}
              />
              <div className="grid grid-cols-[1fr_auto] gap-[8px]">
                <select
                  value={typeLien}
                  onChange={(e) =>
                    setTypeLien(e.target.value as NonNullable<AffaireCAPEB["sourceUrlType"]>)
                  }
                  className={INPUT_CLS}
                >
                  <option value="annonce_exacte">URL exacte de l'annonce</option>
                  <option value="page_recherche">Page de recherche / catégorie</option>
                </select>
                <button
                  type="submit"
                  className="rounded-[10px] px-[12px] py-[10px] text-[12.5px] font-semibold text-white"
                  style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)" }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[8px] mt-auto pt-[2px]">
          <a
            href={mailtoContacter}
            onClick={() => {
              if (estNouveau) {
                markAffaireVue(affaire.id);
                notifyUpdate();
                recharger();
              }
            }}
            className="flex items-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[13px] py-[9px] transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(180deg,#EA1227,#D2001A)",
              boxShadow: "0 3px 10px rgba(226,0,26,.3)",
            }}
          >
            <Mail className="h-3.5 w-3.5" />
            Contacter la CAPEB
          </a>
          {affaire.sourceUrl && (
            <a
              href={affaire.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-[5px] text-[12px] font-medium text-[#4A453F] rounded-[9px] px-[10px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
              style={{ background: "#FAF8F5" }}
              title={lienExactDisponible ? "Voir l'annonce source" : "Ouvrir la page de recherche"}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {lienExactDisponible ? "Voir annonce" : "Recherche"}
            </a>
          )}
          <button
            onClick={handleOuvrir}
            className="flex items-center gap-[5px] text-[12px] font-medium text-[#4A453F] rounded-[9px] px-[10px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
            style={{ background: "#FAF8F5" }}
          >
            {ouverte ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={handleSupprimer}
            className="ml-auto flex items-center justify-center rounded-[9px] p-[9px] border border-[#ECE7E1] hover:border-[#F6CFCB] hover:bg-[#FDECEA] transition-colors"
            style={{ background: "#FAF8F5" }}
            title="Supprimer cette demande"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#8B847D]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vue admin — formulaire d'ajout ────────────────────────────────────────────

type FormAjout = {
  typesTravaux: string;
  commune: string;
  codePostal: string;
  description: string;
  corpsMetierCible: string;
  origine: NonNullable<AffaireCAPEB["origine"]>;
  sourceNom: string;
  sourceUrl: string;
  sourceUrlType: NonNullable<AffaireCAPEB["sourceUrlType"]>;
  validation: NonNullable<AffaireCAPEB["validation"]>;
  contactConsigne: string;
};

const FORM_DEFAUT: FormAjout = {
  typesTravaux: "Plomberie",
  commune: "",
  codePostal: "",
  description: "",
  corpsMetierCible: "Tous",
  origine: "depot_direct",
  sourceNom: "",
  sourceUrl: "",
  sourceUrlType: "annonce_exacte",
  validation: "validee",
  contactConsigne: "Contact à transmettre après qualification par la CAPEB.",
};

function VueAjouter({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<FormAjout>({ ...FORM_DEFAUT });

  function set(field: keyof FormAjout, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.commune.trim() || !form.description.trim()) return;
    if (!sourceUrlValide(form.sourceUrl)) {
      toast.error("Le lien source doit commencer par http:// ou https://");
      return;
    }
    const nouvelle: AffaireCAPEB = {
      id: crypto.randomUUID(),
      dateAjout: new Date().toISOString(),
      typesTravaux: form.typesTravaux,
      commune: form.commune.trim(),
      codePostal: form.codePostal.trim(),
      description: form.description.trim(),
      statut: "nouveau",
      corpsMetierCible: form.corpsMetierCible,
      origine: form.origine,
      sourceNom: form.sourceNom.trim() || labelOrigine(form.origine),
      sourceUrl: form.sourceUrl.trim() || undefined,
      sourceUrlType: form.sourceUrl.trim() ? form.sourceUrlType : undefined,
      validation: form.validation,
      contactConsigne: form.contactConsigne.trim() || undefined,
    };
    saveAffaireCAPEB(nouvelle);
    notifyUpdate();
    toast.success("Demande publiée avec succès");
    setForm({ ...FORM_DEFAUT });
    onSuccess();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,640px)_minmax(260px,1fr)]">
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[24px]"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <h2 className="font-display text-[17px] font-semibold text-[#1A1714] uppercase mb-[20px]">
          Nouvelle demande
        </h2>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          {/* Type de travaux */}
          <div>
            <label className={LABEL_CLS}>Type de travaux</label>
            <select
              value={form.typesTravaux}
              onChange={(e) => set("typesTravaux", e.target.value)}
              className={INPUT_CLS}
            >
              {TYPES_TRAVAUX.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Commune + Code postal */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className={LABEL_CLS}>Commune</label>
              <input
                type="text"
                required
                value={form.commune}
                onChange={(e) => set("commune", e.target.value)}
                placeholder="ex : Pau"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Code postal</label>
              <input
                type="text"
                value={form.codePostal}
                onChange={(e) => set("codePostal", e.target.value)}
                placeholder="ex : 64000"
                maxLength={5}
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>Description de la demande</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Décrivez la demande du particulier…"
              rows={4}
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {/* Corps de métier ciblé */}
          <div>
            <label className={LABEL_CLS}>Corps de métier ciblé</label>
            <select
              value={form.corpsMetierCible}
              onChange={(e) => set("corpsMetierCible", e.target.value)}
              className={INPUT_CLS}
            >
              <option value="Tous">Tous les corps de métier</option>
              {TYPES_TRAVAUX.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-[12px] md:grid-cols-2">
            <div>
              <label className={LABEL_CLS}>Origine</label>
              <select
                value={form.origine}
                onChange={(e) => set("origine", e.target.value)}
                className={INPUT_CLS}
              >
                {ORIGINES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Statut de qualification</label>
              <select
                value={form.validation}
                onChange={(e) => set("validation", e.target.value)}
                className={INPUT_CLS}
              >
                <option value="validee">Qualifiée</option>
                <option value="a_valider">A qualifier</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Nom de la source</label>
            <input
              type="text"
              value={form.sourceNom}
              onChange={(e) => set("sourceNom", e.target.value)}
              placeholder="ex : Formulaire CAPEB, Leboncoin, groupe Facebook public..."
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Lien source public ou autorisé</label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => set("sourceUrl", e.target.value)}
              placeholder="https://..."
              className={INPUT_CLS}
            />
            <p className="text-[11.5px] text-[#8B847D] mt-[6px]">
              Conservez un lien plutôt que de recopier des coordonnées personnelles.
            </p>
          </div>

          <div>
            <label className={LABEL_CLS}>Type de lien</label>
            <select
              value={form.sourceUrlType}
              onChange={(e) => set("sourceUrlType", e.target.value)}
              className={INPUT_CLS}
            >
              <option value="annonce_exacte">URL exacte de l'annonce</option>
              <option value="page_recherche">Page de recherche / catégorie</option>
            </select>
            <p className="text-[11.5px] text-[#8B847D] mt-[6px]">
              Pour les artisans, privilégiez toujours l'URL exacte de l'annonce.
            </p>
          </div>

          <div>
            <label className={LABEL_CLS}>Consigne de contact</label>
            <textarea
              value={form.contactConsigne}
              onChange={(e) => set("contactConsigne", e.target.value)}
              rows={3}
              className={`${INPUT_CLS} resize-none`}
              placeholder="ex : contacter via la plateforme source, validation CAPEB nécessaire..."
            />
          </div>

          {/* Bouton soumettre */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-[8px] text-[13.5px] font-semibold text-white rounded-[10px] px-[16px] py-[12px] transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(180deg,#EA1227,#D2001A)",
              boxShadow: "0 3px 10px rgba(226,0,26,.3)",
            }}
          >
            <Plus className="h-4 w-4" />
            Publier la demande
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <ConseilCard
          icon={<ShieldCheck className="h-4 w-4" />}
          titre="Qualification avant diffusion"
          texte="Les imports issus de plateformes externes doivent rester en 'A qualifier' tant que l'annonce, le consentement ou le mode de contact n'ont pas été vérifiés."
        />
        <ConseilCard
          icon={<AlertTriangle className="h-4 w-4" />}
          titre="Pas d'aspiration massive"
          texte="Pour Facebook, Leboncoin et assimilés, privilégiez les liens, les APIs/partenariats ou une validation manuelle des publications publiques."
        />
        <ConseilCard
          icon={<ClipboardList className="h-4 w-4" />}
          titre="Données minimales"
          texte="La description doit résumer le besoin sans republier téléphone, email, nom complet ou capture d'écran du particulier."
        />
      </div>
    </div>
  );
}

function ConseilCard({
  icon,
  titre,
  texte,
}: {
  icon: React.ReactNode;
  titre: string;
  texte: string;
}) {
  return (
    <div
      className="bg-white rounded-[14px] border border-[#ECE7E1] p-[16px]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-2 text-[#E2001A]">
        {icon}
        <p className="text-[13px] font-semibold text-[#1A1714]">{titre}</p>
      </div>
      <p className="text-[12.5px] text-[#4A453F] leading-relaxed mt-[8px]">{texte}</p>
    </div>
  );
}

function VueVeille({
  annoncesVeille,
  recharger,
  rechargerVeille,
}: {
  annoncesVeille: AnnonceParticulier[];
  recharger: () => void;
  rechargerVeille: () => void;
}) {
  const sources = [
    {
      titre: "Formulaire direct dans l'app",
      statut: "Recommandé",
      description:
        "Le particulier dépose sa demande directement, avec consentement explicite et données structurées.",
    },
    {
      titre: "Partenaires locaux / collectivités",
      statut: "Fiable",
      description:
        "Flux transmis par des partenaires, mairies, réseaux d'entraide ou permanences CAPEB.",
    },
    {
      titre: "Leboncoin et plateformes d'annonces",
      statut: "A encadrer",
      description:
        "Utiliser uniquement des liens publics, imports manuels ou APIs/accords autorisés. Ne pas scraper massivement.",
    },
    {
      titre: "Facebook / groupes locaux",
      statut: "Très encadré",
      description:
        "Ne pas collecter depuis des groupes privés. Importer seulement une publication publique ou autorisée, sans recopier les données personnelles.",
    },
  ];

  const etapes = [
    "Repérer une demande publique ou reçue via un canal autorisé.",
    "Créer une fiche avec le besoin, la commune, le métier et un lien source.",
    "Laisser le statut 'A qualifier' tant que la demande n'est pas vérifiée.",
    "Qualifier la demande côté CAPEB avant de transmettre le contact à un artisan.",
  ];

  return (
    <div className="space-y-5">
      {/* Section annonces scrapées automatiquement */}
      {annoncesVeille.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-[.08em] px-[8px] py-[3px] rounded-full"
              style={{ background: "#FFF3E0", color: "#E65100" }}
            >
              Veille automatique
            </span>
            <span className="text-[12px] text-[#8B847D]">
              {annoncesVeille.length} annonce{annoncesVeille.length > 1 ? "s" : ""} trouvée{annoncesVeille.length > 1 ? "s" : ""} en ligne
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {annoncesVeille.map((a) => (
              <CarteAnnonceVeille
                key={a.id}
                annonce={a}
                recharger={recharger}
                rechargerVeille={rechargerVeille}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#ECE7E1]" />
            <span className="text-[11.5px] text-[#C4BDB5] font-medium uppercase tracking-[.06em]">
              Informations sur les sources
            </span>
            <div className="flex-1 h-px bg-[#ECE7E1]" />
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[22px]"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-[12px] bg-[#FDECEA] p-2 text-[#E2001A]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-semibold text-[#1A1714] uppercase">
              Cadre de veille conforme
            </h2>
            <p className="text-[13px] leading-relaxed text-[#4A453F] mt-2">
              L'onglet peut centraliser beaucoup de demandes, mais l'alimentation doit respecter les
              conditions des plateformes et la protection des données personnelles. Le produit
              stocke donc une fiche qualifiée et un lien vers la source, plutôt qu'une copie
              complète de l'annonce externe.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-5">
          {sources.map((source) => (
            <div
              key={source.titre}
              className="rounded-[14px] border border-[#ECE7E1] bg-[#FAF8F5] p-[15px]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-semibold text-[#1A1714]">{source.titre}</p>
                <span
                  className="rounded-full px-[8px] py-[2px] text-[10.5px] font-semibold uppercase tracking-wide"
                  style={
                    source.statut === "A encadrer" || source.statut === "Très encadré"
                      ? { background: "#FBF1DE", color: "#D98A00" }
                      : { background: "#E7F4EC", color: "#1E8E55" }
                  }
                >
                  {source.statut}
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#4A453F] mt-2">
                {source.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[22px]"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#E2001A]" />
          <h3 className="font-display text-[17px] font-semibold text-[#1A1714] uppercase">
            Processus conseillé
          </h3>
        </div>
        <ol className="mt-4 space-y-3">
          {etapes.map((etape, index) => (
            <li key={etape} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDECEA] text-[12px] font-bold text-[#E2001A]">
                {index + 1}
              </span>
              <span className="text-[13px] leading-relaxed text-[#4A453F]">{etape}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-[14px] border border-[#F6CFCB] bg-[#FDECEA] p-[14px]">
          <p className="text-[12.5px] font-semibold text-[#E2001A]">Point important</p>
          <p className="text-[12.5px] leading-relaxed text-[#4A453F] mt-1">
            Pour automatiser davantage, il faudra privilégier des APIs officielles, des partenariats
            ou un formulaire de dépôt propriétaire. Les connecteurs de scraping vers
            Facebook/Leboncoin ne sont pas intégrés ici.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── Carte annonce veille automatique (Supabase) ───────────────────────────────

function CarteAnnonceVeille({
  annonce,
  recharger,
  rechargerVeille,
}: {
  annonce: AnnonceParticulier;
  recharger: () => void;
  rechargerVeille: () => void;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [importing, setImporting] = useState(false);
  const Icon = iconPourType(annonce.corps_metier);

  const dateFormatee = (() => {
    const d = annonce.date_annonce ?? annonce.date_scraping;
    try { return `Publié le ${format(parseISO(d), "d MMMM yyyy", { locale: fr })}`; }
    catch { return ""; }
  })();

  async function handleImporter() {
    setImporting(true);
    try {
      const nouvelle: AffaireCAPEB = {
        id: crypto.randomUUID(),
        dateAjout: new Date().toISOString(),
        typesTravaux: annonce.corps_metier,
        commune: annonce.ville ?? "",
        codePostal: annonce.code_postal ?? (annonce.departement ? `${annonce.departement}000` : ""),
        description: annonce.description ?? annonce.titre,
        statut: "nouveau",
        corpsMetierCible: annonce.corps_metier,
        origine: "veille_publique",
        sourceNom: sourceLabel(annonce.source),
        sourceUrl: annonce.url_annonce,
        sourceUrlType: annonce.url_type as "annonce_exacte" | "page_recherche",
        validation: "a_valider",
        contactConsigne: "Vérifier que la demande est toujours active et contacter uniquement via la plateforme source.",
      };
      saveAffaireCAPEB(nouvelle);
      notifyUpdate();
      recharger();
      await supabase
        .from("annonces_particuliers")
        .update({ statut_import: "importe" })
        .eq("id", annonce.id);
      rechargerVeille();
      toast.success("Annonce importée dans vos demandes");
    } catch {
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  }

  async function handleIgnorer() {
    try {
      await supabase
        .from("annonces_particuliers")
        .update({ statut_import: "ignore" })
        .eq("id", annonce.id);
      rechargerVeille();
    } catch {
      toast.error("Erreur");
    }
  }

  return (
    <div
      className="bg-white rounded-[16px] overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[2px]"
      style={{ boxShadow: CARD_SHADOW, border: "1px solid #FFE0B2" }}
    >
      <div style={{ height: 5, background: "linear-gradient(90deg,#FF8F00,#E65100)", flexShrink: 0 }} />
      <div className="p-[18px] flex-1 flex flex-col gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <div
            className="flex items-center justify-center rounded-[10px] shrink-0"
            style={{ width: 36, height: 36, background: "#FFF8F0", border: "1px solid #FFE0B2" }}
          >
            <Icon className="h-4 w-4" style={{ color: "#E65100" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-[15px] font-semibold text-[#1A1714]">
                {annonce.corps_metier}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-[7px] py-[2px] rounded-full"
                style={{ background: "#FFF3E0", color: "#E65100" }}
              >
                Veille auto
              </span>
              <span
                className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full"
                style={{ background: "#F5F2EE", color: "#8B847D" }}
              >
                {sourceLabel(annonce.source)}
              </span>
            </div>
            <p className="text-[12px] text-[#8B847D] mt-[1px]">
              {annonce.ville ?? "Localisation inconnue"}
              {annonce.code_postal ? ` — ${annonce.code_postal}` : annonce.departement ? ` (${annonce.departement})` : ""}
            </p>
          </div>
        </div>

        <p className="text-[13px] font-medium text-[#1A1714] leading-snug">{annonce.titre}</p>

        {annonce.description && (
          <p className={`text-[12.5px] text-[#4A453F] leading-relaxed ${ouverte ? "" : "line-clamp-2"}`}>
            {annonce.description}
          </p>
        )}

        <p className="text-[11.5px] text-[#8B847D]">{dateFormatee}</p>

        <div className="flex items-center gap-[8px] mt-auto pt-[2px]">
          <button
            onClick={handleImporter}
            disabled={importing}
            className="flex-1 flex items-center justify-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[13px] py-[9px] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            <Download className="h-3.5 w-3.5" />
            {importing ? "Import…" : "Importer"}
          </button>
          <a
            href={annonce.url_annonce}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[5px] text-[12px] font-medium text-[#4A453F] rounded-[9px] px-[10px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
            style={{ background: "#FAF8F5" }}
            title={annonce.url_type === "annonce_exacte" ? "Voir l'annonce directe" : "Voir la page de recherche"}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {annonce.description && (
            <button
              onClick={() => setOuverte((v) => !v)}
              className="flex items-center gap-[5px] text-[12px] font-medium text-[#4A453F] rounded-[9px] px-[10px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
              style={{ background: "#FAF8F5" }}
            >
              {ouverte ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={handleIgnorer}
            className="ml-auto flex items-center justify-center rounded-[9px] p-[9px] border border-[#ECE7E1] hover:border-[#F6CFCB] hover:bg-[#FDECEA] transition-colors"
            style={{ background: "#FAF8F5" }}
            title="Ignorer cette annonce"
          >
            <X className="h-3.5 w-3.5 text-[#8B847D]" />
          </button>
        </div>
      </div>
    </div>
  );
}
