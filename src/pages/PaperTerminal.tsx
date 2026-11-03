import { useEffect, useState } from "react";
import { paperApi, type PaperAccount, type PaperOrder, type MarketQuote } from "@/lib/paperApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function PaperTerminal() {
  const [token,setToken] = useState("");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [account,setAccount] = useState<PaperAccount | null>(null);
  const [orders,setOrders] = useState<PaperOrder[]>([]);
  const [symbol,setSymbol] = useState<"BTC"|"ETH"|"SOL">("BTC");
  const [side,setSide] = useState<"buy"|"sell">("buy");
  const [quantity,setQuantity] = useState("0.001");
  const [quote,setQuote] = useState<MarketQuote|null>(null);
  const [confirm,setConfirm] = useState(false);
  const [killConfirm,setKillConfirm] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const [connected,setConnected] = useState(false);

  const run = async (operation:()=>Promise<void>) => {
    setBusy(true); setError(""); setMessage("");
    try { await operation(); }
    catch(e) {
      const text = e instanceof Error ? e.message : "Request failed";
      setError(text);
      if (text.includes("401") || text.toLowerCase().includes("expired")) { setToken("");setAccount(null); }
    } finally { setBusy(false); }
  };
  const refresh = async (key:string) => {
    const [a,o] = await Promise.all([paperApi.account(key),paperApi.orders(key)]);
    if(a.mode!=="paper_only" || o.mode!=="paper_only") throw new Error("Unexpected non-paper response");
    setAccount(a); setOrders(o.orders);
  };
  useEffect(() => { let active=true; paperApi.health().then(h => {if(active)setConnected(h.mode==="paper_only"&&h.live_trading==="hard_disabled");}).catch(()=>{if(active)setConnected(false);});return ()=>{active=false;}; },[]);
  useEffect(() => {setQuote(null);setConfirm(false);},[symbol,side,quantity]);
  const signIn = () => run(async()=>{
    const result=await paperApi.login(username,password);
    await refresh(result.access_token);
    setToken(result.access_token);setPassword("");setMessage("Paper-only account connected. Session stays in memory.");
  });
  const signUp = () => run(async()=>{
    await paperApi.register(username,password);
    setMessage("Virtual account created. Sign in to use it.");
  });
  const signOut = () => run(async()=>{
    try { if(token) await paperApi.logout(token); } finally {setToken("");setAccount(null);setOrders([]);setQuote(null);setConfirm(false);}
  });
  const loadQuote = () => run(async()=>{
    const q=await paperApi.quote(token,symbol);
    if(q.is_sample || !q.timestamp || Math.abs(Date.now()/1000-q.timestamp)>120) throw new Error("Quote is sample or stale. Paper order blocked.");
    setQuote(q);setMessage("Quote retrieved. Not guaranteed execution price.");
  });
  const placeOrder = () => run(async()=>{
    if(!account||account.killed||!quote||quote.is_sample||Math.abs(Date.now()/1000-quote.timestamp)>120 || !confirm) throw new Error("Fresh quote and explicit confirmation required.");
    if(!/^\d+(\.\d{1,6})?$/.test(quantity)||Number(quantity)<=0) throw new Error("Enter a positive quantity (max 6 decimal places).");
    const id = "paper-"+crypto.randomUUID();
    const order=await paperApi.fill(token,side,symbol,quantity,id);
    if(order.mode!=="paper_only")throw new Error("Unexpected order mode");
    setConfirm(false);setQuote(null);await refresh(token);
    setMessage("Virtual "+side+" order recorded: "+order.id+". No live exchange order was placed.");
  });
  const activateKill = () => run(async()=>{
    if(!killConfirm)throw new Error("Confirm before activating the paper kill switch.");
    const result=await paperApi.kill(token);
    setKillConfirm(false);await refresh(token);
    setMessage(result.positions_closed ? "Unexpected kill switch response" : "Paper orders disabled. Existing virtual positions were NOT liquidated.");
  });
  return <main className="space-y-6">
    <header className="space-y-2"><h1 className="text-2xl font-bold">Paper Trading Terminal</h1><p className="text-sm text-muted-foreground">Virtual funds only. No live exchange integration or live order execution. <Link className="underline" to="/portfolio">Sample portfolio is separate.</Link></p>
    <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-amber-900/30 p-2">PAPER ONLY</span><span className="rounded bg-red-900/30 p-2">LIVE TRADING DISABLED</span><span className="rounded bg-secondary p-2">Backend: {connected?"paper API reachable":"offline / unverified"}</span></div></header>
    {error&&<p role="alert" className="rounded border border-destructive p-3 text-sm text-destructive">{error}</p>}
    {message&&<p role="status" className="rounded border p-3 text-sm">{message}</p>}
    {!token ? <section className="max-w-md space-y-4 rounded border p-5"><h2 className="font-semibold">Development paper account</h2><p className="text-xs text-muted-foreground">Use test credentials only. This prototype is not approved for public users.</p>
      <label className="block text-sm">Username<Input autoComplete="username" minLength={3} maxLength={50} value={username} onChange={e=>setUsername(e.target.value)}/></label>
      <label className="block text-sm">Password<Input type="password" autoComplete="current-password" minLength={12} value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <div className="flex gap-2"><Button disabled={busy||!connected||username.length<3||password.length<12} onClick={signIn}>Sign in</Button><Button variant="outline" disabled={busy||!connected||username.length<3||password.length<12} onClick={signUp}>Create virtual account</Button></div>
    </section> : <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><Button disabled={busy} variant="outline" onClick={()=>run(()=>refresh(token))}>Refresh account</Button><Button variant="outline" disabled={busy} onClick={signOut}>Sign out</Button></div>
      <section className="rounded border p-5 space-y-3"><h2 className="font-semibold">Authenticated virtual account</h2><p>Simulated cash: <strong>${account?.cash_usd ?? "—"}</strong></p><p>New paper orders: <strong>{account?.killed?"DISABLED (kill switch)":"Enabled subject to risk limits"}</strong></p>
        <p className="text-xs text-muted-foreground">{account?.warning}</p>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left">Virtual asset</th><th className="text-left">Quantity</th><th className="text-left">Cost basis USD</th></tr></thead><tbody>{account?.positions.length ? account.positions.map(p=><tr key={p.symbol}><td>{p.symbol}</td><td>{p.quantity}</td><td>{p.cost_basis_usd}</td></tr>) : <tr><td colSpan={3}>No virtual holdings.</td></tr>}</tbody></table></div>
      </section>
      <section className="rounded border p-5 space-y-4"><h2 className="font-semibold">Manual paper order</h2>
        <div className="grid gap-3 sm:grid-cols-3"><label className="text-sm">Symbol<select className="block w-full rounded border bg-background p-2" value={symbol} onChange={e=>setSymbol(e.target.value as typeof symbol)}><option>BTC</option><option>ETH</option><option>SOL</option></select></label>
        <label className="text-sm">Side<select className="block w-full rounded border bg-background p-2" value={side} onChange={e=>setSide(e.target.value as typeof side)}><option value="buy">Buy virtual</option><option value="sell">Sell virtual</option></select></label>
        <label className="text-sm">Quantity<Input inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label></div>
        <Button variant="outline" disabled={busy||account?.killed} onClick={loadQuote}>Check fresh market quote</Button>
        {quote&&<div className="space-y-3 rounded bg-secondary/40 p-3 text-sm"><p>Reference price: ${quote.price_usd} · Source: {quote.source} · Captured: {new Date(quote.timestamp*1000).toLocaleString()}</p><p className="text-xs">Orders may fill at a newer API quote. No fees or slippage modeled in account executions.</p>
        <label className="flex items-start gap-2"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/><span>I understand that this places a <strong>virtual paper order only</strong>, may change my simulated balance, and does not trade real cryptocurrency.</span></label>
        <Button disabled={busy||!confirm||account?.killed||Math.abs(Date.now()/1000-quote.timestamp)>120} onClick={placeOrder}>Confirm virtual {side}</Button></div>}
      </section>
      <section className="rounded border border-destructive p-5 space-y-3"><h2 className="font-semibold">Emergency paper kill switch</h2><p className="text-sm">Permanently stops new paper orders pending manual review. It does <strong>not</strong> close virtual positions.</p><label className="flex gap-2 text-sm"><input type="checkbox" checked={killConfirm} onChange={e=>setKillConfirm(e.target.checked)}/> I understand this cannot be reset in this interface.</label><Button variant="destructive" disabled={busy||account?.killed||!killConfirm} onClick={activateKill}>Disable new paper orders</Button></section>
      <section className="rounded border p-5"><h2 className="font-semibold mb-3">Authenticated virtual order history</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Time","Side","Asset","Quantity","USD notional"].map(h=><th key={h} className="p-2 text-left">{h}</th>)}</tr></thead><tbody>{orders.length?orders.map(o=><tr key={o.id} className="border-t"><td className="p-2">{new Date(o.timestamp).toLocaleString()}</td><td className="p-2">{o.side}</td><td className="p-2">{o.symbol}</td><td className="p-2">{o.quantity}</td><td className="p-2">{o.notional_usd}</td></tr>):<tr><td colSpan={5} className="p-2">No paper orders.</td></tr>}</tbody></table></div></section>
    </div>}
  </main>;
}
