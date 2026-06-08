import { Link, useRouterState } from "@tanstack/react-router";
import { FileSignature, Calendar, GraduationCap, Hammer, Plus, Users, Gift } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { title: "PV & Suivi devis",    url: "/pv",          icon: FileSignature },
  { title: "Planning chantiers",  url: "/planning",    icon: Calendar },
  { title: "Formations",          url: "/formations",  icon: GraduationCap },
  { title: "RH & Juridique",      url: "/rh",          icon: Users },
  { title: "Avantages CAPEB",     url: "/avantages",   icon: Gift },
];

function initiales(nom: string): string {
  return nom
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const { open, setOpen, isMobile } = useSidebar();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => currentPath === p || currentPath.startsWith(p + "/");

  const collapsed = !open && !isMobile;
  const nomAffiche = "Artisan";
  const inits = initiales(nomAffiche);

  return (
    <>
      {/* Voile mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          background: "linear-gradient(180deg, #E2001A 0%, #B00013 100%)",
          boxShadow: "inset -1px 0 0 rgba(0,0,0,.12), 2px 0 12px rgba(26,23,20,.15)",
          width: collapsed ? 64 : 240,
          transition: "width 200ms ease",
        }}
        className={[
          "flex flex-col flex-shrink-0 z-40 h-screen",
          isMobile ? "fixed left-0 top-0" : "relative",
          isMobile && !open ? "-translate-x-full" : "translate-x-0",
          "transition-transform duration-200",
        ].join(" ")}
      >
        {/* ── LOGO ── */}
        <div className="flex items-center gap-3 px-3 pt-5 pb-4">
          <Link to="/pv" className="flex items-center gap-3 min-w-0" onClick={() => isMobile && setOpen(false)}>
            <div
              className="flex shrink-0 items-center justify-center rounded-xl bg-white"
              style={{
                width: 40, height: 40,
                boxShadow: "0 2px 8px rgba(0,0,0,.18)",
              }}
            >
              <Hammer className="h-5 w-5 text-[#E2001A]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-display text-[15px] text-white tracking-wide">Espace Artisan</span>
                <span className="text-[10px] uppercase tracking-widest text-white/70">CAPEB Adour-Pyrénées</span>
              </div>
            )}
          </Link>
        </div>

        {/* ── BOUTON NOUVEAU DOSSIER ── */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <Link
              to="/pv"
              onClick={() => isMobile && setOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-[10px] py-2.5 text-white font-display text-[12px] tracking-wide transition-all duration-150"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                minHeight: 40,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <Plus className="h-4 w-4" />
              Nouveau dossier
            </Link>
          </div>
        )}

        {/* ── SÉPARATEUR ── */}
        <div className="mx-3 mb-2 h-px bg-white/15" />

        {/* ── NAVIGATION ── */}
        <nav className="flex-1 px-2 overflow-y-auto">
          {!collapsed && (
            <div className="text-[10px] tracking-[.16em] uppercase opacity-60 font-semibold px-3 mt-2 mb-2">
              Pilotage
            </div>
          )}
          <div className="space-y-[3px]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => isMobile && setOpen(false)}
                className="flex items-center gap-3 rounded-[11px] px-3 transition-all duration-150 select-none"
                style={{
                  minHeight: 44,
                  background: active ? "white" : "transparent",
                  boxShadow: active ? "0 4px 14px rgba(0,0,0,.14)" : "none",
                  color: active ? "#A30012" : "rgba(255,255,255,0.88)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.13)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <item.icon
                  className="shrink-0"
                  style={{ width: 19, height: 19, strokeWidth: 1.9, opacity: active ? 1 : 0.92 }}
                />
                {!collapsed && (
                  <span
                    className="font-display text-[14.5px] tracking-wide flex-1"
                    style={{ fontWeight: active ? 600 : 500 }}
                  >
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
          </div>
        </nav>

        {/* ── FOOTER : profil ── */}
        <div className="px-3 pb-5 pt-3 border-t border-white/15">
          <div
            className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2"
            style={{ background: "rgba(0,0,0,.12)" }}
          >
            {/* Avatar initiales */}
            <div
              className="flex shrink-0 items-center justify-center rounded-lg font-display text-[13px] text-[#E2001A] bg-white"
              style={{ width: 34, height: 34, fontWeight: 600 }}
            >
              {inits}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-white leading-tight">
                  {nomAffiche}
                </div>
                <div className="truncate text-[11px] text-white/60 uppercase tracking-wide">
                  CAPEB Adour-Pyrénées
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
