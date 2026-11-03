import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";
import { Choice, WorkspaceTitle } from "@/components/WorkspaceFields";
import { filterSignals } from "@/features/phase1/signals";
export default function Signals() {
  const [search, setSearch] = useState(""), [kind, setKind] = useState("all"), [exchange, setExchange] = useState("all"), [sort, setSort] = useState("score");
  const rows = filterSignals(search, kind, exchange, sort);
  return <div className="space-y-6"><WorkspaceTitle title="Signal Explorer" label="SAMPLE DATA / NOT LIVE" description="Buy, avoid and exit examples from the simulated scanner. Scores are fixtures, not current market recommendations." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Input aria-label="Search signals" placeholder="Search symbol or reason" value={search} onChange={e => setSearch(e.target.value)} /><Choice label="Signal type" value={kind} onChange={setKind} options={[{value:"all",label:"All signals"},{value:"buy",label:"Buy"},{value:"avoid",label:"Avoid"},{value:"exit",label:"Exit"}]} /><Choice label="Exchange filter" value={exchange} onChange={setExchange} options={[{value:"all",label:"All exchanges"},...['Kraken','Coinbase','Unspecified'].map(value=>({value,label:value}))]} /><Choice label="Sort signals" value={sort} onChange={setSort} options={[{value:"score",label:"Sample score: highest first"},{value:"pair",label:"Symbol: A–Z"},{value:"pair-desc",label:"Symbol: Z–A"}]} /></div>
    <p className="text-sm text-muted-foreground" role="status">{rows.length} sample signals</p>
    <div className="divide-y divide-border border-y border-border">{rows.map(s => <article key={s.id} className="grid gap-3 py-4 md:grid-cols-[180px_1fr_auto] md:items-center"><div className="space-y-2"><h2 className="font-semibold mono">{s.pair}</h2><StatusChip variant={s.kind === "buy" ? "success" : s.kind === "avoid" ? "error" : "warning"}>{s.kind.toUpperCase()}</StatusChip><p className="text-xs text-muted-foreground">{s.exchange}</p></div><div><p className="text-sm">{s.reason}</p><p className="text-xs text-muted-foreground mt-2">{s.detail} · Sample score: {s.score ?? "N/A"}</p></div><Button asChild variant="outline" size="sm"><Link to={s.href}>Details <ArrowUpRight /></Link></Button></article>)}</div>
    {!rows.length && <p className="text-muted-foreground">No sample signals match these filters.</p>}
  </div>;
}