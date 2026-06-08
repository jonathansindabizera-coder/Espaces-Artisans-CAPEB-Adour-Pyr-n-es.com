import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Envoi du PV par e-mail. Tente d'utiliser le système d'e-mails Lovable
 * (/lovable/email/transactional/send) si configuré, sinon renvoie
 * { sent: false, reason } pour permettre à l'UI d'afficher un message
 * informatif sans bloquer la signature du PV.
 */
export const envoyerPvParEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      destinataires: z.array(z.string().email()).min(1).max(5),
      sujet: z.string().min(1).max(200),
      message: z.string().min(1).max(5000),
      pdfBase64: z.string().min(1),
      pdfNom: z.string().min(1).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const origin = process.env.APP_URL || "";
    try {
      const res = await fetch(`${origin}/lovable/email/transactional/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: "pv-reception",
          recipientEmail: data.destinataires[0],
          cc: data.destinataires.slice(1),
          idempotencyKey: `pv-${userId}-${data.pdfNom}`,
          templateData: { message: data.message, sujet: data.sujet },
        }),
      });
      if (!res.ok) {
        return {
          sent: false,
          reason: "Configuration e-mail à finaliser",
          destinataires: data.destinataires,
        };
      }
      return { sent: true, destinataires: data.destinataires };
    } catch {
      return {
        sent: false,
        reason: "Configuration e-mail à finaliser",
        destinataires: data.destinataires,
      };
    }
  });