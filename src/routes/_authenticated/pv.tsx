import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, FileSignature, Hammer, Clock, CheckCircle2, FileText, type LucideIcon } from "lucide-react";
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
  { value: "devis_a_faire",    label: "Devis à faire",    dotColor: "#8B847D", chipBg: "#F1EFED", chipColor: "#6B6560" },
  { value: "devis_envoye",     label: "Devis envoyé",     dotColor: "#2563C9", chipBg: "#E8EFFB", chipColor: "#1E4FA3" },
  { value: "devis_signe",      label: "Devis signé",      dotColor: "#6D4AC4", chipBg: "#EEE9FA", chipColor: "#4F33A0" },
  { value: "travaux_en_cours", label: "Travaux en cours", dotColor: "#D98A00", chipBg: "#FBF1DE", chipColor: "#9A6200" },
  { value: "pv_a_signer",      label: "PV à signer",      dotColor: "#E2001A", chipBg: "#FCE7E9", chipColor: "#A30012" },
  { value: "termine",          label: "Terminé",          dotColor: "#1E8E55", chipBg: "#E7F4EC", chipColor: "#15693E" },
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#C30016","#2563C9","#7B2D8E","#0E7C66","#B45309","#D97706","#1D4ED8","#059669"];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initiales(name: string): string {
  return name.split(" ").map(p => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function cityFromAdresse(adresse: string | null): string {
  if (!adresse) return "";
  return adresse.split(",").pop()?.trim() ?? "";
}

// ── PvPage ────────────────────────────────────────────────────────────────────
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
    const enAttente = chantiers.filter(c => ["devis_a_faire","devis_envoye"].includes(c.statut)).length;
    const enCours   = chantiers.filter(c => ["devis_signe","travaux_en_cours"].includes(c.statut)).length;
    const aSigner   = chantiers.filter(c => c.statut === "pv_a_signer").length;
    const termines  = chantiers.filter(c => c.statut === "termine").length;
    return { enAttente, enCours, aSigner, termines };
  }, [chantiers]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const newStatut = String(over.id) as StatutValue;
    const ch = chantiers.find(c => c.id === id);
    if (!ch || ch.statut === newStatut) return;
    updateStatut.mutate({ id, statut: newStatut });
  };

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
            PV &amp; Suivi devis
          </h1>
          <p className="text-[#8B847D] text-sm mt-[7px]">
            Pilotez vos dossiers, du devis à la signature du PV de réception.
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <button className="btn-capeb flex items-center gap-[9px]">
              <Plus style={{ width: 18, height: 18, strokeWidth: 2.2 }} />
              Nouveau dossier
            </button>
          </DialogTrigger>
          <NouveauDossierDialog onClose={() => setOpenNew(false)} clients={clients} />
        </Dialog>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Devis en attente"   value={stats.enAttente} trend="À chiffrer ou à relancer"  iconBg="#FCE7E9" iconColor="#E2001A" icon={FileText}     delay={0.04} />
        <StatCard label="Travaux en cours"   value={stats.enCours}   trend="Chantiers actifs"           iconBg="#E8EFFB" iconColor="#2563C9" icon={Hammer}       delay={0.10} />
        <StatCard label="PV à signer"        value={stats.aSigner}   trend="Prêt à envoyer au client"  iconBg="#FBF1DE" iconColor="#D98A00" icon={Clock}        delay={0.16} />
        <StatCard label="Chantiers terminés" value={stats.termines}  trend="Dossiers bouclés"           iconBg="#E7F4EC" iconColor="#1E8E55" icon={CheckCircle2} delay={0.22} />
      </div>

      {/* Pipeline */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[.05em] text-[#4A453F]">
          Pipeline des dossiers
        </h2>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-[13px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STATUTS.map(s => (
            <Column key={s.value} statut={s} chantiers={chantiers} clients={clients}
              onOpen={(ch, cl) => setOpenDossier({ chantier: ch, client: cl })} />
          ))}
        </div>
      </DndContext>

      {openDossier && (
        <DossierDetailDialog
          open
          onOpenChange={o => !o && setOpenDossier(null)}
          chantier={openDossier.chantier}
          client={openDossier.client}
          onGenererPv={() => { setOpenPv(openDossier); setOpenDossier(null); }}
        />
      )}
      {openPv && (
        <PvDocumentDialog
          open
          onOpenChange={o => !o && setOpenPv(null)}
          chantier={openPv.chantier}
          client={openPv.client}
        />
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({
  label, value, trend, iconBg, iconColor, icon: Icon, delay,
}: {
  label: string;
  value: number;
  trend: string;
  iconBg: string;
  iconColor: string;
  icon: LucideIcon;
  delay: number;
}) {
  return (
    <div
      className="bg-white rounded-[16px] border border-[#ECE7E1] p-[18px] relative transition-all duration-200 hover:-translate-y-0.5"
      style={{
        boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)",
        animation: `fadeInUp .5s ease ${delay}s both`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-[12px] mb-3"
        style={{ width: 42, height: 42, background: iconBg, flexShrink: 0 }}
      >
        <Icon style={{ width: 21, height: 21, stroke: iconColor, fill: "none", strokeWidth: 2 }} />
      </div>
      <div className="font-display text-[36px] font-semibold leading-none text-[#1A1714]">{value}</div>
      <div className="text-[12.5px] text-[#4A453F] font-medium mt-1">{label}</div>
      <div className="text-[11.5px] text-[#8B847D] mt-2">{trend}</div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function Column({
  statut, chantiers, clients, onOpen,
}: {
  statut: (typeof STATUTS)[number];
  chantiers: Chantier[];
  clients: Client[];
  onOpen: (ch: Chantier, cl: Client) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut.value });
  const items = chantiers.filter(c => c.statut === statut.value);

  return (
    <div
      ref={setNodeRef}
      className="rounded-[15px] p-[12px] min-h-[120px] transition-all duration-150"
      style={{
        background: isOver
          ? "#FCE7E9"
          : "linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,.3) 100%)",
        border: isOver ? "2px dashed #E2001A" : "1px solid #ECE7E1",
      }}
    >
      {/* En-tête colonne */}
      <div className="flex items-center gap-2 px-1 pb-3">
        <span
          className="w-[9px] h-[9px] rounded-full flex-shrink-0"
          style={{ background: statut.dotColor }}
        />
        <span className="text-[12.5px] font-semibold uppercase text-[#4A453F] flex-1 truncate">
          {statut.label}
        </span>
        <span
          className="text-[11px] font-bold px-2 py-[1px] rounded-full"
          style={{ background: "white", border: "1px solid #ECE7E1", color: "#4A453F" }}
        >
          {items.length}
        </span>
      </div>

      {/* Cartes */}
      <div className="space-y-[10px]">
        {items.map(ch => {
          const cl = clients.find(c => c.id === ch.client_id);
          if (!cl) return null;
          return (
            <DraggableCard key={ch.id} chantier={ch} client={cl} statut={statut}
              onOpen={() => onOpen(ch, cl)} />
          );
        })}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-5 text-center">
            <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: "#CFC8C0", strokeWidth: 1.6, fill: "none", marginBottom: 6 }}>
              <path d="M5 12h14M12 5v14" />
            </svg>
            <p className="text-[11.5px] text-[#B7B0A8] leading-tight">Glissez un dossier ici</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DraggableCard ─────────────────────────────────────────────────────────────
function DraggableCard({
  chantier, client, statut, onOpen,
}: {
  chantier: Chantier;
  client: Client;
  statut: (typeof STATUTS)[number];
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: chantier.id });
  const transformStyle = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 50 }
    : {};

  const inits = initiales(client.nom);
  const bg    = avatarColor(client.nom);
  const city  = cityFromAdresse(client.adresse);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-white rounded-[13px] p-[13px] cursor-grab active:cursor-grabbing select-none transition-all duration-150",
        isDragging && "opacity-40",
      )}
      style={{
        ...transformStyle,
        border: "1px solid #ECE7E1",
        boxShadow: isDragging
          ? "0 8px 24px rgba(26,23,20,.18)"
          : "0 1px 2px rgba(26,23,20,.05)",
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(26,23,20,.07), 0 16px 40px rgba(26,23,20,.09)";
          e.currentTarget.style.transform = `${transformStyle.transform ?? ""} translateY(-3px)`;
          e.currentTarget.style.borderColor = "#E2DCD4";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(26,23,20,.05)";
        e.currentTarget.style.transform = transformStyle.transform ?? "";
        e.currentTarget.style.borderColor = "#ECE7E1";
      }}
    >
      {/* Drag zone */}
      <div {...listeners} {...attributes}>

        {/* Avatar + nom + ville */}
        <div className="flex items-center gap-[9px] mb-[9px]">
          <div
            className="flex items-center justify-center rounded-[9px] font-display text-[13px] text-white flex-shrink-0"
            style={{ width: 30, height: 30, background: bg }}
          >
            {inits}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-tight text-[#1A1714] truncate">{client.nom}</div>
            {city && <div className="text-[11.5px] text-[#8B847D] truncate">{city}</div>}
          </div>
        </div>

        {/* Description */}
        <div className="text-[12.5px] text-[#4A453F] leading-[1.4] mb-[11px] line-clamp-2">
          {chantier.nature_travaux}
        </div>

        {/* Statut + montant */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10.5px] font-semibold px-[9px] py-[4px] rounded-[7px] whitespace-nowrap"
            style={{ background: statut.chipBg, color: statut.chipColor }}
          >
            {statut.label}
          </span>
          {chantier.montant_estime != null && (
            <span className="font-display text-[13px] text-[#1A1714]">
              {chantier.montant_estime.toLocaleString("fr-FR")} €
            </span>
          )}
        </div>
      </div>

      {/* Lien détail */}
      <button
        type="button"
        onClick={onOpen}
        className="mt-2 w-full text-[11px] text-[#E2001A] hover:text-[#B00013] font-medium flex items-center justify-center gap-1 transition-colors"
      >
        <FileSignature className="h-3 w-3" /> Ouvrir le dossier
      </button>
    </div>
  );
}

// ── NouveauDossierDialog ──────────────────────────────────────────────────────
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
  const selectedClient = !isNew ? clients.find(c => c.id === clientChoice) : null;

  const handleClientChange = (val: string) => {
    setClientChoice(val);
    if (val === "__new__") {
      setNom(""); setEmail(""); setTelephone(""); setAdresse("");
    } else {
      const c = clients.find(x => x.id === val);
      if (c) { setNom(c.nom); setEmail(c.email ?? ""); setTelephone(c.telephone ?? ""); setAdresse(c.adresse ?? ""); }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Session expirée — merci de te reconnecter.");

      let clientId: string;
      if (isNew) {
        const { data: client, error: clErr } = await supabase
          .from("clients")
          .insert({ user_id: u.user.id, nom, email: email || null, telephone: telephone || null, adresse: adresse || null })
          .select().single();
        if (clErr) throw clErr;
        clientId = client.id;
      } else {
        if (!selectedClient) throw new Error("Client introuvable");
        clientId = selectedClient.id;
      }

      const { error: chErr } = await supabase.from("chantiers").insert({
        user_id: u.user.id, client_id: clientId, nature_travaux: nature,
        montant_estime: montant ? Number(montant) : null,
        duree_estimee: duree || null, statut: "devis_a_faire",
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
            <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__new__">+ Nouveau client</SelectItem>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isNew ? (
          <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Nouveau client (saisi une seule fois)
            </div>
            <div><Label>Nom *</Label><Input required value={nom} onChange={e => setNom(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>E-mail</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Téléphone</Label><Input value={telephone} onChange={e => setTelephone(e.target.value)} /></div>
            </div>
            <div><Label>Adresse</Label><Textarea value={adresse} onChange={e => setAdresse(e.target.value)} rows={2} /></div>
          </div>
        ) : selectedClient ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
            <div className="font-semibold">{selectedClient.nom}</div>
            {selectedClient.email && <div className="text-muted-foreground">{selectedClient.email}</div>}
            {selectedClient.telephone && <div className="text-muted-foreground">{selectedClient.telephone}</div>}
            {selectedClient.adresse && <div className="text-muted-foreground whitespace-pre-line">{selectedClient.adresse}</div>}
            <div className="text-[11px] text-muted-foreground italic pt-1">Coordonnées pré-remplies automatiquement.</div>
          </div>
        ) : null}

        <div><Label>Nature des travaux *</Label><Textarea required value={nature} onChange={e => setNature(e.target.value)} rows={2} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Montant estimé (€)</Label><Input type="number" step="0.01" value={montant} onChange={e => setMontant(e.target.value)} /></div>
          <div><Label>Durée estimée</Label><Input value={duree} onChange={e => setDuree(e.target.value)} placeholder="ex : 3 semaines" /></div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving || (!isNew && !selectedClient)}>
            {saving ? "Enregistrement…" : "Créer le dossier"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
