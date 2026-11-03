import { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-2 text-sm text-muted-foreground">{label}{children}</label>;
}
export function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>;
}
export function WorkspaceTitle({ title, label, description }: { title: string; label: string; description: string }) {
  return <div className="space-y-2"><p className="text-xs font-semibold text-warning">{label}</p><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-muted-foreground max-w-3xl">{description}</p></div>;
}