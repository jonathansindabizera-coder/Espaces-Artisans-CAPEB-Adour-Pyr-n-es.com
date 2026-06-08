import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/formations")({
  head: () => ({ meta: [{ title: "Formations – CAPEB" }] }),
  component: FormationsPage,
});

function FormationsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <GraduationCap className="h-12 w-12" />
      </div>
      <h1 className="font-display text-3xl text-foreground">Formations</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Ce module est en construction. Il sera disponible très prochainement dans votre Espace Artisan.
      </p>
    </div>
  );
}