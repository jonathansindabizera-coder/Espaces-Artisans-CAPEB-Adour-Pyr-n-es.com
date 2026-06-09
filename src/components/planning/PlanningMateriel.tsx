import { useState, useEffect, useCallback } from "react";
import { addDays, format, isSameDay, parseISO, subWeeks, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, X, AlertTriangle, ChevronLeft, ChevronRight, Truck, Wrench, Package } from "lucide-react";
import { toast } from "sonner";
import {
  type Ressource, type AffectationRessource, type Chantier, type Client,
  loadRessources, addRessource, removeRessource,
  loadAffectationsRessources, addAffectationRessource, removeAffectationRessource,
  loadChantiers, loadClients, DATA_EVENT,
} from "@/lib/local-data";

const TYPE_LABELS: Record<Ressource["type"], string> = {
  vehicule: "Véhicules",
  machine: "Machines",
  outillage: "Outillage",
};

const TYPE_ICON: Record<Ressource["type"], React.ElementType> = {
  vehicule: Truck,
  machine: Wrench,
  outillage: Package,
};

const PALETTE = ["#E2001A","#1E88E5","#43A047","#FB8C00","#8E24AA","#00897B","#F4511E","#3949AB","#6D4C41","#00838F"];
function couleurChantier(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function semaineDays(weekStart: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
}
function fmtDate(d: Date) { return format(d, "yyyy-MM-dd"); }

export function PlanningMateriel({
  weekStart,
  onWeekChange,
}: {
  weekStart: Date;
  onWeekChange: (d: Date) => void;
}) {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [affectations, setAffectations] = useState<AffectationRessource[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [assignCell, setAssignCell] = useState<{ ressourceId: string; date: string } | null>(null);

  const reload = useCallback(() => {
    setRessources(loadRessources().filter(r => r.actif));
    setAffectations(loadAffectationsRessources());
    setChantiers(loadChantiers());
    setClients(loadClients());
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(DATA_EVENT, reload);
    return () => window.removeEventListener(DATA_EVENT, reload);
  }, [reload]);

  const days = semaineDays(weekStart);
  const chantiersActifs = chantiers.filter(c => c.statut === "devis_signe" || c.statut === "travaux_en_cours");

  function affForCell(ressourceId: string, date: string) {
    return affectations.find(a => a.ressource_id === ressourceId && a.date === date);
  }
  function isDoubleResa(ressourceId: string, date: string) {
    return affectations.filter(a => a.ressource_id === ressourceId && a.date === date).length > 1;
  }

  const grouped: Record<Ressource["type"], Ressource[]> = { vehicule: [], machine: [], outillage: [] };
  for (const r of ressources) grouped[r.type].push(r);

  const labelSem = `${format(days[0], "dd MMM", { locale: fr })} – ${format(days[5], "dd MMM yyyy", { locale: fr })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#1A1714" }}>Matériel</h2>
          <p style={{ fontSize: 13, color: "#8B847D", marginTop: 2 }}>Véhicules & machines · {labelSem}</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => onWeekChange(subWeeks(weekStart, 1))} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E0DA", cursor: "pointer", color: "#4A453F" }}><ChevronLeft size={16} /></button>
        <button onClick={() => onWeekChange(addWeeks(weekStart, 1))} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E0DA", cursor: "pointer", color: "#4A453F" }}><ChevronRight size={16} /></button>
        <button onClick={() => setAddModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "#E2001A", color: "white", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          <Plus size={14} />Ajouter
        </button>
      </div>

      {ressources.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#8B847D", fontSize: 13, background: "white", borderRadius: 12, border: "1.5px solid #E5E0DA" }}>
          Aucune ressource — cliquez sur "Ajouter" pour enregistrer un véhicule ou une machine
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ width: 160, textAlign: "left", padding: "6px 10px", fontSize: 12, color: "#8B847D", fontWeight: 600, borderBottom: "2px solid #E5E0DA" }}>Ressource</th>
                {days.map(d => {
                  const isToday = isSameDay(d, new Date());
                  return (
                    <th key={fmtDate(d)} style={{ padding: "6px 4px", fontSize: 11, fontWeight: 700, textAlign: "center", color: isToday ? "#E2001A" : "#4A453F", borderBottom: `2px solid ${isToday ? "#E2001A" : "#E5E0DA"}`, minWidth: 90 }}>
                      <div>{format(d, "EEE", { locale: fr }).toUpperCase()}</div>
                      <div style={{ fontWeight: 400 }}>{format(d, "dd/MM")}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(["vehicule", "machine", "outillage"] as Ressource["type"][]).map(type => {
                const list = grouped[type];
                if (list.length === 0) return null;
                const Icon = TYPE_ICON[type];
                return (
                  <>
                    <tr key={`hdr-${type}`}>
                      <td colSpan={7} style={{ padding: "8px 10px 4px", fontSize: 10, fontWeight: 700, color: "#8B847D", textTransform: "uppercase", letterSpacing: "0.12em", background: "#FAF8F5", display: "table-cell" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icon size={11} />
                          {TYPE_LABELS[type]}
                        </div>
                      </td>
                    </tr>
                    {list.map((res, idx) => (
                      <tr key={res.id} style={{ background: idx % 2 === 0 ? "white" : "#FAF8F5" }}>
                        <td style={{ padding: "5px 10px", borderBottom: "1px solid #F0EBE5", verticalAlign: "middle" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1714" }}>{res.nom}</div>
                          {res.reference && <div style={{ fontSize: 10, color: "#8B847D" }}>{res.reference}</div>}
                          <button
                            onClick={() => { if (confirm(`Supprimer "${res.nom}" ?`)) { removeRessource(res.id); reload(); } }}
                            style={{ fontSize: 9, color: "#C5BDB5", background: "none", border: "none", cursor: "pointer", padding: "1px 0" }}
                          >
                            Supprimer
                          </button>
                        </td>
                        {days.map(d => {
                          const ds = fmtDate(d);
                          const aff = affForCell(res.id, ds);
                          const conflict = isDoubleResa(res.id, ds);
                          const ch = aff ? chantiers.find(c => c.id === aff.chantier_id) : undefined;
                          const client = ch ? clients.find(c => c.id === ch.client_id) : undefined;
                          const couleur = ch ? couleurChantier(ch.id) : "#8B847D";
                          return (
                            <td
                              key={ds}
                              onClick={() => setAssignCell({ ressourceId: res.id, date: ds })}
                              style={{ padding: 3, borderBottom: "1px solid #F0EBE5", verticalAlign: "top", cursor: "pointer" }}
                            >
                              {aff ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 5px", borderRadius: 5, background: `${couleur}18`, border: `1px solid ${conflict ? "#FB8C00" : couleur}44`, fontSize: 10 }}>
                                  {conflict && <AlertTriangle size={9} style={{ color: "#FB8C00", flexShrink: 0 }} />}
                                  <span style={{ color: couleur, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 62 }}>
                                    {client?.nom?.slice(0, 9) ?? "—"}
                                  </span>
                                  <button
                                    onClick={e => { e.stopPropagation(); removeAffectationRessource(aff.id); reload(); }}
                                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#C5BDB5", padding: 0, lineHeight: 1 }}
                                  >
                                    <X size={9} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ height: 26, borderRadius: 5, border: "1px dashed #D5CFC8", display: "flex", alignItems: "center", justifyContent: "center", color: "#C5BDB5" }}>
                                  <Plus size={11} />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {addModal && (
        <AddRessourceModal
          onClose={() => setAddModal(false)}
          onSave={data => { addRessource(data); reload(); setAddModal(false); toast.success("Ressource ajoutée"); }}
        />
      )}

      {assignCell && (
        <AssignRessourceModal
          ressourceId={assignCell.ressourceId}
          date={assignCell.date}
          chantiers={chantiersActifs}
          clients={clients}
          current={affForCell(assignCell.ressourceId, assignCell.date)}
          onAssign={chantierId => {
            const ex = affForCell(assignCell.ressourceId, assignCell.date);
            if (ex) removeAffectationRessource(ex.id);
            addAffectationRessource({ ressource_id: assignCell.ressourceId, chantier_id: chantierId, date: assignCell.date });
            reload();
            setAssignCell(null);
          }}
          onRemove={() => {
            const ex = affForCell(assignCell.ressourceId, assignCell.date);
            if (ex) { removeAffectationRessource(ex.id); reload(); }
            setAssignCell(null);
          }}
          onClose={() => setAssignCell(null)}
        />
      )}
    </div>
  );
}

function AddRessourceModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: Omit<Ressource, "id">) => void;
}) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<Ressource["type"]>("vehicule");
  const [reference, setReference] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>Nouvelle ressource</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Nom</label>
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Camion benne 01" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Type</label>
        <select value={type} onChange={e => setType(e.target.value as Ressource["type"])} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 12 }}>
          <option value="vehicule">Véhicule</option>
          <option value="machine">Machine</option>
          <option value="outillage">Outillage</option>
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A453F", display: "block", marginBottom: 4 }}>Immatriculation / référence (optionnel)</label>
        <input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex: AA-123-BB" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E0DA", fontSize: 13, marginBottom: 16, boxSizing: "border-box" }} />
        <button onClick={() => nom && onSave({ nom, type, reference: reference || null, actif: true })} style={{ width: "100%", padding: "10px 0", borderRadius: 10, background: "#E2001A", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: nom ? "pointer" : "not-allowed", opacity: nom ? 1 : 0.5 }}>
          Ajouter
        </button>
      </div>
    </div>
  );
}

function AssignRessourceModal({ ressourceId, date, chantiers, clients, current, onAssign, onRemove, onClose }: {
  ressourceId: string; date: string;
  chantiers: Chantier[]; clients: Client[];
  current?: AffectationRessource;
  onAssign: (chantierId: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
          <div>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Affecter à un chantier</h3>
            <p style={{ fontSize: 12, color: "#8B847D" }}>{format(parseISO(date), "EEEE dd MMMM", { locale: fr })}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8B847D" }}><X size={18} /></button>
        </div>
        {current && (
          <button onClick={onRemove} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1.5px solid #E5E0DA", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#8B847D", marginBottom: 10 }}>
            Retirer l'affectation actuelle
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {chantiers.length === 0 && <p style={{ fontSize: 13, color: "#8B847D", textAlign: "center", padding: "12px 0" }}>Aucun chantier actif</p>}
          {chantiers.map(ch => {
            const nom = clients.find(c => c.id === ch.client_id)?.nom ?? "—";
            const isSelected = current?.chantier_id === ch.id;
            const couleur = couleurChantier(ch.id);
            return (
              <button key={ch.id} onClick={() => onAssign(ch.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: isSelected ? `${couleur}12` : "white", border: `1.5px solid ${isSelected ? couleur : "#E5E0DA"}`, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: couleur, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1714" }}>{nom}</div>
                  <div style={{ fontSize: 11, color: "#8B847D" }}>{ch.nature_travaux}</div>
                </div>
                {isSelected && <span style={{ fontSize: 10, color: couleur, fontWeight: 700 }}>Sélectionné</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
