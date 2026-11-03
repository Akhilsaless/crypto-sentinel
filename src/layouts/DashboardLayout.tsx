import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DemoBanner } from "@/components/DemoBanner";
import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="min-h-16 flex items-center justify-between border-b border-border/50 p-3 gap-3 glass sticky top-0 z-30">
            <SidebarTrigger className="h-9 w-9 shrink-0 rounded-md border border-border/60 bg-secondary/40 text-foreground hover:bg-secondary" />
            <DemoBanner />
          </header>
          <main className="mobile-content flex-1 min-w-0 p-4 md:p-6 overflow-x-auto">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}