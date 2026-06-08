import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Envoi du PV par e-mail via Lovable Cloud.
 * Pas de dépendance à Supabase — fonctionne même sans compte connecté.
 */
export const envoyerPvParEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      destinataires: z.array(z.string().email()).min(1).max(5),
      sujet: z.string().min(1).max(200),
      message: z.string().min(1).max(5000),
      pdfBase64: z.string().min(1),
      pdfNom: z.string().min(1).max(200),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const origin = process.env.APP_URL ?? "";
    try {
      const idKey = `pv-${Date.now()}-${data.pdfNom.replace(/[^a-z0-9]/gi, "-")}`;
      const res = await fetch(`${origin}/lovable/email/transactional/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: "pv-reception",
          recipientEmail: data.destinataires[0],
          cc: data.destinataires.slice(1),
          idempotencyKey: idKey,
          templateData: { message: data.message, sujet: data.sujet },
          attachments: [
            {
              filename: data.pdfNom,
              content: data.pdfBase64,
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        }),
      });
      if (!res.ok) {
        return {
          sent: false,
          reason: "Lovable Cloud email non configuré",
          destinataires: data.destinataires,
        };
      }
      return { sent: true, destinataires: data.destinataires };
    } catch {
      return {
        sent: false,
        reason: "Envoi email à configurer dans Lovable Cloud",
        destinataires: data.destinataires,
      };
    }
  });
