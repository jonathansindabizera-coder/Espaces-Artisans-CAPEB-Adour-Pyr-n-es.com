import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  GraduationCap,
  RefreshCw,
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  fetchFormationsCapeb,
  type FormationCapeb,
} from "@/lib/formations-fetch.functions";

export const Route = createFileRoute("/_authenticated/formations")({
  head: () => ({ meta: [{ title: "Formations – CAPEB" }] }),
  component: FormationsPage,
});

const LIEUX = ["Lescar", "Anglet", "Tarbes", "Pau"];

// ── FormationsPage ────────────────────────────────────────────────────────────
function FormationsPage() {
  const [filtreAVenir, setFiltreAVenir] = useState(true);
  const [filtreLieu, setFiltreLieu]     = useState("tous");
  const [filtreTheme, setFiltreTheme]   = useState("tous");
  const [refreshKey, setRefreshKey]     = useState(0);

  const fetchFn = useServerFn(fetchFormationsCapeb);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["formations-capeb", refreshKey],
    queryFn: () => fetchFn({}),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const formations  = data?.formations ?? [];
  const fetchedAt   = data?.fetchedAt ?? null;

  const themes = useMemo(() => {
    const set = new Set(formations.map(f => f.theme).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [formations]);

  const formationsFiltrees = useMemo(() => {
    return formations.filter(f => {
      if (filtreAVenir && f.date_debut && isPast(parseISO(f.date_debut))) return false;
      if (filtreLieu !== "tous" && f.lieu !== filtreLieu) return false;
      if (filtreTheme !== "tous" && f.theme !== filtreTheme) return false;
      return true;
    });
  }, [formations, filtreAVenir, filtreLieu, filtreTheme]);

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
            Formations CAPEB
          </h1>
          <p className="text-[#8B847D] text-sm mt-[7px]">
            Le catalogue de votre antenne Adour-Pyrénées, inscription en un clic.
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={isLoading}
          className="flex items-center gap-2 text-[14px] font-semibold text-[#4A453F] bg-white border border-[#ECE7E1] rounded-[12px] px-[20px] py-[13px] hover:border-[#E2DCD4] transition-colors disabled:opacity-50"
          style={{ boxShadow: "0 1px 2px rgba(26,23,20,.05)" }}
        >
          {isLoading
            ? <Loader2 className="h-[18px] w-[18px] animate-spin" />
            : <RefreshCw className="h-[18px] w-[18px]" />}
          Rafraîchir
        </button>
      </div>

      {/* Bandeau synchro vert */}
      <div
        className="flex flex-wrap items-center gap-[9px] text-[12.5px] rounded-[20px] px-[14px] py-[8px] font-semibold w-max max-w-full"
        style={{ background: "#E7F4EC", border: "1px solid #c6e6d2", color: "#15693E" }}
      >
        <span className="pulse-green" />
        Synchronisé avec capeb.fr/adour-pyrénées
        {fetchedAt && (
          <span className="font-normal text-xs opacity-75 ml-1">
            · Mis à jour le {format(parseISO(fetchedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
          </span>
        )}
      </div>

      {/* Filtres en pastilles */}
      <div className="flex flex-wrap gap-[9px] items-center">
        {/* Lieux */}
        {(["tous", ...LIEUX] as const).map(l => (
          <FilterChip
            key={l}
            label={l === "tous" ? "Tous les lieux" : l}
            active={filtreLieu === l}
            onClick={() => setFiltreLieu(l)}
          />
        ))}

        {/* Séparateur si thèmes disponibles */}
        {themes.length > 0 && (
          <span className="w-px self-stretch bg-[#ECE7E1] mx-1" />
        )}

        {/* Thèmes dynamiques */}
        {themes.map(t => (
          <FilterChip
            key={t}
            label={t}
            active={filtreTheme === t}
            onClick={() => setFiltreTheme(filtreTheme === t ? "tous" : t)}
          />
        ))}

        {/* Toggle à venir */}
        <FilterChip
          label={filtreAVenir ? "✓ À venir" : "Toutes les dates"}
          active={filtreAVenir}
          onClick={() => setFiltreAVenir(v => !v)}
          className="ml-auto"
        />
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8B847D]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Récupération des formations depuis capeb.fr…</span>
        </div>

      ) : isError || (data && !data.ok) ? (
        <div className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center space-y-3"
          style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}>
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <p className="font-display text-lg text-[#1A1714]">Impossible de contacter capeb.fr</p>
          <p className="text-sm text-[#8B847D] max-w-sm mx-auto">
            Le site CAPEB est peut-être temporairement indisponible. Réessayez dans quelques minutes.
          </p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center gap-2 mx-auto text-sm font-semibold text-[#4A453F] bg-white border border-[#ECE7E1] rounded-[10px] px-4 py-2 hover:border-[#E2DCD4] transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Réessayer
          </button>
        </div>

      ) : formations.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#ECE7E1] py-16 text-center space-y-4"
          style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}>
          <GraduationCap className="h-14 w-14 mx-auto text-[#8B847D]/30" />
          <div>
            <p className="font-display text-lg text-[#1A1714]">Aucune formation trouvée</p>
            <p className="text-sm text-[#8B847D] mt-1">
              La page CAPEB ne contient pas encore de formations ou sa structure a changé.
            </p>
          </div>
        </div>

      ) : formationsFiltrees.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm"
          style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}>
          Aucune formation ne correspond aux filtres. Essayez de les modifier.
        </div>

      ) : (
        <>
          <p className="text-sm text-[#8B847D]">
            {formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? "s" : ""} trouvée{formationsFiltrees.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {formationsFiltrees.map(f => (
              <CarteFormation key={f.external_id} formation={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── FilterChip ────────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick, className }: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[20px] border cursor-pointer transition-all duration-150",
        className,
      )}
      style={active
        ? { background: "#1A1714", color: "#fff", borderColor: "#1A1714" }
        : { background: "white", color: "#4A453F", borderColor: "#ECE7E1" }
      }
    >
      {label}
    </button>
  );
}

// ── CarteFormation ────────────────────────────────────────────────────────────
function CarteFormation({ formation }: { formation: FormationCapeb }) {
  const dateStr = formation.date_debut
    ? format(parseISO(formation.date_debut), "d MMMM yyyy", { locale: fr })
    : null;
  const passee = formation.date_debut ? isPast(parseISO(formation.date_debut)) : false;

  return (
    <div
      className={cn(
        "bg-white rounded-[16px] border border-[#ECE7E1] overflow-hidden flex flex-col transition-all duration-150",
        "hover:-translate-y-[3px]",
        passee && "opacity-55",
      )}
      style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}
      onMouseEnter={e => {
        if (!passee) e.currentTarget.style.boxShadow = "0 2px 6px rgba(26,23,20,.07), 0 16px 40px rgba(26,23,20,.09)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";
      }}
    >
      {/* Bande rouge en haut */}
      <div style={{ height: 6, background: "#E2001A", flexShrink: 0 }} />

      <div className="p-[18px] flex-1 flex flex-col">

        {/* Catégorie + lieu */}
        <div className="flex items-center gap-2 mb-[10px]">
          {formation.theme && (
            <span className="text-[10px] font-bold tracking-[.06em] uppercase text-[#E2001A] flex-1 truncate">
              {formation.theme}
            </span>
          )}
          {formation.lieu && (
            <span
              className="text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full border flex-shrink-0"
              style={{ background: "#FAF8F5", borderColor: "#ECE7E1", color: "#4A453F" }}
            >
              📍 {formation.lieu}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-display text-[17px] font-semibold leading-[1.2] text-[#1A1714]">
          {formation.titre}
        </h3>

        {/* Date + durée */}
        <div className="flex flex-wrap gap-[14px] text-[12.5px] text-[#8B847D] my-[11px]">
          {dateStr && (
            <span className="flex items-center gap-[5px]">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              <span className="capitalize">{dateStr}</span>
            </span>
          )}
          {formation.duree_texte && (
            <span className="flex items-center gap-[5px]">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              {formation.duree_texte}
            </span>
          )}
        </div>

        {/* Description */}
        {formation.description && (
          <p className="text-xs text-[#8B847D] line-clamp-3 leading-relaxed mb-2">
            {formation.description}
          </p>
        )}

        {/* Pied de carte */}
        <div className="flex items-center gap-[10px] mt-auto pt-[14px]">
          {formation.url_programme_pdf && (
            <a
              href={formation.url_programme_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[6px] text-[12.5px] font-semibold text-[#4A453F] rounded-[9px] px-[13px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
              style={{ background: "#FAF8F5" }}
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              Programme
            </a>
          )}
          <a
            href={passee ? undefined : "https://www.capeb.fr/adour-pyrenees/nos-services?tab=training"}
            target={passee ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={cn(
              "ml-auto text-[13px] font-semibold rounded-[9px] px-[16px] py-[10px] transition-colors",
              passee ? "bg-[#ECE7E1] text-[#8B847D] cursor-not-allowed pointer-events-none" : "text-white",
            )}
            style={passee ? {} : {
              background: "linear-gradient(180deg,#EA1227,#D2001A)",
              boxShadow: "0 3px 10px rgba(226,0,26,.3)",
            }}
          >
            {passee ? "Formation passée" : "S'inscrire"}
          </a>
        </div>

      </div>
    </div>
  );
}
