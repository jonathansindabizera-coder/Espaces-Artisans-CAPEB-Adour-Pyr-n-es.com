import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Calendar,
  FileText,
  Mail,
  Search,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  FORMATIONS_CATALOGUE,
  type FormationCapeb,
} from "@/lib/formations-catalogue";
import { buildInscriptionMailto } from "@/lib/inscription-email.functions";

export const Route = createFileRoute("/_authenticated/formations")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({ meta: [{ title: "Formations – CAPEB" }] }),
  component: FormationsPage,
});

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── FormationsPage ────────────────────────────────────────────────────────────
function FormationsPage() {
  const { q } = Route.useSearch();
  const [filtreAVenir, setFiltreAVenir] = useState(true);
  const [recherche, setRecherche] = useState(q);

  const formations = FORMATIONS_CATALOGUE;

  const formationsFiltrees = useMemo(() => {
    return formations.filter(f => {
      if (filtreAVenir && f.date_debut && isPast(parseISO(f.date_debut))) return false;
      if (recherche.trim() && !f.titre.toLowerCase().includes(recherche.trim().toLowerCase())) return false;
      return true;
    });
  }, [formations, filtreAVenir, recherche]);

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Formations CAPEB
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Catalogue 2026 · CAPEB Adour-Pyrénées
        </p>
      </div>

      {/* Responsable formation */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[18px] flex flex-wrap items-center justify-between gap-4"
        style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}
      >
        <div>
          <p className="font-display text-[16px] font-semibold text-[#1A1714]">
            Thierry JODAR — Responsable formation · Adour-Pyrénées Conseil
          </p>
          <p className="text-sm text-[#4A453F] mt-2">
            Pour toute question ou inscription, contactez votre responsable formation.
          </p>
        </div>
        <a
          href="mailto:thierry.jodar@adour-pyrenees-conseil.fr"
          className="flex items-center gap-2 text-[13px] font-semibold text-white rounded-[9px] px-[16px] py-[10px] transition-colors flex-shrink-0"
          style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
        >
          <Mail className="h-4 w-4" /> Contacter Thierry Jodar
        </a>
      </div>

      {/* Filtres en pastilles */}
      <div className="flex flex-wrap gap-[9px] items-center">
        <div
          className="flex items-center gap-2 rounded-[10px] px-3 flex-1 min-w-[200px] max-w-[340px]"
          style={{ height: 38, background: "white", border: "1px solid #ECE7E1" }}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[#8B847D]" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une formation…"
            className="flex-1 bg-transparent text-[13px] text-[#1A1714] placeholder:text-[#8B847D] outline-none min-w-0"
          />
        </div>
        <FilterChip
          label={filtreAVenir ? "✓ À venir" : "Toutes les dates"}
          active={filtreAVenir}
          onClick={() => setFiltreAVenir(v => !v)}
          className="ml-auto"
        />
      </div>

      {/* Contenu principal */}
      {formationsFiltrees.length === 0 ? (
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
    ? capitalizeFirst(format(parseISO(formation.date_debut), "EEEE d MMMM yyyy", { locale: fr }))
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

        {/* Lieu */}
        {formation.lieu && (
          <div className="flex items-center mb-[10px]">
            <span
              className="text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full border flex-shrink-0"
              style={{ background: "#FAF8F5", borderColor: "#ECE7E1", color: "#4A453F" }}
            >
              📍 {formation.lieu}
            </span>
          </div>
        )}

        {/* Titre */}
        <h3 className="font-display text-[17px] font-semibold leading-[1.2] text-[#1A1714]">
          {formation.titre}
        </h3>

        {/* Date */}
        {dateStr && (
          <div className="flex flex-wrap gap-[14px] text-[12.5px] text-[#8B847D] my-[11px]">
            <span className="flex items-center gap-[5px]">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              {dateStr}
            </span>
          </div>
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
            href={passee ? undefined : buildInscriptionMailto(formation)}
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
