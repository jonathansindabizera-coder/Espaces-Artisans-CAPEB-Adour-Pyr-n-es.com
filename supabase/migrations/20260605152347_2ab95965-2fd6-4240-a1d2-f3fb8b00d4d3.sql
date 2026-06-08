
CREATE TYPE public.demi_journee_type AS ENUM ('matin','apres_midi','journee');

CREATE TABLE public.employes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nom text NOT NULL,
  role text,
  couleur text NOT NULL DEFAULT '#E2001A',
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employes TO authenticated;
GRANT ALL ON public.employes TO service_role;
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own employes all" ON public.employes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_employes_updated BEFORE UPDATE ON public.employes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.affectations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chantier_id uuid NOT NULL,
  employe_id uuid NOT NULL,
  date date NOT NULL,
  demi_journee public.demi_journee_type NOT NULL DEFAULT 'journee',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_affectations_user_date ON public.affectations(user_id, date);
CREATE INDEX idx_affectations_chantier ON public.affectations(chantier_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.affectations TO authenticated;
GRANT ALL ON public.affectations TO service_role;
ALTER TABLE public.affectations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own affectations all" ON public.affectations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_affectations_updated BEFORE UPDATE ON public.affectations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  employe_id uuid NOT NULL,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  motif text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_absences_user_period ON public.absences(user_id, date_debut, date_fin);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.absences TO authenticated;
GRANT ALL ON public.absences TO service_role;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own absences all" ON public.absences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_absences_updated BEFORE UPDATE ON public.absences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
