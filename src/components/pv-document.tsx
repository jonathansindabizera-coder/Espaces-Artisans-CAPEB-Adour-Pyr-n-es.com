import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { updateChantierStatut, notifyUpdate } from "@/lib/local-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

// ── Champ pré-rempli par l'IA (mise en évidence rouge) ───────────────────────
function AiField({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-semibold rounded-[3px] px-[5px] py-[1px] align-baseline"
      style={{
        background: "#FCE7E9",
        color: "#A30012",
        borderBottom: "1.5px solid #E2001A",
      }}
    >
      {children}
      <span
        className="text-[8px] font-bold uppercase tracking-wider rounded px-[4px] py-[1px]"
        style={{ background: "#E2001A", color: "#fff" }}
      >
        IA
      </span>
    </span>
  );
}

function toFrDate(iso: string | null | undefined): string {
  if (!iso) return "__________";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function cityFromAdresse(adr: string | null): string {
  if (!adr) return "—";
  const parts = adr.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    return last.replace(/^\d{5}\s*/, "").trim() || last;
  }
  return adr;
}

// ── Composant principal ────────────────────────────────────────────────────────
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
  const today   = new Date().toISOString().slice(0, 10);
  const todayFr = toFrDate(today);


  const [typeReception, setType]   = useState<"sans_reserve" | "avec_reserve">("sans_reserve");
  const [dateEffet, setDateEffet]   = useState(today);
  const [reservesNature, setRN]     = useState("");
  const [reservesTravaux, setRT]    = useState("");
  const [reservesDelai, setRD]      = useState("");
  const [aiInput, setAiInput]       = useState("");
  const [sigClient, setSigClient]   = useState<string | null>(null);
  const [sigEnt, setSigEnt]         = useState<string | null>(null);
  const [emailClient, setEmailClient] = useState(client.email ?? "");
  const [confirmation, setConfirmation] = useState<{ destinataires: string[]; emailSent: boolean } | null>(null);

  const reformuler = useServerFn(reformulerReserves);
  const envoyer    = useServerFn(envoyerPvParEmail);

  const aiMut = useMutation({
    mutationFn: async () => reformuler({ data: { texte: aiInput } }),
    onSuccess: (r) => {
      if (r.nature) setRN(r.nature);
      if (r.travaux) setRT(r.travaux);
      toast.success("Réserves reformulées par l'IA");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const entreprise = "—";
  const lieu       = cityFromAdresse(client.adresse);
  const dateMarche = chantier.date_creation?.slice(0, 10) ?? today;

  const buildPdf = () =>
    generatePvPdf({
      entreprise,
      entrepriseAdresse: null,
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
      dateMarche,
      representant: entreprise,
      nbExemplaires: 2,
      signatureClient: sigClient,
      signatureEntreprise: sigEnt,
    });

  const finaliser = useMutation({
    mutationFn: async () => {
      // 1. Mise à jour statut chantier en local
      updateChantierStatut(chantier.id, "termine");
      notifyUpdate();

      // 2. Générer + télécharger le PDF
      const doc      = buildPdf();
      const fileName = `PV-${client.nom.replace(/\s+/g, "_")}-${today}.pdf`;
      doc.save(fileName);

      // 3. Envoi email
      const destinataires = [emailClient]
        .filter((x): x is string => typeof x === "string" && x.includes("@"));

      let emailSent = false;
      if (destinataires.length > 0) {
        const pdfBase64 = doc.output("datauristring").split(",")[1];
        const result = await envoyer({
          data: {
            destinataires,
            sujet: `PV de réception – ${client.nom} – ${todayFr}`,
            message:
              `Bonjour,\n\nVeuillez trouver ci-joint le procès-verbal de réception des travaux signé le ${todayFr}.\n\nCordialement,\n${entreprise}`,
            pdfBase64,
            pdfNom: fileName,
          },
        });
        emailSent = result.sent;
      }

      return { destinataires, emailSent };
    },
    onSuccess: ({ destinataires, emailSent }) => {
      setConfirmation({ destinataires, emailSent });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const close = () => {
    setConfirmation(null);
    onOpenChange(false);
  };

  const canSend      = !!sigClient && !!sigEnt && !finaliser.isPending;
  const emailManquant = !emailClient.includes("@");

  return (
    <Dialog open={open} onOpenChange={o => (o ? onOpenChange(true) : close())}>
      {/*
        [&>button:last-of-type] = le bouton × automatique de shadcn, rendu blanc
        pour s'harmoniser avec le header rouge.
      */}
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0
          [&>button:last-of-type]:text-white
          [&>button:last-of-type]:top-[22px]
          [&>button:last-of-type]:right-5
          [&>button:last-of-type]:opacity-90
          [&>button:last-of-type]:hover:opacity-100"
      >
        {/* DialogTitle caché pour l'accessibilité */}
        <DialogTitle className="sr-only">Procès-verbal de réception des travaux</DialogTitle>

        {/* ── HEADER ROUGE ──────────────────────────────────────────────── */}
        <div
          className="flex items-center px-6 py-5 sticky top-0 z-10"
          style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)" }}
        >
          <h2 className="font-display text-[18px] text-white uppercase tracking-[.03em] leading-tight">
            Procès-verbal de réception des travaux
          </h2>
        </div>

        {/* ── ÉCRAN DE CONFIRMATION ─────────────────────────────────────── */}
        {confirmation ? (
          <div className="px-6 py-8 space-y-5">
            <div
              className="flex items-start gap-4 rounded-[14px] border p-5"
              style={{ background: "#E7F4EC", borderColor: "#c6e6d2" }}
            >
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-0.5" style={{ color: "#1E8E55" }} />
              <div style={{ color: "#15693E" }}>
                <div className="font-display text-[15px] uppercase tracking-wide font-semibold mb-2">
                  PV signé — Chantier passé en « Terminé »
                </div>
                {confirmation.emailSent && confirmation.destinataires.length > 0 ? (
                  <div className="text-[13px]">
                    PDF envoyé automatiquement à :{" "}
                    <strong>{confirmation.destinataires.join(", ")}</strong>
                  </div>
                ) : confirmation.destinataires.length > 0 ? (
                  <div className="text-[13px]">
                    PDF téléchargé.{" "}
                    <span className="opacity-80">
                      Configurez l'envoi email dans Lovable Cloud pour l'automatiser.
                    </span>
                  </div>
                ) : (
                  <div className="text-[13px]">
                    PDF téléchargé.{" "}
                    <span className="opacity-80">
                      Ajoutez les emails dans les fiches pour l'envoi automatique.
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={close} className="btn-capeb w-full flex items-center justify-center">
              Fermer
            </button>
          </div>

        ) : (
          <>
            {/* ── DOCUMENT OFFICIEL ──────────────────────────────────────── */}
            <div
              className="mx-5 my-5 rounded-[12px] border border-[#ECE7E1] bg-white"
              style={{
                padding: "32px 36px",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 14.5,
                lineHeight: 1.85,
                color: "#222",
                boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)",
              }}
            >
              {/* Titre du document */}
              <h2
                className="text-center font-bold mb-1"
                style={{ fontFamily: "Georgia, serif", fontSize: 18, textTransform: "uppercase", letterSpacing: ".04em" }}
              >
                Réception des travaux
              </h2>
              <p className="text-center text-[12px] italic mb-6" style={{ color: "#8B847D", fontFamily: "inherit" }}>
                Procès-verbal CAPEB Adour-Pyrénées
              </p>

              {/* Légende champs IA */}
              <div className="flex items-center gap-4 text-[11px] mb-5 font-sans not-italic" style={{ color: "#8B847D" }}>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block rounded px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wider"
                    style={{ background: "#E2001A", color: "#fff" }}
                  >
                    IA
                  </span>
                  = Pré-rempli automatiquement (modifiable)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="border-b border-dashed border-gray-400 w-8 inline-block" />
                  = À compléter
                </span>
              </div>

              {/* ─ Texte principal ─ */}
              <p className="text-justify">
                Je soussigné(e){" "}
                <AiField>{client.nom}</AiField>, maître de l'ouvrage, après avoir procédé à la visite des
                travaux effectués par{" "}
                <AiField>{entreprise}</AiField>, au titre du marché en date du{" "}
                <AiField>{toFrDate(dateMarche)}</AiField>{" "}
                et relatif à{" "}
                <AiField>{chantier.nature_travaux}</AiField>, en présence du représentant de{" "}
                <AiField>{entreprise}</AiField>{" "}
                (l'entreprise et le maître d'œuvre le cas échéant).
              </p>

              <p className="mt-4 font-bold">Déclare que :</p>

              {/* ─ Choix sans/avec réserves ─ */}
              <div
                className="mt-3 rounded-[12px] p-4 space-y-3"
                style={{
                  border: "2px dashed #ECE7E1",
                  background: "#FAFAF9",
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-[.08em] mb-2 font-sans"
                  style={{ color: "#8B847D" }}
                >
                  À compléter par l'artisan
                </p>

                <label className="flex items-start gap-3 cursor-pointer text-[14.5px]">
                  <input
                    type="radio"
                    name="typeRec"
                    checked={typeReception === "sans_reserve"}
                    onChange={() => setType("sans_reserve")}
                    className="mt-1.5 cursor-pointer"
                    style={{ accentColor: "#E2001A", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    (A) la réception est prononcée <strong>SANS réserve</strong> avec effet en date du{" "}
                    <input
                      type="date"
                      value={dateEffet}
                      onChange={e => setDateEffet(e.target.value)}
                      className="outline-none focus:border-[#E2001A]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: 14,
                        borderBottom: "1.5px solid #4A453F",
                        background: "transparent",
                        padding: "0 4px",
                      }}
                    />{" "}
                    ;
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-[14.5px]">
                  <input
                    type="radio"
                    name="typeRec"
                    checked={typeReception === "avec_reserve"}
                    onChange={() => setType("avec_reserve")}
                    className="mt-1.5 cursor-pointer"
                    style={{ accentColor: "#E2001A", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    (B) la réception est prononcée avec effet en date du{" "}
                    <input
                      type="date"
                      value={dateEffet}
                      onChange={e => setDateEffet(e.target.value)}
                      className="outline-none focus:border-[#E2001A]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: 14,
                        borderBottom: "1.5px solid #4A453F",
                        background: "transparent",
                        padding: "0 4px",
                      }}
                    />
                    , assortie des réserves mentionnées ci-dessous.
                  </span>
                </label>
              </div>

              {/* ─ Section réserves (visible seulement si avec_reserve) ─ */}
              {typeReception === "avec_reserve" && (
                <div className="mt-5 space-y-4">
                  <h3
                    className="font-bold"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 15,
                      borderBottom: "1.5px solid #222",
                      paddingBottom: 3,
                    }}
                  >
                    État des réserves
                  </h3>

                  {/* Aide IA */}
                  <div
                    className="rounded-[10px] p-3 space-y-2 font-sans not-italic"
                    style={{
                      background: "#FCE7E9",
                      border: "1px solid rgba(226,0,26,.2)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "#E2001A" }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Aide IA — décrivez le problème en une phrase
                    </div>
                    <Textarea
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      rows={2}
                      placeholder="ex : la peinture du salon présente des coulures et il manque les plinthes…"
                      className="font-sans text-sm bg-white border-[#ECE7E1]"
                    />
                    <button
                      type="button"
                      onClick={() => aiMut.mutate()}
                      disabled={!aiInput.trim() || aiMut.isPending}
                      className="flex items-center gap-2 text-[12px] font-semibold rounded-[8px] border px-3 py-1.5 transition-colors disabled:opacity-50"
                      style={{
                        background: "rgba(226,0,26,.08)",
                        borderColor: "rgba(226,0,26,.4)",
                        color: "#A30012",
                      }}
                      onMouseEnter={e => !aiMut.isPending && (e.currentTarget.style.background = "rgba(226,0,26,.15)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(226,0,26,.08)")}
                    >
                      {aiMut.isPending
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Sparkles className="h-3 w-3" />}
                      Reformuler avec l'IA
                    </button>
                  </div>

                  <div className="space-y-3 font-sans not-italic">
                    <div>
                      <Label className="text-[13px] font-bold" style={{ fontFamily: "Georgia, serif" }}>
                        Nature des réserves
                      </Label>
                      <Textarea
                        value={reservesNature}
                        onChange={e => setRN(e.target.value)}
                        rows={3}
                        className="mt-1"
                        style={{ fontFamily: "Georgia, serif" }}
                        placeholder="Décrivez les défauts constatés…"
                      />
                    </div>
                    <div>
                      <Label className="text-[13px] font-bold" style={{ fontFamily: "Georgia, serif" }}>
                        Travaux à exécuter
                      </Label>
                      <Textarea
                        value={reservesTravaux}
                        onChange={e => setRT(e.target.value)}
                        rows={3}
                        className="mt-1"
                        style={{ fontFamily: "Georgia, serif" }}
                        placeholder="Décrivez les travaux de reprise nécessaires…"
                      />
                    </div>
                    <div>
                      <Label className="text-[13px] font-bold" style={{ fontFamily: "Georgia, serif" }}>
                        Délai d'exécution des réserves
                      </Label>
                      <Input
                        value={reservesDelai}
                        onChange={e => setRD(e.target.value)}
                        placeholder="ex : 15 jours"
                        className="mt-1"
                        style={{ fontFamily: "Georgia, serif" }}
                      />
                    </div>
                  </div>

                  <p>
                    L'entreprise et le maître d'ouvrage conviennent que les travaux nécessités par les réserves
                    seront exécutés dans un délai global de{" "}
                    <strong>{reservesDelai || <span style={{ borderBottom: "1px dashed #999", padding: "0 24px" }} />}</strong>{" "}
                    à compter de ce jour.
                  </p>
                </div>
              )}

              {/* ─ Fait à / Date / Exemplaires ─ */}
              <p className="mt-6">
                Fait à <AiField>{lieu}</AiField>, le <AiField>{todayFr}</AiField>, en{" "}
                <AiField>2</AiField> exemplaires dont un remis à chacune des parties.
              </p>

              {/* ─ Alerte email manquant ─ */}
              {emailManquant && (
                <div
                  className="mt-4 rounded-[10px] p-3 space-y-2 font-sans not-italic"
                  style={{
                    background: "#FBF1DE",
                    border: "1px solid #f0dca8",
                  }}
                >
                  <p className="text-[12.5px] font-semibold" style={{ color: "#8a6d1f" }}>
                    ⚠️ Email du client manquant — à saisir pour l'envoi automatique du PDF
                  </p>
                  <Input
                    type="email"
                    value={emailClient}
                    onChange={e => setEmailClient(e.target.value)}
                    placeholder="email@client.fr"
                    className="font-sans bg-white"
                  />
                </div>
              )}

              {/* ─ SIGNATURES ─ */}
              <div className="mt-8 grid md:grid-cols-2 gap-6 font-sans not-italic">
                <SignaturePad
                  label="Le maître de l'ouvrage"
                  value={sigClient}
                  onChange={setSigClient}
                />
                <SignaturePad
                  label="L'entreprise"
                  value={sigEnt}
                  onChange={setSigEnt}
                />
              </div>

              {/* ─ PARTIE 2 — LEVÉE DES RÉSERVES ─ */}
              {typeReception === "avec_reserve" && (
                <div
                  className="mt-10 pt-6"
                  style={{ borderTop: "2px dashed #CCC" }}
                >
                  <h2
                    className="text-center font-bold mb-4 uppercase"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 16,
                      letterSpacing: ".04em",
                    }}
                  >
                    Procès-verbal de levée des réserves
                  </h2>

                  <p className="text-justify">
                    Le maître de l'ouvrage et l'entreprise{" "}
                    <AiField>{entreprise}</AiField>{" "}
                    constatent qu'il a été valablement remédié aux réserves mentionnées dans le PV de réception
                    en date du <AiField>{toFrDate(dateEffet)}</AiField>.
                  </p>

                  <p
                    className="mt-2 text-[12.5px] italic font-sans not-italic"
                    style={{ color: "#8B847D" }}
                  >
                    Ce document sera signé ultérieurement, une fois les réserves levées.
                    Il figure déjà dans le PDF généré.
                  </p>

                  <p className="mt-3">
                    Fait à <AiField>{lieu}</AiField>, le{" "}
                    <span
                      className="inline-block"
                      style={{ borderBottom: "1px dashed #999", minWidth: 80, padding: "0 4px" }}
                    >
                      &nbsp;
                    </span>
                    , en <AiField>2</AiField> exemplaires dont un remis à chaque signataire.
                  </p>
                </div>
              )}
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <div className="px-5 pb-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => buildPdf().save(`PV-${client.nom}-${today}.pdf`)}
                className="flex items-center gap-2 text-[13px] font-semibold rounded-[10px] px-4 py-[10px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors"
                style={{ background: "white", color: "#4A453F", boxShadow: "0 1px 2px rgba(26,23,20,.05)" }}
              >
                Aperçu PDF
              </button>

              <div className="flex items-center gap-3">
                {(!sigClient || !sigEnt) && (
                  <span className="text-[12px]" style={{ color: "#8B847D" }}>
                    {!sigClient && !sigEnt
                      ? "Les 2 signatures manquent"
                      : !sigClient
                      ? "Signature client manquante"
                      : "Signature artisan manquante"}
                  </span>
                )}
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={() => finaliser.mutate()}
                  className="btn-capeb flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {finaliser.isPending ? (
                    <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                  ) : (
                    <Send style={{ width: 18, height: 18 }} />
                  )}
                  Signer &amp; envoyer
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
