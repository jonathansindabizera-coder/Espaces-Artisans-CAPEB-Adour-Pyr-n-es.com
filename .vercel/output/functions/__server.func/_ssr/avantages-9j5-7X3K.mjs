import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { l as loadProfilEntreprise, w as loadAvantages, x as replaceAvantages, D as DATA_EVENT, y as addAvantage, z as updateAvantage, n as notifyUpdate, A as removeAvantage } from "./local-data-CXnsCisz.mjs";
import { c as Pencil, g as ChevronUp, h as ChevronDown, U as Users, w as Monitor, x as Package, f as Phone, Z as Zap, y as Landmark, z as Shield, A as Truck, E as ShoppingCart, a as Gift, o as Check, P as Plus, X, I as ToggleRight, J as ToggleLeft, K as Trash2, O as PhoneCall, Q as Tag, r as Copy, V as ExternalLink } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const AVANTAGES_EXEMPLES = [{
  id: "ex-centrale-achat",
  titre: "Centrale d'achat BTP CAPEB Avantages",
  categorie: "Centrale d'achat",
  description: "Tarifs négociés sur plus de 250 000 références : outillage, quincaillerie, équipements de chantier.",
  economie_min_pct: 10,
  economie_max_pct: 30,
  type_action: "lien_externe",
  action_valeur: "https://www.capeb-avantages.com",
  partenaire_nom: "CAPEB Avantages",
  conditions: "Réservé aux adhérents CAPEB. Activation du compte sur capeb-avantages.com requise.",
  date_maj: "2025-06-01",
  actif: true
}, {
  id: "ex-carburant",
  titre: "Carburant & véhicules utilitaires",
  categorie: "Véhicules",
  description: "Tarifs préférentiels sur le carburant professionnel et l'entretien de vos véhicules.",
  economie_min_pct: null,
  economie_max_pct: null,
  type_action: "demande_rappel",
  action_valeur: "",
  partenaire_nom: null,
  conditions: "Selon le volume et le prestataire retenu par la CAPEB.",
  date_maj: "2025-06-01",
  actif: true
}, {
  id: "ex-assurance",
  titre: "Assurance décennale & responsabilité civile",
  categorie: "Assurance",
  description: "Offres groupées négociées par la CAPEB auprès de compagnies spécialisées bâtiment.",
  economie_min_pct: null,
  economie_max_pct: null,
  type_action: "demande_rappel",
  action_valeur: "",
  partenaire_nom: null,
  conditions: "Selon le métier, le CA et le type de chantiers.",
  date_maj: "2025-06-01",
  actif: true
}, {
  id: "ex-banque",
  titre: "Banque & solutions de financement",
  categorie: "Banque & financement",
  description: "Conditions préférentielles sur comptes pro, crédits et financement chantier.",
  economie_min_pct: null,
  economie_max_pct: null,
  type_action: "demande_rappel",
  action_valeur: "",
  partenaire_nom: null,
  conditions: "Selon votre situation et la banque partenaire retenue.",
  date_maj: "2025-06-01",
  actif: true
}, {
  id: "ex-fournitures",
  titre: "Fournitures et matériels de chantier",
  categorie: "Fournitures",
  description: "Remises sur vos achats courants : quincaillerie, consommables, EPI, petit outillage.",
  economie_min_pct: 10,
  economie_max_pct: 25,
  type_action: "demande_rappel",
  action_valeur: "",
  partenaire_nom: null,
  conditions: "Selon le fournisseur, le volume et la période d'achat.",
  date_maj: "2025-06-01",
  actif: true
}, {
  id: "ex-ce",
  titre: "Avantages salariés (Comité d'Entreprise)",
  categorie: "Avantages salariés/CE",
  description: "Offres CE pour vous et vos salariés : cinéma, voyages, parcs, culture, réductions vacances.",
  economie_min_pct: 5,
  economie_max_pct: 50,
  type_action: "lien_externe",
  action_valeur: "https://www.capeb-avantages.com",
  partenaire_nom: "CAPEB Avantages",
  conditions: "Réservé aux adhérents CAPEB et à leurs salariés.",
  date_maj: "2025-06-01",
  actif: true
}];
const EMAIL_RAPPEL = "frederic.laplace@capeb-adour-pyrenees.fr";
const CATEGORIES_LIST = ["Centrale d'achat", "Véhicules", "Assurance", "Banque & financement", "Énergie/CEE", "Téléphonie", "Fournitures", "Logiciels", "Avantages salariés/CE"];
const CATEGORIE_META = {
  "Centrale d'achat": {
    icon: ShoppingCart,
    color: "#3B82F6"
  },
  "Véhicules": {
    icon: Truck,
    color: "#F97316"
  },
  "Assurance": {
    icon: Shield,
    color: "#8B5CF6"
  },
  "Banque & financement": {
    icon: Landmark,
    color: "#10B981"
  },
  "Énergie/CEE": {
    icon: Zap,
    color: "#F59E0B"
  },
  "Téléphonie": {
    icon: Phone,
    color: "#06B6D4"
  },
  "Fournitures": {
    icon: Package,
    color: "#84CC16"
  },
  "Logiciels": {
    icon: Monitor,
    color: "#EC4899"
  },
  "Avantages salariés/CE": {
    icon: Users,
    color: "#E2001A"
  }
};
function getCatMeta(cat) {
  return CATEGORIE_META[cat] ?? {
    icon: Gift,
    color: "#8B847D"
  };
}
function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}
function fmt(n) {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
function buildMailtoRappel(profil, avantage) {
  return `mailto:${EMAIL_RAPPEL}?subject=${encodeURIComponent("Demande de rappel - avantage CAPEB")}&body=${encodeURIComponent(`Bonjour,

Entreprise : ${profil.nom || "—"}
SIRET : ${profil.siret || "—"}

Je souhaite être rappelé(e) concernant l'avantage adhérent "${avantage.titre}".

Merci.`)}`;
}
function AvantagesPage() {
  const [avantages, setAvantages] = reactExports.useState([]);
  const [categorieFiltre, setCategorieFiltre] = reactExports.useState("Tous");
  const [showAdmin, setShowAdmin] = reactExports.useState(false);
  const [showEstimateur, setShowEstimateur] = reactExports.useState(false);
  const [profil] = reactExports.useState(() => loadProfilEntreprise());
  reactExports.useEffect(() => {
    const stored = loadAvantages();
    if (stored.length === 0) replaceAvantages(AVANTAGES_EXEMPLES);
    setAvantages(loadAvantages());
    const refresh = () => setAvantages(loadAvantages());
    window.addEventListener(DATA_EVENT, refresh);
    return () => window.removeEventListener(DATA_EVENT, refresh);
  }, []);
  const actifs = avantages.filter((a) => a.actif);
  const categories = ["Tous", ...Array.from(new Set(actifs.map((a) => a.categorie)))];
  const filtres = categorieFiltre === "Tous" ? actifs : actifs.filter((a) => a.categorie === categorieFiltre);
  const grouped = reactExports.useMemo(() => {
    const g = {};
    for (const a of filtres) {
      (g[a.categorie] ??= []).push(a);
    }
    return g;
  }, [filtres]);
  const chiffrables = actifs.filter((a) => a.economie_min_pct !== null && a.economie_max_pct !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[26px] font-bold tracking-wide", style: {
          color: "#1A1714"
        }, children: "Vos avantages adhérent CAPEB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-0.5", style: {
          color: "#8B847D"
        }, children: "Offres incluses ou négociées via votre cotisation — pour un chiffre exact, demandez votre comparatif gratuit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAdmin(true), className: "flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium transition-colors", style: {
        background: "rgba(26,23,20,.07)",
        color: "#8B847D",
        border: "1px solid #E5E0DA"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        "Gérer les avantages"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", style: {
      scrollbarWidth: "none"
    }, children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCategorieFiltre(cat), className: "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all", style: {
      background: categorieFiltre === cat ? "#E2001A" : "white",
      color: categorieFiltre === cat ? "white" : "#4A453F",
      border: `1px solid ${categorieFiltre === cat ? "#E2001A" : "#E5E0DA"}`
    }, children: cat }, cat)) }),
    Object.entries(grouped).map(([cat, items]) => {
      const {
        icon: CatIcon,
        color
      } = getCatMeta(cat);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-base font-semibold flex items-center gap-2", style: {
          color: "#1A1714"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CatIcon, { className: "h-4 w-4", style: {
            color
          } }),
          cat
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3", children: items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(CarteAvantage, { avantage: a, profil }, a.id)) })
      ] }, cat);
    }),
    filtres.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-sm", style: {
      color: "#8B847D"
    }, children: "Aucun avantage dans cette catégorie." }),
    chiffrables.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] overflow-hidden", style: {
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowEstimateur(!showEstimateur), className: "w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[.02]", style: {
        background: "white"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold", style: {
            color: "#1A1714"
          }, children: "Estimez vos économies potentielles" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5", style: {
            color: "#8B847D"
          }, children: "Saisissez vos dépenses actuelles pour une estimation personnalisée en fourchette" })
        ] }),
        showEstimateur ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-5 w-5 shrink-0", style: {
          color: "#8B847D"
        } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5 shrink-0", style: {
          color: "#8B847D"
        } })
      ] }),
      showEstimateur && /* @__PURE__ */ jsxRuntimeExports.jsx(EstimateurSection, { avantages: chiffrables })
    ] }),
    showAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanel, { onClose: () => {
      setShowAdmin(false);
      setAvantages(loadAvantages());
    } })
  ] });
}
function CarteAvantage({
  avantage: a,
  profil
}) {
  const [codeVisible, setCodeVisible] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const {
    icon: CatIcon,
    color
  } = getCatMeta(a.categorie);
  const copyCode = () => {
    navigator.clipboard.writeText(a.action_valeur).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    });
  };
  const actionBtn = () => {
    switch (a.type_action) {
      case "lien_externe":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: a.action_valeur, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90", style: {
          background: "#E2001A"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
          "Découvrir l'offre"
        ] });
      case "code_promo":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: !codeVisible ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCodeVisible(true), className: "flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold text-white", style: {
          background: "#E2001A"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3.5 w-3.5" }),
          "Obtenir mon code"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded-[7px] px-3 py-1.5 text-xs font-bold tracking-wider", style: {
            background: "rgba(226,0,26,.1)",
            color: "#E2001A"
          }, children: a.action_valeur }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: copyCode, className: "rounded p-1.5 hover:bg-black/8", children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5", style: {
            color: "#8B847D"
          } }) })
        ] }) });
      case "demande_rappel":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: buildMailtoRappel(profil, a), className: "flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold transition-colors", style: {
          background: "rgba(226,0,26,.08)",
          color: "#E2001A",
          border: "1px solid rgba(226,0,26,.2)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneCall, { className: "h-3.5 w-3.5" }),
          "Être rappelé"
        ] });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-[14px] p-4 space-y-3 h-full", style: {
    background: "white",
    border: "1px solid #E5E0DA"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", style: {
        background: `${color}18`,
        color
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CatIcon, { className: "h-3 w-3" }),
        a.categorie
      ] }),
      a.economie_min_pct !== null && a.economie_max_pct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", style: {
        background: "rgba(226,0,26,.1)",
        color: "#E2001A"
      }, children: [
        "Estim. −",
        a.economie_min_pct,
        " à −",
        a.economie_max_pct,
        " %"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-[15px] font-semibold leading-tight", style: {
        color: "#1A1714"
      }, children: a.titre }),
      a.partenaire_nom && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", style: {
        color: "#8B847D"
      }, children: a.partenaire_nom }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", style: {
        color: "#4A453F"
      }, children: a.description })
    ] }),
    a.conditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] leading-relaxed", style: {
      color: "#8B847D"
    }, children: [
      "⚠ ",
      a.conditions
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap pt-1 border-t", style: {
      borderColor: "#F0EBE4"
    }, children: [
      actionBtn(),
      a.date_maj && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] shrink-0", style: {
        color: "#B0A9A2"
      }, children: [
        "Màj ",
        fmtDate(a.date_maj)
      ] })
    ] })
  ] });
}
function EstimateurSection({
  avantages
}) {
  const [checked, setChecked] = reactExports.useState({});
  const [budgets, setBudgets] = reactExports.useState({});
  const toggleCheck = (id) => setChecked((prev) => ({
    ...prev,
    [id]: !prev[id]
  }));
  const setB = (id, v) => setBudgets((prev) => ({
    ...prev,
    [id]: v
  }));
  const result = reactExports.useMemo(() => {
    let min = 0;
    let max = 0;
    for (const a of avantages) {
      if (!checked[a.id]) continue;
      const b = Number(budgets[a.id]) || 0;
      min += b * (a.economie_min_pct ?? 0) / 100;
      max += b * (a.economie_max_pct ?? 0) / 100;
    }
    return {
      min,
      max,
      any: Object.values(checked).some(Boolean)
    };
  }, [avantages, checked, budgets]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4", style: {
    background: "#FAF8F5",
    borderTop: "1px solid #E5E0DA"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: {
      color: "#4A453F"
    }, children: "Cochez les avantages que vous utilisez ou envisagez d'utiliser, puis indiquez votre dépense annuelle concernée." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: avantages.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 rounded-[10px] px-4 py-3", style: {
      background: checked[a.id] ? "white" : "rgba(26,23,20,.03)",
      border: `1px solid ${checked[a.id] ? "#E5E0DA" : "#F0EBE4"}`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleCheck(a.id), className: "flex-shrink-0 flex items-center justify-center rounded-[6px] transition-colors", style: {
        width: 20,
        height: 20,
        background: checked[a.id] ? "#E2001A" : "white",
        border: `2px solid ${checked[a.id] ? "#E2001A" : "#D0C9C2"}`
      }, children: checked[a.id] && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-white", strokeWidth: 3 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", style: {
          color: "#1A1714"
        }, children: a.titre }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs shrink-0", style: {
          color: "#8B847D"
        }, children: [
          "(−",
          a.economie_min_pct,
          "% à −",
          a.economie_max_pct,
          "%)"
        ] })
      ] }),
      checked[a.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, step: 100, placeholder: "Budget / an (€)", value: budgets[a.id] ?? "", onChange: (e) => setB(a.id, e.target.value), className: "rounded-[8px] px-2.5 py-1.5 text-xs outline-none w-36", style: {
        background: "rgba(26,23,20,.05)",
        border: "1px solid #E5E0DA",
        color: "#1A1714"
      }, onFocus: (e) => {
        e.currentTarget.style.border = "1px solid #E2001A";
        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(226,0,26,.1)";
      }, onBlur: (e) => {
        e.currentTarget.style.border = "1px solid #E5E0DA";
        e.currentTarget.style.boxShadow = "none";
      } }) })
    ] }, a.id)) }),
    result.any && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[12px] p-4 space-y-2", style: {
      background: "#FEF2F2",
      border: "1px solid rgba(226,0,26,.2)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-2xl font-bold text-center", style: {
        color: "#E2001A"
      }, children: [
        "Économie estimée : entre ",
        fmt(result.min),
        " € et ",
        fmt(result.max),
        " € / an"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-center leading-relaxed", style: {
        color: "#9A3412"
      }, children: "Estimation indicative basée sur les moyennes constatées par la CAPEB et les montants que vous avez saisis. Hors conditions particulières. Pour un chiffre exact, contactez la CAPEB." })
    ] })
  ] });
}
function AdminPanel({
  onClose
}) {
  const [avantages, setAvantages] = reactExports.useState(() => loadAvantages());
  const [editing, setEditing] = reactExports.useState(null);
  const [isNew, setIsNew] = reactExports.useState(false);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const refresh = () => setAvantages(loadAvantages());
  const handleToggle = (a) => {
    updateAvantage(a.id, {
      actif: !a.actif
    });
    notifyUpdate();
    refresh();
    toast.success(a.actif ? "Avantage désactivé" : "Avantage activé");
  };
  const handleDelete = (id) => {
    removeAvantage(id);
    notifyUpdate();
    refresh();
    setConfirmDelete(null);
    toast.success("Avantage supprimé");
  };
  const handleSave = (data) => {
    if (isNew) {
      addAvantage(data);
      toast.success("Avantage ajouté");
    } else if (editing) {
      updateAvantage(editing.id, data);
      toast.success("Avantage mis à jour");
    }
    notifyUpdate();
    refresh();
    setEditing(null);
    setIsNew(false);
  };
  if (editing !== null || isNew) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormulaireAvantage, { avantage: isNew ? null : editing, onSave: handleSave, onClose: () => {
      setEditing(null);
      setIsNew(false);
    } }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center pt-8 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl rounded-[16px] shadow-2xl", style: {
    background: "#FAF8F5"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b", style: {
      borderColor: "#E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", style: {
        color: "#1A1714"
      }, children: "Gérer les avantages" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsNew(true), className: "flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-semibold text-white", style: {
          background: "#E2001A"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Ajouter"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 hover:bg-black/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 text-[#8B847D]" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 rounded-[10px] p-3 text-xs", style: {
      background: "#FEF3C7",
      border: "1px solid #F59E0B",
      color: "#92400E"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠ Données d'exemple" }),
      " — Les avantages affichés sont des exemples indicatifs. La CAPEB Adour-Pyrénées doit les remplacer par ses offres partenaires réelles."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-2 max-h-[60vh] overflow-y-auto", children: [
      avantages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-center py-8", style: {
        color: "#8B847D"
      }, children: 'Aucun avantage. Cliquez sur "Ajouter" pour commencer.' }),
      avantages.map((a) => {
        const {
          icon: CatIcon,
          color
        } = getCatMeta(a.categorie);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-[12px] px-4 py-3", style: {
          background: a.actif ? "white" : "rgba(26,23,20,.04)",
          border: "1px solid #E5E0DA",
          opacity: a.actif ? 1 : 0.6
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CatIcon, { className: "h-4 w-4 shrink-0", style: {
            color
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", style: {
              color: "#1A1714"
            }, children: a.titre }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", style: {
              color: "#8B847D"
            }, children: [
              a.categorie,
              a.economie_min_pct !== null ? ` · −${a.economie_min_pct}% à −${a.economie_max_pct}%` : "",
              " · ",
              a.actif ? "Actif" : "Inactif"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleToggle(a), className: "rounded-lg p-1.5 hover:bg-black/6 transition-colors", title: a.actif ? "Désactiver" : "Activer", children: a.actif ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { className: "h-5 w-5", style: {
              color: "#10B981"
            } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { className: "h-5 w-5", style: {
              color: "#8B847D"
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setEditing(a);
              setIsNew(false);
            }, className: "rounded-lg p-1.5 hover:bg-black/6 transition-colors", title: "Modifier", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4", style: {
              color: "#4A453F"
            } }) }),
            confirmDelete === a.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(a.id), className: "rounded-lg px-2 py-1 text-xs font-semibold text-white", style: {
                background: "#E2001A"
              }, children: "Supprimer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmDelete(null), className: "rounded-lg px-2 py-1 text-xs", style: {
                color: "#8B847D"
              }, children: "Annuler" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmDelete(a.id), className: "rounded-lg p-1.5 hover:bg-black/6 transition-colors", title: "Supprimer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4", style: {
              color: "#8B847D"
            } }) })
          ] })
        ] }, a.id);
      })
    ] })
  ] }) });
}
const TYPE_ACTION_LABELS = {
  lien_externe: "Lien externe (URL) — « Découvrir l'offre »",
  demande_rappel: "Demande de rappel (email pré-rempli) — « Être rappelé »",
  code_promo: "Code promo à afficher — « Obtenir mon code »"
};
const ACTION_VALEUR_LABELS = {
  lien_externe: "URL du lien",
  demande_rappel: "(email généré automatiquement, laisser vide)",
  code_promo: "Code promo"
};
function FormulaireAvantage({
  avantage,
  onSave,
  onClose
}) {
  const isEdit = avantage !== null;
  const [titre, setTitre] = reactExports.useState(avantage?.titre ?? "");
  const [categorie, setCategorie] = reactExports.useState(avantage?.categorie ?? "");
  const [description, setDescription] = reactExports.useState(avantage?.description ?? "");
  const [minPct, setMinPct] = reactExports.useState(avantage?.economie_min_pct?.toString() ?? "");
  const [maxPct, setMaxPct] = reactExports.useState(avantage?.economie_max_pct?.toString() ?? "");
  const [typeAction, setTypeAction] = reactExports.useState(avantage?.type_action ?? "lien_externe");
  const [actionValeur, setActionValeur] = reactExports.useState(avantage?.action_valeur ?? "");
  const [partenaireNom, setPartenaireNom] = reactExports.useState(avantage?.partenaire_nom ?? "");
  const [conditions, setConditions] = reactExports.useState(avantage?.conditions ?? "");
  const [dateMaj, setDateMaj] = reactExports.useState(avantage?.date_maj ?? (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [actif, setActif] = reactExports.useState(avantage?.actif ?? true);
  const submit = (e) => {
    e.preventDefault();
    if (!titre.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!categorie.trim()) {
      toast.error("La catégorie est requise");
      return;
    }
    onSave({
      titre: titre.trim(),
      categorie: categorie.trim(),
      description: description.trim(),
      economie_min_pct: minPct !== "" ? Number(minPct) : null,
      economie_max_pct: maxPct !== "" ? Number(maxPct) : null,
      type_action: typeAction,
      action_valeur: actionValeur.trim(),
      partenaire_nom: partenaireNom.trim() || null,
      conditions: conditions.trim(),
      date_maj: dateMaj,
      actif
    });
  };
  const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none";
  const inputSt = {
    background: "white",
    border: "1px solid #E5E0DA",
    color: "#1A1714"
  };
  const onF = (e) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onB = (e) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-[16px] shadow-2xl overflow-y-auto", style: {
    background: "#FAF8F5",
    maxHeight: "90vh"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b", style: {
      borderColor: "#E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", style: {
        color: "#1A1714"
      }, children: isEdit ? "Modifier l'avantage" : "Nouvel avantage" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 hover:bg-black/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 text-[#8B847D]" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Titre *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: titre, onChange: (e) => setTitre(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "Ex : Centrale d'achat BTP CAPEB Avantages" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Catégorie *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", list: "cats", value: categorie, onChange: (e) => setCategorie(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "Ex : Fournitures" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "cats", children: CATEGORIES_LIST.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c }, c)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 2, className: `${inputCls} resize-none`, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "Description courte, concrète, sans jargon" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#4A453F"
          }, children: "Économie min (%) — optionnel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, max: 100, step: 1, value: minPct, onChange: (e) => setMinPct(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "ex : 10" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#4A453F"
          }, children: "Économie max (%) — optionnel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, max: 100, step: 1, value: maxPct, onChange: (e) => setMaxPct(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "ex : 30" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Type d'action *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: typeAction, onChange: (e) => setTypeAction(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, children: Object.entries(TYPE_ACTION_LABELS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
      ] }),
      (typeAction === "lien_externe" || typeAction === "code_promo") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: ACTION_VALEUR_LABELS[typeAction] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: actionValeur, onChange: (e) => setActionValeur(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: typeAction === "lien_externe" ? "https://..." : "CODE2025" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Nom du partenaire (optionnel)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: partenaireNom, onChange: (e) => setPartenaireNom(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "Ex : CAPEB Avantages" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
          color: "#4A453F"
        }, children: "Conditions / limites" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: conditions, onChange: (e) => setConditions(e.target.value), rows: 2, className: `${inputCls} resize-none`, style: inputSt, onFocus: onF, onBlur: onB, placeholder: "Réservé aux adhérents, conditions d'activation, etc." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#4A453F"
          }, children: "Date de mise à jour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: dateMaj, onChange: (e) => setDateMaj(e.target.value), className: inputCls, style: inputSt, onFocus: onF, onBlur: onB })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium mb-1", style: {
            color: "#4A453F"
          }, children: "Statut" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActif(!actif), className: "flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium text-left", style: {
            background: actif ? "rgba(16,185,129,.1)" : "rgba(26,23,20,.05)",
            color: actif ? "#059669" : "#8B847D",
            border: `1px solid ${actif ? "rgba(16,185,129,.3)" : "#E5E0DA"}`
          }, children: [
            actif ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { className: "h-5 w-5" }),
            actif ? "Actif" : "Inactif"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 rounded-[10px] py-2.5 text-sm font-medium", style: {
          background: "rgba(26,23,20,.08)",
          color: "#4A453F"
        }, children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white", style: {
          background: "#E2001A"
        }, children: isEdit ? "Enregistrer" : "Ajouter" })
      ] })
    ] })
  ] });
}
export {
  AvantagesPage as component
};
