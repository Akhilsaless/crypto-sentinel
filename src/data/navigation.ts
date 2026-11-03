import { LayoutDashboard, Bot, TrendingUp, TrendingDown, LogOut, Cog, Link2, Play, ScrollText, PieChart, HeartPulse, ScanLine, Bell, BookOpen, NotebookPen, ChartNoAxesCombined } from "lucide-react";
export const navigationGroups = [
  { title: "Overview", items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }, { title: "Agent Command", url: "/agent", icon: Bot }, { title: "Portfolio", url: "/portfolio", icon: PieChart }] },
  { title: "Signals", items: [{ title: "Signal Explorer", url: "/opportunities", icon: ScanLine }, { title: "Top Buys", url: "/opportunities/buys", icon: TrendingUp }, { title: "Avoid List", url: "/opportunities/avoid", icon: TrendingDown }, { title: "Exit Signals", url: "/opportunities/exits", icon: LogOut }] },
  { title: "Research & Learn", items: [{ title: "Chart Review", url: "/chart-review", icon: ChartNoAxesCombined }, { title: "Journal", url: "/journal", icon: NotebookPen }, { title: "Learning", url: "/learn", icon: BookOpen }] },
  { title: "Trading Controls", items: [{ title: "Strategy & Risk", url: "/strategy", icon: Cog }, { title: "Execution", url: "/execution", icon: Play }] },
  { title: "System", items: [{ title: "Alerts", url: "/alerts", icon: Bell }, { title: "Exchanges", url: "/exchanges", icon: Link2 }, { title: "Logs & Audit", url: "/logs", icon: ScrollText }, { title: "Health", url: "/health", icon: HeartPulse }] },
];
export const mobileLinks = [navigationGroups[0].items[0], navigationGroups[0].items[1], navigationGroups[1].items[1], navigationGroups[0].items[2]];