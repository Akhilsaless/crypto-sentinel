import { avoidList } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Ban } from "lucide-react";

export default function AvoidList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avoid List</h1>
        <p className="text-sm text-warning">SAMPLE DATA / NOT LIVE — illustrative risk flags, not current market findings.</p>
      </div>
      <div className="glass rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
              <th className="text-left p-3">Pair</th><th className="text-left p-3">Exchange</th><th className="text-center p-3">Risk</th><th className="text-left p-3">Reason</th>
            </tr></thead>
            <tbody>
              {avoidList.map(a => (
                <tr key={a.pair} className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="p-3 font-medium mono flex items-center gap-2"><Ban className="h-3.5 w-3.5 text-destructive" />{a.pair}</td>
                  <td className="p-3 text-muted-foreground">{a.exchange}</td>
                  <td className="p-3 text-center"><StatusChip variant={a.risk === "critical" ? "error" : a.risk === "high" ? "warning" : "neutral"}>{a.risk}</StatusChip></td>
                  <td className="p-3 text-sm text-muted-foreground">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}