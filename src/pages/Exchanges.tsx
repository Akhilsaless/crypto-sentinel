import { exchangeConfigs } from "@/data/mockData";
import { StatusChip } from "@/components/StatusChip";
import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkspaceTitle } from "@/components/WorkspaceFields";

const publicFeeds = [
  { name: "CoinDCX Spot", exchange: "coindcx", quote: "USDT", caveat: "CoinDCX authenticated keys are not read-only. No key or account is connected." },
  { name: "Binance Spot", exchange: "binance", quote: "USDT", caveat: "Public market candles only; no trading account connection or signed requests." },
] as const;

export default function Exchanges() {
  return <div className="space-y-6">
    <WorkspaceTitle title="Exchange Integrations" label="PUBLIC MARKET DATA / NO LIVE ORDERS"
      description="Read-only adapters are implemented for CoinDCX and Binance. Runtime connectivity and 24/7 hosting must be verified; no trading account API keys have been configured." />
    <div className="grid gap-4 md:grid-cols-2">
      {publicFeeds.map(ex=><article key={ex.exchange} className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-semibold"><Link2 className="h-4 w-4 text-primary"/>{ex.name}</h2>
        <StatusChip variant="warning">PUBLIC DATA ADAPTER — UNVERIFIED HOST</StatusChip>
        <p className="text-sm">BTC, ETH, SOL · 1h intraday / 4h swing · {ex.quote} spot quotes</p>
        <p className="text-sm text-muted-foreground">Read-only candle adapter, experimental scanner, and historical evaluation are implemented on the Python backend.</p>
        <p className="text-xs text-warning">{ex.caveat}</p>
        <Link className="text-sm underline text-primary" to="/market-scanner">Open market scanner and test feed</Link>
      </article>)}
    </div>
    <section className="space-y-3">
      <h2 className="font-semibold">Legacy example exchange cards</h2>
      <p className="text-xs text-muted-foreground">These are sample UI fixtures only and have no real exchange connection.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {exchangeConfigs.map(ex=><article key={ex.id} className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="flex items-start gap-2 font-semibold"><Link2 className="h-4 w-4 shrink-0 mt-1 text-primary"/>{ex.name}</h3>
          <StatusChip variant="neutral">SAMPLE / NOT CONNECTED</StatusChip>
          <p className="text-sm text-muted-foreground">{ex.pairs} example pairs · No account sync</p>
        </article>)}
      </div>
    </section>
    <p className="text-sm text-warning">Real-money trading remains hard-disabled. A read-only feed is not an authenticated exchange-account integration, and a local Docker configuration is not an active deployment.</p>
  </div>;
}
