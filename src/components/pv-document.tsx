import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SignaturePad } from "@/components/signature-pad";
import { generatePvPdf } from "@/lib/pv-pdf";
import { reformulerReserves } from "@/lib/ai.functions";
import { envoyerPvParEmail } from "@/lib/email.functions";

type Chantier = {
  id: string;
  nature_travaux: string;
  client_id: string;
  date_creation: string;
  statut: string;
};
type Client = { id: string; nom: string; email: string | null; adresse: string | null };

function AiField({ children }: { children: React.ReactNode }) {
  return (
    <span className="ai-fill inline-flex items-center gap-1 font-semibold">
      {children}
      <span className="text-[9px] uppercase tracking-wider opacity-70 ml-1">IA</span>
    </span>
  );
}

export function PvDocumentDialog({
  open,
  onOpenChange,
  chantier,
  client,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  chantier: Chantier;
  client: Client;
}) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const todayFr = new Date().toLocaleDateString("fr-FR");

  const { data: profile } = useQuery({
    queryKey: ["profile-pv"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("profiles")
        .select("nom, entreprise, email, adresse")
        .eq("id", u.user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [typeReception, setType] = useState<"sans_reserve" | "avec_reserve">("sans_reserve");
  const [dateEffet, setDateEffet] = useState(today);
  const [reservesNature, setRN] = useState("");
  const [reservesTravaux, setRT] = useState("");
  const [reservesDelai, setRD] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [sigClient, setSigClient] = useState<string | null>(null);
  const [sigEnt, setSigEnt] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string[] | null>(null);

  const reformuler = useServerFn(reformulerReserves);
  const envoyer = useServerFn(envoyerPvParEmail);

  const aiMut = useMutation({
    mutationFn: async () => reformuler({ data: { texte: aiInput } }),
    onSuccess: (r) => {
      if (r.nature) setRN(r.nature);
      if (r.travaux) setRT(r.travaux);
      toast.success("Réserves reformulées par l'IA");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const entreprise = profile?.entreprise || "—";
  const entrepriseAdr = profile?.adresse || null;
  const lieu = client.adresse || "—";

  const buildPdf = () =>
    generatePvPdf({
      entreprise,
      entrepriseAdresse: entrepriseAdr,
      clientNom: client.nom,
      clientAdresse: client.adresse,
      natureTravaux: chantier.nature_travaux,
      typeReception,
      dateEffet,
      reservesNature: typeReception === "avec_reserve" ? reservesNature : null,
      reservesTravaux: typeReception === "avec_reserve" ? reservesTravaux : null,
      reservesDelai: typeReception === "avec_reserve" ? reservesDelai : null,
      lieu,
      dateSignature: today,
      dateMarche: chantier.date_creation?.slice(0, 10) ?? null,
      representant: entreprise,
      nbExemplaires: 2,
      signatureClient: sigClient,
      signatureEntreprise: sigEnt,
    });

  const finaliser = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");

      // 1. Enregistre le PV
      const { error: pvErr } = await supabase.from("pv").insert({
        user_id: u.user.id,
        chantier_id: chantier.id,
        type_reception: typeReception,
        date_effet: dateEffet,
        reserves_nature: typeReception === "avec_reserve" ? reservesNature : null,
        reserves_travaux: typeReception === "avec_reserve" ? reservesTravaux : null,
        reserves_delai: typeReception === "avec_reserve" ? reservesDelai : null,
        lieu,
        date_signature: today,
        signe_client: !!sigClient,
        signe_entreprise: !!sigEnt,
        signature_client_data: sigClient,
        signature_entreprise_data: sigEnt,
        statut: "signe",
      });
      if (pvErr) throw pvErr;

      // 2. Met le chantier en "terminé"
      const { error: chErr } = await supabase
        .from("chantiers")
        .update({ statut: "termine" })
        .eq("id", chantier.id);
      if (chErr) throw chErr;

      // 3. Génère + télécharge le PDF
      const doc = buildPdf();
      const fileName = `PV-${client.nom.replace(/\s+/g, "_")}-${today}.pdf`;
      doc.save(fileName);

      // 4. Envoi par e-mail
      const destinataires = [client.email, profile?.email].filter(
        (x): x is string => !!x && x.includes("@"),
      );
      let emailRes: { sent: boolean; reason?: string; destinataires: string[] } = {
        sent: false,
        reason: "Aucun e-mail destinataire renseigné",
        destinataires: [],
      };
      if (destinataires.length > 0) {
        const pdfBase64 = doc.output("datauristring").split(",")[1];
        emailRes = await envoyer({
          data: {
            destinataires,
            sujet: `PV de réception – ${client.nom} – ${todayFr}`,
            message: `Bonjour,\n\nVeuillez trouver ci-joint le procès-verbal de réception des travaux signé le ${todayFr}.\n\nCordialement,\n${entreprise}`,
            pdfBase64,
            pdfNom: fileName,
          },
        });
      }
      return { destinataires, emailRes };
    },
    onSuccess: ({ destinataires, emailRes }) => {
      qc.invalidateQueries({ queryKey: ["chantiers"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setConfirmation(destinataires);
      if (!emailRes.sent && destinataires.length > 0) {
        toast.message("PV signé. Envoi e-mail à finaliser dans la configuration.");
      } else if (emailRes.sent) {
        toast.success(`PV envoyé à ${destinataires.join(", ")}`);
      } else {
        toast.success("PV signé et téléchargé.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const close = () => {
    setConfirmation(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="font-display text-2xl">Procès-verbal de réception des travaux</DialogTitle>
        </DialogHeader>

        {confirmation ? (
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <div className="font-semibold">PV signé et chantier marqué terminé.</div>
                {confirmation.length > 0 ? (
                  <div className="text-sm">
                    Envoyé automatiquement à :{" "}
                    <span className="font-medium">{confirmation.join(", ")}</span>
                  </div>
                ) : (
                  <div className="text-sm">Le PDF a été téléchargé.</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={close}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="mx-6 my-4 rounded-md border bg-white p-6 font-doc text-[15px] leading-relaxed text-foreground">
              <h2 className="text-center font-bold text-lg mb-4">Réception des travaux</h2>
              <p className="text-justify">
                Je soussigné(e) <AiField>{client.nom}</AiField>, maître de l'ouvrage, après avoir procédé à la
                visite des travaux effectués par <AiField>{entreprise}</AiField>, au titre du marché en date du{" "}
                <AiField>{chantier.date_creation?.slice(0, 10)}</AiField>, et relatif à{" "}
                <AiField>{chantier.nature_travaux}</AiField>, en présence du représentant de{" "}
                <AiField>{entreprise}</AiField>.
              </p>
              <p className="mt-3">Déclare que :</p>

              <div className="mt-3 rounded-md border-2 border-dashed border-primary/40 p-4">
                <Label className="font-doc font-semibold mb-2 block">
                  Type de réception (à compléter par l'artisan)
                </Label>
                <RadioGroup
                  value={typeReception}
                  onValueChange={(v) => setType(v as "sans_reserve" | "avec_reserve")}
                  className="flex flex-col gap-2"
                >
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="sans_reserve" className="mt-1" />
                    <span>
                      (A) la réception est prononcée <strong>sans réserve</strong> avec effet en date du{" "}
                      <input
                        type="date"
                        value={dateEffet}
                        onChange={(e) => setDateEffet(e.target.value)}
                        className="border-b border-foreground/40 bg-transparent font-doc px-1"
                      />
                      .
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="avec_reserve" className="mt-1" />
                    <span>
                      (B) la réception est prononcée avec effet en date du{" "}
                      <input
                        type="date"
                        value={dateEffet}
                        onChange={(e) => setDateEffet(e.target.value)}
                        className="border-b border-foreground/40 bg-transparent font-doc px-1"
                      />
                      , assortie des réserves ci-dessous.
                    </span>
                  </label>
                </RadioGroup>
              </div>

              {typeReception === "avec_reserve" && (
                <div className="mt-4 space-y-3 border-l-4 border-primary pl-4">
                  <div className="font-doc font-bold">État des réserves</div>

                  <div className="rounded-md bg-primary/5 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" /> Aide IA — décrivez le problème en une phrase
                    </div>
                    <Textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      rows={2}
                      placeholder="ex : la peinture du salon présente des coulures et il manque les plinthes au fond"
                      className="font-sans"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => aiMut.mutate()}
                      disabled={!aiInput.trim() || aiMut.isPending}
                    >
                      {aiMut.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 mr-2" />
                      )}
                      Reformuler avec l'IA
                    </Button>
                  </div>

                  <div>
                    <Label className="font-doc">Nature des réserves</Label>
                    <Textarea value={reservesNature} onChange={(e) => setRN(e.target.value)} rows={3} className="font-doc" />
                  </div>
                  <div>
                    <Label className="font-doc">Travaux à exécuter</Label>
                    <Textarea value={reservesTravaux} onChange={(e) => setRT(e.target.value)} rows={3} className="font-doc" />
                  </div>
                  <div>
                    <Label className="font-doc">Délai d'exécution</Label>
                    <Input
                      value={reservesDelai}
                      onChange={(e) => setRD(e.target.value)}
                      placeholder="ex : 15 jours"
                      className="font-doc"
                    />
                  </div>
                </div>
              )}

              <p className="mt-5">
                Fait à <AiField>{lieu}</AiField>, le <AiField>{todayFr}</AiField>, en{" "}
                <AiField>2</AiField> exemplaires dont un remis à chacune des parties.
              </p>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <SignaturePad label="Signature du maître de l'ouvrage" value={sigClient} onChange={setSigClient} />
                <SignaturePad label="Signature de l'entreprise" value={sigEnt} onChange={setSigEnt} />
              </div>

              {typeReception === "avec_reserve" && (
                <div className="mt-8 pt-4 border-t-2 border-dashed">
                  <h3 className="text-center font-bold mb-3">Procès-verbal de levée des réserves</h3>
                  <p className="text-justify text-muted-foreground italic">
                    À signer ultérieurement, une fois les réserves levées. Cette section figurera également
                    dans le PDF généré.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="px-6 pb-6 flex-wrap gap-2">
              <Button variant="outline" onClick={() => buildPdf().save(`PV-${client.nom}-${today}.pdf`)}>
                Aperçu PDF
              </Button>
              <Button
                disabled={!sigClient || !sigEnt || finaliser.isPending}
                onClick={() => finaliser.mutate()}
              >
                {finaliser.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Signer & envoyer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}