import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ExternalLink, ChevronDown, ChevronUp, Clock, MapPin,
  CheckCircle2, Info, Mail, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  fetchMarchesPublicsBoamp, loadMarchesPublicsCache, saveMarchesPublicsCache,
  cacheEstValide, joursRestants, buildAideMarchePublicMailto,
  PIECES_CANDIDATURE_STANDARD,
  type MarchePublic, type MarchesPublicsCache,
} from "@/lib/marches-publics";
import { chargesDevPourDepartements } from "@/lib/contacts-capeb";

export const Route = createFileRoute("/_authenticated/marches-publics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Marchés publics – CAPEB" }] }),
  component: MarchesPublicsPage,
});

const CARD_SHADOW = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── MarchesPublicsPage ───────────────────────────────────────────────────────────
const FILTRES_DEPARTEMENT = [
  { value: "tous", label: "Tous" },
  { value: "64", label: "64 — Pyrénées-Atlantiques" },
  { value: "65", label: "65 — Hautes-Pyrénées" },
] as const;

type FiltreDepartement = (typeof FILTRES_DEPARTEMENT)[number]["value"];

function MarchesPublicsPage() {
  const [cache, setCache] = useState<MarchesPublicsCache | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtreDept, setFiltreDept] = useState<FiltreDepartement>("tous");

  const rafraichir = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const fraiches = await fetchMarchesPublicsBoamp();
      saveMarchesPublicsCache(fraiches);
      setCache(fraiches);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    const local = loadMarchesPublicsCache();
    if (local) setCache(local);

    if (cacheEstValide(local)) {
      setChargement(false);
    } else {
      void rafraichir();
    }
  }, [rafraichir]);

  // On ignore les marchés dont la date limite est dépassée depuis la mise en cache
  const marches = (cache?.marches ?? [])
    .filter(m => joursRestants(m.dateLimiteReponse) >= 0)
    .filter(m => filtreDept === "tous" || m.departements.includes(filtreDept));

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Marchés publics
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          Appels d'offres bâtiment ouverts dans les Pyrénées-Atlantiques (64) et les Hautes-Pyrénées (65)
        </p>
      </div>

      {/* Filtre département */}
      <div className="flex flex-wrap items-center gap-[8px]">
        {FILTRES_DEPARTEMENT.map(opt => {
          const actif = filtreDept === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFiltreDept(opt.value)}
              className="text-[12.5px] font-semibold rounded-[9px] px-[13px] py-[8px] border transition-colors"
              style={
                actif
                  ? { background: "linear-gradient(180deg,#EA1227,#D2001A)", color: "white", borderColor: "transparent", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }
                  : { background: "#FAF8F5", color: "#4A453F", borderColor: "#ECE7E1" }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Bandeau source + actualisation */}
      <div
        className="bg-white rounded-[16px] border border-[#ECE7E1] p-[14px] flex flex-wrap items-center justify-between gap-3"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <p className="text-[12.5px] text-[#8B847D]">
          Source : BOAMP / DILA — données publiques, licence ouverte v2.0
          {cache && (
            <> · Mis à jour {capitalizeFirst(format(parseISO(cache.fetchedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr }))}</>
          )}
        </p>
        <button
          onClick={() => void rafraichir()}
          disabled={chargement}
          className="flex items-center gap-2 text-[12.5px] font-semibold text-[#4A453F] rounded-[9px] px-[13px] py-[8px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors disabled:opacity-60"
          style={{ background: "#FAF8F5" }}
        >
          {chargement
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
          Actualiser
        </button>
      </div>

      {/* États */}
      {chargement && !cache ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-16 flex flex-col items-center gap-3 text-[#8B847D] text-sm"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement des marchés publics…
        </div>

      ) : erreur && !cache ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 flex flex-col items-center gap-3 text-center px-6"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <AlertCircle className="h-5 w-5 text-[#E2001A]" />
          <p className="text-sm text-[#4A453F]">
            Impossible de récupérer les marchés publics pour le moment.<br />
            <span className="text-[#8B847D]">{erreur}</span>
          </p>
          <button
            onClick={() => void rafraichir()}
            className="text-[13px] font-semibold text-white rounded-[9px] px-[16px] py-[10px] transition-colors"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            Réessayer
          </button>
        </div>

      ) : marches.length === 0 ? (
        <div
          className="bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm"
          style={{ boxShadow: CARD_SHADOW }}
        >
          Aucun marché en cours pour vos critères. Revenez bientôt — la liste est actualisée automatiquement.
        </div>

      ) : (
        <>
          <p className="text-sm text-[#8B847D]">
            {marches.length} marché{marches.length > 1 ? "s" : ""} en cours, trié{marches.length > 1 ? "s" : ""} par date limite
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {marches.map(m => (
              <CarteMarchePublic key={m.idweb} marche={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── CarteMarchePublic ──────────────────────────────────────────────────────────
function CarteMarchePublic({ marche }: { marche: MarchePublic }) {
  const [ouvert, setOuvert] = useState(false);
  const jours = joursRestants(marche.dateLimiteReponse);
  const urgent = jours < 7;
  const contacts = chargesDevPourDepartements(marche.departements);

  const dateLimiteFr = capitalizeFirst(
    format(parseISO(marche.dateLimiteReponse), "EEEE d MMMM yyyy", { locale: fr }),
  );

  let texteDelai: string;
  if (jours <= 0) texteDelai = "Aujourd'hui";
  else if (jours === 1) texteDelai = "1 jour restant";
  else texteDelai = `${jours} jours restants`;

  return (
    <div
      className="bg-white rounded-[16px] border border-[#ECE7E1] overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[3px]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* Bande rouge en haut */}
      <div style={{ height: 6, background: "#E2001A", flexShrink: 0 }} />

      <div className="p-[18px] flex-1 flex flex-col">

        {/* Badges : départements + MAPA */}
        <div className="flex flex-wrap items-center gap-[8px] mb-[10px]">
          {marche.departements.map(dep => (
            <span
              key={dep}
              className="flex items-center gap-1 text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full border flex-shrink-0"
              style={{ background: "#FAF8F5", borderColor: "#ECE7E1", color: "#4A453F" }}
            >
              <MapPin className="h-3 w-3" />
              {dep}
            </span>
          ))}
          {marche.estMapa && (
            <span
              className="text-[10.5px] font-bold uppercase tracking-wide px-[9px] py-[3px] rounded-full flex-shrink-0"
              style={{ background: "#FDECEA", color: "#E2001A" }}
            >
              MAPA — accessible
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-display text-[16px] font-semibold leading-[1.25] text-[#1A1714] line-clamp-3">
          {marche.objet}
        </h3>

        {/* Acheteur */}
        <p className="text-[12.5px] text-[#8B847D] mt-[6px] line-clamp-1">
          {marche.acheteur}
        </p>

        {/* Date limite */}
        <div
          className="flex items-center justify-between gap-2 rounded-[10px] px-[12px] py-[10px] mt-[12px]"
          style={{ background: urgent ? "#FDECEA" : "#FAF8F5", border: `1px solid ${urgent ? "#F6CFCB" : "#ECE7E1"}` }}
        >
          <span className="flex items-center gap-[6px] text-[12px] text-[#4A453F]">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: urgent ? "#E2001A" : "#8B847D" }} />
            {dateLimiteFr}
          </span>
          <span
            className="text-[12px] font-bold flex-shrink-0"
            style={{ color: urgent ? "#E2001A" : "#4A453F" }}
          >
            {texteDelai}
          </span>
        </div>

        {/* Procédure */}
        <p className="text-[11.5px] text-[#8B847D] mt-[8px]">
          {marche.procedureLibelle}
        </p>

        {/* Pied de carte */}
        <div className="flex items-center gap-[10px] mt-auto pt-[14px]">
          <a
            href={marche.urlAvis}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[6px] text-[12.5px] font-semibold text-white rounded-[9px] px-[14px] py-[10px] transition-colors"
            style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
            Voir l'avis (DCE)
          </a>
          <button
            onClick={() => setOuvert(v => !v)}
            className="ml-auto flex items-center gap-[6px] text-[12.5px] font-semibold text-[#4A453F] rounded-[9px] px-[13px] py-[10px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
            style={{ background: "#FAF8F5" }}
          >
            Candidater
            {ouvert ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Détail dépliable : pièces à fournir + aide */}
        {ouvert && (
          <div className="mt-[14px] pt-[14px] border-t border-[#ECE7E1] space-y-[12px]">

            <div>
              <h4 className="font-display text-[12px] font-semibold uppercase tracking-wide text-[#1A1714] mb-[8px]">
                Ce qu'il faut pour candidater
              </h4>
              <ul className="space-y-[6px]">
                {PIECES_CANDIDATURE_STANDARD.map(piece => (
                  <li key={piece} className="flex items-start gap-2 text-[12.5px] text-[#4A453F] leading-snug">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-[1px]" style={{ color: "#8B847D" }} />
                    <span>{piece}</span>
                  </li>
                ))}
              </ul>
              <div
                className="flex items-start gap-2.5 rounded-[10px] p-3 mt-[10px]"
                style={{ background: "#FFF7E6", border: "1px solid #F5D98C" }}
              >
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#B8860B" }} />
                <p className="text-[12px] text-[#6B5A1E] leading-snug">
                  Liste standard, à titre indicatif. La liste exacte des pièces demandées dépend de
                  CHAQUE marché : elle se trouve dans le DCE, accessible via le bouton « Voir l'avis (DCE) » ci-dessus.
                </p>
              </div>
            </div>

            {contacts.length > 0 && (
              <div>
                <h4 className="font-display text-[12px] font-semibold uppercase tracking-wide text-[#1A1714] mb-[8px]">
                  Besoin d'aide pour répondre ?
                </h4>
                <div className="space-y-[6px]">
                  {contacts.map(c => (
                    <a
                      key={c.email}
                      href={buildAideMarchePublicMailto(marche, c.email)}
                      className="flex items-center justify-between gap-2 rounded-[10px] px-[12px] py-[10px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
                      style={{ background: "#FAF8F5" }}
                    >
                      <span className="text-[12.5px] text-[#4A453F]">
                        <span className="font-semibold text-[#1A1714]">{c.nom}</span> — {c.secteur}
                      </span>
                      <span
                        className="flex items-center gap-[5px] text-[12px] font-semibold text-white rounded-[8px] px-[11px] py-[7px] flex-shrink-0"
                        style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)" }}
                      >
                        <Mail className="h-3 w-3" />
                        Contacter
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
