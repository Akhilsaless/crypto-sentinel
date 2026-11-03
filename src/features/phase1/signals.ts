import { topBuySignals, avoidList, exitSignals } from "@/data/mockData";
export type SignalKind = "buy" | "avoid" | "exit";
export const sampleSignals = [
  ...topBuySignals.map(s => ({ id: `buy-${s.pair}`, pair: s.pair, kind: "buy" as SignalKind, exchange: s.exchange, score: s.score, reason: s.reason, detail: `${Math.round(s.confidence * 100)}% sample confidence`, href: "/opportunities/buys" })),
  ...avoidList.map(s => ({ id: `avoid-${s.pair}`, pair: s.pair, kind: "avoid" as SignalKind, exchange: s.exchange, score: null, reason: s.reason, detail: `${s.risk} risk`, href: "/opportunities/avoid" })),
  ...exitSignals.map(s => ({ id: `exit-${s.pair}`, pair: s.pair, kind: "exit" as SignalKind, exchange: "Unspecified", score: null, reason: s.reason, detail: `${s.action} · ${s.urgency} urgency`, href: "/opportunities/exits" })),
];
export function filterSignals(search: string, kind: string, exchange: string, sort: string) {
  return sampleSignals.filter(s => (kind === "all" || s.kind === kind) && (exchange === "all" || s.exchange === exchange) && `${s.pair} ${s.reason} ${s.detail}`.toLowerCase().includes(search.toLowerCase().trim())).sort((a,b) => sort === "score" ? (b.score ?? -1) - (a.score ?? -1) || a.pair.localeCompare(b.pair) : sort === "pair-desc" ? b.pair.localeCompare(a.pair) : a.pair.localeCompare(b.pair));
}