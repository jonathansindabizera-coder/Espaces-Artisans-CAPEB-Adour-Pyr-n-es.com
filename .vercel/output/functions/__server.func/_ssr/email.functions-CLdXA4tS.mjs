import { c as createServerRpc } from "./createServerRpc-DOUb8MG3.mjs";
import { a as createServerFn } from "./server-6vWT_TeN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const envoyerPvParEmail_createServerFn_handler = createServerRpc({
  id: "a19ff3c136f8fdabb531ec75b75b284cbf8c38c3d4663f48323f57800f1c02fc",
  name: "envoyerPvParEmail",
  filename: "src/lib/email.functions.ts"
}, (opts) => envoyerPvParEmail.__executeServer(opts));
const envoyerPvParEmail = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  destinataires: arrayType(stringType().email()).min(1).max(5),
  sujet: stringType().min(1).max(200),
  message: stringType().min(1).max(5e3),
  pdfBase64: stringType().min(1),
  pdfNom: stringType().min(1).max(200)
}).parse(input)).handler(envoyerPvParEmail_createServerFn_handler, async ({
  data
}) => {
  const origin = process.env.APP_URL ?? "";
  try {
    const idKey = `pv-${Date.now()}-${data.pdfNom.replace(/[^a-z0-9]/gi, "-")}`;
    const res = await fetch(`${origin}/lovable/email/transactional/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        templateName: "pv-reception",
        recipientEmail: data.destinataires[0],
        cc: data.destinataires.slice(1),
        idempotencyKey: idKey,
        templateData: {
          message: data.message,
          sujet: data.sujet
        },
        attachments: [{
          filename: data.pdfNom,
          content: data.pdfBase64,
          encoding: "base64",
          contentType: "application/pdf"
        }]
      })
    });
    if (!res.ok) {
      return {
        sent: false,
        reason: "Lovable Cloud email non configuré",
        destinataires: data.destinataires
      };
    }
    return {
      sent: true,
      destinataires: data.destinataires
    };
  } catch {
    return {
      sent: false,
      reason: "Envoi email à configurer dans Lovable Cloud",
      destinataires: data.destinataires
    };
  }
});
export {
  envoyerPvParEmail_createServerFn_handler
};
