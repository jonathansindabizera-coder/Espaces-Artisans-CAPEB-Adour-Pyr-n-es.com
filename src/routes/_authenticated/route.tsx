import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => { return {}; },
  component: () => (
    <SidebarProvider>
      <AuthenticatedLayout />
    </SidebarProvider>
  ),
});

const ROUTE_LABELS: Record<string, string> = {
  "/pv":         "PV & Devis",
  "/planning":   "Planning chantiers",
  "/formations": "Formations",
  "/rh":         "RH & Juridique",
};

function TopBar() {
  const { open, setOpen, isMobile } = useSidebar();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const label = ROUTE_LABELS[path] ?? "Espace Artisan";

  return (
    <header
      className="flex items-center gap-3 px-4 md:px-6 z-20 sticky top-0"
      style={{
        height: 56,
        background: "rgba(250,248,245,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 1px 0 rgba(26,23,20,.06), 0 2px 8px rgba(26,23,20,.04)",
        borderBottom: "1px solid rgba(236,231,225,.8)",
      }}
    >
      {/* Bouton menu mobile */}
      {isMobile && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center rounded-lg transition-colors hover:bg-black/6"
          style={{ width: 36, height: 36 }}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-[#4A453F]" />
        </button>
      )}

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-[#8B847D] hidden sm:block">Espace Artisan</span>
        <span className="text-[#8B847D] hidden sm:block">/</span>
        <span className="font-semibold text-[#1A1714] truncate">{label}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Recherche */}
      <div
        className="hidden md:flex items-center gap-2 rounded-[10px] px-3 transition-all duration-150"
        style={{
          height: 36,
          background: "rgba(26,23,20,.05)",
          border: "1px solid transparent",
          width: 220,
        }}
        onFocus={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.border = "1px solid #E2001A";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(226,0,26,.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.background = "rgba(26,23,20,.05)";
          e.currentTarget.style.border = "1px solid transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-[#8B847D]" />
        <input
          type="text"
          placeholder="Rechercher…"
          className="flex-1 bg-transparent text-[13px] text-[#1A1714] placeholder:text-[#8B847D] outline-none min-w-0"
        />
      </div>

      {/* Cloche */}
      <button
        className="relative flex items-center justify-center rounded-[10px] transition-colors hover:bg-black/6"
        style={{ width: 36, height: 36 }}
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5 text-[#4A453F]" style={{ width: 18, height: 18 }} />
        {/* Point rouge (notifications) */}
        <span
          className="absolute top-1.5 right-1.5 rounded-full bg-[#E2001A]"
          style={{ width: 7, height: 7 }}
        />
      </button>
    </header>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen flex w-full" style={{ background: "#FAF8F5" }}>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-7" style={{ background: "#FAF8F5" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
