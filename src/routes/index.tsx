import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espace Artisan CAPEB" },
      { name: "description", content: "Espace Artisan CAPEB Adour-Pyrénées" },
    ],
  }),
  beforeLoad: async () => {
    throw redirect({ to: "/tableau-de-bord" });
  },
  component: Index,
});

function Index() {
  return null;
}
