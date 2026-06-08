import { createServerFn } from "@tanstack/react-start";

export const syncFormations = createServerFn({ method: "POST" }).handler(async () => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.APP_URL || "http://localhost:8080";

  const token = process.env.SYNC_SECRET_TOKEN || "";

  const res = await fetch(`${baseUrl}/api/sync-formations`, {
    method: "GET",
    headers: token ? { "x-sync-token": token } : {},
  });

  const data = await res.json();
  return data as { ok: boolean; count?: number; date_maj?: string; error?: string; message?: string };
});
