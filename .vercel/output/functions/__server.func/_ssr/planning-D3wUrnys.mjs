import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useSensors, a as useSensor, D as DndContext, d as DragOverlay, P as PointerSensor, b as useDroppable, c as useDraggable } from "../_libs/dnd-kit__core.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as loadEmployesRH, g as loadChantiers, h as loadClients, k as loadAbsences, m as loadAffectations, D as DATA_EVENT, o as addAbsence, p as updateEmployeRH, r as removeAbsence, q as updateChantier, t as addAffectation, v as removeAffectation } from "./local-data-CXnsCisz.mjs";
import { s as startOfWeek, f as format, a as subWeeks, b as addWeeks, i as isSameDay, c as addDays, d as fr, p as parseISO, e as isWithinInterval } from "../_libs/date-fns.mjs";
import { p as ChevronLeft, q as ChevronRight, r as Copy, i as Mail, W as Wrench, s as CalendarDays, t as UserX, P as Plus, u as MapPin, N as Navigation, X, o as Check, T as TriangleAlert } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/dnd-kit__accessibility.mjs";
async function geocodeAdresse(adresse) {
  if (!adresse?.trim()) return null;
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5e3) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features?.length) return null;
    const [lon, lat] = data.features[0].geometry.coordinates;
    return { lat, lon };
  } catch {
    return null;
  }
}
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fmtDist(km) {
  if (km < 1) return `${Math.round(km * 1e3)} m`;
  return `${km.toFixed(1)} km`;
}
const METIERS = ["Maçonnerie", "Charpente", "Couverture", "Plomberie", "Électricité", "Menuiserie", "Carrelage", "Peinture", "Isolation", "Autre"];
const MOTIFS = {
  conges: "Congés",
  maladie: "Maladie",
  formation: "Formation",
  autre: "Autre"
};
const PALETTE = ["#E2001A", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#00897B", "#F4511E", "#3949AB", "#6D4C41", "#00838F"];
function couleurEmp(id, stored) {
  if (stored) return stored;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) & 4294967295;
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function initiales(nom, prenom) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}
function semaineDays(weekStart) {
  return Array.from({
    length: 6
  }, (_, i) => addDays(weekStart, i));
}
function isAbsent(salarieId, date, absences) {
  const d = parseISO(date);
  return absences.find((a) => a.salarie_id === salarieId && isWithinInterval(d, {
    start: parseISO(a.date_debut),
    end: parseISO(a.date_fin)
  })) ?? null;
}
function fmtDate(d) {
  return format(d, "yyyy-MM-dd");
}
function affsByCell(affectations) {
  const map = /* @__PURE__ */ new Map();
  for (const a of affectations) {
    const key = `${a.salarie_id}|${a.date}`;
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return map;
}
function scorerSalaries(chantier, date, weekDates, employes, affectations, absences) {
  const results = [];
  for (const emp of employes) {
    if (!emp.actif) continue;
    if (isAbsent(emp.id, date, absences)) continue;
    const dejaAff = affectations.some((a) => a.salarie_id === emp.id && a.date === date);
    if (dejaAff) continue;
    let score = 0;
    const raisons = [];
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
    if (emp.latitude_domicile && emp.longitude_domicile && chantier.latitude && chantier.longitude) {
      const km = haversineKm(emp.latitude_domicile, emp.longitude_domicile, chantier.latitude, chantier.longitude);
      const pts2 = Math.max(0, Math.min(30, 30 - km));
      score += pts2;
      raisons.push(`${fmtDist(km)} du chantier`);
    } else {
      score += 10;
    }
    const charge = affectations.filter((a) => a.salarie_id === emp.id && weekDates.includes(a.date)).length;
    const pts = Math.max(0, 30 - charge * 6);
    score += pts;
    const libres = weekDates.length - charge;
    raisons.push(`${libres} jour${libres > 1 ? "s" : ""} libre${libres > 1 ? "s" : ""}`);
    results.push({
      employe: emp,
      score,
      raisons,
      couleur: couleurEmp(emp.id, emp.couleur)
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}
function PlanningPage() {
  const [weekStart, setWeekStart] = reactExports.useState(() => startOfWeek(/* @__PURE__ */ new Date(), {
    weekStartsOn: 1
  }));
  const [view, setView] = reactExports.useState("grille");
  const [employes, setEmployes] = reactExports.useState([]);
  const [chantiers, setChantiers] = reactExports.useState([]);
  const [clients, setClients] = reactExports.useState([]);
  const [absences, setAbsences] = reactExports.useState([]);
  const [affectations, setAffectations] = reactExports.useState([]);
  const [absenceModal, setAbsenceModal] = reactExports.useState(null);
  const [assignModal, setAssignModal] = reactExports.useState(null);
  const [suggestionFor, setSuggestionFor] = reactExports.useState(null);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [activeDay, setActiveDay] = reactExports.useState(() => fmtDate(/* @__PURE__ */ new Date()));
  const [editEmpId, setEditEmpId] = reactExports.useState(null);
  const [dragActive, setDragActive] = reactExports.useState(null);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }));
  const reload = reactExports.useCallback(() => {
    setEmployes(loadEmployesRH().filter((e) => e.actif));
    setChantiers(loadChantiers());
    setClients(loadClients());
    setAbsences(loadAbsences());
    setAffectations(loadAffectations());
  }, []);
  reactExports.useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);
  reactExports.useEffect(() => {
    const run = async () => {
      const ch = loadChantiers();
      const cl = loadClients();
      const em = loadEmployesRH();
      for (const c of ch) {
        if (c.latitude == null || c.longitude == null) {
          const client = cl.find((x) => x.id === c.client_id);
          if (client?.adresse) {
            const coords = await geocodeAdresse(client.adresse);
            if (coords) updateChantier(c.id, {
              latitude: coords.lat,
              longitude: coords.lon
            });
          }
        }
      }
      for (const e of em) {
        if ((e.latitude_domicile == null || e.longitude_domicile == null) && e.salarie_adresse) {
          const coords = await geocodeAdresse(e.salarie_adresse);
          if (coords) updateEmployeRH(e.id, {
            latitude_domicile: coords.lat,
            longitude_domicile: coords.lon
          });
        }
      }
      reload();
    };
    run();
  }, []);
  const days = semaineDays(weekStart);
  const weekDates = days.map(fmtDate);
  const cellMap = affsByCell(affectations);
  const chantiersActifs = chantiers.filter((c) => c.statut === "devis_signe" || c.statut === "travaux_en_cours");
  function clientNom(id) {
    return clients.find((c) => c.id === id)?.nom ?? "—";
  }
  function handleDragStart(ev) {
    setDragActive(ev.active.data.current);
  }
  function handleDragEnd(ev) {
    setDragActive(null);
    const drop = ev.over?.data.current;
    if (!drop) return;
    const drag = ev.active.data.current;
    applyAffectation(drag, drop.salarieId, drop.date);
  }
  function applyAffectation(drag, salarieId, date) {
    if (drag.kind === "move") {
      removeAffectation(drag.affectationId);
      addAffectation({
        chantier_id: drag.chantierId,
        salarie_id: salarieId,
        date
      });
    } else {
      const existe = affectations.some((a) => a.salarie_id === salarieId && a.date === date && a.chantier_id === drag.chantierId);
      if (!existe) addAffectation({
        chantier_id: drag.chantierId,
        salarie_id: salarieId,
        date
      });
    }
    reload();
    window.dispatchEvent(new Event(DATA_EVENT));
  }
  function supprimerAff(id) {
    removeAffectation(id);
    reload();
    window.dispatchEvent(new Event(DATA_EVENT));
  }
  function dupliquerSemainePrecedente() {
    const prevDates = semaineDays(subWeeks(weekStart)).map(fmtDate);
    const affsPrev = loadAffectations().filter((a) => prevDates.includes(a.date));
    const absNow = loadAbsences();
    const affsNow = loadAffectations();
    let ajoutees = 0;
    for (const a of affsPrev) {
      const newDate = fmtDate(addDays(parseISO(a.date), 7));
      if (isAbsent(a.salarie_id, newDate, absNow)) continue;
      const existe = affsNow.some((x) => x.salarie_id === a.salarie_id && x.date === newDate && x.chantier_id === a.chantier_id);
      if (!existe) {
        addAffectation({
          chantier_id: a.chantier_id,
          salarie_id: a.salarie_id,
          date: newDate
        });
        ajoutees++;
      }
    }
    reload();
    toast.success(`${ajoutees} affectation${ajoutees > 1 ? "s" : ""} dupliquée${ajoutees > 1 ? "s" : ""}`);
  }
  function envoyerPlanning() {
    const label = `${format(days[0], "dd/MM", {
      locale: fr
    })} – ${format(days[5], "dd/MM/yyyy", {
      locale: fr
    })}`;
    let corps = `Planning semaine du ${label}

`;
    for (const emp of employes) {
      const lignes = [];
      for (const d of days) {
        const ds = fmtDate(d);
        const affs = cellMap.get(`${emp.id}|${ds}`) ?? [];
        if (affs.length) {
          const noms = affs.map((a) => {
            const ch = chantiers.find((c) => c.id === a.chantier_id);
            return ch ? `${ch.nature_travaux} (${clientNom(ch.client_id)})` : "—";
          }).join(", ");
          lignes.push(`  ${format(d, "EEE dd/MM", {
            locale: fr
          })}: ${noms}`);
        }
      }
      if (lignes.length) corps += `${emp.prenom} ${emp.nom}:
${lignes.join("\n")}

`;
    }
    window.open(`mailto:?subject=${encodeURIComponent(`Planning semaine ${label}`)}&body=${encodeURIComponent(corps)}`, "_blank");
  }
  function ouvrirSuggestions(chantier, date) {
    setSuggestions(scorerSalaries(chantier, date, weekDates, employes, affectations, absences));
    setSuggestionFor({
      chantier,
      date
    });
  }
  function accepterSuggestion(item) {
    if (!suggestionFor) return;
    applyAffectation({
      kind: "new",
      chantierId: suggestionFor.chantier.id
    }, item.employe.id, suggestionFor.date);
    setSuggestionFor(null);
    toast.success(`${item.employe.prenom} ${item.employe.nom} affecté(e)`);
  }
  const labelSemaine = `${format(days[0], "dd MMM", {
    locale: fr
  })} – ${format(days[5], "dd MMM yyyy", {
    locale: fr
  })}`;
  if (employes.length === 0 && chantiers.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EtatVide, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DndContext, { sensors, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display", style: {
            fontSize: 22,
            fontWeight: 700,
            color: "#1A1714",
            lineHeight: 1.2
          }, children: "Planning chantiers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
            fontSize: 13,
            color: "#8B847D",
            marginTop: 2
          }, children: [
            "Glissez les chantiers sur les salariés · Semaine du ",
            labelSemaine
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          flex: 1
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 6
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBtn, { onClick: () => setWeekStart((w) => subWeeks(w)), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekStart(startOfWeek(/* @__PURE__ */ new Date(), {
            weekStartsOn: 1
          })), style: {
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            background: "#E2001A",
            color: "white",
            border: "none",
            cursor: "pointer"
          }, children: "Aujourd'hui" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavBtn, { onClick: () => setWeekStart((w) => addWeeks(w, 1)), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: dupliquerSemainePrecedente, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }), label: "Dupliquer sem. préc." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: envoyerPlanning, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }), label: "Envoyer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          display: "flex",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #E5E0DA"
        }, children: ["grille", "carte"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView(v), style: {
          padding: "5px 14px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          background: view === v ? "#E2001A" : "white",
          color: view === v ? "white" : "#4A453F",
          border: "none"
        }, children: v === "grille" ? "Grille" : "Carte" }, v)) })
      ] }),
      view === "grille" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PanneauChantiers, { chantiers: chantiersActifs, clients, affectations, onSuggestion: ouvrirSuggestions, weekDates }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          flex: 1,
          overflowX: "auto"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: {
          borderCollapse: "collapse",
          width: "100%",
          minWidth: 520
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: {
              width: 140,
              textAlign: "left",
              padding: "6px 8px",
              fontSize: 12,
              color: "#8B847D",
              fontWeight: 600,
              borderBottom: "2px solid #E5E0DA"
            }, children: "Salarié" }),
            days.map((d) => {
              const ds = fmtDate(d);
              const isToday = isSameDay(d, /* @__PURE__ */ new Date());
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { style: {
                padding: "6px 4px",
                fontSize: 11,
                fontWeight: 700,
                textAlign: "center",
                color: isToday ? "#E2001A" : "#4A453F",
                borderBottom: `2px solid ${isToday ? "#E2001A" : "#E5E0DA"}`,
                minWidth: 80
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: format(d, "EEE", {
                  locale: fr
                }).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  fontWeight: 400,
                  fontSize: 11
                }, children: format(d, "dd/MM") })
              ] }, ds);
            })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            employes.map((emp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: {
              background: idx % 2 === 0 ? "white" : "#FAF8F5"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: {
                padding: "4px 8px",
                borderBottom: "1px solid #F0EBE5",
                verticalAlign: "middle"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 7
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: couleurEmp(emp.id, emp.couleur),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700
                  }, children: initiales(emp.nom, emp.prenom) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1A1714",
                      lineHeight: 1.2
                    }, children: [
                      emp.prenom,
                      " ",
                      emp.nom
                    ] }),
                    emp.metier && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                      fontSize: 10,
                      color: "#8B847D"
                    }, children: emp.metier })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditEmpId(emp.id), title: "Paramétrer", style: {
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#C5BDB5",
                    padding: 2
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 12 }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAbsenceModal(emp), style: {
                  marginTop: 3,
                  fontSize: 9,
                  color: "#8B847D",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 2px"
                }, children: "+ Absence" })
              ] }),
              days.map((d) => {
                const ds = fmtDate(d);
                const abs = isAbsent(emp.id, ds, absences);
                const affs = cellMap.get(`${emp.id}|${ds}`) ?? [];
                return /* @__PURE__ */ jsxRuntimeExports.jsx(GridCell, { salarieId: emp.id, date: ds, absente: abs, affectations: affs, chantiers, clients, employe: emp, onRemove: supprimerAff, onTap: () => setAssignModal({
                  salarieId: emp.id,
                  date: ds
                }) }, ds);
              })
            ] }, emp.id)),
            employes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: {
              padding: 32,
              textAlign: "center",
              color: "#8B847D",
              fontSize: 13
            }, children: "Aucun salarié actif — ajoutez des salariés dans le module RH" }) })
          ] })
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CarteView, { chantiers: chantiersActifs, clients, employes, affectations, activeDay, onDayChange: setActiveDay, days })
    ] }),
    absenceModal && /* @__PURE__ */ jsxRuntimeExports.jsx(AbsenceModal, { employe: absenceModal, onClose: () => setAbsenceModal(null), onSave: (data) => {
      addAbsence({
        salarie_id: absenceModal.id,
        ...data
      });
      reload();
      setAbsenceModal(null);
      toast.success("Absence enregistrée");
    } }),
    assignModal && /* @__PURE__ */ jsxRuntimeExports.jsx(AssignModal, { salarieId: assignModal.salarieId, date: assignModal.date, employes, chantiers: chantiersActifs, clients, affectations, absences, onAssign: (chantierId) => {
      applyAffectation({
        kind: "new",
        chantierId
      }, assignModal.salarieId, assignModal.date);
      setAssignModal(null);
    }, onClose: () => setAssignModal(null) }),
    suggestionFor && /* @__PURE__ */ jsxRuntimeExports.jsx(SuggestionPanel, { chantier: suggestionFor.chantier, date: suggestionFor.date, suggestions, onAccept: accepterSuggestion, onClose: () => setSuggestionFor(null) }),
    editEmpId && employes.find((e) => e.id === editEmpId) && /* @__PURE__ */ jsxRuntimeExports.jsx(EditEmployeModal, { employe: employes.find((e) => e.id === editEmpId), onClose: () => setEditEmpId(null), onSave: (data) => {
      updateEmployeRH(editEmpId, data);
      reload();
      setEditEmpId(null);
      toast.success("Salarié mis à jour");
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AbsenceFloatingList, { absences, employes, onRemove: (id) => {
      removeAbsence(id);
      reload();
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DragOverlay, { children: dragActive && dragActive.kind === "new" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      background: "#E2001A",
      color: "white",
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      boxShadow: "0 4px 12px rgba(0,0,0,.2)"
    }, children: chantiers.find((c) => c.id === dragActive.chantierId)?.nature_travaux ?? "Chantier" }) })
  ] });
}
function NavBtn({
  onClick,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, style: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    border: "1px solid #E5E0DA",
    cursor: "pointer",
    color: "#4A453F"
  }, children: icon });
}
function ActionBtn({
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, style: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    background: "white",
    border: "1px solid #E5E0DA",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    color: "#4A453F"
  }, children: [
    icon,
    label
  ] });
}
function GridCell({
  salarieId,
  date,
  absente,
  affectations,
  chantiers,
  clients,
  employe,
  onRemove,
  onTap
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: `cell-${salarieId}-${date}`,
    data: {
      salarieId,
      date
    }
  });
  const hasConflict = affectations.length > 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { ref: setNodeRef, style: {
    padding: 3,
    borderBottom: "1px solid #F0EBE5",
    verticalAlign: "top",
    minWidth: 80,
    background: isOver ? "rgba(226,0,26,.06)" : absente ? "rgba(139,132,125,.06)" : "transparent",
    transition: "background .15s",
    cursor: absente ? "default" : "pointer"
  }, onClick: absente ? void 0 : onTap, children: absente ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 6px",
    borderRadius: 5,
    background: "rgba(139,132,125,.12)"
  }, title: `Absent – ${MOTIFS[absente.motif]}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 11, style: {
      color: "#8B847D",
      flexShrink: 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
      fontSize: 10,
      color: "#8B847D"
    }, children: MOTIFS[absente.motif] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  }, children: [
    affectations.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AffectationPill, { affectation: a, chantier: chantiers.find((c) => c.id === a.chantier_id), client: clients.find((c) => c.id === chantiers.find((x) => x.id === a.chantier_id)?.client_id), employe, conflict: hasConflict, onRemove: () => onRemove(a.id) }, a.id)),
    affectations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      height: 28,
      borderRadius: 5,
      border: "1px dashed #D5CFC8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#C5BDB5"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }) })
  ] }) });
}
function AffectationPill({
  affectation,
  chantier,
  client,
  employe,
  conflict,
  onRemove
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `aff-${affectation.id}`,
    data: {
      kind: "move",
      affectationId: affectation.id,
      chantierId: affectation.chantier_id
    }
  });
  let dist = null;
  if (employe.latitude_domicile && employe.longitude_domicile && chantier?.latitude && chantier?.longitude) {
    dist = fmtDist(haversineKm(employe.latitude_domicile, employe.longitude_domicile, chantier.latitude, chantier.longitude));
  }
  const conflitMetier = chantier?.metier_requis && employe.metier && chantier.metier_requis !== employe.metier;
  const couleur = chantier ? couleurEmp(chantier.id) : "#8B847D";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, ...listeners, ...attributes, style: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 6px",
    borderRadius: 5,
    background: `${couleur}18`,
    border: `1px solid ${conflict || conflitMetier ? "#FB8C00" : couleur}44`,
    fontSize: 10,
    cursor: "grab",
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Translate.toString(transform),
    userSelect: "none"
  }, title: chantier?.nature_travaux ?? "", children: [
    (conflict || conflitMetier) && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 9, style: {
      color: "#FB8C00",
      flexShrink: 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
      color: couleur,
      fontWeight: 700,
      flexShrink: 0,
      fontSize: 9
    }, children: client?.nom?.slice(0, 6) ?? "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
      color: "#4A453F",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: 56
    }, children: chantier?.nature_travaux?.slice(0, 10) ?? "—" }),
    dist && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
      color: "#8B847D",
      fontSize: 9,
      flexShrink: 0
    }, children: [
      "·",
      dist
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
      e.stopPropagation();
      onRemove();
    }, style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#C5BDB5",
      padding: 0,
      lineHeight: 1
    }, title: "Retirer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10 }) })
  ] });
}
function PanneauChantiers({
  chantiers,
  clients,
  affectations,
  onSuggestion,
  weekDates
}) {
  const today = fmtDate(/* @__PURE__ */ new Date());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    width: 200,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#8B847D",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      padding: "0 4px 4px"
    }, children: "Chantiers actifs" }),
    chantiers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: 12,
      color: "#8B847D",
      padding: "8px 4px"
    }, children: "Aucun chantier signé" }),
    chantiers.map((ch) => {
      const nom = clients.find((c) => c.id === ch.client_id)?.nom ?? "—";
      const totalSem = affectations.filter((a) => a.chantier_id === ch.id && weekDates.includes(a.date)).length;
      const requis = ch.nb_personnes_requises ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ChantierCard, { chantier: ch, clientNom: nom, totalSemaine: totalSem, requiSemaine: requis, onSuggestion: () => onSuggestion(ch, today) }, ch.id);
    })
  ] });
}
function ChantierCard({
  chantier,
  clientNom,
  totalSemaine,
  requiSemaine,
  onSuggestion
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `ch-${chantier.id}`,
    data: {
      kind: "new",
      chantierId: chantier.id
    }
  });
  const couleur = couleurEmp(chantier.id);
  const ok = requiSemaine === 0 || totalSemaine >= requiSemaine;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, ...listeners, ...attributes, style: {
    padding: "7px 9px",
    borderRadius: 8,
    cursor: "grab",
    background: "white",
    border: `1.5px solid ${couleur}44`,
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Translate.toString(transform),
    boxShadow: "0 1px 4px rgba(0,0,0,.04)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 6
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: couleur,
        flexShrink: 0,
        marginTop: 3
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        flex: 1,
        minWidth: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: 11,
          fontWeight: 700,
          color: "#1A1714",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }, children: clientNom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: 10,
          color: "#8B847D",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }, children: chantier.nature_travaux }),
        chantier.metier_requis && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: 9,
          color: couleur,
          fontWeight: 600,
          marginTop: 1
        }, children: chantier.metier_requis })
      ] })
    ] }),
    requiSemaine > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      marginTop: 5,
      display: "flex",
      alignItems: "center",
      gap: 5
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        flex: 1,
        height: 3,
        background: "#F0EBE5",
        borderRadius: 2
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: `${Math.min(100, totalSemaine / requiSemaine * 100)}%`,
        height: "100%",
        borderRadius: 2,
        background: ok ? "#43A047" : "#E2001A"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
        fontSize: 9,
        color: ok ? "#43A047" : "#E2001A",
        fontWeight: 700
      }, children: [
        totalSemaine,
        "/",
        requiSemaine
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onPointerDown: (e) => e.stopPropagation(), onClick: (e) => {
      e.stopPropagation();
      onSuggestion();
    }, style: {
      marginTop: 5,
      width: "100%",
      padding: "2px 0",
      borderRadius: 5,
      fontSize: 9,
      fontWeight: 600,
      background: "rgba(226,0,26,.07)",
      border: "none",
      color: "#E2001A",
      cursor: "pointer"
    }, children: "Suggestions IA" })
  ] });
}
function SuggestionPanel({
  chantier,
  date,
  suggestions,
  onAccept,
  onClose
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 20px 60px rgba(0,0,0,.25)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display", style: {
          fontSize: 17,
          fontWeight: 700,
          color: "#1A1714"
        }, children: "Suggestions IA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
          fontSize: 12,
          color: "#8B847D",
          marginTop: 2
        }, children: [
          chantier.nature_travaux,
          " · ",
          format(parseISO(date), "dd MMMM", {
            locale: fr
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#8B847D"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    suggestions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
      fontSize: 13,
      color: "#8B847D",
      textAlign: "center",
      padding: "20px 0"
    }, children: "Aucun salarié disponible ce jour" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }, children: suggestions.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: 10,
      border: `1.5px solid ${i === 0 ? "#E2001A" : "#E5E0DA"}`,
      background: i === 0 ? "rgba(226,0,26,.04)" : "white"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        background: item.couleur,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 12,
        fontWeight: 700
      }, children: initiales(item.employe.nom, item.employe.prenom) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        flex: 1,
        minWidth: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          fontSize: 13,
          fontWeight: 600,
          color: "#1A1714"
        }, children: [
          item.employe.prenom,
          " ",
          item.employe.nom,
          i === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            marginLeft: 6,
            fontSize: 10,
            color: "#E2001A",
            fontWeight: 700
          }, children: "Recommandé" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: 11,
          color: "#8B847D",
          marginTop: 2
        }, children: item.raisons.join(" · ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          marginTop: 3,
          height: 3,
          borderRadius: 2,
          background: "#F0EBE5"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          height: "100%",
          borderRadius: 2,
          background: item.couleur,
          width: `${Math.min(100, item.score)}%`
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onAccept(item), style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        flexShrink: 0,
        background: i === 0 ? "#E2001A" : "#F0EBE5",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: i === 0 ? "white" : "#4A453F"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 15 }) })
    ] }, item.employe.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
      fontSize: 11,
      color: "#C5BDB5",
      marginTop: 12,
      textAlign: "center"
    }, children: "Score : métier · distance domicile/chantier · charge hebdomadaire" })
  ] }) });
}
function AbsenceModal({
  employe,
  onClose,
  onSave
}) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [debut, setDebut] = reactExports.useState(today);
  const [fin, setFin] = reactExports.useState(today);
  const [motif, setMotif] = reactExports.useState("conges");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "white",
    borderRadius: "16px 16px 0 0",
    padding: 24,
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 -4px 40px rgba(0,0,0,.2)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 16,
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display", style: {
        fontSize: 16,
        fontWeight: 700
      }, children: [
        "Absence — ",
        employe.prenom,
        " ",
        employe.nom
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#8B847D"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
          fontSize: 12,
          fontWeight: 600,
          color: "#4A453F",
          display: "block",
          marginBottom: 4
        }, children: "Début" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: debut, onChange: (e) => setDebut(e.target.value), style: {
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1.5px solid #E5E0DA",
          fontSize: 13
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
          fontSize: 12,
          fontWeight: 600,
          color: "#4A453F",
          display: "block",
          marginBottom: 4
        }, children: "Fin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: fin, onChange: (e) => setFin(e.target.value), style: {
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1.5px solid #E5E0DA",
          fontSize: 13
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#4A453F",
        display: "block",
        marginBottom: 4
      }, children: "Motif" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: motif, onChange: (e) => setMotif(e.target.value), style: {
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1.5px solid #E5E0DA",
        fontSize: 13
      }, children: Object.entries(MOTIFS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v }, k)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSave({
      date_debut: debut,
      date_fin: fin,
      motif
    }), style: {
      width: "100%",
      padding: "10px 0",
      borderRadius: 10,
      background: "#E2001A",
      color: "white",
      fontWeight: 700,
      fontSize: 14,
      border: "none",
      cursor: "pointer"
    }, children: "Enregistrer l'absence" })
  ] }) });
}
function AssignModal({
  salarieId,
  date,
  employes,
  chantiers,
  clients,
  affectations,
  absences,
  onAssign,
  onClose
}) {
  const emp = employes.find((e) => e.id === salarieId);
  const abs = isAbsent(salarieId, date, absences);
  const dejaChantiers = affectations.filter((a) => a.salarie_id === salarieId && a.date === date).map((a) => a.chantier_id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "white",
    borderRadius: "16px 16px 0 0",
    padding: 20,
    width: "100%",
    maxWidth: 480,
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 -4px 40px rgba(0,0,0,.2)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14,
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display", style: {
          fontSize: 15,
          fontWeight: 700
        }, children: [
          "Affecter ",
          emp?.prenom,
          " ",
          emp?.nom
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
          fontSize: 12,
          color: "#8B847D"
        }, children: format(parseISO(date), "EEEE dd MMMM", {
          locale: fr
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#8B847D"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    abs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      padding: "8px 12px",
      borderRadius: 8,
      background: "rgba(139,132,125,.1)",
      marginBottom: 12,
      fontSize: 12,
      color: "#4A453F"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 12, style: {
        display: "inline",
        marginRight: 4
      } }),
      "Salarié absent (",
      MOTIFS[abs.motif],
      ")"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }, children: chantiers.map((ch) => {
      const nom = clients.find((c) => c.id === ch.client_id)?.nom ?? "—";
      const dejaAffecte = dejaChantiers.includes(ch.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => !dejaAffecte && onAssign(ch.id), style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        background: dejaAffecte ? "rgba(67,160,71,.08)" : "white",
        border: `1.5px solid ${dejaAffecte ? "#43A047" : "#E5E0DA"}`,
        cursor: dejaAffecte ? "default" : "pointer",
        textAlign: "left"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: couleurEmp(ch.id),
          flexShrink: 0
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          flex: 1
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1714"
          }, children: nom }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            fontSize: 11,
            color: "#8B847D"
          }, children: ch.nature_travaux })
        ] }),
        dejaAffecte && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14, style: {
          color: "#43A047"
        } })
      ] }, ch.id);
    }) })
  ] }) });
}
function EditEmployeModal({
  employe,
  onClose,
  onSave
}) {
  const [metier, setMetier] = reactExports.useState(employe.metier ?? "");
  const [couleur, setCouleur] = reactExports.useState(employe.couleur ?? couleurEmp(employe.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 16,
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display", style: {
        fontSize: 16,
        fontWeight: 700
      }, children: [
        employe.prenom,
        " ",
        employe.nom
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#8B847D"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
      fontSize: 12,
      fontWeight: 600,
      color: "#4A453F",
      display: "block",
      marginBottom: 4
    }, children: "Métier / spécialité" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: metier, onChange: (e) => setMetier(e.target.value), style: {
      width: "100%",
      padding: "8px 10px",
      borderRadius: 8,
      border: "1.5px solid #E5E0DA",
      fontSize: 13,
      marginBottom: 12
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Non renseigné —" }),
      METIERS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: {
      fontSize: 12,
      fontWeight: 600,
      color: "#4A453F",
      display: "block",
      marginBottom: 4
    }, children: "Couleur planning" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap"
    }, children: PALETTE.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCouleur(c), style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: c,
      border: "none",
      cursor: "pointer",
      outline: couleur === c ? `3px solid ${c}` : "none",
      outlineOffset: 2
    } }, c)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSave({
      metier: metier || null,
      couleur
    }), style: {
      width: "100%",
      padding: "10px 0",
      borderRadius: 10,
      background: "#E2001A",
      color: "white",
      fontWeight: 700,
      fontSize: 14,
      border: "none",
      cursor: "pointer"
    }, children: "Enregistrer" })
  ] }) });
}
function AbsenceFloatingList({
  absences,
  employes,
  onRemove
}) {
  const [open, setOpen] = reactExports.useState(false);
  if (absences.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 50
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen((o) => !o), style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      borderRadius: 24,
      background: "white",
      border: "1.5px solid #E5E0DA",
      boxShadow: "0 4px 16px rgba(0,0,0,.1)",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      color: "#4A453F"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 14, style: {
        color: "#8B847D"
      } }),
      absences.length,
      " absence",
      absences.length > 1 ? "s" : ""
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      position: "absolute",
      bottom: 48,
      right: 0,
      background: "white",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,.15)",
      width: 280,
      border: "1px solid #E5E0DA"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#8B847D",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 8
      }, children: "Absences enregistrées" }),
      absences.map((a) => {
        const emp = employes.find((e) => e.id === a.salarie_id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 0",
          borderBottom: "1px solid #F0EBE5"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            flex: 1
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: 12,
              fontWeight: 600,
              color: "#1A1714"
            }, children: emp ? `${emp.prenom} ${emp.nom}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              fontSize: 11,
              color: "#8B847D"
            }, children: [
              MOTIFS[a.motif],
              " · ",
              format(parseISO(a.date_debut), "dd/MM"),
              " → ",
              format(parseISO(a.date_fin), "dd/MM")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRemove(a.id), style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#C5BDB5"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
        ] }, a.id);
      })
    ] })
  ] });
}
function CarteView({
  chantiers,
  clients,
  employes,
  affectations,
  activeDay,
  onDayChange,
  days
}) {
  const chantiersJour = chantiers.filter((ch) => affectations.some((a) => a.chantier_id === ch.id && a.date === activeDay));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }, children: days.map((d) => {
      const ds = fmtDate(d);
      const active = ds === activeDay;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onDayChange(ds), style: {
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        border: "none",
        background: active ? "#E2001A" : "white",
        color: active ? "white" : "#4A453F",
        boxShadow: active ? "0 2px 8px rgba(226,0,26,.3)" : "0 1px 3px rgba(0,0,0,.06)"
      }, children: format(d, "EEE dd", {
        locale: fr
      }) }, ds);
    }) }),
    chantiersJour.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      padding: 32,
      textAlign: "center",
      color: "#8B847D",
      fontSize: 13,
      background: "white",
      borderRadius: 12
    }, children: "Aucun chantier planifié ce jour" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 12
    }, children: chantiersJour.map((ch) => {
      const client = clients.find((c) => c.id === ch.client_id);
      const equipe = affectations.filter((a) => a.chantier_id === ch.id && a.date === activeDay).map((a) => employes.find((e) => e.id === a.salarie_id)).filter(Boolean);
      const adresse = client?.adresse;
      const gmaps = adresse ? `https://www.google.com/maps/search/${encodeURIComponent(adresse)}` : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "white",
        borderRadius: 12,
        padding: 16,
        border: "1.5px solid #E5E0DA",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 10
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: couleurEmp(ch.id),
            flexShrink: 0,
            marginTop: 3
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            flex: 1
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display", style: {
              fontSize: 14,
              fontWeight: 700,
              color: "#1A1714"
            }, children: client?.nom ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: 12,
              color: "#8B847D"
            }, children: ch.nature_travaux }),
            ch.metier_requis && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: 11,
              color: couleurEmp(ch.id),
              fontWeight: 600,
              marginTop: 1
            }, children: ch.metier_requis })
          ] })
        ] }),
        adresse && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          marginBottom: 10
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, style: {
            color: "#8B847D",
            flexShrink: 0,
            marginTop: 1
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            fontSize: 12,
            color: "#4A453F"
          }, children: adresse })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          marginBottom: 10
        }, children: equipe.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px",
          borderRadius: 20,
          background: `${couleurEmp(emp.id, emp.couleur)}18`,
          border: `1px solid ${couleurEmp(emp.id, emp.couleur)}33`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: couleurEmp(emp.id, emp.couleur)
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: {
            fontSize: 11,
            fontWeight: 600,
            color: "#4A453F"
          }, children: [
            emp.prenom,
            " ",
            emp.nom
          ] })
        ] }, emp.id)) }),
        gmaps && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: gmaps, target: "_blank", rel: "noopener noreferrer", style: {
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontWeight: 700,
          color: "#E2001A",
          textDecoration: "none"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 11 }),
          "Ouvrir dans Google Maps"
        ] })
      ] }, ch.id);
    }) })
  ] });
}
function EtatVide() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    gap: 12
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 48, style: {
      color: "#C5BDB5"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display", style: {
      fontSize: 20,
      fontWeight: 700,
      color: "#1A1714"
    }, children: "Aucune donnée à afficher" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
      fontSize: 13,
      color: "#8B847D",
      textAlign: "center",
      maxWidth: 320
    }, children: [
      "Ajoutez des salariés dans ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "RH & Juridique" }),
      " et des chantiers dans ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "PV & Devis" }),
      " pour commencer le planning."
    ] })
  ] });
}
export {
  PlanningPage as component
};
