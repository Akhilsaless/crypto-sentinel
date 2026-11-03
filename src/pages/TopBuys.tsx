import { topBuySignals } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TopBuys() {
  const [search, setSearch] = useState("");
  const filtered = topBuySignals.filter(s => s.pair.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Top Buy Signals</h1>
          <p className="text-sm text-warning">SAMPLE DATA / NOT LIVE — scores and eligibility are simulated.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pairs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border" />
        </div>
      </div>
      <div className="glass rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                <th className="text-left p-3">Pair</th><th className="text-left p-3">Exchange</th><th className="text-center p-3">Score</th><th className="text-center p-3">Confidence</th><th className="text-left p-3">Entry Zone</th><th className="text-right p-3">Stop</th><th className="text-right p-3">Target</th><th className="text-center p-3">TF</th><th className="text-center p-3">Vol</th><th className="text-center p-3">Liq</th><th className="text-center p-3">Auto</th><th className="text-left p-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length && <tr><td colSpan={12} className="p-4 text-muted-foreground">No sample pairs match your search.</td></tr>}
              {filtered.map(s => (
                <tr key={s.pair} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-medium mono text-primary">{s.pair}</td>
                  <td className="p-3 text-muted-foreground">{s.exchange}</td>
                  <td className="p-3 text-center"><span className={`mono font-bold ${s.score >= 85 ? "text-chart-up" : s.score >= 70 ? "text-warning" : "text-muted-foreground"}`}>{s.score}</span></td>
                  <td className="p-3 text-center mono">{(s.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3 mono text-sm">{s.entryZone}</td>
                  <td className="p-3 text-right mono text-chart-down">${s.stopLoss}</td>
                  <td className="p-3 text-right mono text-chart-up">${s.target}</td>
                  <td className="p-3 text-center"><StatusChip variant="neutral">{s.timeframe}</StatusChip></td>
                  <td className="p-3 text-center"><StatusChip variant={s.volatility === "high" ? "warning" : "info"}>{s.volatility}</StatusChip></td>
                  <td className="p-3 text-center"><StatusChip variant={s.liquidity === "high" ? "success" : "warning"}>{s.liquidity}</StatusChip></td>
                  <td className="p-3 text-center">{s.autoEligible ? <StatusChip variant="success">Yes</StatusChip> : <StatusChip variant="neutral">No</StatusChip>}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-xs">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}