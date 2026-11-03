import { systemHealth } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Activity, Database, Wifi, Clock, AlertCircle, Server, Mail, MessageSquare } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

export default function Health() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Health</h1>
        <p className="text-sm text-muted-foreground">SAMPLE DATA / NOT LIVE — no actual service health or sync is monitored.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Sample Uptime" value={systemHealth.uptime} icon={Clock} />
        <MetricCard title="Sample Scan Cycles" value={String(systemHealth.scanCycles)} icon={Activity} />
        <MetricCard title="DB Health" value="Not provisioned" icon={Database} />
        <MetricCard title="Worker" value="Not deployed" icon={Server} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Connectivity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><Wifi className="h-4 w-4 text-primary" /> Kraken API</div>
              <div className="flex items-center gap-2">
                <span className="mono text-xs text-muted-foreground">Sample {systemHealth.apiLatency.kraken}ms</span>
                <StatusChip variant="neutral">Not connected</StatusChip>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><Wifi className="h-4 w-4 text-primary" /> Coinbase API</div>
              <div className="flex items-center gap-2">
                <span className="mono text-xs text-muted-foreground">Sample {systemHealth.apiLatency.coinbase}ms</span>
                <StatusChip variant="neutral">Not connected</StatusChip>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><Database className="h-4 w-4 text-primary" /> Database</div>
              <StatusChip variant="neutral">Not provisioned</StatusChip>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><Server className="h-4 w-4 text-primary" /> Worker Process</div>
              <StatusChip variant="neutral">Not deployed</StatusChip>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sample Sync Display</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Last Exchange Sync</span><span className="mono">{systemHealth.lastExchangeSync}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Data Fetch</span><span className="mono">{systemHealth.lastDataFetch}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Error</span><span className="mono text-chart-up">Not monitored</span></div>
          </div>
        </div>
      </div>

      {/* Alert Center */}
      <div className="glass rounded-xl p-6 shadow-card space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alert Center</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground mt-1">Unavailable — no email delivery or background alerts in Phase 1.</p>
              <StatusChip variant="neutral">Placeholder</StatusChip>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Telegram Alerts</p>
              <p className="text-xs text-muted-foreground mt-1">Unavailable — no Telegram connection or notification delivery in Phase 1.</p>
              <StatusChip variant="neutral">Placeholder</StatusChip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}