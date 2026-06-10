import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { CheckCircle2, Circle, FileSignature, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type Chantier,
  type Client,
  type StatutValue,
  updateChantier,
  updateChantierStatut,
  notifyUpdate,
} from "@/lib/local-data";

const METIERS = ["Maçonnerie", "Charpente", "Couverture", "Plomberie", "Électricité", "Menuiserie", "Carrelage", "Peinture", "Isolation", "Autre"];

const ETAPES = [
  { key: "devis_realise", label: "Devis réalisé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_envoye", label: "Devis envoyé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_signe", label: "Devis signé", statuts: ["devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "travaux", label: "Travaux réalisés", statuts: ["pv_a_signer", "termine"] },
  { key: "pv", label: "PV signé", statuts: ["termine"] },
];

const CURRENT_MAP: Record<StatutValue, string> = {
  devis_a_faire: "devis_realise",
  devis_envoye: "devis_envoye",
  devis_signe: "devis_signe",
  travaux_en_cours: "travaux",
  pv_a_signer: "pv",
  termine: "",
};

export const STATUT_ORDER: StatutValue[] = [
  "devis_a_faire",
  "devis_envoye",
  "devis_signe",
  "travaux_en_cours",
  "pv_a_signer",
  "termine",
];

export const STATUT_LABELS: Record<StatutValue, string> = {
  devis_a_faire: "Devis à faire",
  devis_envoye: "Devis envoyé",
  devis_signe: "Devis signé",
  travaux_en_cours: "Travaux en cours",
  pv_a_signer: "PV à signer",
  termine: "Terminé",
};

const NEXT_LABELS: Partial<Record<StatutValue, string>> = {
  devis_a_faire: "Marquer le devis comme envoyé",
  devis_envoye: "Marquer le devis comme signé",
  devis_signe: "Démarrer les travaux",
  travaux_en_cours: "Passer au PV à signer",
  pv_a_signer: "Marquer le chantier terminé",
};

export function DossierDetailDialog({
  open,
  onOpenChange,
  chantier,
  client,
  onGenererPv,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chantier: Chantier;
  client: Client;
  onGenererPv: () => void;
}) {
  const [statut, setStatut] = useState<StatutValue>(chantier.statut);
  const [natureTravaux, setNatureTravaux] = useState(chantier.nature_travaux);
  const [montantEstime, setMontantEstime] = useState(chantier.montant_estime != null ? String(chantier.montant_estime) : "");
  const [dureeEstimee, setDureeEstimee] = useState(chantier.duree_estimee ?? "");
  const [dateDebutPrevue, setDateDebutPrevue] = useState(chantier.date_debut_prevue ?? "");
  const [dateFinPrevue, setDateFinPrevue] = useState(chantier.date_fin_prevue ?? "");
  const [metierRequis, setMetierRequis] = useState(chantier.metier_requis ?? "");
  const [nbPersonnes, setNbPersonnes] = useState(chantier.nb_personnes_requises != null ? String(chantier.nb_personnes_requises) : "");

  const currentStep = CURRENT_MAP[statut];
  const idx = STATUT_ORDER.indexOf(statut);
  const nextStatut = idx >= 0 && idx < STATUT_ORDER.length - 1 ? STATUT_ORDER[idx + 1] : null;
  const prevStatut = idx > 0 ? STATUT_ORDER[idx - 1] : null;

  function handleSave() {
    updateChantier(chantier.id, {
      nature_travaux: natureTravaux,
      montant_estime: montantEstime ? Number(montantEstime) : null,
      duree_estimee: dureeEstimee || null,
      date_debut_prevue: dateDebutPrevue || null,
      date_fin_prevue: dateFinPrevue || null,
      metier_requis: metierRequis || null,
      nb_personnes_requises: nbPersonnes ? Number(nbPersonnes) : null,
    });
    notifyUpdate();
    toast.success("Dossier mis à jour");
  }

  function handleStatutChange(newStatut: StatutValue) {
    if (newStatut === statut) return;
    updateChantierStatut(chantier.id, newStatut);
    notifyUpdate();
    setStatut(newStatut);
    toast.success(`Dossier déplacé vers « ${STATUT_LABELS[newStatut]} »`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{client.nom}</DialogTitle>
          <p className="text-sm text-muted-foreground">{STATUT_LABELS[statut]}</p>
        </DialogHeader>

        <ol className="relative ml-3 border-l-2 border-border space-y-5 py-3">
          {ETAPES.map((etape) => {
            const done = etape.statuts.includes(statut);
            const current = currentStep === etape.key;
            return (
              <li key={etape.key} className="ml-6">
                <span
                  className={cn(
                    "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2",
                    done && "bg-green-600 border-green-600 text-white",
                    current && !done && "bg-primary border-primary text-primary-foreground animate-pulse",
                    !done && !current && "bg-card border-border text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                </span>
                <div
                  className={cn(
                    "font-display text-sm",
                    done && "text-green-700",
                    current && !done && "text-primary font-semibold",
                    !done && !current && "text-muted-foreground",
                  )}
                >
                  {etape.label}
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── Détails du dossier (modifiable) ── */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8B847D]">
            Détails du dossier
          </div>

          <div>
            <Label>Nature des travaux</Label>
            <Textarea value={natureTravaux} onChange={e => setNatureTravaux(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Montant estimé (€)</Label>
              <Input type="number" step="0.01" value={montantEstime} onChange={e => setMontantEstime(e.target.value)} />
            </div>
            <div>
              <Label>Durée estimée</Label>
              <Input value={dureeEstimee} onChange={e => setDureeEstimee(e.target.value)} placeholder="ex : 3 semaines" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Début prévu</Label>
              <Input type="date" value={dateDebutPrevue} onChange={e => setDateDebutPrevue(e.target.value)} />
            </div>
            <div>
              <Label>Fin prévue</Label>
              <Input type="date" value={dateFinPrevue} onChange={e => setDateFinPrevue(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Métier requis</Label>
              <Select value={metierRequis || "__tous__"} onValueChange={v => setMetierRequis(v === "__tous__" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__tous__">Tous métiers</SelectItem>
                  {METIERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Personnes requises</Label>
              <Input type="number" min={0} value={nbPersonnes} onChange={e => setNbPersonnes(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSave} variant="outline" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>

        {/* ── Faire avancer le dossier ── */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8B847D]">
            Faire avancer le dossier
          </div>

          {nextStatut && (
            <Button onClick={() => handleStatutChange(nextStatut)} className="w-full" size="lg">
              {NEXT_LABELS[statut]}
            </Button>
          )}

          {prevStatut && (
            <Button onClick={() => handleStatutChange(prevStatut)} variant="outline" className="w-full">
              Revenir à l'étape précédente
            </Button>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">Déplacer vers…</Label>
            <Select value={statut} onValueChange={v => handleStatutChange(v as StatutValue)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUT_ORDER.map(s => <SelectItem key={s} value={s}>{STATUT_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={onGenererPv} className="w-full" size="lg">
          <FileSignature className="h-4 w-4 mr-2" />
          Générer le PV de fin de travaux
        </Button>
      </DialogContent>
    </Dialog>
  );
}
