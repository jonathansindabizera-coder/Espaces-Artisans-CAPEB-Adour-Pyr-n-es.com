-- Table formations : catalogue synchronisé depuis capeb.fr
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  lieu TEXT,
  theme TEXT,
  date_debut TIMESTAMPTZ,
  duree_texte TEXT,
  description TEXT,
  url_programme_pdf TEXT,
  url_ics TEXT,
  date_maj TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.formations TO authenticated;
GRANT ALL ON public.formations TO service_role;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "formations lisibles par tous les connectes" ON public.formations FOR SELECT TO authenticated USING (true);

-- Table inscriptions_formation : demandes envoyées par les artisans
CREATE TABLE public.inscriptions_formation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artisan_nom TEXT NOT NULL DEFAULT '',
  artisan_entreprise TEXT NOT NULL DEFAULT '',
  artisan_email TEXT NOT NULL DEFAULT '',
  artisan_telephone TEXT NOT NULL DEFAULT '',
  nb_participants INTEGER NOT NULL DEFAULT 1,
  noms_participants TEXT,
  statut TEXT NOT NULL DEFAULT 'demande_envoyee',
  date_demande TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.inscriptions_formation TO authenticated;
GRANT ALL ON public.inscriptions_formation TO service_role;
ALTER TABLE public.inscriptions_formation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inscriptions all" ON public.inscriptions_formation FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
