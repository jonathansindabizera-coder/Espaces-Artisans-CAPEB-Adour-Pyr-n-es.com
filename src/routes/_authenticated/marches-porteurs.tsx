import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap, Home, Thermometer, Sun, Snowflake, Briefcase,
  ArrowLeft, Info, Mail, GraduationCap, HeartHandshake, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { MARCHES_PORTEURS, type MarchePorteur } from "@/lib/marches-porteurs";

export const Route = createFileRoute("/_authenticated/marches-porteurs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Marchés porteurs – CAPEB" }] }),
  component: MarchesPorteursPage,
});

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Home, Thermometer, Sun, Snowflake,
};

function getIcon(nom: string): LucideIcon {
  return ICON_MAP[nom] ?? Briefcase;
}

const CARD_SHADOW = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";

function MarchesPorteursPage() {
  const [selection, setSelection] = useState<MarchePorteur | null>(null);

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Marchés porteurs
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Infos métier : où vous positionner, et comment être accompagné par la CAPEB
        </p>
      </div>

      {selection ? (
        <FicheMarche marche={selection} onRetour={() => setSelection(null)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MARCHES_PORTEURS.map((m) => (
            <CarteMarche key={m.id} marche={m} onClick={() => setSelection(m)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Carte (vue liste) ───────────────────────────────────────────────────────────
function CarteMarche({ marche, onClick }: { marche: MarchePorteur; onClick: () => void }) {
  const Icon = getIcon(marche.icone);

  return (
    <div
      className="bg-white rounded-[14px] border border-[#ECE7E1] p-[18px] flex flex-col gap-3"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-[10px] flex-shrink-0"
          style={{ width: 36, height: 36, background: `${marche.accent}1A` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: marche.accent }} />
        </div>
        <h3 className="font-display text-[17px] font-semibold leading-tight text-[#1A1714]">
          {marche.titre}
        </h3>
      </div>

      <p className="text-sm text-[#4A453F] flex-1">{marche.accroche}</p>

      <button
        onClick={onClick}
        className="text-[13px] font-semibold text-white rounded-[9px] px-[16px] py-[10px] transition-colors self-start"
        style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
      >
        Découvrir
      </button>
    </div>
  );
}

// ── Section générique avec titre + ligne d'accent ────────────────────────────────
function SectionTitre({ titre, accent }: { titre: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="font-display text-[17px] font-semibold text-[#1A1714] uppercase tracking-wide whitespace-nowrap">
        {titre}
      </h2>
      <div className="h-[2px] flex-1 rounded-full" style={{ background: accent }} />
    </div>
  );
}

function ListePuces({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#4A453F] leading-snug">
          <span className="mt-[7px] h-[5px] w-[5px] rounded-full flex-shrink-0" style={{ background: accent }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CarteSection({ titre, accent, children }: { titre: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#ECE7E1] p-[20px]" style={{ boxShadow: CARD_SHADOW }}>
      <SectionTitre titre={titre} accent={accent} />
      {children}
    </div>
  );
}

// ── Vue détail (fiche complète) ──────────────────────────────────────────────────
function FicheMarche({ marche, onRetour }: { marche: MarchePorteur; onRetour: () => void }) {
  const Icon = getIcon(marche.icone);

  return (
    <div className="space-y-4">

      {/* Retour */}
      <button
        onClick={onRetour}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#4A453F] hover:text-[#1A1714] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les marchés
      </button>

      {/* En-tête de fiche */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[20px] flex items-start gap-4"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div
          className="flex items-center justify-center rounded-[12px] flex-shrink-0"
          style={{ width: 48, height: 48, background: `${marche.accent}1A` }}
        >
          <Icon className="h-6 w-6" style={{ color: marche.accent }} />
        </div>
        <div>
          <h2 className="font-display text-[22px] font-semibold text-[#1A1714] uppercase leading-tight">
            {marche.titre}
          </h2>
          <p className="text-sm text-[#4A453F] mt-1">{marche.accroche}</p>
        </div>
      </div>

      {/* Le marché en bref */}
      <CarteSection titre="Le marché en bref" accent={marche.accent}>
        <ListePuces items={marche.marcheEnBref} accent={marche.accent} />
      </CarteSection>

      {/* Êtes-vous concerné ? */}
      <CarteSection titre="Êtes-vous concerné ?" accent={marche.accent}>
        <ListePuces items={marche.prerequis} accent={marche.accent} />
      </CarteSection>

      {/* Les aides mobilisables */}
      <CarteSection titre="Les aides mobilisables" accent={marche.accent}>
        <ListePuces items={marche.aides} accent={marche.accent} />
        <div
          className="flex items-start gap-2.5 rounded-[10px] p-3 mt-3"
          style={{ background: "#FFF7E6", border: "1px solid #F5D98C" }}
        >
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#B8860B" }} />
          <p className="text-[12.5px] text-[#6B5A1E] leading-snug">{marche.aidesDisclaimer}</p>
        </div>
      </CarteSection>

      {/* Points de vigilance */}
      <CarteSection titre="Points de vigilance" accent={marche.accent}>
        <ListePuces items={marche.vigilance} accent={marche.accent} />
      </CarteSection>

      {/* Vos prochaines étapes */}
      <CarteSection titre="Vos prochaines étapes" accent={marche.accent}>
        <ul className="space-y-2">
          {marche.prochainesEtapes.map((etape, i) => (
            <li key={i} className="text-sm text-[#4A453F] leading-snug">
              <span className="font-semibold text-[#1A1714]">{etape.label}</span> — {etape.detail}
            </li>
          ))}
        </ul>
      </CarteSection>

      {/* Se former */}
      <CarteSection titre="Se former" accent={marche.accent}>
        <div className="space-y-2">
          {marche.formations.map((titreFormation, i) => (
            <Link
              key={i}
              to="/formations"
              search={{ q: titreFormation }}
              className="flex items-center justify-between gap-2 rounded-[10px] px-[14px] py-[11px] border border-[#ECE7E1] transition-colors hover:border-[#E2DCD4]"
              style={{ background: "#FAF8F5" }}
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-[#1A1714]">
                <GraduationCap className="h-4 w-4 flex-shrink-0" style={{ color: marche.accent }} />
                {titreFormation}
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#8B847D]" />
            </Link>
          ))}
        </div>
      </CarteSection>

      {/* Être accompagné par la CAPEB */}
      <CarteSection titre="Être accompagné par la CAPEB" accent={marche.accent}>
        <div className="divide-y divide-[#F0EBE4]">
          {marche.poles.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 flex-wrap py-3 first:pt-0 last:pb-0">
              <span className="flex items-center gap-2.5 text-sm text-[#4A453F]">
                <HeartHandshake className="h-4 w-4 flex-shrink-0" style={{ color: marche.accent }} />
                <span>
                  <span className="font-semibold text-[#1A1714]">{p.pole}</span> — {p.referent}
                </span>
              </span>
              <a
                href={`mailto:${p.email}?subject=${encodeURIComponent(`Accompagnement ${marche.titre}`)}`}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white rounded-[9px] px-[13px] py-[9px] transition-colors flex-shrink-0"
                style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
              >
                <Mail className="h-3.5 w-3.5" />
                Contacter
              </a>
            </div>
          ))}
        </div>
      </CarteSection>

    </div>
  );
}
