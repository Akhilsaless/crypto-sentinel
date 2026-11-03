import { exposureData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const COLORS = ["hsl(174, 72%, 50%)", "hsl(210, 80%, 55%)", "hsl(38, 92%, 55%)", "hsl(142, 60%, 45%)", "hsl(280, 60%, 55%)", "hsl(0, 72%, 55%)", "hsl(330, 60%, 55%)"];

export default function Portfolio() {
  const total = exposureData.reduce((s, e) => s + e.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio & Exposure</h1>
        <p className="text-sm text-muted-foreground">SAMPLE DATA / NOT LIVE — exposure, value, change and charts are simulated, not your holdings.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Exposure chart */}
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Exposure by Asset</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={exposureData} layout="vertical">
              <XAxis type="number" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
              <YAxis dataKey="asset" type="category" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} width={50} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {exposureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="glass rounded-xl p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Concentration</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={exposureData} dataKey="value" nameKey="asset" cx="50%" cy="50%" innerRadius={60} outerRadius={100} strokeWidth={2} stroke="hsl(220, 20%, 6%)">
                {exposureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 9%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()} (${((v / total) * 100).toFixed(1)}%)`, "Value"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {exposureData.map((e, i) => (
              <div key={e.asset} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{e.asset}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Heatmap Table */}
      <div className="glass rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Risk & Exposure Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
              <th className="text-left p-3">Asset</th><th className="text-right p-3">Value</th><th className="text-right p-3">Portfolio %</th><th className="text-right p-3">24h Change</th><th className="text-center p-3">Concentration</th>
            </tr></thead>
            <tbody>
              {exposureData.map((e, i) => (
                <tr key={e.asset} className="border-b border-border/30 hover:bg-secondary/30">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{e.asset}
                  </td>
                  <td className="p-3 text-right mono">${e.value.toLocaleString()}</td>
                  <td className="p-3 text-right mono">{((e.value / total) * 100).toFixed(1)}%</td>
                  <td className={`p-3 text-right mono font-medium ${e.change >= 0 ? "text-chart-up" : "text-chart-down"}`}>{e.change >= 0 ? "+" : ""}{e.change}%</td>
                  <td className="p-3 text-center">
                    <div className="w-full bg-border rounded-full h-2 max-w-[100px] mx-auto">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min((e.value / total * 100) * 2.5, 100)}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}