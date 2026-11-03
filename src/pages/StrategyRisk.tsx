import { strategies } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AlertTriangle, Cog } from "lucide-react";

export default function StrategyRisk() {
  const [localStrategies, setLocalStrategies] = useState(strategies);
  const [riskPerTrade, setRiskPerTrade] = useState(0.5);
  const [maxPosition, setMaxPosition] = useState(5);
  const [maxOpenTrades, setMaxOpenTrades] = useState(10);
  const [dailyProfitCap, setDailyProfitCap] = useState(500);
  const [dailyLossCap, setDailyLossCap] = useState(200);

  const aggressive = riskPerTrade > 2 || maxPosition > 15 || maxOpenTrades > 15;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strategy & Risk Builder</h1>
        <p className="text-sm text-muted-foreground">SIMULATED / SESSION-ONLY — sample performance, no saved strategy or enforced risk limits. Profit caps are stop conditions, never targets.</p>
      </div>

      {aggressive && (
        <div className="glass rounded-xl p-4 border-destructive/20 shadow-card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive"><strong>Aggressive Configuration Detected.</strong> Your risk per trade or position sizing exceeds recommended limits. Proceed with caution.</p>
          </div>
        </div>
      )}

      {/* Strategy Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {localStrategies.map(s => (
          <div key={s.id} className="glass rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Cog className="h-4 w-4 text-primary" />{s.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </div>
              <Switch aria-label={`Simulate ${s.name}`} checked={s.enabled} onCheckedChange={enabled => setLocalStrategies(localStrategies.map(item => item.id === s.id ? {...item, enabled} : item))} />
            </div>
            <div className="flex gap-4 text-xs">
              <div><span className="text-muted-foreground">Sample Win Rate:</span> <span className="mono text-chart-up">{s.winRate}%</span></div>
              <div><span className="text-muted-foreground">Sample Avg Return:</span> <span className="mono text-primary">{s.avgReturn}%</span></div>
              <StatusChip variant={s.enabled ? "success" : "neutral"}>{s.enabled ? "UI enabled" : "UI disabled"}</StatusChip>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Settings */}
      <div className="glass rounded-xl p-6 shadow-card space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Risk Parameters</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Risk Per Trade (%)", value: riskPerTrade, set: setRiskPerTrade },
            { label: "Max Position Size (%)", value: maxPosition, set: setMaxPosition },
            { label: "Max Open Trades", value: maxOpenTrades, set: setMaxOpenTrades },
            { label: "Daily Profit Cap ($)", value: dailyProfitCap, set: setDailyProfitCap },
            { label: "Daily Loss Cap ($)", value: dailyLossCap, set: setDailyLossCap },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs text-muted-foreground">{label}</label>
              <Input type="number" value={value} onChange={e => set(Number(e.target.value))} className="bg-secondary/50 border-border mono" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}