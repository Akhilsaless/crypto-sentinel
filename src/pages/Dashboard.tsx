import { DollarSign, Wallet, TrendingUp, TrendingDown, Layers, Zap, Bot, Clock } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { portfolioSummary, equityCurve, dailyPnL, positions, openOrders, recentFills, activityFeed } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtUsd = (n: number) => `$${fmt(n)}`;

const typeColors: Record<string, string> = { signal: "text-primary", execution: "text-chart-up", risk: "text-warning", error: "text-destructive" };

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">SAMPLE DATA / NOT LIVE — all portfolio values, charts, orders and activity are simulated.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Equity" value={fmtUsd(portfolioSummary.equity)} icon={DollarSign} trend="up" />
        <MetricCard title="Cash Balance" value={fmtUsd(portfolioSummary.cash)} icon={Wallet} />
        <MetricCard title="Realized P&L" value={fmtUsd(portfolioSummary.realizedPnL)} icon={TrendingUp} trend="up" />
        <MetricCard title="Unrealized P&L" value={fmtUsd(portfolioSummary.unrealizedPnL)} icon={TrendingDown} trend="up" />
        <MetricCard title="Open Positions" value={String(portfolioSummary.openPositions)} subtitle="/ 10 max" icon={Layers} />
        <MetricCard title="Active Signals" value={String(portfolioSummary.activeSignals)} icon={Zap} />
        <MetricCard title="Bot Status" value="Simulated" subtitle="No worker connected" icon={Bot} />
        <MetricCard title="Last Heartbeat" value="12s ago" icon={Clock} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Sample Equity Curve</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="equity" stroke="hsl(174, 72%, 50%)" fill="url(#eqGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Sample Daily P&L</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyPnL}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dailyPnL.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "hsl(142, 60%, 45%)" : "hsl(0, 72%, 55%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Positions Table */}
      <div className="glass rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample Open Positions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                <th className="text-left p-3">Pair</th><th className="text-left p-3">Exchange</th><th className="text-right p-3">Entry</th><th className="text-right p-3">Current</th><th className="text-right p-3">Size</th><th className="text-right p-3">P&L</th><th className="text-right p-3">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(p => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-medium mono">{p.pair}</td>
                  <td className="p-3 text-muted-foreground">{p.exchange}</td>
                  <td className="p-3 text-right mono">{fmtUsd(p.entry)}</td>
                  <td className="p-3 text-right mono">{fmtUsd(p.current)}</td>
                  <td className="p-3 text-right mono">{p.size}</td>
                  <td className={`p-3 text-right mono font-medium ${p.pnl >= 0 ? "text-chart-up" : "text-chart-down"}`}>{p.pnl >= 0 ? "+" : ""}{fmtUsd(p.pnl)}</td>
                  <td className={`p-3 text-right mono ${p.pnlPct >= 0 ? "text-chart-up" : "text-chart-down"}`}>{p.pnlPct >= 0 ? "+" : ""}{p.pnlPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Open Orders */}
        <div className="glass rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample Open Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                <th className="text-left p-3">Pair</th><th className="text-left p-3">Type</th><th className="text-left p-3">Side</th><th className="text-right p-3">Price</th><th className="text-right p-3">Size</th><th className="text-right p-3">Status</th>
              </tr></thead>
              <tbody>
                {openOrders.map(o => (
                  <tr key={o.id} className="border-b border-border/30 hover:bg-secondary/30">
                    <td className="p-3 font-medium mono">{o.pair}</td>
                    <td className="p-3 text-muted-foreground">{o.type}</td>
                    <td className={`p-3 font-medium ${o.side === "buy" ? "text-chart-up" : "text-chart-down"}`}>{o.side.toUpperCase()}</td>
                    <td className="p-3 text-right mono">${o.price}</td>
                    <td className="p-3 text-right mono">{o.size}</td>
                    <td className="p-3 text-right"><StatusChip variant={o.status === "open" ? "success" : "warning"}>{o.status}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Fills */}
        <div className="glass rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample Recent Fills</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                <th className="text-left p-3">Pair</th><th className="text-left p-3">Side</th><th className="text-right p-3">Price</th><th className="text-right p-3">Total</th><th className="text-right p-3">Time</th>
              </tr></thead>
              <tbody>
                {recentFills.map(f => (
                  <tr key={f.id} className="border-b border-border/30 hover:bg-secondary/30">
                    <td className="p-3 font-medium mono">{f.pair}</td>
                    <td className={`p-3 font-medium ${f.side === "buy" ? "text-chart-up" : "text-chart-down"}`}>{f.side.toUpperCase()}</td>
                    <td className="p-3 text-right mono">${f.price}</td>
                    <td className="p-3 text-right mono">{fmtUsd(f.total)}</td>
                    <td className="p-3 text-right text-muted-foreground">{f.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass rounded-xl shadow-card">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample Recent Activity</h3>
        </div>
        <div className="divide-y divide-border/30 max-h-80 overflow-auto">
          {activityFeed.map((a, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors">
              <span className="mono text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">{a.time}</span>
              <span className={`text-xs font-medium uppercase w-16 flex-shrink-0 pt-0.5 ${typeColors[a.type] || "text-muted-foreground"}`}>{a.type}</span>
              <span className="text-sm">Sample: {a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}