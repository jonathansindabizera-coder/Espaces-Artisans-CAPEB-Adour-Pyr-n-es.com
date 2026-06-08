import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Trash2,
  CalendarOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  addDays,
  format,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { proposerReaffectation, type PropositionReaff } from "@/lib/planning-ai.functions";
import { PvDocumentDialog } from "@/components/pv-document";

export const Route = createFileRoute("/_authenticated/planning")({
  head: () => ({ meta: [{ title: "Planning chantiers – CAPEB" }] }),
  component: PlanningPage,
});

type Employe = { id: string; nom: string; role: string | null; couleur: string; actif: boolean };
type Affectation = {
  id: string;
  chantier_id: string;
  employe_id: string;
  date: string;
  demi_journee: "matin" | "apres_midi" | "journee";
};
type Absence = { id: string; employe_id: string; date_debut: string; date_fin: string; motif: string | null };
type Chantier = {
  id: string;
  client_id: string;
  nature_travaux: string;
  duree_estimee: string | null;
  statut: string;
  date_creation: string;
};
type Client = { id: string; nom: string; email: string | null; adresse: string | null };

const PALETTE = ["#E2001A", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#00897B", "#F4511E", "#3949AB"];

function PlanningPage() {
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showSaturday, setShowSaturday] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [assignCell, setAssignCell] = useState<{ employeId: string; date: string } | null>(null);
  const [absenceFor, setAbsenceFor] = useState<Employe | null>(null);
  const [aiProp, setAiProp] = useState<{ prop: PropositionReaff; absence: Absence } | null>(null);
  const [pvFor, setPvFor] = useState<{ chantier: Chantier; client: Client } | null>(null);

  const days = useMemo(
    () => Array.from({ length: showSaturday ? 6 : 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart, showSaturday],
  );
  const dateStrs = days.map((d) => format(d, "yyyy-MM-dd"));

  const { data: employes = [] } = useQuery({
    queryKey: ["employes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employes").select("*").order("nom");
      if (error) throw error;
      return data as Employe[];
    },
  });
  const employesActifs = employes.filter((e) => e.actif);

  const { data: chantiers = [] } = useQuery({
    queryKey: ["chantiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chantiers").select("*");
      if (error) throw error;
      return data as Chantier[];
    },
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, nom, email, adresse");
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: affectations = [] } = useQuery({
    queryKey: ["affectations", dateStrs[0], dateStrs[dateStrs.length - 1]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affectations")
        .select("*")
        .gte("date", dateStrs[0])
        .lte("date", dateStrs[dateStrs.length - 1]);
      if (error) throw error;
      return data as Affectation[];
    },
  });

  const { data: absences = [] } = useQuery({
    queryKey: ["absences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("absences").select("*");
      if (error) throw error;
      return data as Absence[];
    },
  });

  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients]);
  const chantierById = useMemo(() => Object.fromEntries(chantiers.map((c) => [c.id, c])), [chantiers]);
  const employeById = useMemo(() => Object.fromEntries(employes.map((e) => [e.id, e])), [employes]);

  const villeOf = (cl?: Client) => {
    if (!cl?.adresse) return null;
    const parts = cl.adresse.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    return parts[parts.length - 1] || null;
  };

  // Chantiers à planifier : devis_signe ou travaux_en_cours
  const aPlanifier = chantiers.filter((c) =>
    ["devis_signe", "travaux_en_cours"].includes(c.statut),
  );

  // Chantiers terminés à proposer pour PV
  const aFinaliser = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const byChantier = new Map<string, string>();
    affectations.forEach((a) => {
      const cur = byChantier.get(a.chantier_id);
      if (!cur || a.date > cur) byChantier.set(a.chantier_id, a.date);
    });
    return chantiers.filter((c) => {
      if (c.statut !== "travaux_en_cours") return false;
      const last = byChantier.get(c.id);
      return last && last < today;
    });
  }, [chantiers, affectations]);

  const isAbsent = (empId: string, dateStr: string) =>
    absences.some(
      (a) =>
        a.employe_id === empId &&
        isWithinInterval(parseISO(dateStr), {
          start: parseISO(a.date_debut),
          end: parseISO(a.date_fin),
        }),
    );

  // --- Mutations ---
  const upsertAffectation = useMutation({
    mutationFn: async (input: {
      id?: string;
      chantier_id: string;
      employe_id: string;
      date: string;
      demi_journee?: "matin" | "apres_midi" | "journee";
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      if (input.id) {
        const { error } = await supabase
          .from("affectations")
          .update({ employe_id: input.employe_id, date: input.date, demi_journee: input.demi_journee ?? "journee" })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("affectations").insert({
          user_id: u.user.id,
          chantier_id: input.chantier_id,
          employe_id: input.employe_id,
          date: input.date,
          demi_journee: input.demi_journee ?? "journee",
        });
        if (error) throw error;
      }
      // Auto-status : devis_signe → travaux_en_cours
      const ch = chantierById[input.chantier_id];
      if (ch && ch.statut === "devis_signe") {
        await supabase.from("chantiers").update({ statut: "travaux_en_cours" }).eq("id", ch.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affectations"] });
      qc.invalidateQueries({ queryKey: ["chantiers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeAffectation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affectations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["affectations"] }),
  });

  // --- AI proposition au déclenchement d'une absence ---
  const aiCall = useServerFn(proposerReaffectation);

  const declencherIA = async (absence: Absence) => {
    const debut = absence.date_debut;
    const fin = absence.date_fin;
    // chantiers planifiés sur cet employé pendant l'absence
    const { data: affs } = await supabase
      .from("affectations")
      .select("*")
      .eq("employe_id", absence.employe_id)
      .gte("date", debut)
      .lte("date", fin);
    if (!affs || affs.length === 0) return;

    const emp = employeById[absence.employe_id];
    const groupes = new Map<string, Affectation[]>();
    (affs as Affectation[]).forEach((a) => {
      const arr = groupes.get(a.chantier_id) ?? [];
      arr.push(a);
      groupes.set(a.chantier_id, arr);
    });

    const chantiersImpactes = Array.from(groupes.entries()).map(([cid, list]) => {
      const ch = chantierById[cid];
      const cl = ch ? clientById[ch.client_id] : undefined;
      return {
        id: cid,
        client: cl?.nom ?? "Client",
        ville: villeOf(cl),
        nature: ch?.nature_travaux ?? "",
        duree: ch?.duree_estimee ?? null,
        jours: list.map((a) => ({ date: a.date, demi_journee: a.demi_journee, affectationId: a.id })),
      };
    });

    const periodDates: string[] = [];
    for (let d = parseISO(debut); !isBefore(parseISO(fin), d); d = addDays(d, 1)) {
      periodDates.push(format(d, "yyyy-MM-dd"));
    }

    const employesDisponibles = employesActifs
      .filter((e) => e.id !== absence.employe_id)
      .map((e) => {
        const occupiedDates = new Set(
          (affectations as Affectation[])
            .filter((a) => a.employe_id === e.id)
            .map((a) => a.date),
        );
        const absDates = absences
          .filter((a) => a.employe_id === e.id)
          .flatMap((a) => {
            const out: string[] = [];
            for (let d = parseISO(a.date_debut); !isBefore(parseISO(a.date_fin), d); d = addDays(d, 1)) {
              out.push(format(d, "yyyy-MM-dd"));
            }
            return out;
          });
        const absSet = new Set(absDates);
        const joursLibres = periodDates.filter((d) => !occupiedDates.has(d) && !absSet.has(d));
        return { id: e.id, nom: e.nom, role: e.role, joursLibres };
      });

    try {
      const prop = await aiCall({
        data: {
          absence: {
            employeNom: emp?.nom ?? "Employé",
            motif: absence.motif,
            debut,
            fin,
          },
          chantiersImpactes,
          employesDisponibles,
        },
      });
      setAiProp({ prop, absence });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const appliquerProposition = useMutation({
    mutationFn: async () => {
      if (!aiProp) return;
      for (const t of aiProp.prop.transferts) {
        const { error } = await supabase
          .from("affectations")
          .update({
            employe_id: t.nouveauEmployeId,
            date: t.nouvelleDate,
            demi_journee: t.demi_journee,
          })
          .eq("id", t.affectationId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["affectations"] });
      toast.success("Proposition appliquée");
      setAiProp(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const data = active.data.current as
      | { type: "new"; chantierId: string }
      | { type: "move"; affectationId: string; chantierId: string }
      | undefined;
    const target = over.data.current as { employeId: string; date: string } | undefined;
    if (!data || !target) return;
    if (isAbsent(target.employeId, target.date)) {
      toast.error("Cet employé est absent ce jour-là");
      return;
    }
    upsertAffectation.mutate({
      id: data.type === "move" ? data.affectationId : undefined,
      chantier_id: data.chantierId,
      employe_id: target.employeId,
      date: target.date,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Planning chantiers</h1>
          <p className="text-muted-foreground mt-1">
            Affectez vos équipes et anticipez les imprévus.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Switch checked={showSaturday} onCheckedChange={setShowSaturday} id="sat" />
            <Label htmlFor="sat" className="cursor-pointer">Samedi</Label>
          </div>
          <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-display">
                <Users className="h-4 w-4 mr-2" /> Mon équipe
              </Button>
            </DialogTrigger>
            <TeamPanel employes={employes} onClose={() => setTeamOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* AI Card */}
      {aiProp && (
        <Card className="bg-foreground text-background border-0 shadow-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                IA
              </span>
              <span className="font-display uppercase text-sm">Assistant — réorganisation proposée</span>
            </div>
            <p className="text-sm leading-relaxed">{aiProp.prop.resume}</p>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => appliquerProposition.mutate()}
                disabled={appliquerProposition.isPending || aiProp.prop.transferts.length === 0}
              >
                {appliquerProposition.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Appliquer la proposition
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAiProp(null)} className="text-background hover:bg-background/10">
                Ignorer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {/* Planning grid */}
          <div className="space-y-3 min-w-0">
            {/* Week nav */}
            <div className="flex items-center justify-between bg-card border rounded-lg p-2">
              <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="font-display text-sm uppercase">
                  Semaine du {format(weekStart, "d MMMM", { locale: fr })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(weekStart, "d MMM", { locale: fr })} → {format(days[days.length - 1], "d MMM yyyy", { locale: fr })}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Header */}
                <div
                  className="grid gap-1 mb-1"
                  style={{ gridTemplateColumns: `160px repeat(${days.length}, minmax(100px, 1fr))` }}
                >
                  <div />
                  {days.map((d) => (
                    <div
                      key={d.toISOString()}
                      className="text-center text-xs font-display uppercase py-2 bg-muted/50 rounded"
                    >
                      <div>{format(d, "EEE", { locale: fr })}</div>
                      <div className="text-foreground font-bold">{format(d, "d MMM", { locale: fr })}</div>
                    </div>
                  ))}
                </div>

                {employesActifs.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      Aucun employé. Cliquez sur « Mon équipe » pour en ajouter.
                    </CardContent>
                  </Card>
                )}

                {employesActifs.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid gap-1 mb-1"
                    style={{ gridTemplateColumns: `160px repeat(${days.length}, minmax(100px, 1fr))` }}
                  >
                    <div className="bg-card border rounded p-2 flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: emp.couleur }}
                      >
                        {emp.nom.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{emp.nom}</div>
                        {emp.role && <div className="text-[10px] text-muted-foreground truncate">{emp.role}</div>}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setAbsenceFor(emp)}
                        title="Marquer absent"
                      >
                        <CalendarOff className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {days.map((d) => {
                      const dateStr = format(d, "yyyy-MM-dd");
                      const absent = isAbsent(emp.id, dateStr);
                      const cellAffs = (affectations as Affectation[]).filter(
                        (a) => a.employe_id === emp.id && a.date === dateStr,
                      );
                      return (
                        <Cell
                          key={dateStr}
                          employeId={emp.id}
                          date={dateStr}
                          absent={absent}
                          affectations={cellAffs}
                          chantierById={chantierById}
                          clientById={clientById}
                          onTap={() => !absent && setAssignCell({ employeId: emp.id, date: dateStr })}
                          onRemove={(id) => removeAffectation.mutate(id)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Chantiers à finaliser */}
            {aFinaliser.length > 0 && (
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="font-display uppercase text-xs text-muted-foreground">
                    Travaux terminés ?
                  </div>
                  {aFinaliser.map((ch) => {
                    const cl = clientById[ch.client_id];
                    return (
                      <div key={ch.id} className="flex items-center justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <span className="font-semibold">{cl?.nom ?? "Client"}</span>
                          <span className="text-muted-foreground"> — {ch.nature_travaux}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!cl) return;
                            setPvFor({
                              chantier: ch,
                              client: { id: cl.id, nom: cl.nom, email: cl.email, adresse: cl.adresse },
                            });
                          }}
                        >
                          Générer le PV
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side panel : chantiers à planifier */}
          <div className="space-y-2">
            <div className="bg-card border rounded-lg p-3">
              <div className="font-display uppercase text-xs text-muted-foreground mb-2">
                Chantiers à planifier
              </div>
              {aPlanifier.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Aucun chantier en attente. Les dossiers signés apparaîtront ici.
                </p>
              ) : (
                <div className="space-y-2">
                  {aPlanifier.map((ch) => {
                    const cl = clientById[ch.client_id];
                    return (
                      <ChantierChip
                        key={ch.id}
                        chantier={ch}
                        client={cl}
                        ville={villeOf(cl)}
                      />
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-3 leading-snug">
                💡 Sur ordinateur : glissez un chantier sur une case.<br />
                Sur mobile : tapez une case vide pour l'affecter.
              </p>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Assign-by-tap dialog */}
      <Dialog open={!!assignCell} onOpenChange={(o) => !o && setAssignCell(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Affecter un chantier</DialogTitle>
          </DialogHeader>
          {assignCell && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {employeById[assignCell.employeId]?.nom} —{" "}
                {format(parseISO(assignCell.date), "EEEE d MMMM", { locale: fr })}
              </div>
              {aPlanifier.length === 0 && (
                <p className="text-sm italic text-muted-foreground">Aucun chantier disponible.</p>
              )}
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {aPlanifier.map((ch) => {
                  const cl = clientById[ch.client_id];
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        upsertAffectation.mutate({
                          chantier_id: ch.id,
                          employe_id: assignCell.employeId,
                          date: assignCell.date,
                        });
                        setAssignCell(null);
                      }}
                      className="w-full text-left p-2 rounded border hover:bg-muted/60 text-sm"
                    >
                      <div className="font-semibold">{cl?.nom ?? "Client"}</div>
                      <div className="text-xs text-muted-foreground truncate">{ch.nature_travaux}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Absence dialog */}
      <Dialog open={!!absenceFor} onOpenChange={(o) => !o && setAbsenceFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Marquer absent — {absenceFor?.nom}
            </DialogTitle>
          </DialogHeader>
          {absenceFor && (
            <AbsenceForm
              employe={absenceFor}
              onCreated={async (abs) => {
                setAbsenceFor(null);
                qc.invalidateQueries({ queryKey: ["absences"] });
                await declencherIA(abs);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {pvFor && (
        <PvDocumentDialog
          open
          onOpenChange={(o) => !o && setPvFor(null)}
          chantier={pvFor.chantier}
          client={pvFor.client}
        />
      )}
    </div>
  );
}

function Cell({
  employeId,
  date,
  absent,
  affectations,
  chantierById,
  clientById,
  onTap,
  onRemove,
}: {
  employeId: string;
  date: string;
  absent: boolean;
  affectations: Affectation[];
  chantierById: Record<string, Chantier>;
  clientById: Record<string, Client>;
  onTap: () => void;
  onRemove: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${employeId}-${date}`, data: { employeId, date } });
  return (
    <div
      ref={setNodeRef}
      onClick={() => affectations.length === 0 && !absent && onTap()}
      className={cn(
        "min-h-[72px] rounded border p-1 transition-colors",
        absent
          ? "bg-muted/80 border-dashed cursor-not-allowed"
          : affectations.length === 0
            ? "bg-muted/20 hover:bg-primary/5 cursor-pointer border-dashed"
            : "bg-card",
        isOver && !absent && "bg-primary/10 border-primary",
      )}
    >
      {absent ? (
        <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Absent
        </div>
      ) : affectations.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/60">
          +
        </div>
      ) : (
        <div className="space-y-1">
          {affectations.map((a) => {
            const ch = chantierById[a.chantier_id];
            const cl = ch ? clientById[ch.client_id] : undefined;
            return (
              <AffectationChip
                key={a.id}
                affectation={a}
                clientNom={cl?.nom ?? "Client"}
                nature={ch?.nature_travaux ?? ""}
                onRemove={() => onRemove(a.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function AffectationChip({
  affectation,
  clientNom,
  nature,
  onRemove,
}: {
  affectation: Affectation;
  clientNom: string;
  nature: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `aff-${affectation.id}`,
    data: { type: "move", affectationId: affectation.id, chantierId: affectation.chantier_id },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-primary/10 border-l-4 border-primary rounded px-1.5 py-1 text-[11px] cursor-grab active:cursor-grabbing relative group",
        isDragging && "opacity-50",
      )}
    >
      <div {...listeners} {...attributes}>
        <div className="font-semibold truncate">{clientNom}</div>
        <div className="text-muted-foreground truncate text-[10px]">{nature}</div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 hover:text-primary"
        aria-label="Retirer"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function ChantierChip({
  chantier,
  client,
  ville,
}: {
  chantier: Chantier;
  client?: Client;
  ville: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${chantier.id}`,
    data: { type: "new", chantierId: chantier.id },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded border-l-4 border-primary bg-primary/5 p-2 cursor-grab active:cursor-grabbing text-xs",
        isDragging && "opacity-50",
      )}
    >
      <div className="font-semibold text-sm">{client?.nom ?? "Client"}</div>
      {ville && <div className="text-[11px] text-muted-foreground">{ville}</div>}
      <div className="text-[11px] text-muted-foreground truncate">{chantier.nature_travaux}</div>
      {chantier.duree_estimee && (
        <div className="text-[10px] font-medium text-primary mt-1">⏱ {chantier.duree_estimee}</div>
      )}
    </div>
  );
}

function AbsenceForm({
  employe,
  onCreated,
}: {
  employe: Employe;
  onCreated: (a: Absence) => void;
}) {
  const [debut, setDebut] = useState(format(new Date(), "yyyy-MM-dd"));
  const [fin, setFin] = useState(format(new Date(), "yyyy-MM-dd"));
  const [motif, setMotif] = useState("Arrêt de travail");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      const { data, error } = await supabase
        .from("absences")
        .insert({
          user_id: u.user.id,
          employe_id: employe.id,
          date_debut: debut,
          date_fin: fin,
          motif,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Absence enregistrée");
      onCreated(data as Absence);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Du</Label>
          <Input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} required />
        </div>
        <div>
          <Label>Au</Label>
          <Input type="date" value={fin} min={debut} onChange={(e) => setFin(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Motif</Label>
        <Select value={motif} onValueChange={setMotif}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Arrêt de travail">Arrêt de travail</SelectItem>
            <SelectItem value="Congé">Congé</SelectItem>
            <SelectItem value="Formation">Formation</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer l'absence"}
        </Button>
      </DialogFooter>
      <p className="text-[11px] text-muted-foreground italic">
        Si l'employé avait des chantiers planifiés, l'assistant IA proposera automatiquement une réorganisation.
      </p>
    </form>
  );
}

function TeamPanel({ employes, onClose }: { employes: Employe[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState("");
  const [role, setRole] = useState("");
  const [couleur, setCouleur] = useState(PALETTE[0]);

  const ajouter = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      const { error } = await supabase
        .from("employes")
        .insert({ user_id: u.user.id, nom, role: role || null, couleur });
      if (error) throw error;
    },
    onSuccess: () => {
      setNom(""); setRole("");
      qc.invalidateQueries({ queryKey: ["employes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActif = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { error } = await supabase.from("employes").update({ actif }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employes"] }),
  });

  const supprimer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employes"] }),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Mon équipe</DialogTitle>
      </DialogHeader>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {employes.length === 0 && (
          <p className="text-sm italic text-muted-foreground">Aucun employé pour le moment.</p>
        )}
        {employes.map((e) => (
          <div key={e.id} className="flex items-center gap-2 p-2 border rounded">
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: e.couleur }}
            >
              {e.nom.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{e.nom}</div>
              {e.role && <div className="text-[11px] text-muted-foreground">{e.role}</div>}
            </div>
            <Switch
              checked={e.actif}
              onCheckedChange={(v) => toggleActif.mutate({ id: e.id, actif: v })}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => supprimer.mutate(e.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (nom.trim()) ajouter.mutate();
        }}
        className="border-t pt-3 space-y-2"
      >
        <div className="font-display uppercase text-xs">Ajouter un employé</div>
        <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <Input placeholder="Rôle (plombier, apprenti…)" value={role} onChange={(e) => setRole(e.target.value)} />
        <div>
          <Label className="text-xs">Couleur</Label>
          <div className="flex gap-1 flex-wrap mt-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCouleur(c)}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition",
                  couleur === c ? "border-foreground scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <DialogFooter className="gap-2 flex-wrap">
          <Button type="button" variant="outline" onClick={onClose}>Fermer</Button>
          <Button type="submit" disabled={!nom.trim() || ajouter.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {ajouter.isPending ? "Ajout…" : "Ajouter"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}