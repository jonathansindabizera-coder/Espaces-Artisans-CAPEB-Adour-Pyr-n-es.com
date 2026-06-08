import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  fetchFormationsCapeb,
  type FormationCapeb,
} from "@/lib/formations-fetch.functions";

export const Route = createFileRoute("/_authenticated/formations")({
  head: () => ({ meta: [{ title: "Formations – CAPEB" }] }),
  component: FormationsPage,
});

const LIEUX = ["Lescar", "Anglet", "Tarbes", "Pau"];
const COULEURS_LIEU: Record<string, string> = {
  Lescar: "bg-blue-100 text-blue-800",
  Anglet: "bg-green-100 text-green-800",
  Tarbes: "bg-purple-100 text-purple-800",
  Pau:    "bg-amber-100 text-amber-800",
};

function BadgeLieu({ lieu }: { lieu: string | null }) {
  if (!lieu) return null;
  const cls = COULEURS_LIEU[lieu] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0", cls)}>
      <MapPin className="h-3 w-3" />
      {lieu}
    </span>
  );
}

function FormationsPage() {
  const [filtreAVenir, setFiltreAVenir] = useState(true);
  const [filtreLieu, setFiltreLieu] = useState("tous");
  const [filtreTheme, setFiltreTheme] = useState("tous");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFn = useServerFn(fetchFormationsCapeb);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["formations-capeb", refreshKey],
    queryFn: () => fetchFn({}),
    staleTime: 60 * 60 * 1000, // 1 heure de cache
    retry: 1,
  });

  const formations = data?.formations ?? [];
  const fetchedAt = data?.fetchedAt ?? null;

  const themes = useMemo(() => {
    const set = new Set(formations.map((f) => f.theme).filter(Boolean));
    return Array.from(set).sort();
  }, [formations]);

  const formationsFiltrees = useMemo(() => {
    return formations.filter((f) => {
      if (filtreAVenir && f.date_debut && isPast(parseISO(f.date_debut))) return false;
      if (filtreLieu !== "tous" && f.lieu !== filtreLieu) return false;
      if (filtreTheme !== "tous" && f.theme !== filtreTheme) return false;
      return true;
    });
  }, [formations, filtreAVenir, filtreLieu, filtreTheme]);

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Formations</h1>
          <p className="text-muted-foreground mt-1">
            Catalogue des formations CAPEB Adour-Pyrénées
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={isLoading}
          className="font-display"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            : <RefreshCw className="h-4 w-4 mr-2" />}
          Rafraîchir
        </Button>
      </div>

      {/* Bandeau synchro */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <span className="text-foreground font-medium">
          Données en direct depuis capeb.fr/adour-pyrenees
        </span>
        {fetchedAt && (
          <span className="text-muted-foreground ml-auto text-xs">
            Chargé le {format(parseISO(fetchedAt), "d MMMM yyyy à HH:mm", { locale: fr })}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filtreLieu} onValueChange={setFiltreLieu}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Lieu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les lieux</SelectItem>
            {LIEUX.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filtreTheme} onValueChange={setFiltreTheme}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Thème" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les thèmes</SelectItem>
            {themes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none ml-auto">
          <input
            type="checkbox"
            checked={filtreAVenir}
            onChange={(e) => setFiltreAVenir(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary"
          />
          À venir uniquement
        </label>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Récupération des formations depuis capeb.fr…</span>
        </div>

      ) : isError || (data && !data.ok) ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
            <p className="font-display text-lg text-foreground">Impossible de contacter capeb.fr</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Le site CAPEB est peut-être temporairement indisponible. Réessayez dans quelques minutes.
            </p>
            <Button variant="outline" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
            </Button>
          </CardContent>
        </Card>

      ) : formations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <GraduationCap className="h-14 w-14 mx-auto text-muted-foreground/30" />
            <div>
              <p className="font-display text-lg text-foreground">Aucune formation trouvée</p>
              <p className="text-sm text-muted-foreground mt-1">
                La page CAPEB ne contient pas encore de formations ou sa structure a changé.
              </p>
            </div>
          </CardContent>
        </Card>

      ) : formationsFiltrees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune formation ne correspond aux filtres. Essayez de les modifier.
          </CardContent>
        </Card>

      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {formationsFiltrees.length} formation{formationsFiltrees.length > 1 ? "s" : ""} trouvée{formationsFiltrees.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {formationsFiltrees.map((f) => (
              <CarteFormation key={f.external_id} formation={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CarteFormation({ formation }: { formation: FormationCapeb }) {
  const dateStr = formation.date_debut
    ? format(parseISO(formation.date_debut), "EEEE d MMMM yyyy", { locale: fr })
    : null;
  const passee = formation.date_debut ? isPast(parseISO(formation.date_debut)) : false;

  return (
    <Card className={cn(
      "flex flex-col shadow-sm hover:shadow-md transition-shadow border",
      passee && "opacity-55"
    )}>
      <CardContent className="flex flex-col gap-3 p-5 flex-1">

        {/* Titre + badge lieu */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm leading-snug text-foreground uppercase flex-1">
            {formation.titre}
          </h3>
          <BadgeLieu lieu={formation.lieu} />
        </div>

        {/* Badge thème */}
        {formation.theme && (
          <span className="inline-block self-start rounded bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5">
            {formation.theme}
          </span>
        )}

        {/* Date + durée */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {dateStr && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span className="capitalize">{dateStr}</span>
            </div>
          )}
          {formation.duree_texte && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formation.duree_texte}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {formation.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {formation.description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2 border-t">
          {formation.url_programme_pdf && (
            <a
              href={formation.url_programme_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1.5 hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Programme PDF
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={formation.url_ics}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1.5 hover:bg-muted/50 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Ajouter au calendrier
          </a>
          <a
            href="https://www.capeb.fr/adour-pyrenees/nos-services?tab=training"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "ml-auto inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-display font-semibold text-white transition-colors",
              passee
                ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {passee ? "Formation passée" : "S'inscrire sur capeb.fr"}
            {!passee && <ExternalLink className="h-3 w-3" />}
          </a>
        </div>

      </CardContent>
    </Card>
  );
}
