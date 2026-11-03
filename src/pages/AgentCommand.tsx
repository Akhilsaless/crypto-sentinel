import { useState } from "react";
import { Bot, Play, Pause, Square, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { StatusChip } from "@/components/StatusChip";

const exampleCommands = [
  "Scan the market and take only A-grade setups",
  "Risk 0.5% per trade, max 8 open positions",
  "Stop after +$500 or -$200 today",
  "Close all positions at end of session",
];

export default function AgentCommand() {
  const [command, setCommand] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "running" | "paused">("idle");
  const [settings, setSettings] = useState({
    dailyProfitCap: 500, dailyLossCap: 200, riskPerTrade: 0.5, maxOpenTrades: 10,
    quoteCurrencies: "USDT, USDC", allowedExchanges: "Kraken, Coinbase",
    sessionHours: "09:00–17:00 UTC", autoExecute: false, dryRun: true, paperMode: true, closeAtSessionEnd: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent Command Center</h1>
        <p className="text-sm text-muted-foreground">SIMULATION ONLY — no AI parsing, market scan or execution. Controls and settings are session-only.</p>
      </div>

      {/* Important note */}
      <div className="glass rounded-xl p-4 border-info/20 shadow-card">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info mb-1">How profit/loss caps work</p>
            <p className="text-muted-foreground">The daily profit cap is a <strong className="text-foreground">stop condition</strong>, not a forced target. The agent seeks high-quality setups under your risk limits and will stop trading once the cap is reached. It will <em>never</em> force trades just to hit a dollar target.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Command Panel */}
        <div className="glass rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" /> Command examples — not executed
          </h3>
          <div className="space-y-2">
            <Input
              placeholder="e.g. Scan the market and take only A-grade setups..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <div className="flex flex-wrap gap-2">
              {exampleCommands.map((c) => (
                <Button type="button" variant="secondary" key={c} onClick={() => setCommand(c)} className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {/* Parsed constraints */}
          <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Static Example Constraints (not parsed)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Min Score:</span><span className="mono">A-grade (≥85)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Risk/Trade:</span><span className="mono">0.5%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profit Cap:</span><span className="mono text-chart-up">+$500</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loss Cap:</span><span className="mono text-chart-down">-$200</span></div>
            </div>
          </div>

          {/* Agent Controls */}
          <div className="flex items-center gap-3 pt-2">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5" onClick={() => setAgentStatus("running")}>
              <Play className="h-3.5 w-3.5" /> {agentStatus === "idle" ? "Simulate Start" : "Simulate Scan"}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-border" onClick={() => setAgentStatus("paused")} disabled={agentStatus !== "running"}>
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setAgentStatus("idle")}>
              <Square className="h-3.5 w-3.5" /> Stop
            </Button>
            <StatusChip variant={agentStatus === "running" ? "success" : agentStatus === "paused" ? "warning" : "neutral"} pulse={agentStatus === "running"}>
              {agentStatus === "running" ? "Simulated running" : agentStatus === "paused" ? "Simulated paused" : "Simulated idle"}
            </StatusChip>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="glass rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Simulated Configuration</h3>
          <div className="space-y-3">
            {[
              { label: "Daily Profit Cap ($)", key: "dailyProfitCap", type: "number" },
              { label: "Daily Loss Cap ($)", key: "dailyLossCap", type: "number" },
              { label: "Risk Per Trade (%)", key: "riskPerTrade", type: "number" },
              { label: "Max Open Trades", key: "maxOpenTrades", type: "number" },
              { label: "Quote Currencies", key: "quoteCurrencies", type: "text" },
              { label: "Allowed Exchanges", key: "allowedExchanges", type: "text" },
              { label: "Session Hours", key: "sessionHours", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <label className="text-sm text-muted-foreground w-40 flex-shrink-0">{label}</label>
                <Input
                  type={type}
                  value={settings[key as keyof typeof settings] as string | number}
                  onChange={(e) => setSettings({ ...settings, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                  className="bg-secondary/50 border-border text-right mono max-w-[180px]"
                />
              </div>
            ))}
            <div className="border-t border-border/50 pt-3 space-y-3">
              {[
                { label: "Auto-Execute (UI only)", key: "autoExecute" },
                { label: "Dry Run", key: "dryRun" },
                { label: "Paper Mode", key: "paperMode" },
                { label: "Close All at Session End", key: "closeAtSessionEnd" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Switch
                    checked={settings[key as keyof typeof settings] as boolean}
                    onCheckedChange={(v) => setSettings({ ...settings, [key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      {!settings.paperMode && (
        <div className="glass rounded-xl p-4 border-destructive/20 shadow-card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              <strong>Paper option deselected (UI only).</strong> Live execution is unavailable in Phase 1. No credentials are accepted or services connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}