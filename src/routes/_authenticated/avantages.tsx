import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  Gift, ShoppingCart, Truck, Shield, Landmark, Zap, Phone,
  Package, Monitor, Users, ExternalLink, Tag, PhoneCall,
  Plus, Pencil, X, ChevronDown, ChevronUp, Copy, Check,
  ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import {
  loadAvantages, replaceAvantages, addAvantage, updateAvantage, removeAvantage,
  loadProfilEntreprise,
  notifyUpdate, DATA_EVENT,
  type AvantageCapeb,
} from "@/lib/local-data";

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/avantages")({
  ssr: false,
  component: AvantagesPage,
});

// ── Données d'exemple ─────────────────────────────────────────────────────────
// NOTE : ces données sont des EXEMPLES. La CAPEB Adour-Pyrénées doit les
// remplacer par ses offres réelles via le panneau « Gérer les avantages ».

const AVANTAGES_EXEMPLES: AvantageCapeb[] = [
  {
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
    actif: true,
  },
  {
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
    actif: true,
  },
  {
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
    actif: true,
  },
  {
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
    actif: true,
  },
  {
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
    actif: true,
  },
  {
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
    actif: true,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const EMAIL_RAPPEL = "frederic.laplace@capeb-adour-pyrenees.fr";

const CATEGORIES_LIST = [
  "Centrale d'achat", "Véhicules", "Assurance", "Banque & financement",
  "Énergie/CEE", "Téléphonie", "Fournitures", "Logiciels", "Avantages salariés/CE",
];

const CATEGORIE_META: Record<string, { icon: LucideIcon; color: string }> = {
  "Centrale d'achat":      { icon: ShoppingCart, color: "#3B82F6" },
  "Véhicules":             { icon: Truck,        color: "#F97316" },
  "Assurance":             { icon: Shield,       color: "#8B5CF6" },
  "Banque & financement":  { icon: Landmark,     color: "#10B981" },
  "Énergie/CEE":           { icon: Zap,          color: "#F59E0B" },
  "Téléphonie":            { icon: Phone,        color: "#06B6D4" },
  "Fournitures":           { icon: Package,      color: "#84CC16" },
  "Logiciels":             { icon: Monitor,      color: "#EC4899" },
  "Avantages salariés/CE": { icon: Users,        color: "#E2001A" },
};

function getCatMeta(cat: string) {
  return CATEGORIE_META[cat] ?? { icon: Gift, color: "#8B847D" };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return iso; }
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

type Profil = ReturnType<typeof loadProfilEntreprise>;

function buildMailtoRappel(profil: Profil, avantage: AvantageCapeb): string {
  return `mailto:${EMAIL_RAPPEL}?subject=${encodeURIComponent(
    "Demande de rappel - avantage CAPEB",
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nEntreprise : ${profil.nom || "—"}\nSIRET : ${profil.siret || "—"}\n\nJe souhaite être rappelé(e) concernant l'avantage adhérent "${avantage.titre}".\n\nMerci.`,
  )}`;
}

// ── Page principale ───────────────────────────────────────────────────────────

function AvantagesPage() {
  const [avantages, setAvantages] = useState<AvantageCapeb[]>([]);
  const [categorieFiltre, setCategorieFiltre] = useState("Tous");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEstimateur, setShowEstimateur] = useState(false);
  const [profil] = useState(() => loadProfilEntreprise());

  useEffect(() => {
    const stored = loadAvantages();
    if (stored.length === 0) replaceAvantages(AVANTAGES_EXEMPLES);
    setAvantages(loadAvantages());

    const refresh = () => setAvantages(loadAvantages());
    window.addEventListener(DATA_EVENT, refresh);
    return () => window.removeEventListener(DATA_EVENT, refresh);
  }, []);

  const actifs = avantages.filter((a) => a.actif);
  const categories = ["Tous", ...Array.from(new Set(actifs.map((a) => a.categorie)))];

  const filtres = categorieFiltre === "Tous"
    ? actifs
    : actifs.filter((a) => a.categorie === categorieFiltre);

  const grouped = useMemo(() => {
    const g: Record<string, AvantageCapeb[]> = {};
    for (const a of filtres) {
      (g[a.categorie] ??= []).push(a);
    }
    return g;
  }, [filtres]);

  const chiffrables = actifs.filter(
    (a) => a.economie_min_pct !== null && a.economie_max_pct !== null,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="font-display text-[26px] font-bold tracking-wide"
            style={{ color: "#1A1714" }}
          >
            Vos avantages adhérent CAPEB
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B847D" }}>
            Offres incluses ou négociées via votre cotisation — pour un chiffre exact, demandez votre comparatif gratuit.
          </p>
        </div>
        <button
          onClick={() => setShowAdmin(true)}
          className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium transition-colors"
          style={{ background: "rgba(26,23,20,.07)", color: "#8B847D", border: "1px solid #E5E0DA" }}
        >
          <Pencil className="h-3.5 w-3.5" />
          Gérer les avantages
        </button>
      </div>

      {/* ── Filtres catégories ── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategorieFiltre(cat)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
            style={{
              background: categorieFiltre === cat ? "#E2001A" : "white",
              color: categorieFiltre === cat ? "white" : "#4A453F",
              border: `1px solid ${categorieFiltre === cat ? "#E2001A" : "#E5E0DA"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Grille par catégorie ── */}
      {Object.entries(grouped).map(([cat, items]) => {
        const { icon: CatIcon, color } = getCatMeta(cat);
        return (
          <div key={cat} className="space-y-3">
            <h2
              className="font-display text-base font-semibold flex items-center gap-2"
              style={{ color: "#1A1714" }}
            >
              <CatIcon className="h-4 w-4" style={{ color }} />
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((a) => (
                <CarteAvantage key={a.id} avantage={a} profil={profil} />
              ))}
            </div>
          </div>
        );
      })}

      {filtres.length === 0 && (
        <div className="py-16 text-center text-sm" style={{ color: "#8B847D" }}>
          Aucun avantage dans cette catégorie.
        </div>
      )}

      {/* ── Estimateur ── */}
      {chiffrables.length > 0 && (
        <div
          className="rounded-[16px] overflow-hidden"
          style={{ border: "1px solid #E5E0DA" }}
        >
          <button
            onClick={() => setShowEstimateur(!showEstimateur)}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[.02]"
            style={{ background: "white" }}
          >
            <div>
              <div className="font-display text-base font-semibold" style={{ color: "#1A1714" }}>
                Estimez vos économies potentielles
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#8B847D" }}>
                Saisissez vos dépenses actuelles pour une estimation personnalisée en fourchette
              </div>
            </div>
            {showEstimateur
              ? <ChevronUp className="h-5 w-5 shrink-0" style={{ color: "#8B847D" }} />
              : <ChevronDown className="h-5 w-5 shrink-0" style={{ color: "#8B847D" }} />}
          </button>
          {showEstimateur && <EstimateurSection avantages={chiffrables} />}
        </div>
      )}

      {/* ── Admin ── */}
      {showAdmin && (
        <AdminPanel onClose={() => { setShowAdmin(false); setAvantages(loadAvantages()); }} />
      )}
    </div>
  );
}

// ── Carte avantage ────────────────────────────────────────────────────────────

function CarteAvantage({ avantage: a, profil }: { avantage: AvantageCapeb; profil: Profil }) {
  const [codeVisible, setCodeVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const { icon: CatIcon, color } = getCatMeta(a.categorie);

  const copyCode = () => {
    navigator.clipboard.writeText(a.action_valeur).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const actionBtn = () => {
    switch (a.type_action) {
      case "lien_externe":
        return (
          <a
            href={a.action_valeur}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#E2001A" }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Découvrir l'offre
          </a>
        );
      case "code_promo":
        return (
          <div>
            {!codeVisible ? (
              <button
                onClick={() => setCodeVisible(true)}
                className="flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold text-white"
                style={{ background: "#E2001A" }}
              >
                <Tag className="h-3.5 w-3.5" />
                Obtenir mon code
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <code
                  className="rounded-[7px] px-3 py-1.5 text-xs font-bold tracking-wider"
                  style={{ background: "rgba(226,0,26,.1)", color: "#E2001A" }}
                >
                  {a.action_valeur}
                </code>
                <button onClick={copyCode} className="rounded p-1.5 hover:bg-black/8">
                  {copied
                    ? <Check className="h-3.5 w-3.5 text-green-600" />
                    : <Copy className="h-3.5 w-3.5" style={{ color: "#8B847D" }} />}
                </button>
              </div>
            )}
          </div>
        );
      case "demande_rappel":
        return (
          <a
            href={buildMailtoRappel(profil, a)}
            className="flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-xs font-semibold transition-colors"
            style={{ background: "rgba(226,0,26,.08)", color: "#E2001A", border: "1px solid rgba(226,0,26,.2)" }}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Être rappelé
          </a>
        );
    }
  };

  return (
    <div
      className="flex flex-col rounded-[14px] p-4 space-y-3 h-full"
      style={{ background: "white", border: "1px solid #E5E0DA" }}
    >
      {/* Catégorie + badge économie */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: `${color}18`, color }}
        >
          <CatIcon className="h-3 w-3" />
          {a.categorie}
        </span>
        {a.economie_min_pct !== null && a.economie_max_pct !== null && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: "rgba(226,0,26,.1)", color: "#E2001A" }}
          >
            Estim. −{a.economie_min_pct} à −{a.economie_max_pct} %
          </span>
        )}
      </div>

      {/* Titre + description */}
      <div className="flex-1 space-y-1.5">
        <h3 className="font-display text-[15px] font-semibold leading-tight" style={{ color: "#1A1714" }}>
          {a.titre}
        </h3>
        {a.partenaire_nom && (
          <div className="text-xs font-medium" style={{ color: "#8B847D" }}>{a.partenaire_nom}</div>
        )}
        <p className="text-xs leading-relaxed" style={{ color: "#4A453F" }}>{a.description}</p>
      </div>

      {/* Conditions */}
      {a.conditions && (
        <p className="text-[11px] leading-relaxed" style={{ color: "#8B847D" }}>
          ⚠ {a.conditions}
        </p>
      )}

      {/* Footer : bouton + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t" style={{ borderColor: "#F0EBE4" }}>
        {actionBtn()}
        {a.date_maj && (
          <span className="text-[10px] shrink-0" style={{ color: "#B0A9A2" }}>
            Màj {fmtDate(a.date_maj)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Estimateur ────────────────────────────────────────────────────────────────

function EstimateurSection({ avantages }: { avantages: AvantageCapeb[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [budgets, setBudgets] = useState<Record<string, string>>({});

  const toggleCheck = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const setB = (id: string, v: string) =>
    setBudgets((prev) => ({ ...prev, [id]: v }));

  const result = useMemo(() => {
    let min = 0;
    let max = 0;
    for (const a of avantages) {
      if (!checked[a.id]) continue;
      const b = Number(budgets[a.id]) || 0;
      min += b * (a.economie_min_pct ?? 0) / 100;
      max += b * (a.economie_max_pct ?? 0) / 100;
    }
    return { min, max, any: Object.values(checked).some(Boolean) };
  }, [avantages, checked, budgets]);

  return (
    <div className="p-5 space-y-4" style={{ background: "#FAF8F5", borderTop: "1px solid #E5E0DA" }}>
      <p className="text-xs" style={{ color: "#4A453F" }}>
        Cochez les avantages que vous utilisez ou envisagez d'utiliser, puis indiquez votre dépense annuelle concernée.
      </p>

      <div className="space-y-2">
        {avantages.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-[10px] px-4 py-3"
            style={{
              background: checked[a.id] ? "white" : "rgba(26,23,20,.03)",
              border: `1px solid ${checked[a.id] ? "#E5E0DA" : "#F0EBE4"}`,
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleCheck(a.id)}
              className="flex-shrink-0 flex items-center justify-center rounded-[6px] transition-colors"
              style={{
                width: 20,
                height: 20,
                background: checked[a.id] ? "#E2001A" : "white",
                border: `2px solid ${checked[a.id] ? "#E2001A" : "#D0C9C2"}`,
              }}
            >
              {checked[a.id] && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>

            {/* Nom + badge */}
            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate" style={{ color: "#1A1714" }}>
                {a.titre}
              </span>
              <span className="text-xs shrink-0" style={{ color: "#8B847D" }}>
                (−{a.economie_min_pct}% à −{a.economie_max_pct}%)
              </span>
            </div>

            {/* Budget input */}
            {checked[a.id] && (
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Budget / an (€)"
                  value={budgets[a.id] ?? ""}
                  onChange={(e) => setB(a.id, e.target.value)}
                  className="rounded-[8px] px-2.5 py-1.5 text-xs outline-none w-36"
                  style={{ background: "rgba(26,23,20,.05)", border: "1px solid #E5E0DA", color: "#1A1714" }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid #E2001A";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(226,0,26,.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid #E5E0DA";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Résultat */}
      {result.any && (
        <div
          className="rounded-[12px] p-4 space-y-2"
          style={{ background: "#FEF2F2", border: "1px solid rgba(226,0,26,.2)" }}
        >
          <div className="font-display text-2xl font-bold text-center" style={{ color: "#E2001A" }}>
            Économie estimée : entre {fmt(result.min)} € et {fmt(result.max)} € / an
          </div>
          <p className="text-xs text-center leading-relaxed" style={{ color: "#9A3412" }}>
            Estimation indicative basée sur les moyennes constatées par la CAPEB et les montants que vous avez saisis.
            Hors conditions particulières. Pour un chiffre exact, contactez la CAPEB.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Panneau admin ─────────────────────────────────────────────────────────────

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [avantages, setAvantages] = useState<AvantageCapeb[]>(() => loadAvantages());
  const [editing, setEditing] = useState<AvantageCapeb | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = () => setAvantages(loadAvantages());

  const handleToggle = (a: AvantageCapeb) => {
    updateAvantage(a.id, { actif: !a.actif });
    notifyUpdate();
    refresh();
    toast.success(a.actif ? "Avantage désactivé" : "Avantage activé");
  };

  const handleDelete = (id: string) => {
    removeAvantage(id);
    notifyUpdate();
    refresh();
    setConfirmDelete(null);
    toast.success("Avantage supprimé");
  };

  const handleSave = (data: Omit<AvantageCapeb, "id">) => {
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
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <FormulaireAvantage
          avantage={isNew ? null : editing}
          onSave={handleSave}
          onClose={() => { setEditing(null); setIsNew(false); }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl rounded-[16px] shadow-2xl"
        style={{ background: "#FAF8F5" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#E5E0DA" }}
        >
          <h2 className="font-display text-xl font-bold" style={{ color: "#1A1714" }}>
            Gérer les avantages
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNew(true)}
              className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-semibold text-white"
              style={{ background: "#E2001A" }}
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/8">
              <X className="h-5 w-5 text-[#8B847D]" />
            </button>
          </div>
        </div>

        {/* Note données d'exemple */}
        <div
          className="mx-5 mt-4 rounded-[10px] p-3 text-xs"
          style={{ background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E" }}
        >
          <strong>⚠ Données d'exemple</strong> — Les avantages affichés sont des exemples indicatifs.
          La CAPEB Adour-Pyrénées doit les remplacer par ses offres partenaires réelles.
        </div>

        {/* Liste */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {avantages.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "#8B847D" }}>
              Aucun avantage. Cliquez sur "Ajouter" pour commencer.
            </p>
          )}
          {avantages.map((a) => {
            const { icon: CatIcon, color } = getCatMeta(a.categorie);
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-[12px] px-4 py-3"
                style={{
                  background: a.actif ? "white" : "rgba(26,23,20,.04)",
                  border: "1px solid #E5E0DA",
                  opacity: a.actif ? 1 : 0.6,
                }}
              >
                <CatIcon className="h-4 w-4 shrink-0" style={{ color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#1A1714" }}>
                    {a.titre}
                  </div>
                  <div className="text-xs" style={{ color: "#8B847D" }}>
                    {a.categorie}
                    {a.economie_min_pct !== null
                      ? ` · −${a.economie_min_pct}% à −${a.economie_max_pct}%`
                      : ""}
                    {" · "}
                    {a.actif ? "Actif" : "Inactif"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(a)}
                    className="rounded-lg p-1.5 hover:bg-black/6 transition-colors"
                    title={a.actif ? "Désactiver" : "Activer"}
                  >
                    {a.actif
                      ? <ToggleRight className="h-5 w-5" style={{ color: "#10B981" }} />
                      : <ToggleLeft className="h-5 w-5" style={{ color: "#8B847D" }} />}
                  </button>
                  <button
                    onClick={() => { setEditing(a); setIsNew(false); }}
                    className="rounded-lg p-1.5 hover:bg-black/6 transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" style={{ color: "#4A453F" }} />
                  </button>
                  {confirmDelete === a.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-white"
                        style={{ background: "#E2001A" }}
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg px-2 py-1 text-xs"
                        style={{ color: "#8B847D" }}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(a.id)}
                      className="rounded-lg p-1.5 hover:bg-black/6 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "#8B847D" }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Formulaire avantage (admin) ───────────────────────────────────────────────

const TYPE_ACTION_LABELS: Record<string, string> = {
  lien_externe:  "Lien externe (URL) — « Découvrir l'offre »",
  demande_rappel: "Demande de rappel (email pré-rempli) — « Être rappelé »",
  code_promo:    "Code promo à afficher — « Obtenir mon code »",
};

const ACTION_VALEUR_LABELS: Record<string, string> = {
  lien_externe:  "URL du lien",
  demande_rappel: "(email généré automatiquement, laisser vide)",
  code_promo:    "Code promo",
};

function FormulaireAvantage({
  avantage,
  onSave,
  onClose,
}: {
  avantage: AvantageCapeb | null;
  onSave: (data: Omit<AvantageCapeb, "id">) => void;
  onClose: () => void;
}) {
  const isEdit = avantage !== null;
  const [titre,          setTitre]          = useState(avantage?.titre ?? "");
  const [categorie,      setCategorie]      = useState(avantage?.categorie ?? "");
  const [description,    setDescription]    = useState(avantage?.description ?? "");
  const [minPct,         setMinPct]         = useState<string>(avantage?.economie_min_pct?.toString() ?? "");
  const [maxPct,         setMaxPct]         = useState<string>(avantage?.economie_max_pct?.toString() ?? "");
  const [typeAction,     setTypeAction]     = useState<AvantageCapeb["type_action"]>(avantage?.type_action ?? "lien_externe");
  const [actionValeur,   setActionValeur]   = useState(avantage?.action_valeur ?? "");
  const [partenaireNom,  setPartenaireNom]  = useState(avantage?.partenaire_nom ?? "");
  const [conditions,     setConditions]     = useState(avantage?.conditions ?? "");
  const [dateMaj,        setDateMaj]        = useState(avantage?.date_maj ?? new Date().toISOString().split("T")[0]);
  const [actif,          setActif]          = useState(avantage?.actif ?? true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim())     { toast.error("Le titre est requis"); return; }
    if (!categorie.trim()) { toast.error("La catégorie est requise"); return; }
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
      actif,
    });
  };

  const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-sm outline-none";
  const inputSt  = { background: "white", border: "1px solid #E5E0DA", color: "#1A1714" };
  const onF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E2001A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.1)";
  };
  const onB = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = "1px solid #E5E0DA";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="w-full max-w-lg rounded-[16px] shadow-2xl overflow-y-auto"
      style={{ background: "#FAF8F5", maxHeight: "90vh" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E5E0DA" }}>
        <h2 className="font-display text-xl font-bold" style={{ color: "#1A1714" }}>
          {isEdit ? "Modifier l'avantage" : "Nouvel avantage"}
        </h2>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/8">
          <X className="h-5 w-5 text-[#8B847D]" />
        </button>
      </div>

      <form onSubmit={submit} className="p-5 space-y-4">

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Titre *</label>
          <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)}
            className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
            placeholder="Ex : Centrale d'achat BTP CAPEB Avantages" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Catégorie *</label>
          <input type="text" list="cats" value={categorie} onChange={(e) => setCategorie(e.target.value)}
            className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
            placeholder="Ex : Fournitures" />
          <datalist id="cats">
            {CATEGORIES_LIST.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={2} className={`${inputCls} resize-none`} style={inputSt}
            onFocus={onF} onBlur={onB}
            placeholder="Description courte, concrète, sans jargon" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
              Économie min (%) — optionnel
            </label>
            <input type="number" min={0} max={100} step={1}
              value={minPct} onChange={(e) => setMinPct(e.target.value)}
              className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
              placeholder="ex : 10" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
              Économie max (%) — optionnel
            </label>
            <input type="number" min={0} max={100} step={1}
              value={maxPct} onChange={(e) => setMaxPct(e.target.value)}
              className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
              placeholder="ex : 30" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Type d'action *</label>
          <select value={typeAction} onChange={(e) => setTypeAction(e.target.value as AvantageCapeb["type_action"])}
            className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}>
            {Object.entries(TYPE_ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {(typeAction === "lien_externe" || typeAction === "code_promo") && (
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
              {ACTION_VALEUR_LABELS[typeAction]}
            </label>
            <input type="text" value={actionValeur} onChange={(e) => setActionValeur(e.target.value)}
              className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
              placeholder={typeAction === "lien_externe" ? "https://..." : "CODE2025"} />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
            Nom du partenaire (optionnel)
          </label>
          <input type="text" value={partenaireNom} onChange={(e) => setPartenaireNom(e.target.value)}
            className={inputCls} style={inputSt} onFocus={onF} onBlur={onB}
            placeholder="Ex : CAPEB Avantages" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Conditions / limites</label>
          <textarea value={conditions} onChange={(e) => setConditions(e.target.value)}
            rows={2} className={`${inputCls} resize-none`} style={inputSt}
            onFocus={onF} onBlur={onB}
            placeholder="Réservé aux adhérents, conditions d'activation, etc." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>
              Date de mise à jour
            </label>
            <input type="date" value={dateMaj} onChange={(e) => setDateMaj(e.target.value)}
              className={inputCls} style={inputSt} onFocus={onF} onBlur={onB} />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1" style={{ color: "#4A453F" }}>Statut</label>
            <button
              type="button"
              onClick={() => setActif(!actif)}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium text-left"
              style={{
                background: actif ? "rgba(16,185,129,.1)" : "rgba(26,23,20,.05)",
                color: actif ? "#059669" : "#8B847D",
                border: `1px solid ${actif ? "rgba(16,185,129,.3)" : "#E5E0DA"}`,
              }}
            >
              {actif
                ? <ToggleRight className="h-5 w-5" />
                : <ToggleLeft className="h-5 w-5" />}
              {actif ? "Actif" : "Inactif"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-[10px] py-2.5 text-sm font-medium"
            style={{ background: "rgba(26,23,20,.08)", color: "#4A453F" }}>
            Annuler
          </button>
          <button type="submit"
            className="flex-1 rounded-[10px] py-2.5 text-sm font-semibold text-white"
            style={{ background: "#E2001A" }}>
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}
