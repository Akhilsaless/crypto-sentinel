import { exitSignals } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";

const actionVariant = (a: string) => a === "sell" ? "error" as const : a === "trim" ? "warning" as const : a === "hold" ? "success" as const : "info" as const;

export default function ExitSignals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exit Signals</h1>
        <p className="text-sm text-warning">SAMPLE DATA / NOT LIVE — hypothetical exit examples and simulated P&L; not your holdings.</p>
      </div>
      <div className="glass rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
              <th className="text-left p-3">Pair</th><th className="text-center p-3">Action</th><th className="text-center p-3">Urgency</th><th className="text-right p-3">Current P&L</th><th className="text-left p-3">Reason</th>
            </tr></thead>
            <tbody>
              {exitSignals.map(s => (
                <tr key={s.pair} className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="p-3 font-medium mono">{s.pair}</td>
                  <td className="p-3 text-center"><StatusChip variant={actionVariant(s.action)}>{s.action.toUpperCase()}</StatusChip></td>
                  <td className="p-3 text-center"><StatusChip variant={s.urgency === "high" ? "error" : s.urgency === "medium" ? "warning" : "neutral"}>{s.urgency}</StatusChip></td>
                  <td className={`p-3 text-right mono font-medium ${s.currentPnl >= 0 ? "text-chart-up" : "text-chart-down"}`}>{s.currentPnl >= 0 ? "+" : ""}{s.currentPnl}%</td>
                  <td className="p-3 text-sm text-muted-foreground">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}