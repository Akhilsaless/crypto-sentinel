import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

const variants: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusChip({ variant = "neutral", children, pulse }: { variant?: StatusVariant; children: React.ReactNode; pulse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border", variants[variant])}>
      {pulse && <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-glow", variant === "success" ? "bg-success" : variant === "warning" ? "bg-warning" : variant === "error" ? "bg-destructive" : "bg-info")} />}
      {children}
    </span>
  );
}