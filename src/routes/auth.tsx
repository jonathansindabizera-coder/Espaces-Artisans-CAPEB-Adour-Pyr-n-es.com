import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Hammer } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/pv" });
  },
  head: () => ({ meta: [{ title: "Connexion – Espace Artisan CAPEB" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        return toast.error("Votre email n'a pas encore été confirmé. Vérifiez votre boîte de réception.");
      }
      if (msg.includes("invalid login") || msg.includes("invalid_credentials")) {
        return toast.error("Email ou mot de passe incorrect. Si vous n'avez pas encore de compte, créez-en un dans l'onglet « Créer un compte ».");
      }
      return toast.error("Connexion impossible : " + error.message);
    }
    toast.success("Bienvenue !");
    navigate({ to: "/pv" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nom, entreprise },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return toast.error("Un compte existe déjà avec cet email. Connectez-vous plutôt dans l'onglet « Connexion ».");
      }
      return toast.error("Création impossible : " + error.message);
    }
    if (data.session) {
      toast.success("Compte créé. Vous êtes connecté !");
      navigate({ to: "/pv" });
    } else {
      toast.success("Compte créé ! Vérifiez votre boîte mail et cliquez sur le lien de confirmation pour activer votre compte.", { duration: 8000 });
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);
    if (error) {
      return toast.error("Impossible d'envoyer le lien : " + error.message);
    }
    setResetSent(true);
  };

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Hammer className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>Un lien vous sera envoyé par email</CardDescription>
          </CardHeader>
          <CardContent>
            {resetSent ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  ✅ Email envoyé à <strong>{resetEmail}</strong>. Cliquez sur le lien dans l'email pour choisir un nouveau mot de passe.
                </p>
                <Button variant="outline" className="w-full" onClick={() => { setResetMode(false); setResetSent(false); }}>
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Votre adresse e-mail</Label>
                  <Input id="reset-email" type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </Button>
                <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-muted-foreground underline">
                  Retour à la connexion
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Hammer className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Espace Artisan CAPEB</CardTitle>
          <CardDescription>Adour-Pyrénées</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setResetMode(true); }}
                      className="text-xs text-muted-foreground underline hover:text-foreground"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion…" : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Votre nom</Label>
                  <Input id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entreprise">Nom de l'entreprise</Label>
                  <Input id="entreprise" required value={entreprise} onChange={(e) => setEntreprise(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">E-mail</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Mot de passe (8 caractères minimum)</Label>
                  <Input id="password2" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Création…" : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}