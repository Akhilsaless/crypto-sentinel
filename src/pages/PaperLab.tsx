import { useState } from "react";
import { AlertTriangle, FlaskConical, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkspaceTitle } from "@/components/WorkspaceFields";
import { paperRequest, type PaperAccount, type PaperTrade } from "@/lib/paperApi";

export default function PaperLab() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [orders, setOrders] = useState<PaperTrade[]>([]);
  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("0.001");
  const [quote, setQuote] = useState("");
  const [message, setMessage] = useState("Connect to the local Python API before using paper trading.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function task(run: () => Promise<void>) {
    setError(""); setBusy(true);
    try { await run(); } catch (e) { setError(e instanceof Error ? e.message : "Request failed"); } finally { setBusy(false); }
  }
  async function refresh(t = token) {
    const [a, h] = await Promise.all([
      paperRequest<PaperAccount>("/paper/account", t),
      paperRequest<{ orders: PaperTrade[] }>("/paper/orders", t)
    ]);
    setAccount(a); setOrders(h.orders);
  }
  const login = (register: boolean) => task(async () => {
    if (register) await paperRequest("/auth/register", undefined, "POST", { username, password });
    const response = await paperRequest<{ access_token: string }>("/auth/login", undefined, "POST", { username, password });
    setToken(response.access_token); setPassword("");
    await refresh(response.access_token);
    setMessage("Paper-only session connected. Balances represent virtual funds.");
  });
  const logout = () => task(async () => {
    try { await paperRequest("/auth/logout", token, "POST"); }
    finally { setToken(""); setAccount(null); setOrders([]); setQuote(""); setMessage("Signed out of local paper session."); }
  });
  const lookUp = () => task(async () => {
    const result = await paperRequest<{price_usd:string;source:string;timestamp:number}>("/market/" + symbol,token);
    setQuote(result.price_usd); setMessage("Read-only quote from " + result.source + " at " + new Date(result.timestamp * 1000).toLocaleTimeString() + ". Not an execution guarantee.");
  });
  const sendOrder = () => task(async () => {
    if (!window.confirm("SIMULATED " + side.toUpperCase() + " " + quantity + " " + symbol + "? Virtual funds only. No real order will be sent.")) return;
    const id = "manual_" + crypto.randomUUID().replaceAll("-", "");
    await paperRequest("/paper/orders", token, "POST", { symbol, side, quantity, client_order_id: id });
    await refresh();
    setMessage("Virtual order recorded on your local paper account. No real exchange order.");
  });
  const kill = () => task(async () => {
    if (!window.confirm("Block all NEW paper orders? This is irreversible in this development build and does not close positions.")) return;
    await paperRequest("/paper/kill", token, "POST");
    await refresh();
    setMessage("Paper kill switch activated. New paper orders blocked; existing simulated positions are NOT liquidated.");
  });
  return <div className="space-y-6 max-w-5xl">
    <WorkspaceTitle title="Paper Trading Lab" label="VIRTUAL FUNDS ONLY / NO LIVE ORDERS"
      description="An experimental local API workspace. Unlike the sample Dashboard, this page reads your local paper account when both servers are running. It is not production-ready." />
    <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm flex gap-3"><AlertTriangle className="shrink-0 h-5 w-5 text-warning" />
      <span>This screen uses the same-origin <code>/paper-api</code> development proxy. Run the Python server locally at 127.0.0.1:8000. Never enter real exchange credentials. This is not a brokerage service.</span>
    </div>
    <p role="status" className="text-sm text-muted-foreground">{message}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!token ? <section className="glass rounded-xl p-5 space-y-4">
      <h2 className="font-semibold flex gap-2"><FlaskConical className="h-5 w-5"/> Local demo account</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">Username<Input aria-label="Username" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} /></label>
        <label className="space-y-1 text-sm">Password<Input aria-label="Password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      </div>
      <div className="flex gap-3"><Button disabled={busy || username.length<3 || password.length<12} onClick={()=>login(false)}>Sign in</Button>
      <Button variant="outline" disabled={busy || username.length<3 || password.length<12} onClick={()=>login(true)}>Create local paper account</Button></div>
      <p className="text-xs text-muted-foreground">Bearer token exists only in this browser tab's React memory; refreshing signs you out. Do not use this prototype for personal or sensitive credentials.</p>
    </section> : <>
      <div className="flex flex-wrap justify-between gap-3"><h2 className="text-lg font-semibold">Virtual account</h2>
        <div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={()=>task(()=>refresh())}>Refresh</Button><Button variant="outline" disabled={busy} onClick={logout}>Sign out</Button></div></div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="glass p-4 rounded-lg"><div className="text-xs text-muted-foreground">Virtual cash</div><div className="text-xl font-semibold">${account?.cash_usd ?? "—"}</div></div>
        <div className="glass p-4 rounded-lg"><div className="text-xs text-muted-foreground">Virtual positions</div><div className="text-xl font-semibold">{account?.positions.length ?? "—"}</div></div>
        <div className="glass p-4 rounded-lg"><div className="text-xs text-muted-foreground">Paper trading status</div><div className="font-semibold">{account?.killed ? "KILLED" : "LOCAL PAPER ONLY"}</div></div>
      </div>
      <section className="glass rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Manual virtual order</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm space-y-1">Symbol<select aria-label="Symbol" className="w-full rounded-md border bg-background p-2" value={symbol} onChange={e=>{setSymbol(e.target.value);setQuote("");}}><option>BTC</option><option>ETH</option><option>SOL</option></select></label>
          <label className="text-sm space-y-1">Side<select aria-label="Side" className="w-full rounded-md border bg-background p-2" value={side} onChange={e=>setSide(e.target.value as "buy"|"sell")}><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
          <label className="text-sm space-y-1">Quantity<Input aria-label="Quantity" inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)} /></label>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="outline" disabled={busy} onClick={lookUp}>Fetch read-only quote</Button>
          <span className="text-sm">Quote: {quote ? "$"+quote+" (indicative)" : "Not fetched"}</span>
          <Button disabled={busy || Boolean(account?.killed) || !/^\d+(?:\.\d{1,6})?$/.test(quantity) || Number(quantity)<=0} onClick={sendOrder}>Place virtual order</Button>
        </div>
      </section>
      <section className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-semibold">Virtual positions</h3>
        {account?.positions.length ? account.positions.map(p=><p key={p.symbol} className="text-sm">{p.symbol}: {p.quantity} units · cost basis ${p.cost_basis_usd}</p>) : <p className="text-sm text-muted-foreground">No virtual positions.</p>}
        <h3 className="font-semibold pt-2">Virtual order history</h3>
        {orders.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left p-2">Side</th><th className="text-left p-2">Symbol</th><th className="text-left p-2">Units</th><th className="text-left p-2">Price</th></tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-t"><td className="p-2">{o.side}</td><td className="p-2">{o.symbol}</td><td className="p-2">{o.quantity}</td><td className="p-2">${o.price_usd}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">No virtual orders.</p>}
      </section>
      <div className="border border-destructive/30 rounded-xl p-5 space-y-2">
        <h3 className="flex gap-2 font-semibold text-destructive"><ShieldAlert className="h-5 w-5"/> Emergency paper stop</h3>
        <p className="text-sm text-muted-foreground">Disables all new paper orders on the server; does NOT close positions. No self-service reset.</p>
        <Button disabled={busy || Boolean(account?.killed)} variant="destructive" onClick={kill}>Stop new paper orders</Button>
      </div>
    </>}
  </div>;
}
