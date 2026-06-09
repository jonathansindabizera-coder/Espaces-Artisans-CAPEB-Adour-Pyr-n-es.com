import { useState, useEffect, useCallback } from "react";
import { addDays, format, parseISO, startOfWeek, subWeeks, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  type Pointage, type Affectation, type EmployeRH, type Chantier, type Client,
  loadPointages, addPointage, updatePointage,
  loadAffectations, loadEmployesRH, loadChantiers, loadClients, DATA_EVENT,
} from "@/lib/local-data";

function semaineDays(weekStart: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
}
function fmtDate(d: Date) { return format(d, "yyyy-MM-dd"); }

export function PlanningPointage({
  weekStart,
  onWeekChange,
}: {
  weekStart: Date;
  onWeekChange: (d: Date) => void;
}) {
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [employes, setEmployes] = useState<EmployeRH[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const reload = useCallback(() => {
    setPointages(loadPointages());
    setAffectations(loadAffectations());
    setEmployes(loadEmployesRH().filter(e => e.actif));
    setChantiers(loadChantiers());
    setClients(loadClients());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);

  const days = semaineDays(weekStart);
  const weekDates = days.map(fmtDate);
  const today = fmtDate(new Date());

  const affsWeek = affectations.filter(a => weekDates.includes(a.date));

  // Chercher le pointage existant (ou null)
  function getPointage(aff: Affectation): Pointage | undefined {
    return pointages.find(p =>
      p.chantier_id === aff.chantier_id && p.salarie_id === aff.salarie_id && p.date === aff.date
    );
  }

  function saveHeures(aff: Affectation, heures: number) {
    const ex = getPointage(aff);
    if (ex) {
      updatePointage(ex.id, { heures_reelles: heures });
    } else {
      addPointage({ chantier_id: aff.chantier_id, salarie_id: aff.salarie_id, date: aff.date, heures_prevues: 8, heures_reelles: heures, valide: false });
    }
    reload();
  }

  function toggleValide(aff: Affectation) {
    const ex = getPointage(aff);
    if (ex) {
      updatePointage(ex.id, { valide: !ex.valide });
    } else {
      addPointage({ chantier_id: aff.chantier_id, salarie_id: aff.salarie_id, date: aff.date, heures_prevues: 8, heures_reelles: 8, valide: true });
    }
    reload();
  }

  // Récap par salarié
  const recapEmp = employes
    .map(emp => {
      const affsEmp = affsWeek.filter(a => a.salarie_id === emp.id);
      if (affsEmp.length === 0) return null;
      const heuresR = affsEmp.reduce((s, a) => s + (getPointage(a)?.heures_reelles ?? 0), 0);
      const heuresP = affsEmp.length * 8;
      return { emp, heuresR, heuresP };
    })
    .filter(Boolean) as { emp: EmployeRH; heuresR: number; heuresP: number }[];

  // Récap par chantier
  const recapCh = chantiers
    .filter(ch => affsWeek.some(a => a.chantier_id === ch.id))
    .map(ch => {
      const affs = affsWeek.filter(a => a.chantier_id === ch.id);
      const heuresR = affs.reduce((s, a) => s + (getPointage(a)?.heures_reelles ?? 0), 0);
      const client = clients.find(c => c.id === ch.client_id);
      return { ch, client, heuresR };
    });

  const labelSem = `${format(days[0], "dd MMM", { locale: fr })} – ${format(days[5], "dd MMM yyyy", { locale: fr })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#1A1714" }}>Pointage des heures</h2>
          <p style={{ fontSize: 13, color: "#8B847D", marginTop: 2 }}>Semaine du {labelSem}</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => onWeekChange(subWeeks(weekStart, 1))} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E0DA", cursor: "pointer", color: "#4A453F" }}><ChevronLeft size={16} /></button>
        <button onClick={() => onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#E2001A", color: "white", border: "none", cursor: "pointer" }}>
          Semaine actuelle
        </button>
        <button onClick={() => onWeekChange(addWeeks(weekStart, 1))} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E0DA", cursor: "pointer", color: "#4A453F" }}><ChevronRight size={16} /></button>
      </div>

      {affsWeek.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA" }}>
          Aucune affectation cette semaine — placez des salariés dans la grille pour pointer leurs heures
        </div>
      ) : (
        <>
          {/* Tableau */}
          <div style={{ background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                <thead>
                  <tr style={{ background: "#FAF8F5" }}>
                    {["Salarié", "Chantier", "Date", "Prévues", "Réelles", "Validé"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: h === "Prévues" || h === "Réelles" || h === "Validé" ? "center" : "left", fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {affsWeek.map((aff, idx) => {
                    const emp = employes.find(e => e.id === aff.salarie_id);
                    const ch = chantiers.find(c => c.id === aff.chantier_id);
                    const client = ch ? clients.find(c => c.id === ch.client_id) : null;
                    const p = getPointage(aff);
                    const editable = aff.date <= today;
                    return (
                      <tr key={aff.id} style={{ borderTop: "1px solid #F0EBE5", background: idx % 2 === 0 ? "white" : "#FAF8F5" }}>
                        <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#1A1714", whiteSpace: "nowrap" }}>
                          {emp ? `${emp.prenom} ${emp.nom}` : "—"}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#4A453F" }}>{client?.nom ?? "—"}</div>
                          <div style={{ fontSize: 11, color: "#8B847D" }}>{ch?.nature_travaux}</div>
                        </td>
                        <td style={{ padding: "8px 12px", fontSize: 12, color: "#4A453F", whiteSpace: "nowrap" }}>
                          {format(parseISO(aff.date), "EEE dd/MM", { locale: fr })}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 13, color: "#8B847D" }}>
                          {p?.heures_prevues ?? 8}h
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "center" }}>
                          {editable ? (
                            <input
                              type="number"
                              min={0} max={24} step={0.5}
                              defaultValue={p?.heures_reelles ?? ""}
                              placeholder="—"
                              onBlur={e => {
                                const v = parseFloat(e.target.value);
                                if (!isNaN(v)) saveHeures(aff, v);
                              }}
                              style={{ width: 58, padding: "4px 6px", textAlign: "center", borderRadius: 6, border: "1.5px solid #E5E0DA", fontSize: 13 }}
                            />
                          ) : (
                            <span style={{ fontSize: 12, color: "#C5BDB5" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          {editable ? (
                            <button
                              onClick={() => toggleValide(aff)}
                              style={{ width: 26, height: 26, borderRadius: 6, background: p?.valide ? "#43A047" : "transparent", border: `2px solid ${p?.valide ? "#43A047" : "#C5BDB5"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto" }}
                            >
                              {p?.valide && <Check size={13} style={{ color: "white" }} />}
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#C5BDB5" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Récaps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid #E5E0DA" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Par salarié</div>
              {recapEmp.map(({ emp, heuresR, heuresP }) => (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #F0EBE5" }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1A1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.prenom} {emp.nom}</span>
                  <span style={{ fontSize: 12, color: "#8B847D", flexShrink: 0 }}>{heuresR}h / {heuresP}h prév.</span>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid #E5E0DA" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Par chantier</div>
              {recapCh.map(({ ch, client, heuresR }) => (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #F0EBE5" }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1A1714", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client?.nom ?? "—"}</span>
                  <span style={{ fontSize: 12, color: "#8B847D", flexShrink: 0 }}>{heuresR}h pointées</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avertissement légal */}
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(226,0,26,.04)", border: "1px solid rgba(226,0,26,.15)", fontSize: 12, color: "#4A453F", lineHeight: 1.5 }}>
            Ces heures sont indicatives. Elles ne constituent pas un bulletin de paie ni un document contractuel.
            Question sur les heures, la convention collective ou les absences ?{" "}
            <a href="mailto:nicolas.souard@capeb-adour-pyrenees.fr?subject=Question convention collective / heures" style={{ color: "#E2001A", fontWeight: 700, textDecoration: "none" }}>
              → Contacter le service social CAPEB
            </a>
          </div>
        </>
      )}
    </div>
  );
}
