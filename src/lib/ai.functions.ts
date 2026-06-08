import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const reformulerReserves = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      texte: z.string().min(3).max(2000),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Tu es un assistant pour un artisan du bâtiment. Reformule de façon claire, professionnelle et concise les réserves listées sur un PV de réception de travaux. Réponds en français uniquement, en deux courts paragraphes : 1) 'Nature des réserves' (1-3 phrases factuelles), 2) 'Travaux à exécuter' (1-3 phrases d'actions concrètes). Sépare les deux par une ligne contenant uniquement '---'. Pas d'introduction, pas de conclusion.",
          },
          { role: "user", content: data.texte },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`IA indisponible (${res.status}): ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    const [nature, travaux] = content.split(/\n?---\n?/).map((s: string) => s.trim());
    return { nature: nature || content.trim(), travaux: travaux || "" };
  });