import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const CAPEB_EMAIL = "thierry.jodar@adour-pyrenees-conseil.fr";

export const envoyerInscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      formation: z.object({
        titre: z.string(),
        lieu: z.string().nullable(),
        date_debut: z.string().nullable(),
        duree_texte: z.string().nullable(),
      }),
      artisan: z.object({
        nom: z.string(),
        entreprise: z.string(),
        email: z.string(),
        telephone: z.string(),
      }),
      nbParticipants: z.number().int().min(1),
      nomsParticipants: z.string().optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { formation, artisan, nbParticipants, nomsParticipants } = data;

    const dateFr = formation.date_debut
      ? format(parseISO(formation.date_debut), "d MMMM yyyy", { locale: fr })
      : "Date non précisée";

    const ligneParticipants = nomsParticipants?.trim()
      ? `\nNoms des participants :\n${nomsParticipants}`
      : "";

    const corps = `Bonjour,

Une demande d'inscription à une formation a été soumise via l'Espace Artisan CAPEB.

--- FORMATION ---
Intitulé : ${formation.titre}
Lieu     : ${formation.lieu || "Non précisé"}
Date     : ${dateFr}
Durée    : ${formation.duree_texte || "Non précisée"}

--- ARTISAN ---
Nom          : ${artisan.nom}
Entreprise   : ${artisan.entreprise}
Email        : ${artisan.email}
Téléphone    : ${artisan.telephone}

--- PARTICIPANTS ---
Nombre       : ${nbParticipants}${ligneParticipants}

---
Cette demande a été générée automatiquement depuis l'Espace Artisan CAPEB Adour-Pyrénées.
`;

    const destinataires = [CAPEB_EMAIL];
    if (artisan.email && artisan.email.includes("@") && artisan.email !== "Non renseigné") {
      destinataires.push(artisan.email);
    }

    const origin = process.env.APP_URL || "";

    try {
      const res = await fetch(`${origin}/lovable/email/transactional/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: "inscription-formation",
          recipientEmail: CAPEB_EMAIL,
          cc: destinataires.slice(1),
          idempotencyKey: `inscription-${artisan.email}-${formation.titre}-${Date.now()}`,
          templateData: {
            sujet: `Demande d'inscription – ${formation.titre} – ${artisan.nom}`,
            message: corps,
          },
        }),
      });

      if (!res.ok) {
        return { sent: false, reason: "Configuration email à finaliser" };
      }
      return { sent: true, destinataires };
    } catch {
      return { sent: false, reason: "Envoi email non disponible" };
    }
  });
