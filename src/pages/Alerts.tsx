import { useState } from "react";
import { Pencil, Trash2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Choice, Field, WorkspaceTitle } from "@/components/WorkspaceFields";
import { alertSchema, AlertRule } from "@/features/phase1/models";
import { useBrowserLocal } from "@/hooks/useBrowserLocal";
const empty = { symbol: "", direction: "above" as AlertRule['direction'], threshold: "" };
export default function Alerts() {
  const { items, update, storageError } = useBrowserLocal("crypto-sentinel:alerts:v1", alertSchema);
  const [draft, setDraft] = useState(empty), [editing, setEditing] = useState<string | null>(null), [error, setError] = useState("");
  const cancel = () => { setDraft(empty); setEditing(null); setError(""); };
  return <div className="space-y-6"><WorkspaceTitle title="Alerts workspace" label="UI-ONLY / BROWSER-LOCAL" description="Manual rules saved only in this browser. No prices are monitored, no background checks run, and no notifications are triggered or delivered. Do not enter credentials or sensitive information." />
    {storageError && <p role="alert" className="text-warning">{storageError}</p>}
    <form noValidate className="space-y-4 border-y border-border py-5" onSubmit={e => { e.preventDefault(); const parsed = alertSchema.safeParse({ id: editing ?? crypto.randomUUID(), ...draft, threshold: Number(draft.threshold), enabled: items.find(i => i.id === editing)?.enabled ?? true }); if (!parsed.success) {setError(parsed.error.issues[0]?.message ?? "Invalid rule"); return;} update(editing ? items.map(i => i.id === editing ? parsed.data : i) : [...items, parsed.data]); cancel(); }}>
      <h2 className="font-semibold">{editing ? "Edit alert rule" : "Add alert rule"}</h2><div className="grid gap-4 sm:grid-cols-3"><Field label="Symbol"><Input aria-label="Symbol" value={draft.symbol} maxLength={30} placeholder="BTC/USDT" onChange={e=>setDraft({...draft,symbol:e.target.value})} /></Field><Field label="Condition"><Choice label="Condition" value={draft.direction} onChange={v=>setDraft({...draft,direction:v as AlertRule['direction']})} options={[{value:"above",label:"Price above"},{value:"below",label:"Price below"}]} /></Field><Field label="Price threshold (quote currency)"><Input aria-label="Price threshold" type="number" step="any" value={draft.threshold} onChange={e=>setDraft({...draft,threshold:e.target.value})} /></Field></div>
      {error && <p role="alert" className="text-destructive">{error}</p>}<div className="flex gap-2"><Button type="submit">{editing ? <Save /> : <Plus />}{editing ? "Save rule" : "Add rule"}</Button>{editing && <Button type="button" variant="outline" onClick={cancel}>Cancel edit</Button>}</div>
    </form>
    <div className="divide-y divide-border">{items.map(i=><article key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><h3 className="font-semibold mono">{i.symbol}</h3><p className="text-sm text-muted-foreground">Price {i.direction} {i.threshold} · {i.enabled ? "Enabled locally" : "Disabled locally"}</p></div><div className="flex items-center gap-2"><Switch aria-label={`Enable rule ${i.symbol}`} checked={i.enabled} onCheckedChange={enabled=>update(items.map(r=>r.id===i.id?{...r,enabled}:r))} /><Button size="icon" variant="ghost" aria-label={`Edit rule ${i.symbol}`} title="Edit rule" onClick={()=>{setEditing(i.id);setDraft({symbol:i.symbol,direction:i.direction,threshold:String(i.threshold)});setError("");}}><Pencil /></Button><Button size="icon" variant="ghost" aria-label={`Delete rule ${i.symbol}`} title="Delete rule" onClick={()=>{update(items.filter(r=>r.id!==i.id));if(editing===i.id)cancel();}}><Trash2 /></Button></div></article>)}</div>
    {!items.length && <p className="text-muted-foreground">No manual alert rules yet.</p>}
  </div>;
}