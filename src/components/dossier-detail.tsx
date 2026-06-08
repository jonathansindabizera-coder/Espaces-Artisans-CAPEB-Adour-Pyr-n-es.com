import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

type Chantier = {
  id: string;
  nature_travaux: string;
  montant_estime: number | null;
  statut: string;
};
type Client = { id: string; nom: string; email: string | null; adresse: string | null };

const ETAPES = [
  { key: "devis_realise", label: "Devis réalisé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_envoye", label: "Devis envoyé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_signe", label: "Devis signé", statuts: ["devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "travaux", label: "Travaux réalisés", statuts: ["pv_a_signer", "termine"] },
  { key: "pv", label: "PV signé", statuts: ["termine"] },
];

const CURRENT_MAP: Record<string, string> = {
  devis_a_faire: "devis_realise",
  devis_envoye: "devis_envoye",
  devis_signe: "devis_signe",
  travaux_en_cours: "travaux",
  pv_a_signer: "pv",
  termine: "",
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
  const currentStep = CURRENT_MAP[chantier.statut];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{client.nom}</DialogTitle>
          <p className="text-sm text-muted-foreground">{chantier.nature_travaux}</p>
          {chantier.montant_estime != null && (
            <p className="text-sm font-semibold text-primary">
              {chantier.montant_estime.toLocaleString("fr-FR")} €
            </p>
          )}
        </DialogHeader>

        <ol className="relative ml-3 border-l-2 border-border space-y-5 py-3">
          {ETAPES.map((etape) => {
            const done = etape.statuts.includes(chantier.statut);
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

        <Button onClick={onGenererPv} className="w-full" size="lg">
          <FileSignature className="h-4 w-4 mr-2" />
          Générer le PV de fin de travaux
        </Button>
      </DialogContent>
    </Dialog>
  );
}