"""Conservative, long-only chronological holdout evaluation.

Research ONLY. Each decision uses only fully closed prior bars and trades
the next bar open. Stop takes priority when stop/target are both touched.
No leverage, shorting, live orders, or optimization on the holdout interval.
"""
from __future__ import annotations
import math
from dataclasses import dataclass
from sentinel.scanner import Bar, FRAMES, MIN_BARS, MarketDataError, analyze, validate_bars

@dataclass
class Position:
    qty: float
    entry_cost: float
    stop: float
    target: float

def evaluate(bars: list[Bar], frame: str, fee_bps: int = 15,
             slippage_bps: int = 15, now: float | None = None) -> dict:
    if frame not in FRAMES:
        raise MarketDataError("Unsupported timeframe")
    if not 0 <= fee_bps <= 200 or not 0 <= slippage_bps <= 200:
        raise MarketDataError("Invalid fee/slippage assumptions")
    if len(bars) < 200 or len(bars) > 720:
        raise MarketDataError("At least 200 and at most 720 candles required")
    validate_bars(bars, FRAMES[frame], now)
    if any(b.open is None for b in bars):
        raise MarketDataError("Open prices required for next-bar fills")
    holdout = int(len(bars) * 0.7)
    cash = 10_000.0
    held: Position | None = None
    peak = cash
    maximum_drawdown = 0.0
    fees_paid = 0.0
    trades = []
    curve = []
    rate = fee_bps / 10_000
    slip = slippage_bps / 10_000
    interval_seconds = FRAMES[frame] * 60

    for index in range(holdout, len(bars)):
        current = bars[index]
        # All market information is from candles completed before current opens.
        completed = bars[max(0, index - 90):index]
        research = analyze("RESEARCH", frame, completed,
                           now=completed[-1].timestamp + interval_seconds)
        signal = research["signal"]
        open_price = float(current.open)
        if held is not None:
            trigger = None
            raw_exit = open_price
            if open_price <= held.stop:
                trigger, raw_exit = "gap_stop", open_price
            elif open_price >= held.target:
                trigger, raw_exit = "gap_target", open_price
            elif current.low <= held.stop:
                trigger, raw_exit = "stop", held.stop
            elif current.high >= held.target:
                trigger, raw_exit = "target", held.target
            elif signal == "exit_watch":
                trigger, raw_exit = "signal_exit", open_price
            if trigger is not None:
                exit_price = raw_exit * (1 - slip)
                gross = held.qty * exit_price
                charge = gross * rate
                cash += gross - charge
                fees_paid += charge
                pnl = gross - charge - held.entry_cost
                trades.append({"side":"sell","timestamp":current.timestamp,
                               "reason":trigger,"pnl_usd":round(pnl,2)})
                held = None
        if held is None and signal == "entry_watch":
            entry_price = open_price * (1 + slip)
            stop = research["hypothetical_long_stop_usd"]
            target = research["hypothetical_long_target_usd"]
            if 0 < stop < entry_price < target:
                # Max 20% portfolio notional, and <=1% equity planned stop risk.
                qty = min(cash * .20 / (entry_price * (1 + rate)),
                          cash * .01 / (entry_price - stop))
                if math.isfinite(qty) and qty > 0:
                    cost = qty * entry_price * (1 + rate)
                    cash -= cost
                    fees_paid += qty * entry_price * rate
                    held = Position(qty,cost,stop,target)
                    trades.append({"side":"buy","timestamp":current.timestamp,
                                   "reason":"completed_bar_entry_watch",
                                   "quantity":round(qty,8)})
        equity = cash + (held.qty * current.close if held else 0)
        peak = max(peak,equity)
        maximum_drawdown = max(maximum_drawdown,(peak-equity)/peak)
        curve.append({"timestamp":current.timestamp,"equity_usd":round(equity,2)})
    ending = curve[-1]["equity_usd"]
    sells = [t for t in trades if t["side"]=="sell"]
    return {
        "mode":"historical_research_only",
        "holdout_start":bars[holdout].timestamp,
        "holdout_bars":len(bars)-holdout,
        "initial_cash_usd":10000.0,
        "ending_equity_usd":ending,
        "return_pct":round((ending/10000-1)*100,3),
        "max_drawdown_pct":round(maximum_drawdown*100,3),
        "fees_paid_usd":round(fees_paid,2),
        "round_trips_closed":len(sells),
        "win_rate_pct":round(100*sum(t["pnl_usd"]>0 for t in sells)/len(sells),2) if sells else None,
        "position_open":held is not None,
        "trades":trades,
        "assumptions":{"fee_bps":fee_bps,"slippage_bps":slippage_bps,
                       "long_only":True,"stop_target_same_bar":"stop_first",
                       "entry":"next_bar_open","position_notional_cap_pct":20,
                       "planned_stop_risk_pct":1},
        "warning":"Historical, unvalidated strategy simulation. No funding, spread, exchange limits, taxes or fill queue; performance does not predict returns.",
    }
