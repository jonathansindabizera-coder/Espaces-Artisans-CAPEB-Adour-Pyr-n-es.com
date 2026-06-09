import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  type TacheChantier, type Chantier, type Client, type EmployeRH, type Affectation,
  loadTaches, addTache, updateTache, removeTache,
  loadChantiers, loadClients, loadEmployesRH, loadAffectations, DATA_EVENT,
} from "@/lib/local-data";

export function PlanningTaches({ weekStart }: { weekStart: Date }) {
  const [taches, setTaches] = useState<TacheChantier[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employes, setEmployes] = useState<EmployeRH[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);

  const [selectedChantier, setSelectedChantier] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newDesc, setNewDesc] = useState("");
  const [newSalarie, setNewSalarie] = useState("");
  const [modeCarnet, setModeCarnet] = useState(false);

  const reload = useCallback(() => {
    setTaches(loadTaches());
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

  const chantiersActifs = chantiers.filter(c => c.statut === "devis_signe" || c.statut === "travaux_en_cours");

  function clientNom(ch: Chantier) {
    return clients.find(c => c.id === ch.client_id)?.nom ?? "—";
  }

  const tachesFiltrees = taches.filter(t =>
    (!selectedChantier || t.chantier_id === selectedChantier) &&
    t.date === selectedDate
  );

  // Carnet de route : salariés affectés ce jour avec leurs tâches par chantier
  const carnet = employes.map(emp => {
    const affsJour = affectations.filter(a => a.salarie_id === emp.id && a.date === selectedDate);
    if (affsJour.length === 0) return null;
    return {
      emp,
      chantiers: affsJour.map(a => {
        const ch = chantiers.find(c => c.id === a.chantier_id);
        const tachesCh = taches.filter(t => t.chantier_id === a.chantier_id && t.date === selectedDate);
        return { ch, client: ch ? clients.find(c => c.id === ch.client_id) : null, taches: tachesCh };
      }),
    };
  }).filter(Boolean) as { emp: EmployeRH; chantiers: { ch?: Chantier; client?: Client | null; taches: TacheChantier[] }[] }[];

  function ajouterTache() {
    if (!newDesc.trim()) { toast.error("Saisissez une description"); return; }
    if (!selectedChantier) { toast.error("Sélectionnez un chantier"); return; }
    addTache({ chantier_id: selectedChantier, date: selectedDate, description: newDesc.trim(), fait: false, salarie_id: newSalarie || null });
    setNewDesc("");
    reload();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#1A1714" }}>Tâches & Carnet de route</h2>
          <p style={{ fontSize: 13, color: "#8B847D", marginTop: 2 }}>Planifiez les tâches et générez le carnet de route du jour</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid #E5E0DA" }}>
          <button onClick={() => setModeCarnet(false)} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: !modeCarnet ? "#E2001A" : "white", color: !modeCarnet ? "white" : "#4A453F", border: "none" }}>
            Tâches
          </button>
          <button onClick={() => setModeCarnet(true)} style={{ padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: modeCarnet ? "#E2001A" : "white", color: modeCarnet ? "white" : "#4A453F", border: "none" }}>
            Carnet de route
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ minWidth: 150 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#8B847D", display: "block", marginBottom: 3 }}>Jour</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}
          />
        </div>
        {!modeCarnet && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#8B847D", display: "block", marginBottom: 3 }}>Chantier</label>
            <select value={selectedChantier} onChange={e => setSelectedChantier(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}>
              <option value="">— Choisir un chantier —</option>
              {chantiersActifs.map(ch => (
                <option key={ch.id} value={ch.id}>{clientNom(ch)} — {ch.nature_travaux}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!modeCarnet ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Formulaire ajout */}
          {selectedChantier && (
            <div style={{ display: "flex", gap: 8, background: "white", padding: 12, borderRadius: 12, border: "1.5px solid #E5E0DA", flexWrap: "wrap" }}>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                onKeyDown={e => e.key === "Enter" && ajouterTache()}
                placeholder="Description de la tâche…"
                style={{ flex: 3, minWidth: 180, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}
              />
              <select value={newSalarie} onChange={e => setNewSalarie(e.target.value)} style={{ flex: 1, minWidth: 130, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13 }}>
                <option value="">Tous</option>
                {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </select>
              <button
                onClick={ajouterTache}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#E2001A", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
              >
                <Plus size={14} />Ajouter
              </button>
            </div>
          )}

          {/* Liste */}
          {!selectedChantier ? (
            <div style={{ padding: 24, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA" }}>
              Sélectionnez un chantier ci-dessus
            </div>
          ) : tachesFiltrees.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA" }}>
              Aucune tâche — ajoutez-en une ci-dessus
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {tachesFiltrees.map(t => {
                const emp = employes.find(e => e.id === t.salarie_id);
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "white", borderRadius: 10, border: `1.5px solid ${t.fait ? "#43A047" : "#E5E0DA"}` }}>
                    <button
                      onClick={() => { updateTache(t.id, { fait: !t.fait }); reload(); }}
                      style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: t.fait ? "#43A047" : "transparent", border: `2px solid ${t.fait ? "#43A047" : "#C5BDB5"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      {t.fait && <Check size={12} style={{ color: "white" }} />}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, color: t.fait ? "#8B847D" : "#1A1714", textDecoration: t.fait ? "line-through" : "none" }}>
                      {t.description}
                    </span>
                    {emp && (
                      <span style={{ fontSize: 11, color: "#8B847D", flexShrink: 0 }}>{emp.prenom} {emp.nom}</span>
                    )}
                    <button onClick={() => { removeTache(t.id); reload(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#C5BDB5", flexShrink: 0 }}>
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#8B847D", textAlign: "right", marginTop: 2 }}>
                {tachesFiltrees.filter(t => t.fait).length}/{tachesFiltrees.length} tâche{tachesFiltrees.length > 1 ? "s" : ""} faite{tachesFiltrees.length > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Carnet de route */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#8B847D" }}>
            {format(parseISO(selectedDate), "EEEE dd MMMM yyyy", { locale: fr })} — {carnet.length} salarié{carnet.length > 1 ? "s" : ""} affecté{carnet.length > 1 ? "s" : ""}
          </p>
          {carnet.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA" }}>
              Aucun salarié affecté ce jour — placez des salariés dans la grille
            </div>
          ) : (
            carnet.map(({ emp, chantiers: chsEmp }) => (
              <div key={emp.id} style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid #E5E0DA" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 16 }}>📋</div>
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#1A1714" }}>
                    {emp.prenom} {emp.nom}
                  </div>
                  {emp.metier && <span style={{ fontSize: 10, color: "#E2001A", fontWeight: 600, background: "rgba(226,0,26,.08)", padding: "2px 6px", borderRadius: 20 }}>{emp.metier}</span>}
                </div>
                {chsEmp.map(({ ch, client, taches: tCh }, i) => (
                  <div key={i} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: "3px solid #E5E0DA" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#4A453F", marginBottom: 3 }}>
                      {client?.nom ?? "—"} — {ch?.nature_travaux ?? "—"}
                    </div>
                    {client?.adresse ? (
                      <div style={{ fontSize: 11, color: "#8B847D", marginBottom: 3 }}>
                        📍 {client.adresse}
                      </div>
                    ) : null}
                    {tCh.length === 0 ? (
                      <div style={{ fontSize: 11, color: "#C5BDB5" }}>Aucune tâche planifiée pour ce chantier</div>
                    ) : (
                      tCh.map(t => (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.fait ? "#43A047" : "#E2001A", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: t.fait ? "#8B847D" : "#1A1714", textDecoration: t.fait ? "line-through" : "none" }}>
                            {t.description}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
