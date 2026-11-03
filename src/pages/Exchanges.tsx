import { exchangeConfigs } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Link2 } from "lucide-react";
import { WorkspaceTitle } from "@/components/WorkspaceFields";
export default function Exchanges() {
  return <div className="space-y-6"><WorkspaceTitle title="Exchange Integrations" label="SAMPLE ADAPTERS / NO CONNECTIONS" description="Phase 1 has no exchange connection, credential collection, validation or live mode. No keys are accepted and no API calls are made." /><div className="grid gap-4 md:grid-cols-3">{exchangeConfigs.map(ex=><article key={ex.id} className="rounded-lg border border-border bg-card p-5 space-y-4"><h2 className="flex items-start gap-2 font-semibold"><Link2 className="h-4 w-4 shrink-0 mt-1 text-primary" />{ex.name}</h2><StatusChip variant="neutral">NOT CONNECTED</StatusChip><p className="text-sm text-muted-foreground">{ex.pairs} sample pairs · No actual sync</p><p className="text-xs text-warning">Mock adapter only. Connection testing and saving credentials are unavailable.</p></article>)}</div></div>;
}