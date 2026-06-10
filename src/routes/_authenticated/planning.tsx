import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { PlanningMateriel } from "@/components/planning/PlanningMateriel";
import { PlanningTaches } from "@/components/planning/PlanningTaches";
import { PlanningPointage } from "@/components/planning/PlanningPointage";
import { PlanningTableauBord } from "@/components/planning/PlanningTableauBord";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  addDays,
  format,
  startOfWeek,
  isWithinInterval,
  parseISO,
  isSameDay,
  subWeeks,
  addWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  MapPin,
  AlertTriangle,
  UserX,
  Wrench,
  X,
  Plus,
  Check,
  Navigation,
  CalendarDays,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  type Chantier,
  type EmployeRH,
  type Client,
  type Absence,
  type Affectation,
  loadChantiers,
  loadClients,
  loadEmployesRH,
  loadAbsences,
  loadAffectations,
  addAbsence,
  removeAbsence,
  addAffectation,
  removeAffectation,
  addChantier,
  addClient,
  updateChantier,
  updateEmployeRH,
  addEmployeRH,
  notifyUpdate,
  DATA_EVENT,
} from "@/lib/local-data";
import { geocodeAdresse, haversineKm, fmtDist } from "@/lib/geo";

export const Route = createFileRoute("/_authenticated/planning")({
  ssr: false,
  component: PlanningPage,
});

// ── Constantes ────────────────────────────────────────────────────────────────

const METIERS = ["Maçonnerie", "Charpente", "Couverture", "Plomberie", "Électricité", "Menuiserie", "Carrelage", "Peinture", "Isolation", "Autre"];
const STATUTS: Record<EmployeRH["statut"], string> = {
  ouvrier: "Ouvrier",
  etam: "ETAM",
  cadre: "Cadre",
};
const MOTIFS: Record<Absence["motif"], string> = {
  conges: "Congés",
  maladie: "Maladie",
  formation: "Formation",
  autre: "Autre",
};
const PALETTE = ["#E2001A", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#00897B", "#F4511E", "#3949AB", "#6D4C41", "#00838F"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function couleurEmp(id: string, stored?: string | null): string {
  if (stored) return stored;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initiales(nom: string, prenom: string): string {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

function semaineDays(weekStart: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
}

function isAbsent(salarieId: string, date: string, absences: Absence[]): Absence | null {
  const d = parseISO(date);
  return absences.find(a =>
    a.salarie_id === salarieId &&
    isWithinInterval(d, { start: parseISO(a.date_debut), end: parseISO(a.date_fin) })
  ) ?? null;
}

function fmtDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function affsByCell(affectations: Affectation[]): Map<string, Affectation[]> {
  const map = new Map<string, Affectation[]>();
  for (const a of affectations) {
    const key = `${a.salarie_id}|${a.date}`;
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return map;
}

// ── Scoring IA ────────────────────────────────────────────────────────────────

type SuggestionItem = {
  employe: EmployeRH;
  score: number;
  raisons: string[];
  couleur: string;
};

function scorerSalaries(
  chantier: Chantier,
  date: string,
  weekDates: string[],
  employes: EmployeRH[],
  affectations: Affectation[],
  absences: Absence[],
): SuggestionItem[] {
  const results: SuggestionItem[] = [];

  for (const emp of employes) {
    if (!emp.actif) continue;
    if (isAbsent(emp.id, date, absences)) continue;
    const dejaAff = affectations.some(a => a.salarie_id === emp.id && a.date === date);
    if (dejaAff) continue;

    let score = 0;
    const raisons: string[] = [];

    // Métier (40 pts)
    if (chantier.metier_requis && emp.metier) {
      if (emp.metier === chantier.metier_requis) {
        score += 40;
        raisons.push(`${emp.metier} ✓`);
      } else {
        raisons.push(`Métier: ${emp.metier}`);
      }
    } else if (!chantier.metier_requis) {
      score += 20;
      raisons.push("Tous métiers");
    } else {
      raisons.push("Métier non renseigné");
    }

    // Proximité (30 pts)
    if (emp.latitude_domicile && emp.longitude_domicile && chantier.latitude && chantier.longitude) {
      const km = haversineKm(emp.latitude_domicile, emp.longitude_domicile, chantier.latitude, chantier.longitude);
      const pts = Math.max(0, Math.min(30, 30 - km));
      score += pts;
      raisons.push(`${fmtDist(km)} du chantier`);
    } else {
      score += 10;
    }

    // Charge semaine (30 pts)
    const charge = affectations.filter(a => a.salarie_id === emp.id && weekDates.includes(a.date)).length;
    const pts = Math.max(0, 30 - charge * 6);
    score += pts;
    const libres = weekDates.length - charge;
    raisons.push(`${libres} jour${libres > 1 ? "s" : ""} libre${libres > 1 ? "s" : ""}`);

    results.push({ employe: emp, score, raisons, couleur: couleurEmp(emp.id, emp.couleur) });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

// ── Types DnD ─────────────────────────────────────────────────────────────────

type DragData =
  | { kind: "new"; chantierId: string }
  | { kind: "move"; affectationId: string; chantierId: string }
  | { kind: "salarie"; salarieId: string };

type DropData =
  | { kind: "cell"; salarieId: string; date: string }
  | { kind: "day"; date: string };

// ── Composant principal ───────────────────────────────────────────────────────

function PlanningPage() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [tab, setTab] = useState<"grille" | "materiel" | "taches" | "pointage" | "carte" | "tableau-bord">("grille");
  const [employes, setEmployes] = useState<EmployeRH[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);

  const [absenceModal, setAbsenceModal] = useState<EmployeRH | null>(null);
  const [assignModal, setAssignModal] = useState<{ salarieId: string; date: string } | null>(null);
  const [suggestionFor, setSuggestionFor] = useState<{ chantier: Chantier; date: string } | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [activeDay, setActiveDay] = useState<string>(() => fmtDate(new Date()));
  const [editEmpId, setEditEmpId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<DragData | null>(null);
  const [addEmpModal, setAddEmpModal] = useState(false);
  const [daySelectFor, setDaySelectFor] = useState<EmployeRH | null>(null);
  const [addChantierModal, setAddChantierModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const reload = useCallback(() => {
    setEmployes(loadEmployesRH().filter(e => e.actif));
    setChantiers(loadChantiers());
    setClients(loadClients());
    setAbsences(loadAbsences());
    setAffectations(loadAffectations());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);

  // Géocodage automatique en arrière-plan
  useEffect(() => {
    const run = async () => {
      const ch = loadChantiers();
      const cl = loadClients();
      const em = loadEmployesRH();
      for (const c of ch) {
        if (c.latitude == null || c.longitude == null) {
          const client = cl.find(x => x.id === c.client_id);
          if (client?.adresse) {
            const coords = await geocodeAdresse(client.adresse);
            if (coords) updateChantier(c.id, { latitude: coords.lat, longitude: coords.lon });
          }
        }
      }
      for (const e of em) {
        if ((e.latitude_domicile == null || e.longitude_domicile == null) && e.salarie_adresse) {
          const coords = await geocodeAdresse(e.salarie_adresse);
          if (coords) updateEmployeRH(e.id, { latitude_domicile: coords.lat, longitude_domicile: coords.lon });
        }
      }
      reload();
    };
    run();
  // Une seule fois au montage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = semaineDays(weekStart);
  const weekDates = days.map(fmtDate);
  const cellMap = affsByCell(affectations);
  const chantiersActifs = chantiers.filter(c =>
    c.statut === "devis_signe" || c.statut === "travaux_en_cours"
  );

  function clientNom(id: string) {
    return clients.find(c => c.id === id)?.nom ?? "—";
  }

  // ── DnD ──────────────────────────────────────────────────────────────────────

  function handleDragStart(ev: DragStartEvent) {
    setDragActive(ev.active.data.current as DragData);
  }

  function handleDragEnd(ev: DragEndEvent) {
    setDragActive(null);
    const drop = ev.over?.data.current as DropData | undefined;
    if (!drop) return;
    const drag = ev.active.data.current as DragData;

    if (drag.kind === "salarie") {
      setAssignModal({ salarieId: drag.salarieId, date: drop.date });
      return;
    }

    if (drop.kind === "cell") {
      applyAffectation(drag, drop.salarieId, drop.date);
    }
  }

  function applyAffectation(drag: Exclude<DragData, { kind: "salarie" }>, salarieId: string, date: string) {
    if (drag.kind === "move") {
      removeAffectation(drag.affectationId);
      addAffectation({ chantier_id: drag.chantierId, salarie_id: salarieId, date });
    } else {
      const existe = affectations.some(
        a => a.salarie_id === salarieId && a.date === date && a.chantier_id === drag.chantierId
      );
      if (!existe) addAffectation({ chantier_id: drag.chantierId, salarie_id: salarieId, date });
    }
    reload();
    window.dispatchEvent(new Event(DATA_EVENT));
  }

  function supprimerAff(id: string) {
    removeAffectation(id);
    reload();
    window.dispatchEvent(new Event(DATA_EVENT));
  }

  // ── Dupliquer semaine précédente ──────────────────────────────────────────

  function dupliquerSemainePrecedente() {
    const prevDates = semaineDays(subWeeks(weekStart, 1)).map(fmtDate);
    const affsPrev = loadAffectations().filter(a => prevDates.includes(a.date));
    const absNow = loadAbsences();
    const affsNow = loadAffectations();
    let ajoutees = 0;
    for (const a of affsPrev) {
      const newDate = fmtDate(addDays(parseISO(a.date), 7));
      if (isAbsent(a.salarie_id, newDate, absNow)) continue;
      const existe = affsNow.some(x => x.salarie_id === a.salarie_id && x.date === newDate && x.chantier_id === a.chantier_id);
      if (!existe) { addAffectation({ chantier_id: a.chantier_id, salarie_id: a.salarie_id, date: newDate }); ajoutees++; }
    }
    reload();
    toast.success(`${ajoutees} affectation${ajoutees > 1 ? "s" : ""} dupliquée${ajoutees > 1 ? "s" : ""}`);
  }

  // ── Email planning ────────────────────────────────────────────────────────

  function envoyerPlanning() {
    const label = `${format(days[0], "dd/MM", { locale: fr })} – ${format(days[5], "dd/MM/yyyy", { locale: fr })}`;
    let corps = `Planning semaine du ${label}\n\n`;
    for (const emp of employes) {
      const lignes: string[] = [];
      for (const d of days) {
        const ds = fmtDate(d);
        const affs = cellMap.get(`${emp.id}|${ds}`) ?? [];
        if (affs.length) {
          const noms = affs.map(a => {
            const ch = chantiers.find(c => c.id === a.chantier_id);
            return ch ? `${ch.nature_travaux} (${clientNom(ch.client_id)})` : "—";
          }).join(", ");
          lignes.push(`  ${format(d, "EEE dd/MM", { locale: fr })}: ${noms}`);
        }
      }
      if (lignes.length) corps += `${emp.prenom} ${emp.nom}:\n${lignes.join("\n")}\n\n`;
    }
    window.open(`mailto:?subject=${encodeURIComponent(`Planning semaine ${label}`)}&body=${encodeURIComponent(corps)}`, "_blank");
  }

  // ── Suggestions IA ───────────────────────────────────────────────────────

  function ouvrirSuggestions(chantier: Chantier, date: string) {
    setSuggestions(scorerSalaries(chantier, date, weekDates, employes, affectations, absences));
    setSuggestionFor({ chantier, date });
  }

  function accepterSuggestion(item: SuggestionItem) {
    if (!suggestionFor) return;
    applyAffectation({ kind: "new", chantierId: suggestionFor.chantier.id }, item.employe.id, suggestionFor.date);
    setSuggestionFor(null);
    toast.success(`${item.employe.prenom} ${item.employe.nom} affecté(e)`);
  }

  const labelSemaine = `${format(days[0], "dd MMM", { locale: fr })} – ${format(days[5], "dd MMM yyyy", { locale: fr })}`;

  if (employes.length === 0 && chantiers.length === 0) return <EtatVide />;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── En-tête ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", lineHeight: 1.2 }}>
              Planning chantiers
            </h1>
            <p style={{ fontSize: 13, color: "#8B847D", marginTop: 2 }}>
              Glissez les chantiers sur les salariés · Semaine du {labelSemaine}
            </p>
          </div>
          <div style={{ flex: 1 }} />

          {/* Navigation semaine */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <NavBtn onClick={() => setWeekStart(w => subWeeks(w, 1))} icon={<ChevronLeft size={16} />} />
            <button
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#E2001A", color: "white", border: "none", cursor: "pointer" }}
            >
              Aujourd'hui
            </button>
            <NavBtn onClick={() => setWeekStart(w => addWeeks(w, 1))} icon={<ChevronRight size={16} />} />
          </div>

          <ActionBtn onClick={dupliquerSemainePrecedente} icon={<Copy size={14} />} label="Dupliquer sem. préc." />
          <ActionBtn onClick={envoyerPlanning} icon={<Mail size={14} />} label="Envoyer" />

        </div>

        {/* ── Onglets ── */}
        <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #E5E0DA", overflowX: "auto" }}>
          {([
            { key: "grille",        label: "Grille" },
            { key: "materiel",      label: "Matériel" },
            { key: "taches",        label: "Tâches" },
            { key: "pointage",      label: "Pointage" },
            { key: "carte",         label: "Carte" },
            { key: "tableau-bord",  label: "Tableau de bord" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: tab === key ? 700 : 500, cursor: "pointer",
                background: "transparent", border: "none", color: tab === key ? "#E2001A" : "#4A453F",
                borderBottom: `2px solid ${tab === key ? "#E2001A" : "transparent"}`,
                marginBottom: -2, whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Corps ── */}
        {tab === "materiel" && (
          <PlanningMateriel weekStart={weekStart} onWeekChange={setWeekStart} />
        )}
        {tab === "taches" && (
          <PlanningTaches weekStart={weekStart} />
        )}
        {tab === "pointage" && (
          <PlanningPointage weekStart={weekStart} onWeekChange={setWeekStart} />
        )}
        {tab === "tableau-bord" && (
          <PlanningTableauBord weekStart={weekStart} />
        )}
        {tab === "carte" && (
          <CarteView chantiers={chantiersActifs} clients={clients} employes={employes} affectations={affectations} activeDay={activeDay} onDayChange={setActiveDay} days={days} />
        )}
        {tab === "grille" && (
          <>
            <ReserveSalaries
              employes={employes}
              onAdd={() => setAddEmpModal(true)}
              onTapSalarie={emp => setDaySelectFor(emp)}
            />
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <PanneauChantiers
              chantiers={chantiersActifs}
              clients={clients}
              affectations={affectations}
              onSuggestion={ouvrirSuggestions}
              weekDates={weekDates}
            />

            <div style={{ flex: 1, overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140, textAlign: "left", padding: "6px 8px", fontSize: 12, color: "#8B847D", fontWeight: 600, borderBottom: "2px solid #E5E0DA" }}>
                      Salarié
                    </th>
                    {days.map(d => {
                      const ds = fmtDate(d);
                      const isToday = isSameDay(d, new Date());
                      return (
                        <DayHeaderCell
                          key={ds}
                          date={ds}
                          label={format(d, "EEE", { locale: fr }).toUpperCase()}
                          sublabel={format(d, "dd/MM")}
                          isToday={isToday}
                        />
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {employes.map((emp, idx) => (
                    <tr key={emp.id} style={{ background: idx % 2 === 0 ? "white" : "#FAF8F5" }}>
                      <td style={{ padding: "4px 8px", borderBottom: "1px solid #F0EBE5", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: couleurEmp(emp.id, emp.couleur), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>
                            {initiales(emp.nom, emp.prenom)}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1714", lineHeight: 1.2 }}>{emp.prenom} {emp.nom}</div>
                            {emp.metier && <div style={{ fontSize: 10, color: "#8B847D" }}>{emp.metier}</div>}
                          </div>
                          <button onClick={() => setEditEmpId(emp.id)} title="Paramétrer" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#C5BDB5", padding: 2 }}>
                            <Wrench size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => setAbsenceModal(emp)}
                          style={{ marginTop: 3, fontSize: 9, color: "#8B847D", background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}
                        >
                          + Absence
                        </button>
                      </td>
                      {days.map(d => {
                        const ds = fmtDate(d);
                        const abs = isAbsent(emp.id, ds, absences);
                        const affs = cellMap.get(`${emp.id}|${ds}`) ?? [];
                        return (
                          <GridCell
                            key={ds}
                            salarieId={emp.id}
                            date={ds}
                            absente={abs}
                            affectations={affs}
                            chantiers={chantiers}
                            clients={clients}
                            employe={emp}
                            onRemove={supprimerAff}
                            onTap={() => setAssignModal({ salarieId: emp.id, date: ds })}
                          />
                        );
                      })}
                    </tr>
                  ))}
                  {employes.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#8B847D", fontSize: 13 }}>
                        Aucun salarié actif — ajoutez des salariés dans le module RH
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      {absenceModal && (
        <AbsenceModal
          employe={absenceModal}
          onClose={() => setAbsenceModal(null)}
          onSave={data => {
            addAbsence({ salarie_id: absenceModal.id, ...data });
            reload();
            setAbsenceModal(null);
            toast.success("Absence enregistrée");
          }}
        />
      )}

      {assignModal && (
        <AssignModal
          salarieId={assignModal.salarieId}
          date={assignModal.date}
          employes={employes}
          chantiers={chantiersActifs}
          clients={clients}
          affectations={affectations}
          absences={absences}
          onAssign={chantierId => {
            applyAffectation({ kind: "new", chantierId }, assignModal.salarieId, assignModal.date);
            setAssignModal(null);
          }}
          onAddChantier={() => setAddChantierModal(true)}
          onClose={() => setAssignModal(null)}
        />
      )}

      {addChantierModal && assignModal && (
        <AddChantierModal
          clients={clients}
          onClose={() => setAddChantierModal(false)}
          onCreate={chantierId => {
            applyAffectation({ kind: "new", chantierId }, assignModal.salarieId, assignModal.date);
            setAddChantierModal(false);
            setAssignModal(null);
            toast.success("Chantier créé et affecté");
          }}
        />
      )}

      {suggestionFor && (
        <SuggestionPanel
          chantier={suggestionFor.chantier}
          date={suggestionFor.date}
          suggestions={suggestions}
          onAccept={accepterSuggestion}
          onClose={() => setSuggestionFor(null)}
        />
      )}

      {editEmpId && employes.find(e => e.id === editEmpId) && (
        <EditEmployeModal
          employe={employes.find(e => e.id === editEmpId)!}
          onClose={() => setEditEmpId(null)}
          onSave={data => {
            updateEmployeRH(editEmpId, data);
            reload();
            setEditEmpId(null);
            toast.success("Salarié mis à jour");
          }}
        />
      )}

      {addEmpModal && (
        <AddEmployeModal
          onClose={() => setAddEmpModal(false)}
          onSave={data => {
            addEmployeRH({
              prenom: data.prenom,
              nom: data.nom,
              date_naissance: null,
              num_secu: null,
              qualification: null,
              salarie_adresse: null,
              statut: data.statut,
              actif: true,
              metier: data.metier || null,
              couleur: data.couleur,
            });
            notifyUpdate();
            reload();
            setAddEmpModal(false);
            toast.success("Salarié ajouté");
          }}
        />
      )}

      {daySelectFor && (
        <DaySelectModal
          employe={daySelectFor}
          days={days}
          onSelect={ds => {
            setAssignModal({ salarieId: daySelectFor.id, date: ds });
            setDaySelectFor(null);
          }}
          onClose={() => setDaySelectFor(null)}
        />
      )}

      <AbsenceFloatingList
        absences={absences}
        employes={employes}
        onRemove={id => { removeAbsence(id); reload(); }}
      />

      <DragOverlay>
        {dragActive && dragActive.kind === "new" && (
          <div style={{ background: "#E2001A", color: "white", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>
            {chantiers.find(c => c.id === dragActive.chantierId)?.nature_travaux ?? "Chantier"}
          </div>
        )}
        {dragActive && dragActive.kind === "salarie" && (() => {
          const emp = employes.find(e => e.id === dragActive.salarieId);
          if (!emp) return null;
          return (
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: couleurEmp(emp.id, emp.couleur), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,.25)", border: "2px solid white" }}>
              {initiales(emp.nom, emp.prenom)}
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}

// ── Petits boutons ────────────────────────────────────────────────────────────

function NavBtn({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E0DA", cursor: "pointer", color: "#4A453F" }}>
      {icon}
    </button>
  );
}

function ActionBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "white", border: "1px solid #E5E0DA", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#4A453F" }}>
      {icon}{label}
    </button>
  );
}

// ── Réserve de salariés ───────────────────────────────────────────────────────

function ReserveSalaries({
  employes, onAdd, onTapSalarie,
}: {
  employes: EmployeRH[];
  onAdd: () => void;
  onTapSalarie: (emp: EmployeRH) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 12px", background: "white", borderRadius: 14, border: "1px solid #ECE7E1", boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        <Users size={13} />
        Réserve
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, flex: 1 }}>
        {employes.map(emp => (
          <ReserveAvatar key={emp.id} employe={emp} onTap={() => onTapSalarie(emp)} />
        ))}
      </div>
      <button
        onClick={onAdd}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: "rgba(226,0,26,.07)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#E2001A" }}
      >
        <Plus size={13} />
        Ajouter un salarié
      </button>
    </div>
  );
}

function ReserveAvatar({ employe, onTap }: { employe: EmployeRH; onTap: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `salarie-${employe.id}`,
    data: { kind: "salarie", salarieId: employe.id } satisfies DragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onTap}
      title={`${employe.prenom} ${employe.nom} — glisser sur un jour ou cliquer pour affecter`}
      style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: couleurEmp(employe.id, employe.couleur),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 12, fontWeight: 700,
        cursor: "grab", opacity: isDragging ? 0.4 : 1,
        transform: CSS.Translate.toString(transform), userSelect: "none",
        border: "2px solid white", boxShadow: "0 1px 3px rgba(26,23,20,.15)",
        touchAction: "none",
      }}
    >
      {initiales(employe.nom, employe.prenom)}
    </div>
  );
}

// ── En-tête de jour (drop "salarié → jour") ───────────────────────────────────

function DayHeaderCell({
  date, label, sublabel, isToday,
}: {
  date: string; label: string; sublabel: string; isToday: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date}`,
    data: { kind: "day", date } satisfies DropData,
  });

  return (
    <th
      ref={setNodeRef}
      style={{ padding: "6px 4px", fontSize: 11, fontWeight: 700, textAlign: "center", color: isToday ? "#E2001A" : "#4A453F", borderBottom: `2px solid ${isToday ? "#E2001A" : "#E5E0DA"}`, minWidth: 80, background: isOver ? "rgba(226,0,26,.08)" : "transparent", borderRadius: isOver ? "6px 6px 0 0" : 0, transition: "background .15s" }}
    >
      <div>{label}</div>
      <div style={{ fontWeight: 400, fontSize: 11 }}>{sublabel}</div>
    </th>
  );
}

// ── Cellule grille ────────────────────────────────────────────────────────────

function GridCell({
  salarieId, date, absente, affectations, chantiers, clients, employe, onRemove, onTap,
}: {
  salarieId: string; date: string;
  absente: Absence | null;
  affectations: Affectation[];
  chantiers: Chantier[]; clients: Client[];
  employe: EmployeRH;
  onRemove: (id: string) => void;
  onTap: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${salarieId}-${date}`,
    data: { kind: "cell", salarieId, date } satisfies DropData,
  });

  const hasConflict = affectations.length > 1;

  return (
    <td
      ref={setNodeRef}
      style={{ padding: 3, borderBottom: "1px solid #F0EBE5", verticalAlign: "top", minWidth: 80, background: isOver ? "rgba(226,0,26,.06)" : absente ? "rgba(139,132,125,.06)" : "transparent", transition: "background .15s", cursor: absente ? "default" : "pointer" }}
      onClick={absente ? undefined : onTap}
    >
      {absente ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", borderRadius: 5, background: "rgba(139,132,125,.12)" }} title={`Absent – ${MOTIFS[absente.motif]}`}>
          <UserX size={11} style={{ color: "#8B847D", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#8B847D" }}>{MOTIFS[absente.motif]}</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {affectations.map(a => (
            <AffectationPill
              key={a.id}
              affectation={a}
              chantier={chantiers.find(c => c.id === a.chantier_id)}
              client={clients.find(c => c.id === chantiers.find(x => x.id === a.chantier_id)?.client_id)}
              employe={employe}
              conflict={hasConflict}
              onRemove={() => onRemove(a.id)}
            />
          ))}
          {affectations.length === 0 && (
            <div style={{ height: 28, borderRadius: 5, border: "1px dashed #D5CFC8", display: "flex", alignItems: "center", justifyContent: "center", color: "#C5BDB5" }}>
              <Plus size={12} />
            </div>
          )}
        </div>
      )}
    </td>
  );
}

// ── Pill d'affectation ────────────────────────────────────────────────────────

function AffectationPill({
  affectation, chantier, client, employe, conflict, onRemove,
}: {
  affectation: Affectation;
  chantier?: Chantier;
  client?: Client;
  employe: EmployeRH;
  conflict: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `aff-${affectation.id}`,
    data: { kind: "move", affectationId: affectation.id, chantierId: affectation.chantier_id } satisfies DragData,
  });

  let dist: string | null = null;
  if (employe.latitude_domicile && employe.longitude_domicile && chantier?.latitude && chantier?.longitude) {
    dist = fmtDist(haversineKm(employe.latitude_domicile, employe.longitude_domicile, chantier.latitude, chantier.longitude));
  }

  const conflitMetier = chantier?.metier_requis && employe.metier && chantier.metier_requis !== employe.metier;
  const couleur = chantier ? couleurEmp(chantier.id) : "#8B847D";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 6px", borderRadius: 5, background: `${couleur}18`, border: `1px solid ${conflict || conflitMetier ? "#FB8C00" : couleur}44`, fontSize: 10, cursor: "grab", opacity: isDragging ? 0.4 : 1, transform: CSS.Translate.toString(transform), userSelect: "none" }}
      title={chantier?.nature_travaux ?? ""}
    >
      {(conflict || conflitMetier) && <AlertTriangle size={9} style={{ color: "#FB8C00", flexShrink: 0 }} />}
      <span style={{ color: couleur, fontWeight: 700, flexShrink: 0, fontSize: 9 }}>{client?.nom?.slice(0, 6) ?? "—"}</span>
      <span style={{ color: "#4A453F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 56 }}>{chantier?.nature_travaux?.slice(0, 10) ?? "—"}</span>
      {dist && <span style={{ color: "#8B847D", fontSize: 9, flexShrink: 0 }}>·{dist}</span>}
      <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#C5BDB5", padding: 0, lineHeight: 1 }} title="Retirer">
        <X size={10} />
      </button>
    </div>
  );
}

// ── Panneau chantiers ─────────────────────────────────────────────────────────

function PanneauChantiers({
  chantiers, clients, affectations, onSuggestion, weekDates,
}: {
  chantiers: Chantier[];
  clients: Client[];
  affectations: Affectation[];
  onSuggestion: (ch: Chantier, date: string) => void;
  weekDates: string[];
}) {
  const today = fmtDate(new Date());
  return (
    <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 4px 4px" }}>Chantiers actifs</div>
      {chantiers.length === 0 && <div style={{ fontSize: 12, color: "#8B847D", padding: "8px 4px" }}>Aucun chantier signé</div>}
      {chantiers.map(ch => {
        const nom = clients.find(c => c.id === ch.client_id)?.nom ?? "—";
        const totalSem = affectations.filter(a => a.chantier_id === ch.id && weekDates.includes(a.date)).length;
        const requis = ch.nb_personnes_requises ?? 0;
        return (
          <ChantierCard
            key={ch.id}
            chantier={ch}
            clientNom={nom}
            totalSemaine={totalSem}
            requiSemaine={requis}
            onSuggestion={() => onSuggestion(ch, today)}
          />
        );
      })}
    </div>
  );
}

function ChantierCard({
  chantier, clientNom, totalSemaine, requiSemaine, onSuggestion,
}: {
  chantier: Chantier; clientNom: string;
  totalSemaine: number; requiSemaine: number;
  onSuggestion: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `ch-${chantier.id}`,
    data: { kind: "new", chantierId: chantier.id } satisfies DragData,
  });

  const couleur = couleurEmp(chantier.id);
  const ok = requiSemaine === 0 || totalSemaine >= requiSemaine;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ padding: "7px 9px", borderRadius: 8, cursor: "grab", background: "white", border: `1.5px solid ${couleur}44`, opacity: isDragging ? 0.4 : 1, transform: CSS.Translate.toString(transform), boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: couleur, flexShrink: 0, marginTop: 3 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1714", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clientNom}</div>
          <div style={{ fontSize: 10, color: "#8B847D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chantier.nature_travaux}</div>
          {chantier.metier_requis && <div style={{ fontSize: 9, color: couleur, fontWeight: 600, marginTop: 1 }}>{chantier.metier_requis}</div>}
        </div>
      </div>
      {requiSemaine > 0 && (
        <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ flex: 1, height: 3, background: "#F0EBE5", borderRadius: 2 }}>
            <div style={{ width: `${Math.min(100, (totalSemaine / requiSemaine) * 100)}%`, height: "100%", borderRadius: 2, background: ok ? "#43A047" : "#E2001A" }} />
          </div>
          <span style={{ fontSize: 9, color: ok ? "#43A047" : "#E2001A", fontWeight: 700 }}>{totalSemaine}/{requiSemaine}</span>
        </div>
      )}
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onSuggestion(); }}
        style={{ marginTop: 5, width: "100%", padding: "2px 0", borderRadius: 5, fontSize: 9, fontWeight: 600, background: "rgba(226,0,26,.07)", border: "none", color: "#E2001A", cursor: "pointer" }}
      >
        Suggestions IA
      </button>
    </div>
  );
}

// ── Panneau suggestions ───────────────────────────────────────────────────────

function SuggestionPanel({
  chantier, date, suggestions, onAccept, onClose,
}: {
  chantier: Chantier; date: string;
  suggestions: SuggestionItem[];
  onAccept: (item: SuggestionItem) => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#1A1714" }}>Suggestions IA</h2>
            <p style={{ fontSize: 12, color: "#8B847D", marginTop: 2 }}>
              {chantier.nature_travaux} · {format(parseISO(date), "dd MMMM", { locale: fr })}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>

        {suggestions.length === 0 ? (
          <p style={{ fontSize: 13, color: "#8B847D", textAlign: "center", padding: "20px 0" }}>Aucun salarié disponible ce jour</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((item, i) => (
              <div key={item.employe.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${i === 0 ? "#E2001A" : "#E5E0DA"}`, background: i === 0 ? "rgba(226,0,26,.04)" : "white" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: item.couleur, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                  {initiales(item.employe.nom, item.employe.prenom)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1714" }}>
                    {item.employe.prenom} {item.employe.nom}
                    {i === 0 && <span style={{ marginLeft: 6, fontSize: 10, color: "#E2001A", fontWeight: 700 }}>Recommandé</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8B847D", marginTop: 2 }}>{item.raisons.join(" · ")}</div>
                  <div style={{ marginTop: 3, height: 3, borderRadius: 2, background: "#F0EBE5" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: item.couleur, width: `${Math.min(100, item.score)}%` }} />
                  </div>
                </div>
                <button onClick={() => onAccept(item)} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: i === 0 ? "#E2001A" : "#F0EBE5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: i === 0 ? "white" : "#4A453F" }}>
                  <Check size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: "#C5BDB5", marginTop: 12, textAlign: "center" }}>
          Score : métier · distance domicile/chantier · charge hebdomadaire
        </p>
      </div>
    </div>
  );
}

// ── Modal absence ─────────────────────────────────────────────────────────────

function AbsenceModal({
  employe, onClose, onSave,
}: {
  employe: EmployeRH;
  onClose: () => void;
  onSave: (data: Omit<Absence, "id" | "salarie_id">) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [debut, setDebut] = useState(today);
  const [fin, setFin] = useState(today);
  const [motif, setMotif] = useState<Absence["motif"]>("conges");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 -4px 40px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Absence — {employe.prenom} {employe.nom}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Début</label>
            <input type="date" value={debut} onChange={e => setDebut(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Fin</label>
            <input type="date" value={fin} onChange={e => setFin(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Motif</label>
          <select value={motif} onChange={e => setMotif(e.target.value as Absence["motif"])} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}>
            {Object.entries(MOTIFS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button onClick={() => onSave({ date_debut: debut, date_fin: fin, motif })} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "#E2001A", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Enregistrer l'absence
        </button>
      </div>
    </div>
  );
}

// ── Modal affectation mobile ──────────────────────────────────────────────────

function AssignModal({
  salarieId, date, employes, chantiers, clients, affectations, absences, onAssign, onAddChantier, onClose,
}: {
  salarieId: string; date: string;
  employes: EmployeRH[]; chantiers: Chantier[]; clients: Client[];
  affectations: Affectation[]; absences: Absence[];
  onAssign: (chantierId: string) => void;
  onAddChantier: () => void;
  onClose: () => void;
}) {
  const emp = employes.find(e => e.id === salarieId);
  const abs = isAbsent(salarieId, date, absences);
  const dejaChantiers = affectations.filter(a => a.salarie_id === salarieId && a.date === date).map(a => a.chantier_id);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto", boxShadow: "0 -4px 40px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
          <div>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Affecter {emp?.prenom} {emp?.nom}</h3>
            <p style={{ fontSize: 12, color: "#8B847D" }}>{format(parseISO(date), "EEEE dd MMMM", { locale: fr })}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>

        {abs && (
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(139,132,125,.1)", marginBottom: 12, fontSize: 12, color: "#4A453F" }}>
            <UserX size={12} style={{ display: "inline", marginRight: 4 }} />
            Salarié absent ({MOTIFS[abs.motif]})
          </div>
        )}

        {chantiers.length === 0 && (
          <p style={{ fontSize: 12, color: "#8B847D", textAlign: "center", padding: "8px 0 14px" }}>
            Aucun chantier actif pour le moment — créez-en un ci-dessous.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {chantiers.map(ch => {
            const nom = clients.find(c => c.id === ch.client_id)?.nom ?? "—";
            const dejaAffecte = dejaChantiers.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => !dejaAffecte && onAssign(ch.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: dejaAffecte ? "rgba(67,160,71,.08)" : "white", border: `1.5px solid ${dejaAffecte ? "#43A047" : "#E5E0DA"}`, cursor: dejaAffecte ? "default" : "pointer", textAlign: "left" }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: couleurEmp(ch.id), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1714" }}>{nom}</div>
                  <div style={{ fontSize: 11, color: "#8B847D" }}>{ch.nature_travaux}</div>
                </div>
                {dejaAffecte && <Check size={14} style={{ color: "#43A047" }} />}
              </button>
            );
          })}
        </div>

        <button
          onClick={onAddChantier}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 10, border: "1.5px dashed #D5CFC8", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#E2001A" }}
        >
          <Plus size={14} />
          Nouveau chantier
        </button>
      </div>
    </div>
  );
}

// ── Modal ajout chantier (rapide, depuis la grille) ───────────────────────────

function AddChantierModal({
  clients, onClose, onCreate,
}: {
  clients: Client[];
  onClose: () => void;
  onCreate: (chantierId: string) => void;
}) {
  const [clientId, setClientId] = useState<string>("__nouveau__");
  const [nouveauClient, setNouveauClient] = useState("");
  const [natureTravaux, setNatureTravaux] = useState("");
  const [metierRequis, setMetierRequis] = useState("");
  const [nbPersonnes, setNbPersonnes] = useState("");

  const nomClientValide = clientId === "__nouveau__" ? nouveauClient.trim().length > 0 : true;
  const valid = natureTravaux.trim().length > 0 && nomClientValide;

  function handleCreate() {
    if (!valid) return;
    let finalClientId = clientId;
    if (clientId === "__nouveau__") {
      const client = addClient({ nom: nouveauClient.trim(), email: null, telephone: null, adresse: null });
      finalClientId = client.id;
    }
    const chantier = addChantier({
      client_id: finalClientId,
      nature_travaux: natureTravaux.trim(),
      montant_estime: null,
      duree_estimee: null,
      statut: "travaux_en_cours",
      metier_requis: metierRequis || null,
      nb_personnes_requises: nbPersonnes ? Number(nbPersonnes) : null,
    });
    notifyUpdate();
    onCreate(chantier.id);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Nouveau chantier</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Client</label>
        <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }}>
          <option value="__nouveau__">+ Nouveau client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        {clientId === "__nouveau__" && (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Nom du client *</label>
            <input value={nouveauClient} onChange={e => setNouveauClient(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }} />
          </>
        )}

        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Nature des travaux *</label>
        <input value={natureTravaux} onChange={e => setNatureTravaux(e.target.value)} placeholder="Ex : Rénovation toiture" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Métier requis</label>
            <select value={metierRequis} onChange={e => setMetierRequis(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}>
              <option value="">— Tous —</option>
              {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Personnes requises</label>
            <input type="number" min={0} value={nbPersonnes} onChange={e => setNbPersonnes(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }} />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!valid}
          style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: valid ? "#E2001A" : "#E5E0DA", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: valid ? "pointer" : "default" }}
        >
          Créer et affecter
        </button>
      </div>
    </div>
  );
}

// ── Modal édition salarié ─────────────────────────────────────────────────────

function EditEmployeModal({
  employe, onClose, onSave,
}: {
  employe: EmployeRH;
  onClose: () => void;
  onSave: (data: Partial<Omit<EmployeRH, "id" | "created_at">>) => void;
}) {
  const [metier, setMetier] = useState(employe.metier ?? "");
  const [couleur, setCouleur] = useState(employe.couleur ?? couleurEmp(employe.id));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>{employe.prenom} {employe.nom}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Métier / spécialité</label>
        <select value={metier} onChange={e => setMetier(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }}>
          <option value="">— Non renseigné —</option>
          {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Couleur planning</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {PALETTE.map(c => (
            <button key={c} onClick={() => setCouleur(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: couleur === c ? `3px solid ${c}` : "none", outlineOffset: 2 }} />
          ))}
        </div>
        <button onClick={() => onSave({ metier: metier || null, couleur })} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "#E2001A", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}

// ── Modal ajout salarié ───────────────────────────────────────────────────────

function AddEmployeModal({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (data: { prenom: string; nom: string; metier: string; statut: EmployeRH["statut"]; couleur: string }) => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [metier, setMetier] = useState("");
  const [statut, setStatut] = useState<EmployeRH["statut"]>("ouvrier");
  const [couleur, setCouleur] = useState(PALETTE[0]);

  const valid = prenom.trim().length > 0 && nom.trim().length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Ajouter un salarié</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Prénom *</label>
            <input value={prenom} onChange={e => setPrenom(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Nom *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }} />
          </div>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Métier / spécialité</label>
        <select value={metier} onChange={e => setMetier(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }}>
          <option value="">— Non renseigné —</option>
          {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Statut</label>
        <select value={statut} onChange={e => setStatut(e.target.value as EmployeRH["statut"])} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }}>
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Couleur planning</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {PALETTE.map(c => (
            <button key={c} onClick={() => setCouleur(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer", outline: couleur === c ? `3px solid ${c}` : "none", outlineOffset: 2 }} />
          ))}
        </div>

        <button
          onClick={() => valid && onSave({ prenom: prenom.trim(), nom: nom.trim(), metier, statut, couleur })}
          disabled={!valid}
          style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: valid ? "#E2001A" : "#E5E0DA", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: valid ? "pointer" : "default" }}
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ── Modal sélection de jour (réserve, mobile) ─────────────────────────────────

function DaySelectModal({
  employe, days, onSelect, onClose,
}: {
  employe: EmployeRH;
  days: Date[];
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Affecter {employe.prenom} {employe.nom}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 12, color: "#8B847D", marginBottom: 14 }}>Choisissez un jour</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {days.map(d => {
            const ds = fmtDate(d);
            return (
              <button
                key={ds}
                onClick={() => onSelect(ds)}
                style={{ padding: "10px 0", borderRadius: 10, border: "1.5px solid #E5E0DA", background: "white", cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#8B847D" }}>{format(d, "EEE", { locale: fr })}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1714" }}>{format(d, "dd/MM")}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Absences flottantes ───────────────────────────────────────────────────────

function AbsenceFloatingList({
  absences, employes, onRemove,
}: {
  absences: Absence[];
  employes: EmployeRH[];
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (absences.length === 0) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 24, background: "white", border: "1.5px solid #E5E0DA", boxShadow: "0 4px 16px rgba(0,0,0,.1)", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#4A453F" }}>
        <UserX size={14} style={{ color: "#8B847D" }} />
        {absences.length} absence{absences.length > 1 ? "s" : ""}
      </button>
      {open && (
        <div style={{ position: "absolute", bottom: 48, right: 0, background: "white", borderRadius: 12, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,.15)", width: 280, border: "1px solid #E5E0DA" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Absences enregistrées</div>
          {absences.map(a => {
            const emp = employes.find(e => e.id === a.salarie_id);
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #F0EBE5" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1714" }}>{emp ? `${emp.prenom} ${emp.nom}` : "—"}</div>
                  <div style={{ fontSize: 11, color: "#8B847D" }}>{MOTIFS[a.motif]} · {format(parseISO(a.date_debut), "dd/MM")} → {format(parseISO(a.date_fin), "dd/MM")}</div>
                </div>
                <button onClick={() => onRemove(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C5BDB5" }}><X size={12} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Vue carte ─────────────────────────────────────────────────────────────────

function CarteView({
  chantiers, clients, employes, affectations, activeDay, onDayChange, days,
}: {
  chantiers: Chantier[];
  clients: Client[];
  employes: EmployeRH[];
  affectations: Affectation[];
  activeDay: string;
  onDayChange: (d: string) => void;
  days: Date[];
}) {
  const chantiersJour = chantiers.filter(ch => affectations.some(a => a.chantier_id === ch.id && a.date === activeDay));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {days.map(d => {
          const ds = fmtDate(d);
          const active = ds === activeDay;
          return (
            <button key={ds} onClick={() => onDayChange(ds)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: active ? "#E2001A" : "white", color: active ? "white" : "#4A453F", boxShadow: active ? "0 2px 8px rgba(226,0,26,.3)" : "0 1px 3px rgba(0,0,0,.06)" }}>
              {format(d, "EEE dd", { locale: fr })}
            </button>
          );
        })}
      </div>

      {chantiersJour.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12 }}>
          Aucun chantier planifié ce jour
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {chantiersJour.map(ch => {
            const client = clients.find(c => c.id === ch.client_id);
            const equipe = affectations
              .filter(a => a.chantier_id === ch.id && a.date === activeDay)
              .map(a => employes.find(e => e.id === a.salarie_id))
              .filter(Boolean) as EmployeRH[];
            const adresse = client?.adresse;
            const gmaps = adresse ? `https://www.google.com/maps/search/${encodeURIComponent(adresse)}` : null;
            return (
              <div key={ch.id} style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid #E5E0DA", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: couleurEmp(ch.id), flexShrink: 0, marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "#1A1714" }}>{client?.nom ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#8B847D" }}>{ch.nature_travaux}</div>
                    {ch.metier_requis && <div style={{ fontSize: 11, color: couleurEmp(ch.id), fontWeight: 600, marginTop: 1 }}>{ch.metier_requis}</div>}
                  </div>
                </div>
                {adresse && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 10 }}>
                    <MapPin size={12} style={{ color: "#8B847D", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12, color: "#4A453F" }}>{adresse}</span>
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {equipe.map(emp => (
                    <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 20, background: `${couleurEmp(emp.id, emp.couleur)}18`, border: `1px solid ${couleurEmp(emp.id, emp.couleur)}33` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: couleurEmp(emp.id, emp.couleur) }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4A453F" }}>{emp.prenom} {emp.nom}</span>
                    </div>
                  ))}
                </div>
                {gmaps && (
                  <a href={gmaps} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#E2001A", textDecoration: "none" }}>
                    <Navigation size={11} />
                    Ouvrir dans Google Maps
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── État vide ─────────────────────────────────────────────────────────────────

function EtatVide() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12 }}>
      <CalendarDays size={48} style={{ color: "#C5BDB5" }} />
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#1A1714" }}>Aucune donnée à afficher</h2>
      <p style={{ fontSize: 13, color: "#8B847D", textAlign: "center", maxWidth: 320 }}>
        Ajoutez des salariés dans <strong>RH & Juridique</strong> et des chantiers dans <strong>PV & Devis</strong> pour commencer le planning.
      </p>
    </div>
  );
}
