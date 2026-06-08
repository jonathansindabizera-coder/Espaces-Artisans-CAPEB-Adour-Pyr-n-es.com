import { c as createServerRpc } from "./createServerRpc-DOUb8MG3.mjs";
import { a as createServerFn } from "./server-6vWT_TeN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const reformulerReserves_createServerFn_handler = createServerRpc({
  id: "b3fb65dda702ca1be5bf069805d390f4f1d8e75719f576416045dc6b3b17e9cc",
  name: "reformulerReserves",
  filename: "src/lib/ai.functions.ts"
}, (opts) => reformulerReserves.__executeServer(opts));
const reformulerReserves = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  texte: stringType().min(3).max(2e3)
}).parse(input)).handler(reformulerReserves_createServerFn_handler, async ({
  data
}) => {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "system",
        content: "Tu es un assistant pour un artisan du bâtiment. Reformule de façon claire, professionnelle et concise les réserves listées sur un PV de réception de travaux. Réponds en français uniquement, en deux courts paragraphes : 1) 'Nature des réserves' (1-3 phrases factuelles), 2) 'Travaux à exécuter' (1-3 phrases d'actions concrètes). Sépare les deux par une ligne contenant uniquement '---'. Pas d'introduction, pas de conclusion."
      }, {
        role: "user",
        content: data.texte
      }]
    })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`IA indisponible (${res.status}): ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  const [nature, travaux] = content.split(/\n?---\n?/).map((s) => s.trim());
  return {
    nature: nature || content.trim(),
    travaux: travaux || ""
  };
});
export {
  reformulerReserves_createServerFn_handler
};
