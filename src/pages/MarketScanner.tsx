import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paperRequest } from "@/lib/paperApi";

type Scan = {
  symbol: string; timeframe: "intraday"|"swing"; signal: "entry_watch"|"exit_watch"|"no_trade";
  as_of_candle: number; price_usd: number; rsi14: number; atr14: number;
  ema9: number; ema21: number; hypothetical_long_stop_usd: number;
  hypothetical_long_target_usd: number; reasons: string[]; warning: string;
  mode: "read_only_research";
};
const symbols = ["BTC","ETH","SOL"] as const;
const frames = ["intraday","swing"] as const;
type Evaluation = { symbol:string;timeframe:string;mode:"historical_research_only";holdout_bars:number;return_pct:number;max_drawdown_pct:number;round_trips_closed:number;win_rate_pct:number|null;warning:string; };

export default function MarketScanner() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<Scan[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [evaluations,setEvaluations] = useState<Record<string,Evaluation>>({});
  const [issue, setIssue] = useState("");
  const login=async()=>{
    setBusy(true);setIssue("");
    try {
      const response=await paperRequest<{access_token:string}>("/auth/login",undefined,"POST",{username,password});
      setToken(response.access_token);setPassword("");
    } catch(e) {setIssue(e instanceof Error?e.message:"Login failed");}
    finally {setBusy(false);}
  };
  const scan=async()=>{
    setBusy(true);setRows([]);setErrors([]);setIssue("");
    try {
      const requests=symbols.flatMap(symbol=>frames.map(timeframe=>({symbol,timeframe})));
      const outcomes=await Promise.allSettled(requests.map(({symbol,timeframe})=>
        paperRequest<Scan>(`/research/scan/${symbol}/${timeframe}`,token)));
      const valid:Scan[]=[];const failed:string[]=[];
      outcomes.forEach((result,i)=>{
        if(result.status==="fulfilled"&&result.value.mode==="read_only_research") valid.push(result.value);
        else failed.push(`${requests[i].symbol} ${requests[i].timeframe}: ${result.status==="rejected" ? String(result.reason instanceof Error?result.reason.message:result.reason):"Invalid response"}`);
      });
      setRows(valid);setErrors(failed);
    } catch(e) {setIssue(e instanceof Error?e.message:"Scanner unavailable");}
    finally {setBusy(false);}
  };
  const evaluateOne=async(symbol:string,timeframe:string)=>{
    setBusy(true);setIssue("");
    try {
      const data=await paperRequest<Evaluation>(`/research/evaluate/${symbol}/${timeframe}`,token);
      if(data.mode!=="historical_research_only")throw new Error("Unexpected evaluation response");
      setEvaluations(previous=>({...previous,[symbol+timeframe]:data}));
    } catch(e) {setIssue(e instanceof Error?e.message:"Evaluation unavailable");}
    finally {setBusy(false);}
  };
  const logout=async()=>{
    try {if(token)await paperRequest("/auth/logout",token,"POST");}
    catch { /* local session is cleared even on network failure */ }
    finally {setToken("");setRows([]);setErrors([]);}
  };
  return <div className="max-w-6xl space-y-5">
    <header className="space-y-2"><h1 className="text-2xl font-bold">Market Research Scanner</h1>
      <p className="text-sm text-muted-foreground">BTC, ETH and SOL · 1-hour intraday / 4-hour swing candles · Kraken read-only public feed. No automated trades.</p>
      <p className="text-xs text-amber-500">Experimental, unvalidated signals. Never use alone to place a real-money trade. Data outage means no signal.</p>
      <p className="text-sm"><Link className="underline" to="/paper-lab">Open virtual trading lab</Link></p></header>
    {issue&&<p role="alert" className="text-destructive text-sm">{issue}</p>}
    {!token?<section className="rounded border p-4 max-w-md space-y-3">
      <h2 className="font-semibold">Local demo account login</h2>
      <p className="text-xs text-muted-foreground">Use the development paper account; no exchange credentials.</p>
      <label className="block text-sm">Username<Input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label>
      <label className="block text-sm">Password<Input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <Button disabled={busy||username.length<3||password.length<12} onClick={login}>Sign in</Button>
    </section>:<section className="space-y-4">
      <div className="flex gap-3"><Button disabled={busy} onClick={scan}>{busy?"Scanning…":"Scan 6 markets"}</Button>
        <Button variant="outline" disabled={busy} onClick={logout}>Sign out</Button></div>
      {errors.length>0&&<div role="alert" className="rounded border border-destructive p-3 text-sm"><strong>Data unavailable; signals suppressed:</strong>{errors.map(e=><p key={e}>{e}</p>)}</div>}
      <div className="grid gap-3 md:grid-cols-2">{rows.map(r=><article className="rounded border p-4 space-y-2" key={r.symbol+r.timeframe}>
        <div className="flex justify-between items-center"><h2 className="font-semibold">{r.symbol} / USD — {r.timeframe}</h2><span className="text-sm font-semibold">{r.signal.replaceAll("_"," ").toUpperCase()}</span></div>
        <p className="text-xs text-muted-foreground">Last completed candle: {new Date(r.as_of_candle*1000).toLocaleString()}</p>
        <p className="text-sm">Reference close: ${r.price_usd.toLocaleString()} · RSI14: {r.rsi14} · ATR14: {r.atr14}</p>
        <p className="text-sm">Illustrative long stop: ${r.hypothetical_long_stop_usd} · target: ${r.hypothetical_long_target_usd}</p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">{r.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>
        <p className="text-xs text-amber-500">{r.warning}</p>
        <Button variant="outline" size="sm" disabled={busy} onClick={()=>evaluateOne(r.symbol,r.timeframe)}>Evaluate historical holdout</Button>
        {evaluations[r.symbol+r.timeframe]&&<div className="rounded border p-3 text-sm space-y-1"><p>Historical holdout ({evaluations[r.symbol+r.timeframe].holdout_bars} bars): {evaluations[r.symbol+r.timeframe].return_pct}% return; {evaluations[r.symbol+r.timeframe].max_drawdown_pct}% max drawdown</p><p>Closed simulated trades: {evaluations[r.symbol+r.timeframe].round_trips_closed}; win rate: {evaluations[r.symbol+r.timeframe].win_rate_pct ?? "N/A"}%</p><p className="text-xs text-amber-500">{evaluations[r.symbol+r.timeframe].warning}</p></div>}
        </article>)}</div>
      {rows.length===0&&errors.length===0&&<p className="text-sm text-muted-foreground">Run a scan to request completed-market-candle analysis.</p>}
    </section>}
  </div>;
}
