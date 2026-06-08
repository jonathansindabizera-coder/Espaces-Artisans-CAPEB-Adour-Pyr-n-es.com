import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  FileSignature,
  Hammer,
  Clock,
  CheckCircle2,
  FileText,
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
import { cn } from "@/lib/utils";
import { DossierDetailDialog } from "@/components/dossier-detail";
import { PvDocumentDialog } from "@/components/pv-document";

export const Route = createFileRoute("/_authenticated/pv")({
  head: () => ({ meta: [{ title: "PV & Suivi devis – CAPEB" }] }),
  component: PvPage,
});

const STATUTS = [
  { value: "devis_a_faire", label: "Devis à faire", color: "bg-slate-500" },
  { value: "devis_envoye", label: "Devis envoyé", color: "bg-blue-500" },
  { value: "devis_signe", label: "Devis signé", color: "bg-indigo-500" },
  { value: "travaux_en_cours", label: "Travaux en cours", color: "bg-amber-500" },
  { value: "pv_a_signer", label: "PV à signer", color: "bg-primary" },
  { value: "termine", label: "Terminé", color: "bg-green-600" },
] as const;

type StatutValue = (typeof STATUTS)[number]["value"];

type Chantier = {
  id: string;
  client_id: string;
  nature_travaux: string;
  montant_estime: number | null;
  duree_estimee: string | null;
  statut: StatutValue;
  date_creation: string;
};
type Client = { id: string; nom: string; email: string | null; telephone: string | null; adresse: string | null };

function PvPage() {
  const qc = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [openDossier, setOpenDossier] = useState<{ chantier: Chantier; client: Client } | null>(null);
  const [openPv, setOpenPv] = useState<{ chantier: Chantier; client: Client } | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("nom");
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: chantiers = [] } = useQuery({
    queryKey: ["chantiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chantiers")
        .select("*")
        .order("date_creation", { ascending: false });
      if (error) throw error;
      return data as Chantier[];
    },
  });

  const updateStatut = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutValue }) => {
      const { error } = await supabase.from("chantiers").update({ statut }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chantiers"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = useMemo(() => {
    const enAttente = chantiers.filter((c) =>
      ["devis_a_faire", "devis_envoye"].includes(c.statut),
    ).length;
    const enCours = chantiers.filter((c) =>
      ["devis_signe", "travaux_en_cours"].includes(c.statut),
    ).length;
    const aSigner = chantiers.filter((c) => c.statut === "pv_a_signer").length;
    const termines = chantiers.filter((c) => c.statut === "termine").length;
    return { enAttente, enCours, aSigner, termines };
  }, [chantiers]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const newStatut = String(over.id) as StatutValue;
    const ch = chantiers.find((c) => c.id === id);
    if (!ch || ch.statut === newStatut) return;
    updateStatut.mutate({ id, statut: newStatut });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">PV & Suivi devis</h1>
          <p className="text-muted-foreground mt-1">
            Pilotez vos dossiers, du devis à la signature du PV de réception.
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="lg" className="font-display">
              <Plus className="h-4 w-4 mr-2" /> Nouveau dossier
            </Button>
          </DialogTrigger>
          <NouveauDossierDialog onClose={() => setOpenNew(false)} clients={clients} />
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Devis en attente" value={stats.enAttente} color="border-l-primary" icon={FileText} />
        <StatCard label="Travaux en cours" value={stats.enCours} color="border-l-blue-500" icon={Hammer} />
        <StatCard label="PV à signer" value={stats.aSigner} color="border-l-amber-500" icon={Clock} />
        <StatCard label="Chantiers terminés" value={stats.termines} color="border-l-green-600" icon={CheckCircle2} />
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STATUTS.map((s) => (
            <Column key={s.value} statut={s} chantiers={chantiers} clients={clients} onOpen={(ch, cl) => setOpenDossier({ chantier: ch, client: cl })} />
          ))}
        </div>
      </DndContext>

      {openDossier && (
        <DossierDetailDialog
          open
          onOpenChange={(o) => !o && setOpenDossier(null)}
          chantier={openDossier.chantier}
          client={openDossier.client}
          onGenererPv={() => {
            setOpenPv(openDossier);
            setOpenDossier(null);
          }}
        />
      )}

      {openPv && (
        <PvDocumentDialog
          open
          onOpenChange={(o) => !o && setOpenPv(null)}
          chantier={openPv.chantier}
          client={openPv.client}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={cn("border-l-4 shadow-sm", color)}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="font-display text-3xl mt-1 text-foreground">{value}</div>
        </div>
        <Icon className="h-7 w-7 text-muted-foreground/40" />
      </CardContent>
    </Card>
  );
}

function Column({
  statut,
  chantiers,
  clients,
  onOpen,
}: {
  statut: (typeof STATUTS)[number];
  chantiers: Chantier[];
  clients: Client[];
  onOpen: (ch: Chantier, cl: Client) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut.value });
  const items = chantiers.filter((c) => c.statut === statut.value);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg bg-muted/40 border border-transparent p-3 min-h-[200px] transition-colors",
        isOver && "bg-primary/10 border-primary/40",
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", statut.color)} />
          <span className="font-display text-xs text-foreground">{statut.label}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((ch) => {
          const cl = clients.find((c) => c.id === ch.client_id);
          if (!cl) return null;
          return <DraggableCard key={ch.id} chantier={ch} client={cl} statut={statut} onOpen={() => onOpen(ch, cl)} />;
        })}
        {items.length === 0 && (
          <div className="text-xs text-muted-foreground/70 italic px-2 py-4 text-center">
            Glissez un dossier ici
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  chantier,
  client,
  statut,
  onOpen,
}: {
  chantier: Chantier;
  client: Client;
  statut: (typeof STATUTS)[number];
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: chantier.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md bg-card border shadow-sm p-3 cursor-grab active:cursor-grabbing select-none hover:shadow-md transition",
        isDragging && "opacity-60",
      )}
    >
      <div {...listeners} {...attributes} className="space-y-1.5">
        <div className="font-semibold text-sm leading-tight">{client.nom}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{chantier.nature_travaux}</div>
        {client.adresse && (
          <div className="text-[11px] text-muted-foreground truncate">{client.adresse.split("\n")[0]}</div>
        )}
        <div className="flex items-center justify-between pt-1">
          {chantier.montant_estime != null ? (
            <span className="text-xs font-bold text-foreground">
              {chantier.montant_estime.toLocaleString("fr-FR")} €
            </span>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider text-white px-1.5 py-0.5 rounded font-semibold",
              statut.color,
            )}
          >
            {statut.label}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-2 w-full text-[11px] text-primary hover:underline font-medium flex items-center justify-center gap-1"
      >
        <FileSignature className="h-3 w-3" /> Ouvrir le dossier
      </button>
    </div>
  );
}

function NouveauDossierDialog({ onClose, clients }: { onClose: () => void; clients: Client[] }) {
  const qc = useQueryClient();
  const [clientChoice, setClientChoice] = useState<string>("__new__");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [nature, setNature] = useState("");
  const [montant, setMontant] = useState("");
  const [duree, setDuree] = useState("");
  const [saving, setSaving] = useState(false);

  const isNew = clientChoice === "__new__";
  const selectedClient = !isNew ? clients.find((c) => c.id === clientChoice) : null;

  const handleClientChange = (val: string) => {
    setClientChoice(val);
    if (val === "__new__") {
      setNom(""); setEmail(""); setTelephone(""); setAdresse("");
    } else {
      const c = clients.find((x) => x.id === val);
      if (c) {
        setNom(c.nom);
        setEmail(c.email ?? "");
        setTelephone(c.telephone ?? "");
        setAdresse(c.adresse ?? "");
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");

      let clientId: string;
      if (isNew) {
        const { data: client, error: clErr } = await supabase
          .from("clients")
          .insert({
            user_id: u.user.id,
            nom,
            email: email || null,
            telephone: telephone || null,
            adresse: adresse || null,
          })
          .select()
          .single();
        if (clErr) throw clErr;
        clientId = client.id;
      } else {
        if (!selectedClient) throw new Error("Client introuvable");
        clientId = selectedClient.id;
      }

      const { error: chErr } = await supabase.from("chantiers").insert({
        user_id: u.user.id,
        client_id: clientId,
        nature_travaux: nature,
        montant_estime: montant ? Number(montant) : null,
        duree_estimee: duree || null,
        statut: "devis_a_faire",
      });
      if (chErr) throw chErr;

      toast.success("Nouveau dossier créé");
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["chantiers"] });
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Nouveau dossier</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Client *</Label>
          <Select value={clientChoice} onValueChange={handleClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">+ Nouveau client</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isNew ? (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Nouveau client (saisi une seule fois)
            </div>
            <div>
              <Label>Nom *</Label>
              <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Adresse</Label>
              <Textarea value={adresse} onChange={(e) => setAdresse(e.target.value)} rows={2} />
            </div>
          </div>
        ) : selectedClient ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
            <div className="font-semibold">{selectedClient.nom}</div>
            {selectedClient.email && <div className="text-muted-foreground">{selectedClient.email}</div>}
            {selectedClient.telephone && <div className="text-muted-foreground">{selectedClient.telephone}</div>}
            {selectedClient.adresse && (
              <div className="text-muted-foreground whitespace-pre-line">{selectedClient.adresse}</div>
            )}
            <div className="text-[11px] text-muted-foreground italic pt-1">
              Coordonnées pré-remplies automatiquement.
            </div>
          </div>
        ) : null}

        <div>
          <Label>Nature des travaux *</Label>
          <Textarea required value={nature} onChange={(e) => setNature(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Montant estimé (€)</Label>
            <Input type="number" step="0.01" value={montant} onChange={(e) => setMontant(e.target.value)} />
          </div>
          <div>
            <Label>Durée estimée</Label>
            <Input value={duree} onChange={(e) => setDuree(e.target.value)} placeholder="ex : 3 semaines" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || (!isNew && !selectedClient)}>
            {saving ? "Enregistrement…" : "Créer le dossier"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}