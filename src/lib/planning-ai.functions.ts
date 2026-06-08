import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  absence: z.object({
    employeNom: z.string(),
    motif: z.string().nullable(),
    debut: z.string(),
    fin: z.string(),
  }),
  chantiersImpactes: z.array(
    z.object({
      id: z.string(),
      client: z.string(),
      ville: z.string().nullable(),
      nature: z.string(),
      duree: z.string().nullable(),
      jours: z.array(
        z.object({
          date: z.string(),
          demi_journee: z.enum(["matin", "apres_midi", "journee"]),
          affectationId: z.string(),
        }),
      ),
    }),
  ),
  employesDisponibles: z.array(
    z.object({
      id: z.string(),
      nom: z.string(),
      role: z.string().nullable(),
      joursLibres: z.array(z.string()),
    }),
  ),
});

export type PropositionReaff = {
  resume: string;
  transferts: Array<{
    affectationId: string;
    nouveauEmployeId: string;
    nouvelleDate: string;
    demi_journee: "matin" | "apres_midi" | "journee";
  }>;
};

export const proposerReaffectation = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<PropositionReaff> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Tu es un assistant pour artisan du bâtiment. Un employé est absent. Tu dois proposer une réorganisation concrète des chantiers impactés vers les employés disponibles. Réponds UNIQUEMENT via l'outil 'proposer_plan'. Le résumé doit être court (2-3 phrases) en français clair, sans jargon, citer les prénoms et chantiers, et indiquer s'il y a un risque de retard.",
          },
          { role: "user", content: JSON.stringify(data) },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "proposer_plan",
              description: "Plan de réaffectation",
              parameters: {
                type: "object",
                properties: {
                  resume: { type: "string" },
                  transferts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        affectationId: { type: "string" },
                        nouveauEmployeId: { type: "string" },
                        nouvelleDate: { type: "string" },
                        demi_journee: { type: "string", enum: ["matin", "apres_midi", "journee"] },
                      },
                      required: ["affectationId", "nouveauEmployeId", "nouvelleDate", "demi_journee"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["resume", "transferts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "proposer_plan" } },
      }),
    });
    if (!res.ok) throw new Error(`IA indisponible (${res.status})`);
    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) throw new Error("Réponse IA vide");
    return JSON.parse(args) as PropositionReaff;
  });