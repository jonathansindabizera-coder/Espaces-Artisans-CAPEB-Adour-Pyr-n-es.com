-- Table annonces_particuliers : annonces scrapées automatiquement (veille particuliers 64/65)
CREATE TABLE public.annonces_particuliers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT        NOT NULL CHECK (source IN ('allovoisins', 'appeloffreduparticulier')),
  external_id   TEXT        NOT NULL,
  titre         TEXT        NOT NULL,
  description   TEXT,
  ville         TEXT,
  code_postal   TEXT,
  departement   TEXT        CHECK (departement IN ('64', '65')),
  corps_metier  TEXT        NOT NULL DEFAULT 'Autre',
  date_annonce  DATE,
  date_scraping TIMESTAMPTZ NOT NULL DEFAULT now(),
  url_annonce   TEXT        NOT NULL,
  url_type      TEXT        NOT NULL CHECK (url_type IN ('annonce_exacte', 'page_recherche')) DEFAULT 'page_recherche',
  statut_import TEXT        NOT NULL CHECK (statut_import IN ('nouveau', 'ignore', 'importe')) DEFAULT 'nouveau',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);

-- Lecture : tous les artisans connectés
GRANT SELECT ON public.annonces_particuliers TO authenticated;
-- Mise à jour du statut uniquement (colonne par colonne)
GRANT UPDATE (statut_import) ON public.annonces_particuliers TO authenticated;
-- Toutes opérations pour le scraper (service_role)
GRANT ALL ON public.annonces_particuliers TO service_role;

ALTER TABLE public.annonces_particuliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "annonces_particuliers lisibles par tous les connectes"
  ON public.annonces_particuliers FOR SELECT TO authenticated USING (true);

CREATE POLICY "annonces_particuliers mise_a_jour_statut"
  ON public.annonces_particuliers FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (statut_import IN ('nouveau', 'ignore', 'importe'));
