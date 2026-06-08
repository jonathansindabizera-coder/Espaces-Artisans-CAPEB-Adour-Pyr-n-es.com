import { createServerFn } from "@tanstack/react-start";

const CAPEB_URL = "https://www.capeb.fr/adour-pyrenees/nos-services?tab=training";

const LIEUX = ["LESCAR", "ANGLET", "TARBES", "PAU"];

const THEMES: [RegExp, string][] = [
  [/pompe.?à.?chaleur|qualipac|pac\b/i, "Pompe à chaleur"],
  [/photovoltai|solaire|qualisol/i, "Énergie solaire"],
  [/rge|rénovation|qualibat|renovation/i, "RGE / Rénovation"],
  [/électri|habilitation|br[0-9]?|b1|b2|bc\b/i, "Électricité / Habilitation"],
  [/sécurité|securi|amiante|échafaud|echafaud/i, "Sécurité"],
  [/gestion|comptab|devis|facturation/i, "Gestion"],
  [/communication|commercial/i, "Communication"],
  [/plomb|sanitaire/i, "Plomberie / Sanitaire"],
  [/charpente|menuiserie/i, "Charpente / Menuiserie"],
  [/peinture|enduit/i, "Peinture"],
];

function detectLieu(titre: string): string | null {
  const upper = titre.toUpperCase();
  for (const lieu of LIEUX) {
    if (upper.includes(lieu)) return lieu[0] + lieu.slice(1).toLowerCase();
  }
  return null;
}

function detectTheme(titre: string): string {
  for (const [regex, label] of THEMES) {
    if (regex.test(titre)) return label;
  }
  return "Autre";
}

function nettoyerTitre(titre: string): string {
  let t = titre.trim();
  for (const lieu of LIEUX) {
    t = t.replace(new RegExp(`\\s+${lieu}\\s*$`, "i"), "").trim();
    t = t.replace(new RegExp(`\\s*-\\s*${lieu}\\s*$`, "i"), "").trim();
  }
  // Supprimer les espaces multiples
  return t.replace(/\s{2,}/g, " ").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export type FormationCapeb = {
  external_id: string;
  titre: string;
  lieu: string | null;
  theme: string;
  date_debut: string | null;
  duree_texte: string | null;
  description: string | null;
  url_programme_pdf: string | null;
  url_ics: string;
};

function parseFormations(html: string): FormationCapeb[] {
  const formations: FormationCapeb[] = [];
  const seen = new Set<string>();

  // Repérer chaque bloc par son lien ICS unique
  const icsRegex = /https?:\/\/www\.capeb\.fr\/ics\?item=(training_\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = icsRegex.exec(html)) !== null) {
    const external_id = match[1];
    if (seen.has(external_id)) continue;
    seen.add(external_id);

    const icsUrl = `https://www.capeb.fr/ics?item=${external_id}`;
    const posIcs = match.index;

    // Contexte : 5000 chars avant le lien ICS
    const debut = Math.max(0, posIcs - 5000);
    const bloc = html.slice(debut, posIcs + 200);

    // --- TITRE ---
    // Chercher le dernier h2/h3/h4 avant le lien ICS
    let titre = "";
    const titreRegexes = [
      /<h[2-4][^>]*>\s*([\s\S]{10,200}?)\s*<\/h[2-4]>/gi,
      /class="[^"]*(?:title|name|intitule)[^"]*"[^>]*>\s*([\s\S]{10,200}?)\s*</gi,
    ];
    for (const rx of titreRegexes) {
      const tous: string[] = [];
      let m: RegExpExecArray | null;
      rx.lastIndex = 0;
      while ((m = rx.exec(bloc)) !== null) tous.push(stripHtml(m[1]));
      if (tous.length) { titre = tous[tous.length - 1]; break; }
    }
    // Fallback : chercher un texte en majuscules (titres CAPEB)
    if (!titre) {
      const majMatch = bloc.match(/>\s*([A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ\s\/\-]{15,})\s*</);
      if (majMatch) titre = majMatch[1].trim();
    }
    if (!titre) titre = external_id;

    // --- DATE ---
    let date_debut: string | null = null;
    const dateMatch = bloc.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?)/);
    if (dateMatch) {
      try { date_debut = new Date(dateMatch[1]).toISOString(); } catch { /* ignore */ }
    }

    // --- DURÉE ---
    const dureeMatch =
      bloc.match(/(\d+\s*jours?\s+\d+\s*h(?:eures?)?)/i) ||
      bloc.match(/(\d+\s*h(?:eures?)?\s+\d+\s*jours?)/i) ||
      bloc.match(/(\d+\s*jours?)/i) ||
      bloc.match(/(\d+\s*h(?:eures?)?)/i);
    const duree_texte = dureeMatch ? dureeMatch[1].trim() : null;

    // --- DESCRIPTION ---
    let description: string | null = null;
    const descRegexes = [
      /<p[^>]*>\s*([\s\S]{40,600}?)\s*<\/p>/,
      /class="[^"]*(?:desc|objectif|content|text)[^"]*"[^>]*>\s*([\s\S]{40,600}?)\s*</i,
    ];
    for (const rx of descRegexes) {
      const dm = bloc.match(rx);
      if (dm) {
        const txt = stripHtml(dm[1]);
        if (txt.length >= 40) { description = txt.slice(0, 300); break; }
      }
    }

    // --- PDF ---
    let url_programme_pdf: string | null = null;
    const pdfMatch =
      bloc.match(/href="([^"]*\.pdf[^"]*)"/i) ||
      bloc.match(/href="([^"]*programme[^"]*)"/i) ||
      bloc.match(/href="([^"]*telecharger[^"]*)"/i);
    if (pdfMatch) {
      url_programme_pdf = pdfMatch[1].startsWith("http")
        ? pdfMatch[1]
        : `https://www.capeb.fr${pdfMatch[1]}`;
    }

    const lieu = detectLieu(titre);
    const titreNettoye = nettoyerTitre(titre);
    const theme = detectTheme(titreNettoye);

    formations.push({
      external_id,
      titre: titreNettoye,
      lieu,
      theme,
      date_debut,
      duree_texte,
      description,
      url_programme_pdf,
      url_ics: icsUrl,
    });
  }

  // Trier par date croissante
  return formations.sort((a, b) => {
    if (!a.date_debut) return 1;
    if (!b.date_debut) return -1;
    return a.date_debut.localeCompare(b.date_debut);
  });
}

export const fetchFormationsCapeb = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const response = await fetch(CAPEB_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status} en accédant à capeb.fr`);
    }

    const html = await response.text();
    const formations = parseFormations(html);

    return {
      ok: true as const,
      formations,
      fetchedAt: new Date().toISOString(),
      count: formations.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Formations] Erreur:", message);
    return {
      ok: false as const,
      formations: [] as FormationCapeb[],
      fetchedAt: new Date().toISOString(),
      count: 0,
      error: message,
    };
  }
});
