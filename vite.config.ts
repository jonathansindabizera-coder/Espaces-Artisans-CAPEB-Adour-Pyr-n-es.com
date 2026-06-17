// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
  // Newer @lovable.dev/vite-tanstack-config releases force Lightning CSS as the
  // dev CSS transformer, which rejects the Google Fonts `@import` in
  // src/styles.css (it lands after the inlined Tailwind imports). Use PostCSS —
  // the transformer the repo's pinned lockfile used in dev — so the dev server
  // serves styles.css instead of returning a 500.
  vite: {
    css: { transformer: "postcss" },
  },
});
