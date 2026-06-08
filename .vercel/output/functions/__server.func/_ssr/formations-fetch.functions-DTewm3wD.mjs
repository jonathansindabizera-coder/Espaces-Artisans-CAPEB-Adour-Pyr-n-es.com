import { c as createServerRpc } from "./createServerRpc-DOUb8MG3.mjs";
import { a as createServerFn } from "./server-6vWT_TeN.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
const CAPEB_URL = "https://www.capeb.fr/adour-pyrenees/nos-services?tab=training";
const LIEUX = ["LESCAR", "ANGLET", "TARBES", "PAU"];
const THEMES = [[/pompe.?à.?chaleur|qualipac|pac\b/i, "Pompe à chaleur"], [/photovoltai|solaire|qualisol/i, "Énergie solaire"], [/rge|rénovation|qualibat|renovation/i, "RGE / Rénovation"], [/électri|habilitation|br[0-9]?|b1|b2|bc\b/i, "Électricité / Habilitation"], [/sécurité|securi|amiante|échafaud|echafaud/i, "Sécurité"], [/gestion|comptab|devis|facturation/i, "Gestion"], [/communication|commercial/i, "Communication"], [/plomb|sanitaire/i, "Plomberie / Sanitaire"], [/charpente|menuiserie/i, "Charpente / Menuiserie"], [/peinture|enduit/i, "Peinture"]];
function detectLieu(titre) {
  const upper = titre.toUpperCase();
  for (const lieu of LIEUX) {
    if (upper.includes(lieu)) return lieu[0] + lieu.slice(1).toLowerCase();
  }
  return null;
}
function detectTheme(titre) {
  for (const [regex, label] of THEMES) {
    if (regex.test(titre)) return label;
  }
  return "Autre";
}
function nettoyerTitre(titre) {
  let t = titre.trim();
  for (const lieu of LIEUX) {
    t = t.replace(new RegExp(`\\s+${lieu}\\s*$`, "i"), "").trim();
    t = t.replace(new RegExp(`\\s*-\\s*${lieu}\\s*$`, "i"), "").trim();
  }
  return t.replace(/\s{2,}/g, " ").trim();
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}
function parseFormations(html) {
  const formations = [];
  const seen = /* @__PURE__ */ new Set();
  const icsRegex = /https?:\/\/www\.capeb\.fr\/ics\?item=(training_\d+)/g;
  let match;
  while ((match = icsRegex.exec(html)) !== null) {
    const external_id = match[1];
    if (seen.has(external_id)) continue;
    seen.add(external_id);
    const icsUrl = `https://www.capeb.fr/ics?item=${external_id}`;
    const posIcs = match.index;
    const debut = Math.max(0, posIcs - 5e3);
    const bloc = html.slice(debut, posIcs + 200);
    let titre = "";
    const titreRegexes = [/<h[2-4][^>]*>\s*([\s\S]{10,200}?)\s*<\/h[2-4]>/gi, /class="[^"]*(?:title|name|intitule)[^"]*"[^>]*>\s*([\s\S]{10,200}?)\s*</gi];
    for (const rx of titreRegexes) {
      const tous = [];
      let m;
      rx.lastIndex = 0;
      while ((m = rx.exec(bloc)) !== null) tous.push(stripHtml(m[1]));
      if (tous.length) {
        titre = tous[tous.length - 1];
        break;
      }
    }
    if (!titre) {
      const majMatch = bloc.match(/>\s*([A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ\s\/\-]{15,})\s*</);
      if (majMatch) titre = majMatch[1].trim();
    }
    if (!titre) titre = external_id;
    let date_debut = null;
    const dateMatch = bloc.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?)/);
    if (dateMatch) {
      try {
        date_debut = new Date(dateMatch[1]).toISOString();
      } catch {
      }
    }
    const dureeMatch = bloc.match(/(\d+\s*jours?\s+\d+\s*h(?:eures?)?)/i) || bloc.match(/(\d+\s*h(?:eures?)?\s+\d+\s*jours?)/i) || bloc.match(/(\d+\s*jours?)/i) || bloc.match(/(\d+\s*h(?:eures?)?)/i);
    const duree_texte = dureeMatch ? dureeMatch[1].trim() : null;
    let description = null;
    const descRegexes = [/<p[^>]*>\s*([\s\S]{40,600}?)\s*<\/p>/, /class="[^"]*(?:desc|objectif|content|text)[^"]*"[^>]*>\s*([\s\S]{40,600}?)\s*</i];
    for (const rx of descRegexes) {
      const dm = bloc.match(rx);
      if (dm) {
        const txt = stripHtml(dm[1]);
        if (txt.length >= 40) {
          description = txt.slice(0, 300);
          break;
        }
      }
    }
    let url_programme_pdf = null;
    const pdfMatch = bloc.match(/href="([^"]*\.pdf[^"]*)"/i) || bloc.match(/href="([^"]*programme[^"]*)"/i) || bloc.match(/href="([^"]*telecharger[^"]*)"/i);
    if (pdfMatch) {
      url_programme_pdf = pdfMatch[1].startsWith("http") ? pdfMatch[1] : `https://www.capeb.fr${pdfMatch[1]}`;
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
      url_ics: icsUrl
    });
  }
  return formations.sort((a, b) => {
    if (!a.date_debut) return 1;
    if (!b.date_debut) return -1;
    return a.date_debut.localeCompare(b.date_debut);
  });
}
const fetchFormationsCapeb_createServerFn_handler = createServerRpc({
  id: "b2d05ff9dfd718a3e7fecb3077784753c92d0afac7786d1a4320e21c7bb867f4",
  name: "fetchFormationsCapeb",
  filename: "src/lib/formations-fetch.functions.ts"
}, (opts) => fetchFormationsCapeb.__executeServer(opts));
const fetchFormationsCapeb = createServerFn({
  method: "GET"
}).handler(fetchFormationsCapeb_createServerFn_handler, async () => {
  try {
    const response = await fetch(CAPEB_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Cache-Control": "no-cache"
      }
    });
    if (!response.ok) {
      throw new Error(`Erreur ${response.status} en accédant à capeb.fr`);
    }
    const html = await response.text();
    const formations = parseFormations(html);
    return {
      ok: true,
      formations,
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      count: formations.length
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Formations] Erreur:", message);
    return {
      ok: false,
      formations: [],
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      count: 0,
      error: message
    };
  }
});
export {
  fetchFormationsCapeb_createServerFn_handler
};
