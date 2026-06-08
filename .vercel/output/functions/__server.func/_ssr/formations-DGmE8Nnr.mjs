import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, c as createSsrRpc } from "./createSsrRpc-Ddupdfr2.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { a as createServerFn } from "./server-6vWT_TeN.mjs";
import "../_libs/seroval.mjs";
import { g as isPast, p as parseISO, f as format, d as fr } from "../_libs/date-fns.mjs";
import { L as LoaderCircle, R as RefreshCw, v as CircleAlert, G as GraduationCap, C as Calendar, j as Clock, d as FileText } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const fetchFormationsCapeb = createServerFn({
  method: "GET"
}).handler(createSsrRpc("b2d05ff9dfd718a3e7fecb3077784753c92d0afac7786d1a4320e21c7bb867f4"));
const LIEUX = ["Lescar", "Anglet", "Tarbes", "Pau"];
function FormationsPage() {
  const [filtreAVenir, setFiltreAVenir] = reactExports.useState(true);
  const [filtreLieu, setFiltreLieu] = reactExports.useState("tous");
  const [filtreTheme, setFiltreTheme] = reactExports.useState("tous");
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const fetchFn = useServerFn(fetchFormationsCapeb);
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["formations-capeb", refreshKey],
    queryFn: () => fetchFn({}),
    staleTime: 60 * 60 * 1e3,
    retry: 1
  });
  const formations = data?.formations ?? [];
  const fetchedAt = data?.fetchedAt ?? null;
  const themes = reactExports.useMemo(() => {
    const set = new Set(formations.map((f) => f.theme).filter(Boolean));
    return Array.from(set).sort();
  }, [formations]);
  const formationsFiltrees = reactExports.useMemo(() => {
    return formations.filter((f) => {
      if (filtreAVenir && f.date_debut && isPast(parseISO(f.date_debut))) return false;
      if (filtreLieu !== "tous" && f.lieu !== filtreLieu) return false;
      if (filtreTheme !== "tous" && f.theme !== filtreTheme) return false;
      return true;
    });
  }, [formations, filtreAVenir, filtreLieu, filtreTheme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none", children: "Formations CAPEB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8B847D] text-sm mt-[7px]", children: "Le catalogue de votre antenne Adour-Pyrénées, inscription en un clic." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRefreshKey((k) => k + 1), disabled: isLoading, className: "flex items-center gap-2 text-[14px] font-semibold text-[#4A453F] bg-white border border-[#ECE7E1] rounded-[12px] px-[20px] py-[13px] hover:border-[#E2DCD4] transition-colors disabled:opacity-50", style: {
        boxShadow: "0 1px 2px rgba(26,23,20,.05)"
      }, children: [
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-[18px] w-[18px] animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-[18px] w-[18px]" }),
        "Rafraîchir"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-[9px] text-[12.5px] rounded-[20px] px-[14px] py-[8px] font-semibold w-max max-w-full", style: {
      background: "#E7F4EC",
      border: "1px solid #c6e6d2",
      color: "#15693E"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-green" }),
      "Synchronisé avec capeb.fr/adour-pyrénées",
      fetchedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-xs opacity-75 ml-1", children: [
        "· Mis à jour le ",
        format(parseISO(fetchedAt), "d MMMM yyyy à HH:mm", {
          locale: fr
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-[9px] items-center", children: [
      ["tous", ...LIEUX].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterChip, { label: l === "tous" ? "Tous les lieux" : l, active: filtreLieu === l, onClick: () => setFiltreLieu(l) }, l)),
      themes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-px self-stretch bg-[#ECE7E1] mx-1" }),
      themes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterChip, { label: t, active: filtreTheme === t, onClick: () => setFiltreTheme(filtreTheme === t ? "tous" : t) }, t)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FilterChip, { label: filtreAVenir ? "✓ À venir" : "Toutes les dates", active: filtreAVenir, onClick: () => setFiltreAVenir((v) => !v), className: "ml-auto" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3 text-[#8B847D]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Récupération des formations depuis capeb.fr…" })
    ] }) : isError || data && !data.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center space-y-3", style: {
      boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 mx-auto text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg text-[#1A1714]", children: "Impossible de contacter capeb.fr" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8B847D] max-w-sm mx-auto", children: "Le site CAPEB est peut-être temporairement indisponible. Réessayez dans quelques minutes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRefreshKey((k) => k + 1), className: "flex items-center gap-2 mx-auto text-sm font-semibold text-[#4A453F] bg-white border border-[#ECE7E1] rounded-[10px] px-4 py-2 hover:border-[#E2DCD4] transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
        " Réessayer"
      ] })
    ] }) : formations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-[16px] border border-[#ECE7E1] py-16 text-center space-y-4", style: {
      boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-14 w-14 mx-auto text-[#8B847D]/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg text-[#1A1714]", children: "Aucune formation trouvée" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8B847D] mt-1", children: "La page CAPEB ne contient pas encore de formations ou sa structure a changé." })
      ] })
    ] }) : formationsFiltrees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-[16px] border border-[#ECE7E1] py-12 text-center text-[#8B847D] text-sm", style: {
      boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)"
    }, children: "Aucune formation ne correspond aux filtres. Essayez de les modifier." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-[#8B847D]", children: [
        formationsFiltrees.length,
        " formation",
        formationsFiltrees.length > 1 ? "s" : "",
        " trouvée",
        formationsFiltrees.length > 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: formationsFiltrees.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(CarteFormation, { formation: f }, f.external_id)) })
    ] })
  ] });
}
function FilterChip({
  label,
  active,
  onClick,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: cn("text-[12.5px] font-semibold px-[14px] py-[8px] rounded-[20px] border cursor-pointer transition-all duration-150", className), style: active ? {
    background: "#1A1714",
    color: "#fff",
    borderColor: "#1A1714"
  } : {
    background: "white",
    color: "#4A453F",
    borderColor: "#ECE7E1"
  }, children: label });
}
function CarteFormation({
  formation
}) {
  const dateStr = formation.date_debut ? format(parseISO(formation.date_debut), "d MMMM yyyy", {
    locale: fr
  }) : null;
  const passee = formation.date_debut ? isPast(parseISO(formation.date_debut)) : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("bg-white rounded-[16px] border border-[#ECE7E1] overflow-hidden flex flex-col transition-all duration-150", "hover:-translate-y-[3px]", passee && "opacity-55"), style: {
    boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)"
  }, onMouseEnter: (e) => {
    if (!passee) e.currentTarget.style.boxShadow = "0 2px 6px rgba(26,23,20,.07), 0 16px 40px rgba(26,23,20,.09)";
  }, onMouseLeave: (e) => {
    e.currentTarget.style.boxShadow = "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)";
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      height: 6,
      background: "#E2001A",
      flexShrink: 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-[18px] flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-[10px]", children: [
        formation.theme && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tracking-[.06em] uppercase text-[#E2001A] flex-1 truncate", children: formation.theme }),
        formation.lieu && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full border flex-shrink-0", style: {
          background: "#FAF8F5",
          borderColor: "#ECE7E1",
          color: "#4A453F"
        }, children: [
          "📍 ",
          formation.lieu
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[17px] font-semibold leading-[1.2] text-[#1A1714]", children: formation.titre }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-[14px] text-[12.5px] text-[#8B847D] my-[11px]", children: [
        dateStr && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-[5px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 flex-shrink-0", strokeWidth: 2 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: dateStr })
        ] }),
        formation.duree_texte && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-[5px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 flex-shrink-0", strokeWidth: 2 }),
          formation.duree_texte
        ] })
      ] }),
      formation.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8B847D] line-clamp-3 leading-relaxed mb-2", children: formation.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[10px] mt-auto pt-[14px]", children: [
        formation.url_programme_pdf && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: formation.url_programme_pdf, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-[6px] text-[12.5px] font-semibold text-[#4A453F] rounded-[9px] px-[13px] py-[9px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors", style: {
          background: "#FAF8F5"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 flex-shrink-0", strokeWidth: 2 }),
          "Programme"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: passee ? void 0 : "https://www.capeb.fr/adour-pyrenees/nos-services?tab=training", target: passee ? void 0 : "_blank", rel: "noopener noreferrer", className: cn("ml-auto text-[13px] font-semibold rounded-[9px] px-[16px] py-[10px] transition-colors", passee ? "bg-[#ECE7E1] text-[#8B847D] cursor-not-allowed pointer-events-none" : "text-white"), style: passee ? {} : {
          background: "linear-gradient(180deg,#EA1227,#D2001A)",
          boxShadow: "0 3px 10px rgba(226,0,26,.3)"
        }, children: passee ? "Formation passée" : "S'inscrire" })
      ] })
    ] })
  ] });
}
export {
  FormationsPage as component
};
