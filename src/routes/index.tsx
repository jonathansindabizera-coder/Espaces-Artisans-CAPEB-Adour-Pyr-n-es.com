import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espace Artisan CAPEB" },
      { name: "description", content: "Espace Artisan CAPEB Adour-Pyrénées" },
    ],
  }),
  beforeLoad: async () => {
    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch { /* client placeholder — pas de session */ }

    if (session) {
      throw redirect({ to: "/pv" });
    } else {
      throw redirect({ to: "/auth" });
    }
  },
  component: Index,
});

function Index() {
  return null;
}
