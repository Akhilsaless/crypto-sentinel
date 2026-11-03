import { signalLog, tradeLog, auditLog } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Logs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs & Audit</h1>
        <p className="text-sm text-muted-foreground">SAMPLE DATA / NOT LIVE — fabricated log fixtures, not actual executions or an audit trail.</p>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="signals">Sample Signals</TabsTrigger>
          <TabsTrigger value="trades">Sample Trades</TabsTrigger>
          <TabsTrigger value="audit">Sample Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <div className="glass rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                  <th className="text-left p-3">Time</th><th className="text-left p-3">Pair</th><th className="text-center p-3">Type</th><th className="text-center p-3">Score</th><th className="text-center p-3">Status</th>
                </tr></thead>
                <tbody>
                  {signalLog.map(s => (
                    <tr key={s.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="p-3 mono text-muted-foreground">{s.time}</td>
                      <td className="p-3 font-medium mono">{s.pair}</td>
                      <td className="p-3 text-center"><StatusChip variant={s.type === "buy" ? "success" : s.type === "sell" ? "error" : "warning"}>{s.type}</StatusChip></td>
                      <td className="p-3 text-center mono">{s.score}</td>
                      <td className="p-3 text-center"><StatusChip variant={s.status === "executed" ? "success" : s.status === "rejected" ? "error" : "warning"}>{s.status}</StatusChip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trades">
          <div className="glass rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                  <th className="text-left p-3">Time</th><th className="text-left p-3">Pair</th><th className="text-center p-3">Side</th><th className="text-right p-3">Price</th><th className="text-right p-3">Size</th><th className="text-right p-3">P&L</th><th className="text-center p-3">Status</th>
                </tr></thead>
                <tbody>
                  {tradeLog.map(t => (
                    <tr key={t.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="p-3 mono text-muted-foreground">{t.time}</td>
                      <td className="p-3 font-medium mono">{t.pair}</td>
                      <td className={`p-3 text-center font-medium ${t.side === "buy" ? "text-chart-up" : "text-chart-down"}`}>{t.side.toUpperCase()}</td>
                      <td className="p-3 text-right mono">${t.price}</td>
                      <td className="p-3 text-right mono">{t.size}</td>
                      <td className={`p-3 text-right mono ${t.pnl ? (t.pnl >= 0 ? "text-chart-up" : "text-chart-down") : "text-muted-foreground"}`}>{t.pnl ? `$${t.pnl}` : "—"}</td>
                      <td className="p-3 text-center"><StatusChip variant={t.status === "open" ? "success" : "neutral"}>{t.status}</StatusChip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="glass rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                  <th className="text-left p-3">Time</th><th className="text-left p-3">User</th><th className="text-left p-3">Action</th><th className="text-left p-3">Detail</th>
                </tr></thead>
                <tbody>
                  {auditLog.map((a, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="p-3 mono text-muted-foreground">{a.time}</td>
                      <td className="p-3"><StatusChip variant={a.user === "agent" ? "info" : a.user === "admin" ? "warning" : "neutral"}>{a.user}</StatusChip></td>
                      <td className="p-3 text-sm">{a.action.replace(/_/g, " ")}</td>
                      <td className="p-3 text-sm text-muted-foreground mono">{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}