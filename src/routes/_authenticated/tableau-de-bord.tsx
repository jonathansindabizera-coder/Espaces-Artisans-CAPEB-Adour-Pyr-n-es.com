import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle, Calendar, ChevronRight, Users, FileSignature,
  GraduationCap, Gift, Info, CheckCircle, Clock, Mail, Phone, HeartHandshake,
} from "lucide-react";
import {
  loadChantiers, loadClients, loadEmployesRH, loadAffectations, loadAbsences,
  loadRessources, loadAffectationsRessources, loadAvantages, loadProfilEntreprise,
  DATA_EVENT,
  type Chantier, type Client, type EmployeRH, type Affectation, type Absence,
  type Ressource, type AffectationRessource,
} from "@/lib/local-data";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({ meta: [{ title: "Tableau de bord – CAPEB" }] }),
  component: TableauDeBordPage,
});

// ── Types internes ────────────────────────────────────────────────────────────

type Alerte = {
  id: string;
  niveau: "urgent" | "attention" | "info";
  label: string;
  detail?: string;
  lien: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function isAbsentOn(salarieId: string, dateStr: string, absences: Absence[]): boolean {
  return absences.some(
    (a) => a.salarie_id === salarieId && a.date_debut <= dateStr && a.date_fin >= dateStr
  );
}

function pluriel(n: number, mot: string, motPluriel?: string) {
  return n > 1 ? (motPluriel ?? mot + "s") : mot;
}

// ── Chargés de développement CAPEB par secteur ──────────────────────────────────

const CHARGES_DEV: {
  secteur: string;
  nom: string;
  email: string;
  telephone?: string;
}[] = [
  { secteur: "Lescar", nom: "Guillaume PIGUÉ", email: "guillaume.pigue@capeb-adour-pyrenees.fr" },
  { secteur: "Anglet", nom: "Serge CAZEAUX", email: "serge.cazeaux@capeb-adour-pyrenees.fr" },
  { secteur: "Tarbes", nom: "Frédéric LAPLACE", email: "frederic.laplace@capeb-adour-pyrenees.fr", telephone: "07 77 33 41 88" },
];

// ── Composants enfants ────────────────────────────────────────────────────────

function KpiCard({
  label, value, color, icon, lien,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  lien: string;
}) {
  return (
    <Link
      to={lien}
      style={{
        display: "block", background: "white", borderRadius: 12,
        padding: "12px 14px", border: "1.5px solid #E5E0DA", textDecoration: "none",
      }}
    >
      <span style={{ color, display: "block", marginBottom: 6 }}>{icon}</span>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#8B847D", marginTop: 5, lineHeight: 1.35 }}>{label}</div>
    </Link>
  );
}

function ResumCard({
  icon, title, lien, lignes, vide,
}: {
  icon: React.ReactNode;
  title: string;
  lien: string;
  lignes: string[];
  vide: boolean;
}) {
  return (
    <Link
      to={lien}
      style={{
        display: "flex", flexDirection: "column", background: "white",
        borderRadius: 12, padding: "14px 16px", border: "1.5px solid #E5E0DA",
        textDecoration: "none", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#E2001A" }}>{icon}</span>
          <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#1A1714" }}>
            {title}
          </span>
        </div>
        <ChevronRight size={14} style={{ color: "#C5BDB5", flexShrink: 0 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {lignes.map((l, i) => (
          <span key={i} style={{ fontSize: 12, color: vide ? "#C5BDB5" : "#4A453F" }}>
            {l}
          </span>
        ))}
      </div>
    </Link>
  );
}

function ContactDevCard({
  secteur, nom, email, telephone,
}: {
  secteur: string;
  nom: string;
  email: string;
  telephone?: string;
}) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", background: "white",
        borderRadius: 14, padding: "14px 16px", border: "1.5px solid #E5E0DA",
        gap: 10,
      }}
    >
      <div>
        <div
          className="font-display"
          style={{
            fontSize: 15, fontWeight: 700, color: "#1A1714",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}
        >
          {secteur}
        </div>
        <div style={{ fontSize: 13, color: "#4A453F", marginTop: 2 }}>{nom}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <a
          href={`mailto:${email}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px 12px", borderRadius: 10, background: "#E2001A", color: "white",
            fontSize: 12, fontWeight: 700, textDecoration: "none",
          }}
        >
          <Mail size={14} /> Envoyer un email
        </a>
        {telephone && (
          <a
            href={`tel:${telephone.replace(/\s+/g, "")}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 12px", borderRadius: 10, background: "white", color: "#4A453F",
              fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1.5px solid #E5E0DA",
            }}
          >
            <Phone size={14} /> Appeler
          </a>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

function TableauDeBordPage() {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employes, setEmployes] = useState<EmployeRH[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [affRessources, setAffRessources] = useState<AffectationRessource[]>([]);
  const [avantages, setAvantages] = useState<ReturnType<typeof loadAvantages>>([]);
  const [nomEntreprise, setNomEntreprise] = useState("");

  const reload = useCallback(() => {
    setChantiers(loadChantiers());
    setClients(loadClients());
    setEmployes(loadEmployesRH().filter((e) => e.actif));
    setAffectations(loadAffectations());
    setAbsences(loadAbsences());
    setRessources(loadRessources());
    setAffRessources(loadAffectationsRessources());
    setAvantages(loadAvantages());
    const profil = loadProfilEntreprise();
    setNomEntreprise(profil.nom || "");
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);

  // ── Calculs de base ──
  const today = new Date();
  const todayStr = fmtDate(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }, (_, i) => fmtDate(addDays(weekStart, i)));

  const affAujourdHui = affectations.filter((a) => a.date === todayStr);
  const affsWeek = affectations.filter((a) => weekDays.includes(a.date));

  // ── KPIs ──
  const nbEnCours = chantiers.filter((c) => c.statut === "travaux_en_cours").length;
  const nbPvSigner = chantiers.filter((c) => c.statut === "pv_a_signer").length;
  const nbDevisAttente = chantiers.filter((c) => c.statut === "devis_envoye").length;
  const empActifs = employes.length;
  const tauxOcc =
    empActifs > 0
      ? Math.round((new Set(affsWeek.map((a) => a.salarie_id)).size / empActifs) * 100)
      : 0;
  const tauxColor = tauxOcc >= 70 ? "#43A047" : tauxOcc >= 40 ? "#FB8C00" : "#8B847D";

  // ── Alertes ──
  const alertes: Alerte[] = [];

  // PV à signer
  const pvList = chantiers.filter((c) => c.statut === "pv_a_signer");
  if (pvList.length > 0) {
    alertes.push({
      id: "pv-signer",
      niveau: "urgent",
      label: `${pvList.length} ${pluriel(pvList.length, "PV")} en attente de signature`,
      detail: pvList
        .map((c) => clients.find((cl) => cl.id === c.client_id)?.nom ?? "—")
        .join(", "),
      lien: "/pv",
    });
  }

  // Devis en attente
  const devList = chantiers.filter((c) => c.statut === "devis_envoye");
  if (devList.length > 0) {
    alertes.push({
      id: "devis-attente",
      niveau: "attention",
      label: `${devList.length} ${pluriel(devList.length, "devis")} en attente de réponse client`,
      detail: devList
        .map((c) => clients.find((cl) => cl.id === c.client_id)?.nom ?? "—")
        .join(", "),
      lien: "/pv",
    });
  }

  // Absent mais affecté aujourd'hui
  const conflitsAbs = affAujourdHui.filter((a) =>
    isAbsentOn(a.salarie_id, todayStr, absences)
  );
  if (conflitsAbs.length > 0) {
    const noms = [
      ...new Set(
        conflitsAbs.map((a) => {
          const e = employes.find((emp) => emp.id === a.salarie_id);
          return e ? `${e.prenom} ${e.nom}` : "—";
        })
      ),
    ];
    alertes.push({
      id: "absent-affecte",
      niveau: "urgent",
      label: `${noms.length} ${pluriel(noms.length, "salarié")} absent${noms.length > 1 ? "s" : ""} mais affecté${noms.length > 1 ? "s" : ""} aujourd'hui`,
      detail: noms.join(", "),
      lien: "/planning",
    });
  }

  // Chantier sous-staffé aujourd'hui
  const sousList = chantiers.filter(
    (c) =>
      c.statut === "travaux_en_cours" &&
      (c.nb_personnes_requises ?? 0) > 0 &&
      affAujourdHui.filter((a) => a.chantier_id === c.id).length <
        (c.nb_personnes_requises ?? 0)
  );
  if (sousList.length > 0) {
    alertes.push({
      id: "sous-staffe",
      niveau: "attention",
      label: `${sousList.length} ${pluriel(sousList.length, "chantier")} sous-staffé${sousList.length > 1 ? "s" : ""} aujourd'hui`,
      detail: sousList
        .map((c) => clients.find((cl) => cl.id === c.client_id)?.nom ?? "—")
        .join(", "),
      lien: "/planning",
    });
  }

  // Ressource double-réservée cette semaine
  const ressConflits: string[] = [];
  weekDays.forEach((d) => {
    const cnt: Record<string, number> = {};
    affRessources
      .filter((a) => a.date === d)
      .forEach((a) => {
        cnt[a.ressource_id] = (cnt[a.ressource_id] ?? 0) + 1;
      });
    Object.entries(cnt).forEach(([rid, n]) => {
      if (n > 1) {
        const r = ressources.find((res) => res.id === rid);
        if (r) ressConflits.push(r.nom);
      }
    });
  });
  const ressConflitsU = [...new Set(ressConflits)];
  if (ressConflitsU.length > 0) {
    alertes.push({
      id: "ressource-double",
      niveau: "attention",
      label: `${ressConflitsU.length} ${pluriel(ressConflitsU.length, "ressource")} double-réservée${ressConflitsU.length > 1 ? "s" : ""} cette semaine`,
      detail: ressConflitsU.join(", "),
      lien: "/planning",
    });
  }

  // Absences cette semaine
  const absSemaine = absences.filter((a) =>
    weekDays.some((d) => a.date_debut <= d && a.date_fin >= d)
  );
  if (absSemaine.length > 0) {
    const nbEmpAbs = new Set(absSemaine.map((a) => a.salarie_id)).size;
    alertes.push({
      id: "absences-semaine",
      niveau: "info",
      label: `${nbEmpAbs} ${pluriel(nbEmpAbs, "salarié")} absent${nbEmpAbs > 1 ? "s" : ""} cette semaine`,
      lien: "/planning",
    });
  }

  // ── Planning aujourd'hui ──
  const planningAujourdHui = chantiers
    .filter((c) => affAujourdHui.some((a) => a.chantier_id === c.id))
    .map((c) => {
      const client = clients.find((cl) => cl.id === c.client_id);
      const salaries = affAujourdHui
        .filter((a) => a.chantier_id === c.id)
        .map((a) => employes.find((e) => e.id === a.salarie_id))
        .filter(Boolean) as EmployeRH[];
      const res = affRessources
        .filter((a) => a.chantier_id === c.id && a.date === todayStr)
        .map((a) => ressources.find((r) => r.id === a.ressource_id))
        .filter(Boolean) as Ressource[];
      return { chantier: c, client, salaries, res };
    });

  // ── Résumés ──
  const nbChantiersActifsSemaine = new Set(affsWeek.map((a) => a.chantier_id)).size;
  const empNonAffectesAujourdHui = employes.filter(
    (e) => !affAujourdHui.some((a) => a.salarie_id === e.id)
  ).length;
  const nbPvEnCours = chantiers.filter(
    (c) => c.statut === "devis_signe" || c.statut === "travaux_en_cours"
  ).length;
  const nbAvantages = avantages.length;

  // ── Helpers visuels ──
  function alerteStyle(niveau: Alerte["niveau"]) {
    if (niveau === "urgent")
      return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" };
    if (niveau === "attention")
      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" };
    return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
  }

  const dateLabel = format(today, "EEEE d MMMM yyyy", { locale: fr });

  // ── Rendu ──
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "20px 16px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ── 1. Bandeau d'accueil ── */}
      <div>
        <h1
          className="font-display"
          style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", lineHeight: 1.2 }}
        >
          {nomEntreprise ? `Bonjour, ${nomEntreprise}` : "Bonjour"}
        </h1>
        <p style={{ fontSize: 14, color: "#8B847D", marginTop: 4, textTransform: "capitalize" }}>
          {dateLabel}
        </p>
        {!nomEntreprise && (
          <p style={{ fontSize: 12, color: "#8B847D", marginTop: 4 }}>
            Configurez le nom de votre entreprise dans{" "}
            <Link to="/rh" style={{ color: "#E2001A", fontWeight: 600, textDecoration: "none" }}>
              RH & Juridique
            </Link>
          </p>
        )}
      </div>

      {/* ── 2. Alertes ── */}
      <section>
        <div
          style={{
            fontSize: 11, fontWeight: 700, color: "#8B847D",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
          }}
        >
          À faire
        </div>

        {alertes.length === 0 ? (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 10,
              background: "#F0FDF4", border: "1px solid #BBF7D0",
            }}
          >
            <CheckCircle size={15} style={{ color: "#15803D", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#15803D" }}>
              Aucune action requise — tout est en ordre
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alertes.map((a) => {
              const s = alerteStyle(a.niveau);
              return (
                <Link
                  key={a.id}
                  to={a.lien}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 14px", borderRadius: 10,
                    background: s.bg, border: `1px solid ${s.border}`,
                    textDecoration: "none", minHeight: 48,
                  }}
                >
                  <span style={{ color: s.color, flexShrink: 0 }}>
                    {a.niveau === "info"
                      ? <Info size={15} />
                      : <AlertTriangle size={15} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>
                      {a.label}
                    </div>
                    {a.detail && (
                      <div
                        style={{
                          fontSize: 11, color: s.color, opacity: 0.7, marginTop: 1,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {a.detail}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} style={{ color: s.color, opacity: 0.5, flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 3. KPIs ── */}
      <section>
        <div
          style={{
            fontSize: 11, fontWeight: 700, color: "#8B847D",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
          }}
        >
          Indicateurs
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))",
            gap: 8,
          }}
        >
          <KpiCard
            label="Chantiers en cours"
            value={nbEnCours}
            color="#D98A00"
            icon={<Calendar size={16} />}
            lien="/planning"
          />
          <KpiCard
            label="PV à signer"
            value={nbPvSigner}
            color={nbPvSigner > 0 ? "#E2001A" : "#43A047"}
            icon={<FileSignature size={16} />}
            lien="/pv"
          />
          <KpiCard
            label="Devis en attente"
            value={nbDevisAttente}
            color={nbDevisAttente > 0 ? "#2563C9" : "#8B847D"}
            icon={<Clock size={16} />}
            lien="/pv"
          />
          <KpiCard
            label="Occupation équipe"
            value={`${tauxOcc}%`}
            color={tauxColor}
            icon={<Users size={16} />}
            lien="/planning"
          />
          <KpiCard
            label="Salariés actifs"
            value={empActifs}
            color="#1E88E5"
            icon={<Users size={16} />}
            lien="/rh"
          />
        </div>
      </section>

      {/* ── 4. Planning aujourd'hui ── */}
      <section>
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 11, fontWeight: 700, color: "#8B847D",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}
          >
            Mon planning aujourd'hui
          </div>
          <Link
            to="/planning"
            style={{
              fontSize: 12, color: "#E2001A", fontWeight: 600,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
            }}
          >
            Voir le planning <ChevronRight size={12} />
          </Link>
        </div>

        {planningAujourdHui.length === 0 ? (
          <div
            style={{
              padding: "24px 16px", textAlign: "center", background: "white",
              borderRadius: 12, border: "1.5px solid #E5E0DA",
            }}
          >
            <p style={{ fontSize: 13, color: "#8B847D", marginBottom: 8 }}>
              Aucun chantier planifié aujourd'hui
            </p>
            <Link
              to="/planning"
              style={{ fontSize: 12, color: "#E2001A", fontWeight: 600, textDecoration: "none" }}
            >
              → Ouvrir le planning
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {planningAujourdHui.map(({ chantier, client, salaries, res }) => (
              <Link
                key={chantier.id}
                to="/planning"
                style={{
                  display: "block", padding: "12px 14px", background: "white",
                  borderRadius: 12, border: "1.5px solid #E5E0DA", textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1714" }}>
                      {client?.nom ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#8B847D", marginTop: 1 }}>
                      {chantier.nature_travaux}
                    </div>
                    {(salaries.length > 0 || res.length > 0) && (
                      <div
                        style={{
                          display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7,
                        }}
                      >
                        {salaries.map((emp) => (
                          <span
                            key={emp.id}
                            style={{
                              fontSize: 10, fontWeight: 600,
                              padding: "2px 7px", borderRadius: 20,
                              background: "#F1EFED", color: "#4A453F",
                            }}
                          >
                            {emp.prenom} {emp.nom}
                          </span>
                        ))}
                        {res.map((r) => (
                          <span
                            key={r.id}
                            style={{
                              fontSize: 10, fontWeight: 600,
                              padding: "2px 7px", borderRadius: 20,
                              background: "#E8F4FD", color: "#1565C0",
                            }}
                          >
                            {r.nom}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    size={14}
                    style={{ color: "#C5BDB5", flexShrink: 0, marginTop: 2 }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Résumés par module ── */}
      <section>
        <div
          style={{
            fontSize: 11, fontWeight: 700, color: "#8B847D",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
          }}
        >
          Résumés
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          <ResumCard
            icon={<FileSignature size={18} />}
            title="PV & Devis"
            lien="/pv"
            lignes={
              chantiers.length === 0
                ? ["Aucun dossier — créez le premier"]
                : [
                    `${nbPvEnCours} dossier${nbPvEnCours > 1 ? "s" : ""} en cours`,
                    nbPvSigner > 0
                      ? `${nbPvSigner} PV ${nbPvSigner > 1 ? "prêts" : "prêt"} à signer`
                      : "Aucun PV en attente",
                  ]
            }
            vide={chantiers.length === 0}
          />
          <ResumCard
            icon={<Calendar size={18} />}
            title="Planning"
            lien="/planning"
            lignes={
              employes.length === 0
                ? ["Aucun salarié — ajoutez-en dans RH"]
                : [
                    `${nbChantiersActifsSemaine} chantier${nbChantiersActifsSemaine > 1 ? "s" : ""} planifié${nbChantiersActifsSemaine > 1 ? "s" : ""} cette semaine`,
                    empNonAffectesAujourdHui > 0
                      ? `${empNonAffectesAujourdHui} salarié${empNonAffectesAujourdHui > 1 ? "s" : ""} sans affectation aujourd'hui`
                      : "Tous les salariés sont affectés",
                  ]
            }
            vide={employes.length === 0}
          />
          <ResumCard
            icon={<GraduationCap size={18} />}
            title="Formations"
            lien="/formations"
            lignes={["Consultez le catalogue des formations CAPEB disponibles"]}
            vide={false}
          />
          <ResumCard
            icon={<Gift size={18} />}
            title="Avantages CAPEB"
            lien="/avantages"
            lignes={
              nbAvantages > 0
                ? [`${nbAvantages} avantage${nbAvantages > 1 ? "s" : ""} disponible${nbAvantages > 1 ? "s" : ""}`]
                : ["Découvrez les avantages réservés aux artisans CAPEB"]
            }
            vide={false}
          />
          <ResumCard
            icon={<HeartHandshake size={18} />}
            title="Nos services CAPEB"
            lien="/services"
            lignes={["Découvrez les 7 pôles d'accompagnement CAPEB"]}
            vide={false}
          />
        </div>
      </section>

      {/* ── 6. Chargés de développement ── */}
      <section>
        <div
          className="font-display"
          style={{ fontSize: 18, fontWeight: 700, color: "#1A1714", textTransform: "uppercase" }}
        >
          Contactez votre chargé de développement
        </div>
        <p style={{ fontSize: 12, color: "#8B847D", marginTop: 2, marginBottom: 10 }}>
          Pour vous accompagner sur toutes vos questions, selon votre secteur
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 8,
          }}
        >
          {CHARGES_DEV.map((c) => (
            <ContactDevCard key={c.secteur} {...c} />
          ))}
        </div>
      </section>
    </div>
  );
}
