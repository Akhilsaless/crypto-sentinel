import { NavLink } from "react-router-dom";
import { mobileLinks } from "@/data/navigation";
import { Button } from "@/components/ui/button";
export function MobileBottomNav() {
  return <nav aria-label="Mobile navigation" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background md:hidden">
    {mobileLinks.map(item => <Button asChild variant="ghost" key={item.url} className="h-16 min-w-0 rounded-none px-1"><NavLink end to={item.url} className={({ isActive }) => `flex flex-col gap-1 text-[11px] ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground"}`}><item.icon className="h-5 w-5" /><span>{item.title === "Agent Command" ? "Agent" : item.title}</span></NavLink></Button>)}
  </nav>;
}