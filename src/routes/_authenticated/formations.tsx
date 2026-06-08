import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  GraduationCap,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Send,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { syncFormations } from "@/lib/formations-sync.functions";
import { envoyerInscription } from "@/lib/inscription-email.functions";

export const Route = createFileRoute("/_authenticated/formations")({
  head: () => ({ meta: [{ title: "Formations – CAPEB" }] }),
  component: FormationsPage,
});

type Formation = {
  id: string;
  external_id: string;
  titre: string;
  lieu: string | null;
  theme: string | null;
  date_debut: string | null;
  duree_texte: string | null;
  description: string | null;
  url_programme_pdf: string | null;
  url_ics: string;
  date_maj: string;
};

type Profile = {
  nom: string;
  entreprise: string;
  email: string | null;
  telephone: string | null;
};

const LIEUX = ["Lescar", "Anglet", "Tarbes", "Pau"];
const COULEURS_LIEU: Record<string, string> = {
  Lescar: "bg-blue-100 text-blue-800",
  Anglet: "bg-green-100 text-green-800",
  Tarbes: "bg-purple-100 text-purple-800",
  Pau: "bg-amber-100 text-amber-800",
};

function badgeLieu(lieu: string | null) {
  if (!lieu) return null;
  const cls = COULEURS_LIEU[lieu] || "bg-gray-100 text-gray-800";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", cls)}>
      <MapPin className="h-3 w-3" />
      {lieu}
    </span>
  );
}

function FormationsPage() {
  const qc = useQueryClient();
  const [filtreAVenir, setFiltreAVenir] = useState(true);
  const [filtreLieu, setFiltreLieu] = useState("tous");
  const [filtreTheme, setFiltreTheme] = useState("tous");
  const [formationSelectionnee, setFormationSelectionnee] = useState<Formation | null>(null);
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);
  const [derniereTitreConfirm, setDerniereTitreConfirm] = useState("");

  const syncFn = useServerFn(syncFormations);
  const envoyerFn = useServerFn(envoyerInscription);

  const { data: formations = [], isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("date_debut", { ascending: true });
      if (error) throw error;
      return data as Formation[];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-formations"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("nom, entreprise, email, telephone")
        .eq("id", u.user.id)
        .maybeSingle();
      return data as Profile | null;
    },
  });

  const dateMaj = useMemo(() => {
    if (!formations.length) return null;
    const dates = formations.map((f) => f.date_maj).filter(Boolean);
    if (!dates.length) return null;
    return dates.sort().reverse()[0];
  }, [formations]);

  const themes = useMemo(() => {
    const set = new Set(formations.map((f) => f.theme).filter(Boolean) as string[]);
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

  const syncMut = useMutation({
    mutationFn: async () => syncFn({}),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(`${result.count} formations synchronisées depuis capeb.fr`);
        qc.invalidateQueries({ queryKey: ["formations"] });
      } else {
        toast.warning(result.message || "Synchronisation partielle — données existantes conservées");
      }
    },
    onError: () => toast.error("Impossible de contacter capeb.fr. Les données existantes sont conservées."),
  });

  const inscrireMut = useMutation({
    mutationFn: async (params: {
      formation: Formation;
      nbParticipants: number;
      nomsParticipants: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");

      const { error } = await supabase.from("inscriptions_formation").insert({
        formation_id: params.formation.id,
        user_id: u.user.id,
        artisan_nom: profile?.nom || "",
        artisan_entreprise: profile?.entreprise || "",
        artisan_email: profile?.email || "",
        artisan_telephone: profile?.telephone || "",
        nb_participants: params.nbParticipants,
        noms_participants: params.nomsParticipants || null,
        statut: "demande_envoyee",
      });
      if (error) throw error;

      try {
        await envoyerFn({
          data: {
            formation: {
              titre: params.formation.titre,
              lieu: params.formation.lieu,
              date_debut: params.formation.date_debut,
              duree_texte: params.formation.duree_texte,
            },
            artisan: {
              nom: profile?.nom || "Non renseigné",
              entreprise: profile?.entreprise || "Non renseigné",
              email: profile?.email || "Non renseigné",
              telephone: profile?.telephone || "Non renseigné",
            },
            nbParticipants: params.nbParticipants,
            nomsParticipants: params.nomsParticipants,
          },
        });
      } catch {
        // L'inscription est enregistrée même si l'email échoue
      }

      return params.formation.titre;
    },
    onSuccess: (titre) => {
      setDerniereTitreConfirm(titre);
      setFormationSelectionnee(null);
      setConfirmationOuverte(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
          onClick={() => syncMut.mutate()}
          disabled={syncMut.isPending}
          className="font-display"
        >
          {syncMut.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Rafraîchir
        </Button>
      </div>

      {/* Bandeau synchro */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <span className="text-foreground font-medium">
          Synchronisé avec capeb.fr/adour-pyrenees
        </span>
        {dateMaj && (
          <span className="text-muted-foreground ml-auto text-xs">
            Mis à jour le {format(parseISO(dateMaj), "d MMMM yyyy à HH:mm", { locale: fr })}
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
            {LIEUX.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtreTheme} onValueChange={setFiltreTheme}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Thème" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les thèmes</SelectItem>
            {themes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
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

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement…
        </div>
      ) : formations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <GraduationCap className="h-14 w-14 mx-auto text-muted-foreground/30" />
            <div>
              <p className="font-display text-lg text-foreground">Aucune formation chargée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cliquez sur « Rafraîchir » pour récupérer le catalogue depuis capeb.fr
              </p>
            </div>
            <Button onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
              {syncMut.isPending
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <RefreshCw className="h-4 w-4 mr-2" />}
              Charger les formations
            </Button>
          </CardContent>
        </Card>
      ) : formationsFiltrees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune formation ne correspond aux filtres sélectionnés.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {formationsFiltrees.map((f) => (
            <CarteFormation
              key={f.id}
              formation={f}
              onInscrire={() => setFormationSelectionnee(f)}
            />
          ))}
        </div>
      )}

      {/* Dialog inscription */}
      {formationSelectionnee && (
        <DialogInscription
          formation={formationSelectionnee}
          profile={profile}
          onClose={() => setFormationSelectionnee(null)}
          onSubmit={(nb, noms) =>
            inscrireMut.mutate({
              formation: formationSelectionnee,
              nbParticipants: nb,
              nomsParticipants: noms,
            })
          }
          isPending={inscrireMut.isPending}
        />
      )}

      {/* Dialog confirmation */}
      <Dialog open={confirmationOuverte} onOpenChange={setConfirmationOuverte}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Demande envoyée
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">
              Votre demande d'inscription à{" "}
              <span className="text-primary">« {derniereTitreConfirm} »</span>{" "}
              a été transmise à la CAPEB Adour-Pyrénées.
            </p>
            <p className="text-muted-foreground">
              Vous recevrez une confirmation par email ou par téléphone de la part de la CAPEB.
            </p>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
              <strong>Information :</strong> Il s'agit d'une demande transmise à la CAPEB. Votre place n'est pas réservée automatiquement — la CAPEB vous confirmera votre inscription.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setConfirmationOuverte(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CarteFormation({
  formation,
  onInscrire,
}: {
  formation: Formation;
  onInscrire: () => void;
}) {
  const dateStr = formation.date_debut
    ? format(parseISO(formation.date_debut), "d MMMM yyyy", { locale: fr })
    : null;
  const passee = formation.date_debut ? isPast(parseISO(formation.date_debut)) : false;

  return (
    <Card className={cn("flex flex-col shadow-sm hover:shadow-md transition-shadow", passee && "opacity-60")}>
      <CardContent className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm leading-tight text-foreground uppercase flex-1">
            {formation.titre}
          </h3>
          {badgeLieu(formation.lieu)}
        </div>

        {formation.theme && (
          <span className="inline-block self-start rounded bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5">
            {formation.theme}
          </span>
        )}

        <div className="space-y-1 text-sm text-muted-foreground">
          {dateStr && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{dateStr}</span>
            </div>
          )}
          {formation.duree_texte && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formation.duree_texte}</span>
            </div>
          )}
        </div>

        {formation.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {formation.description}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          {formation.url_programme_pdf && (
            <a
              href={formation.url_programme_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1.5 hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Programme
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Button
            size="sm"
            className="ml-auto font-display"
            onClick={onInscrire}
            disabled={passee}
          >
            {passee ? "Passée" : "S'inscrire"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DialogInscription({
  formation,
  profile,
  onClose,
  onSubmit,
  isPending,
}: {
  formation: Formation;
  profile: Profile | null | undefined;
  onClose: () => void;
  onSubmit: (nb: number, noms: string) => void;
  isPending: boolean;
}) {
  const [nb, setNb] = useState(1);
  const [noms, setNoms] = useState("");

  const dateStr = formation.date_debut
    ? format(parseISO(formation.date_debut), "d MMMM yyyy", { locale: fr })
    : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Demande d'inscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Récap formation */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1.5 text-sm">
            <p className="font-display font-semibold uppercase text-foreground text-xs">{formation.titre}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              {formation.lieu && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{formation.lieu}</span>
              )}
              {dateStr && (
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{dateStr}</span>
              )}
              {formation.duree_texte && (
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formation.duree_texte}</span>
              )}
            </div>
          </div>

          {/* Infos artisan */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vos coordonnées (pré-remplies depuis votre profil)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nom</Label>
                <Input value={profile?.nom || ""} disabled className="bg-muted/40 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Entreprise</Label>
                <Input value={profile?.entreprise || ""} disabled className="bg-muted/40 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted/40 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Téléphone</Label>
                <Input value={profile?.telephone || ""} disabled className="bg-muted/40 text-sm" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              Pour modifier ces informations, allez dans votre profil.
            </p>
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <div>
              <Label>Nombre de participants *</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={nb}
                onChange={(e) => setNb(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 mt-1"
              />
            </div>
            {nb > 1 && (
              <div>
                <Label>Noms des participants (optionnel)</Label>
                <Textarea
                  value={noms}
                  onChange={(e) => setNoms(e.target.value)}
                  rows={3}
                  placeholder={"Jean Dupont\nMarie Martin\n..."}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Avertissement */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
            <strong>Information :</strong> Cette demande sera transmise par email à la CAPEB Adour-Pyrénées. Votre inscription n'est pas confirmée automatiquement — la CAPEB reviendra vers vous.
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap pt-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Annuler</Button>
          <Button disabled={isPending} onClick={() => onSubmit(nb, noms)} className="font-display">
            {isPending
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Send className="h-4 w-4 mr-2" />}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
