import { useState, useEffect, useCallback } from "react";
import { addDays, format, isBefore, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Users, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import {
  type Chantier, type Client, type EmployeRH, type Affectation,
  loadChantiers, loadClients, loadEmployesRH, loadAffectations, DATA_EVENT,
} from "@/lib/local-data";

function semaineDays(weekStart: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
}
function fmtDate(d: Date) { return format(d, "yyyy-MM-dd"); }

type ChanStatut = "planifie" | "en_cours" | "en_retard" | "termine";

function getChanStatut(ch: Chantier): ChanStatut {
  if (ch.statut === "termine" || ch.statut === "pv_a_signer") return "termine";
  const today = new Date();
  const fin = ch.date_fin_prevue ? parseISO(ch.date_fin_prevue) : null;
  const debut = ch.date_debut_prevue ? parseISO(ch.date_debut_prevue) : null;
  if (fin && isBefore(fin, today)) return "en_retard";
  if (debut && isAfter(debut, today)) return "planifie";
  return "en_cours";
}

const STATUT_LABEL: Record<ChanStatut, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  en_retard: "En retard",
  termine: "Terminé",
};
const STATUT_COLOR: Record<ChanStatut, string> = {
  planifie: "#1E88E5",
  en_cours: "#43A047",
  en_retard: "#E2001A",
  termine: "#8B847D",
};

function KpiCard({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub?: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: "1.5px solid #E5E0DA" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#8B847D", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function PlanningTableauBord({ weekStart }: { weekStart: Date }) {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employes, setEmployes] = useState<EmployeRH[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);

  const reload = useCallback(() => {
    setChantiers(loadChantiers());
    setClients(loadClients());
    setEmployes(loadEmployesRH().filter(e => e.actif));
    setAffectations(loadAffectations());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);

  const days = semaineDays(weekStart);
  const weekDates = days.map(fmtDate);
  const affsWeek = affectations.filter(a => weekDates.includes(a.date));

  const chantiersActifs = chantiers.filter(c =>
    c.statut !== "devis_a_faire" && c.statut !== "devis_envoye"
  );

  const enRetard = chantiersActifs.filter(c => getChanStatut(c) === "en_retard").length;
  const enCours = chantiersActifs.filter(c => getChanStatut(c) === "en_cours").length;
  const planifie = chantiersActifs.filter(c => getChanStatut(c) === "planifie").length;
  const termine = chantiersActifs.filter(c => getChanStatut(c) === "termine").length;

  const totalDispo = employes.length * 6;
  const tauxOcc = totalDispo > 0 ? Math.round((affsWeek.length / totalDispo) * 100) : 0;
  const tauxColor = tauxOcc >= 70 ? "#43A047" : tauxOcc >= 40 ? "#FB8C00" : "#8B847D";

  const labelSem = `${format(days[0], "dd MMM", { locale: fr })} – ${format(days[5], "dd MMM yyyy", { locale: fr })}`;

  // Tri : retard en premier, puis en cours, planifié, terminé
  const ordre: ChanStatut[] = ["en_retard", "en_cours", "planifie", "termine"];
  const chantiersTriees = [...chantiersActifs].sort((a, b) => ordre.indexOf(getChanStatut(a)) - ordre.indexOf(getChanStatut(b)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#1A1714" }}>Tableau de bord</h2>
        <p style={{ fontSize: 13, color: "#8B847D", marginTop: 2 }}>Semaine du {labelSem}</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        <KpiCard icon={<TrendingUp size={16} />} label="Occupation sem." value={`${tauxOcc}%`} color={tauxColor} sub={`${affsWeek.length} aff. / ${totalDispo} dispo.`} />
        <KpiCard icon={<Users size={16} />} label="En cours" value={String(enCours)} color="#43A047" sub={`${planifie} planifié${planifie > 1 ? "s" : ""}`} />
        <KpiCard icon={<AlertTriangle size={16} />} label="En retard" value={String(enRetard)} color={enRetard > 0 ? "#E2001A" : "#43A047"} sub="Fin prévue dépassée" />
        <KpiCard icon={<CheckCircle size={16} />} label="Terminés" value={String(termine)} color="#8B847D" sub="Cette période" />
        <KpiCard icon={<Clock size={16} />} label="Salariés actifs" value={String(employes.length)} color="#1E88E5" sub="Disponibles cette semaine" />
      </div>

      {/* Suivi chantiers */}
      <div style={{ background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0EBE5", fontSize: 12, fontWeight: 700, color: "#4A453F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Suivi des chantiers
        </div>
        {chantiersActifs.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#8B847D", fontSize: 13 }}>Aucun chantier actif</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ background: "#FAF8F5" }}>
                  {["Chantier", "Statut", "Fin prévue", "Affectés sem."].map(h => (
                    <th key={h} style={{ padding: "8px 14px", textAlign: h === "Affectés sem." ? "center" : "left", fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chantiersTriees.map((ch, idx) => {
                  const client = clients.find(c => c.id === ch.client_id);
                  const aff = affsWeek.filter(a => a.chantier_id === ch.id).length;
                  const requis = ch.nb_personnes_requises ?? 0;
                  const st = getChanStatut(ch);
                  const staffOk = requis === 0 || aff >= requis;
                  return (
                    <tr key={ch.id} style={{ borderTop: "1px solid #F0EBE5", background: idx % 2 === 0 ? "white" : "#FAF8F5" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1714" }}>{client?.nom ?? "—"}</div>
                        <div style={{ fontSize: 11, color: "#8B847D" }}>{ch.nature_travaux}{ch.metier_requis ? ` · ${ch.metier_requis}` : ""}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, background: `${STATUT_COLOR[st]}14`, fontSize: 11, fontWeight: 700, color: STATUT_COLOR[st], whiteSpace: "nowrap" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUT_COLOR[st], flexShrink: 0 }} />
                          {STATUT_LABEL[st]}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#4A453F" }}>
                        {ch.date_fin_prevue ? format(parseISO(ch.date_fin_prevue), "dd/MM/yyyy") : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: staffOk ? "#43A047" : "#E2001A" }}>
                          {aff}{requis > 0 ? `/${requis}` : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Occupation salariés */}
      <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid #E5E0DA" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4A453F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Occupation des salariés cette semaine
        </div>
        {employes.length === 0 ? (
          <p style={{ fontSize: 13, color: "#8B847D" }}>Aucun salarié actif</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {employes.map(emp => {
              const n = affsWeek.filter(a => a.salarie_id === emp.id).length;
              const pct = Math.round((n / 6) * 100);
              const color = pct >= 70 ? "#43A047" : pct >= 40 ? "#FB8C00" : "#C5BDB5";
              return (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 110, fontSize: 12, fontWeight: 600, color: "#1A1714", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {emp.prenom} {emp.nom}
                  </span>
                  <div style={{ flex: 1, height: 6, background: "#F0EBE5", borderRadius: 3 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pct}%`, transition: "width .3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8B847D", width: 36, textAlign: "right", flexShrink: 0 }}>{n}/6j</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
