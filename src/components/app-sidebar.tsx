import { Link, useRouterState } from "@tanstack/react-router";
import { FileSignature, Calendar, GraduationCap, Hammer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "PV & Suivi devis", url: "/pv", icon: FileSignature },
  { title: "Planning chantiers", url: "/planning", icon: Calendar },
  { title: "Formations", url: "/formations", icon: GraduationCap },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => currentPath === p || currentPath.startsWith(p + "/");

  const { data: profile } = useQuery({
    queryKey: ["profile-sidebar"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("nom, entreprise, email").eq("id", u.user.id).maybeSingle();
      return data;
    },
  });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <Link to="/pv" className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-primary shadow-sm">
            <Hammer className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base text-sidebar-foreground">Espace Artisan</span>
              <span className="text-[11px] uppercase tracking-wider text-sidebar-foreground/80">CAPEB Adour-Pyrénées</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 data-[active=true]:bg-white data-[active=true]:text-primary data-[active=true]:font-semibold hover:bg-sidebar-accent"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="font-display text-sm">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4">
        {!collapsed && profile && (
          <div className="rounded-md bg-sidebar-accent/60 px-3 py-2.5 text-sidebar-foreground">
            <div className="text-sm font-semibold leading-tight truncate">{profile.nom || profile.email}</div>
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/80 truncate">
              {profile.entreprise || "—"}
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}