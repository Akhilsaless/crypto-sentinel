// Mock data for CryptoSignal Agent demo

export const portfolioSummary = {
  equity: 127843.52,
  cash: 42156.48,
  realizedPnL: 3841.20,
  unrealizedPnL: 1247.33,
  openPositions: 7,
  activeSignals: 14,
  botStatus: "running" as const,
  lastHeartbeat: new Date(Date.now() - 12000).toISOString(),
  mode: "demo" as const,
};

export const equityCurve = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  equity: 100000 + Math.floor(Math.random() * 5000 + i * 800 + Math.sin(i * 0.5) * 3000),
}));

export const dailyPnL = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  pnl: Math.floor(Math.random() * 1200 - 400),
}));

export const positions = [
  { id: "1", pair: "BTC/USDT", exchange: "Kraken", side: "long", entry: 67234.50, current: 68412.80, size: 0.15, pnl: 176.75, pnlPct: 1.75, stopLoss: 65800, takeProfit: 71000 },
  { id: "2", pair: "ETH/USDT", exchange: "Coinbase", side: "long", entry: 3456.20, current: 3521.40, size: 2.5, pnl: 163.00, pnlPct: 1.89, stopLoss: 3350, takeProfit: 3750 },
  { id: "3", pair: "SOL/USDT", exchange: "Kraken", side: "long", entry: 142.80, current: 148.65, size: 25, pnl: 146.25, pnlPct: 4.10, stopLoss: 136, takeProfit: 165 },
  { id: "4", pair: "AVAX/USDT", exchange: "Coinbase", side: "long", entry: 35.42, current: 34.18, size: 80, pnl: -99.20, pnlPct: -3.50, stopLoss: 32.50, takeProfit: 42 },
  { id: "5", pair: "LINK/USDT", exchange: "Kraken", side: "long", entry: 14.85, current: 15.62, size: 200, pnl: 154.00, pnlPct: 5.19, stopLoss: 13.50, takeProfit: 18 },
  { id: "6", pair: "DOT/USDT", exchange: "Coinbase", side: "long", entry: 7.23, current: 7.58, size: 500, pnl: 175.00, pnlPct: 4.84, stopLoss: 6.80, takeProfit: 9 },
  { id: "7", pair: "MATIC/USDT", exchange: "Kraken", side: "long", entry: 0.892, current: 0.867, size: 3000, pnl: -75.00, pnlPct: -2.80, stopLoss: 0.82, takeProfit: 1.05 },
];

export const openOrders = [
  { id: "O1", pair: "ADA/USDT", exchange: "Kraken", type: "limit", side: "buy", price: 0.445, size: 2000, status: "open", created: "2 min ago" },
  { id: "O2", pair: "XRP/USDT", exchange: "Coinbase", type: "stop-limit", side: "sell", price: 0.58, size: 1500, status: "open", created: "8 min ago" },
  { id: "O3", pair: "NEAR/USDT", exchange: "Kraken", type: "limit", side: "buy", price: 6.12, size: 100, status: "pending", created: "15 min ago" },
];

export const recentFills = [
  { id: "F1", pair: "BTC/USDT", side: "buy", price: 67234.50, size: 0.15, total: 10085.18, time: "34 min ago", exchange: "Kraken" },
  { id: "F2", pair: "DOGE/USDT", side: "sell", price: 0.1245, size: 10000, total: 1245.00, time: "1h ago", exchange: "Coinbase" },
  { id: "F3", pair: "ETH/USDT", side: "buy", price: 3456.20, size: 2.5, total: 8640.50, time: "2h ago", exchange: "Kraken" },
  { id: "F4", pair: "SOL/USDT", side: "buy", price: 142.80, size: 25, total: 3570.00, time: "3h ago", exchange: "Kraken" },
  { id: "F5", pair: "LINK/USDT", side: "buy", price: 14.85, size: 200, total: 2970.00, time: "5h ago", exchange: "Coinbase" },
];

export const topBuySignals = [
  { pair: "BTC/USDT", exchange: "Kraken", score: 94, confidence: 0.91, entryZone: "67000–67500", stopLoss: 65200, target: 72500, timeframe: "4H", reason: "Bullish breakout + volume surge + RSI divergence", volatility: "medium", liquidity: "high", autoEligible: true },
  { pair: "ETH/USDT", exchange: "Coinbase", score: 89, confidence: 0.87, entryZone: "3420–3480", stopLoss: 3300, target: 3850, timeframe: "4H", reason: "Golden cross + accumulation zone + strong bid wall", volatility: "medium", liquidity: "high", autoEligible: true },
  { pair: "SOL/USDT", exchange: "Kraken", score: 86, confidence: 0.84, entryZone: "140–145", stopLoss: 132, target: 172, timeframe: "1D", reason: "Higher lows + ecosystem growth catalyst", volatility: "high", liquidity: "high", autoEligible: true },
  { pair: "LINK/USDT", exchange: "Coinbase", score: 82, confidence: 0.79, entryZone: "14.50–15.20", stopLoss: 13.20, target: 19.50, timeframe: "4H", reason: "CCIP adoption + bullish wedge breakout", volatility: "medium", liquidity: "medium", autoEligible: true },
  { pair: "INJ/USDT", exchange: "Kraken", score: 78, confidence: 0.76, entryZone: "22.50–24.00", stopLoss: 20.80, target: 31.00, timeframe: "1D", reason: "Trend continuation + DeFi narrative", volatility: "high", liquidity: "medium", autoEligible: false },
  { pair: "RUNE/USDT", exchange: "Kraken", score: 75, confidence: 0.72, entryZone: "5.20–5.60", stopLoss: 4.80, target: 7.40, timeframe: "4H", reason: "Cross-chain volume spike + oversold bounce", volatility: "high", liquidity: "medium", autoEligible: false },
  { pair: "AAVE/USDT", exchange: "Coinbase", score: 73, confidence: 0.70, entryZone: "92–96", stopLoss: 85, target: 120, timeframe: "1D", reason: "DeFi rotation + protocol revenue growth", volatility: "medium", liquidity: "medium", autoEligible: true },
  { pair: "NEAR/USDT", exchange: "Kraken", score: 71, confidence: 0.68, entryZone: "6.00–6.40", stopLoss: 5.50, target: 8.20, timeframe: "4H", reason: "AI narrative + chain abstraction momentum", volatility: "high", liquidity: "medium", autoEligible: false },
];

export const avoidList = [
  { pair: "SHIB/USDT", exchange: "Coinbase", reason: "Low liquidity depth, high spread, meme-driven volatility", risk: "high" as const },
  { pair: "PEPE/USDT", exchange: "Kraken", reason: "Overextended +180% in 7d, exhaustion signals, whale distribution", risk: "critical" as const },
  { pair: "DOGE/USDT", exchange: "Coinbase", reason: "Conflicting signals across timeframes, no clear trend", risk: "medium" as const },
  { pair: "FLOKI/USDT", exchange: "Kraken", reason: "Extremely low liquidity, high slippage risk, event-driven pumps", risk: "critical" as const },
  { pair: "LUNC/USDT", exchange: "Coinbase", reason: "Dead project momentum, declining volume, no institutional interest", risk: "high" as const },
  { pair: "XLM/USDT", exchange: "Kraken", reason: "Weak trend strength, range-bound for 30+ days, low ATR", risk: "medium" as const },
];

export const exitSignals = [
  { pair: "DOGE/USDT", action: "sell" as const, reason: "Take-profit hit at +12%, momentum fading", urgency: "high" as const, currentPnl: 12.4 },
  { pair: "AVAX/USDT", action: "trim" as const, reason: "Approaching resistance, reduce by 50%", urgency: "medium" as const, currentPnl: -3.5 },
  { pair: "MATIC/USDT", action: "stop-adjust" as const, reason: "Trail stop to breakeven, trend weakening", urgency: "low" as const, currentPnl: -2.8 },
  { pair: "BTC/USDT", action: "hold" as const, reason: "Strong trend intact, no exit trigger yet", urgency: "low" as const, currentPnl: 1.75 },
];

export const activityFeed = [
  { time: "12:34:02", type: "signal" as const, message: "New A-grade BUY signal: BTC/USDT @ 67,234 (score: 94)" },
  { time: "12:33:45", type: "execution" as const, message: "Filled: BUY 0.15 BTC/USDT @ 67,234.50 on Kraken" },
  { time: "12:31:12", type: "signal" as const, message: "Exit signal: SELL DOGE/USDT – take profit hit +12.4%" },
  { time: "12:28:55", type: "risk" as const, message: "Risk check passed: 7/10 max positions, 0.48% risk per trade" },
  { time: "12:25:30", type: "signal" as const, message: "New B-grade BUY signal: LINK/USDT @ 14.85 (score: 82)" },
  { time: "12:20:18", type: "error" as const, message: "Coinbase API rate limit warning – throttling requests" },
  { time: "12:15:44", type: "execution" as const, message: "Filled: SELL 10,000 DOGE/USDT @ 0.1245 on Coinbase" },
  { time: "12:10:02", type: "risk" as const, message: "Daily P&L: +$341.20 / $500.00 stop-profit cap (68%)" },
  { time: "12:05:33", type: "signal" as const, message: "AVOID flagged: PEPE/USDT – overextended +180% in 7d" },
  { time: "12:00:00", type: "execution" as const, message: "Agent scan cycle #247 completed – 14 signals generated" },
];

export const signalLog = [
  { id: "S1", time: "12:34:02", pair: "BTC/USDT", type: "buy", score: 94, status: "executed" },
  { id: "S2", time: "12:31:12", pair: "DOGE/USDT", type: "sell", score: 88, status: "executed" },
  { id: "S3", time: "12:25:30", pair: "LINK/USDT", type: "buy", score: 82, status: "pending" },
  { id: "S4", time: "12:18:45", pair: "ETH/USDT", type: "buy", score: 89, status: "executed" },
  { id: "S5", time: "12:12:10", pair: "SOL/USDT", type: "buy", score: 86, status: "executed" },
  { id: "S6", time: "12:05:33", pair: "PEPE/USDT", type: "avoid", score: 15, status: "rejected" },
  { id: "S7", time: "11:58:20", pair: "AVAX/USDT", type: "buy", score: 71, status: "executed" },
  { id: "S8", time: "11:50:05", pair: "MATIC/USDT", type: "buy", score: 68, status: "executed" },
];

export const tradeLog = [
  { id: "T1", time: "12:33:45", pair: "BTC/USDT", side: "buy", price: 67234.50, size: 0.15, pnl: null, status: "open" },
  { id: "T2", time: "12:15:44", pair: "DOGE/USDT", side: "sell", price: 0.1245, size: 10000, pnl: 142.50, status: "closed" },
  { id: "T3", time: "11:45:30", pair: "ETH/USDT", side: "buy", price: 3456.20, size: 2.5, pnl: null, status: "open" },
  { id: "T4", time: "10:20:15", pair: "SOL/USDT", side: "buy", price: 142.80, size: 25, pnl: null, status: "open" },
  { id: "T5", time: "09:30:00", pair: "ADA/USDT", side: "sell", price: 0.472, size: 5000, pnl: 85.00, status: "closed" },
];

export const auditLog = [
  { time: "12:34:02", user: "agent", action: "signal_generated", detail: "BTC/USDT BUY score=94" },
  { time: "12:33:45", user: "agent", action: "order_placed", detail: "BUY 0.15 BTC/USDT @ 67234.50" },
  { time: "12:30:00", user: "admin", action: "config_changed", detail: "daily_profit_cap: $400 → $500" },
  { time: "12:25:30", user: "agent", action: "signal_generated", detail: "LINK/USDT BUY score=82" },
  { time: "12:20:00", user: "system", action: "risk_check", detail: "All checks passed" },
  { time: "12:15:44", user: "agent", action: "order_filled", detail: "SELL 10000 DOGE/USDT @ 0.1245" },
  { time: "12:00:00", user: "system", action: "heartbeat", detail: "Scan cycle #247 OK" },
];

export const systemHealth = {
  lastExchangeSync: "12 sec ago",
  lastDataFetch: "3 sec ago",
  apiLatency: { kraken: 45, coinbase: 62 },
  dbHealth: "healthy" as const,
  workerStatus: "running" as const,
  lastError: null as string | null,
  uptime: "4d 7h 23m",
  scanCycles: 247,
};

export const exchangeConfigs = [
  { id: "kraken", name: "Kraken", status: "demo" as const, apiKey: "••••••••k4Fz", lastSync: "12s ago", pairs: 142 },
  { id: "coinbase", name: "Coinbase Advanced Trade", status: "demo" as const, apiKey: "••••••••xR2m", lastSync: "15s ago", pairs: 98 },
  { id: "ccxt", name: "Generic CCXT Connector", status: "not_configured" as const, apiKey: "", lastSync: "—", pairs: 0 },
];

export const strategies = [
  { id: "trend", name: "Trend Following", description: "Follow established trends using SMA crossovers and ADX confirmation", enabled: true, winRate: 62, avgReturn: 3.8 },
  { id: "breakout", name: "Breakout", description: "Capture range breakouts with volume confirmation", enabled: true, winRate: 55, avgReturn: 5.2 },
  { id: "momentum", name: "Momentum", description: "RSI + MACD momentum plays with tight risk management", enabled: false, winRate: 58, avgReturn: 2.9 },
  { id: "mean_reversion", name: "Mean Reversion", description: "Fade overextended moves back to VWAP/mean", enabled: false, winRate: 64, avgReturn: 2.1 },
];

export const exposureData = [
  { asset: "BTC", value: 10261.92, pct: 35.2, change: 1.75 },
  { asset: "ETH", value: 8803.50, pct: 30.2, change: 1.89 },
  { asset: "SOL", value: 3716.25, pct: 12.8, change: 4.10 },
  { asset: "LINK", value: 3124.00, pct: 10.7, change: 5.19 },
  { asset: "DOT", value: 3790.00, pct: 13.0, change: 4.84 },
  { asset: "AVAX", value: 2734.40, pct: 9.4, change: -3.50 },
  { asset: "MATIC", value: 2601.00, pct: 8.9, change: -2.80 },
];