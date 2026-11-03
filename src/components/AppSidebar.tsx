import { Bot as BotIcon, X } from "lucide-react";
import { navigationGroups } from "@/data/navigation";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { StatusChip } from "@/components/StatusChip";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent aria-label="Primary navigation">
        <div className="flex items-center justify-between gap-2 px-3 py-4">
          <div className="flex items-center gap-2"><BotIcon className="h-5 w-5 shrink-0 text-primary" />{!collapsed && <span className="font-bold text-foreground">Crypto Sentinel</span>}</div>
          {isMobile && <Button size="icon" variant="ghost" aria-label="Close navigation" onClick={() => setOpenMobile(false)}><X /></Button>}
        </div>
        {!collapsed && <div className="px-3"><StatusChip variant="warning">SAMPLE / NOT LIVE</StatusChip></div>}
        {navigationGroups.map(group => <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end
                        aria-label={item.title}
                        onClick={() => { if (isMobile) setOpenMobile(false); }}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>)}
      </SidebarContent>
    </Sidebar>
  );
}