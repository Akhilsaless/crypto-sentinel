"""Deterministic educational backtest. Input prices are supplied by the caller.

Not a price-data provider, financial adviser, or evidence of expected returns.
The simple moving-average signal is evaluated at a completed bar and filled at
the next bar's open to avoid same-close lookahead. Only unlevered long/cash.
"""
from decimal import Decimal
from pydantic import BaseModel, Field, model_validator

class Candle(BaseModel):
    timestamp: int
    open: float = Field(gt=0, allow_inf_nan=False)
    close: float = Field(gt=0, allow_inf_nan=False)

class BacktestRequest(BaseModel):
    candles: list[Candle] = Field(min_length=35, max_length=5000)
    fast_window: int = Field(ge=2, le=100, default=5)
    slow_window: int = Field(ge=3, le=200, default=20)
    fee_bps: int = Field(ge=0, le=500, default=10)
    slippage_bps: int = Field(ge=0, le=500, default=10)
    initial_cash: float = Field(ge=100, le=1000000, default=10000, allow_inf_nan=False)

    @model_validator(mode="after")
    def check(self):
        if self.fast_window >= self.slow_window:
            raise ValueError("fast_window must be smaller than slow_window")
        if self.slow_window + 2 > len(self.candles):
            raise ValueError("At least slow_window + 2 candles required")
        ts = [c.timestamp for c in self.candles]
        if any(b <= a for a, b in zip(ts, ts[1:])):
            raise ValueError("Timestamps must be strictly increasing and nonduplicated")
        return self

def run_backtest(req: BacktestRequest) -> dict:
    closes = [Decimal(str(c.close)) for c in req.candles]
    opens = [Decimal(str(c.open)) for c in req.candles]
    fee = Decimal(req.fee_bps) / 10000
    slippage = Decimal(req.slippage_bps) / 10000
    cash = Decimal(str(req.initial_cash))
    qty = Decimal(0)
    trades = []
    curve = []
    equity_peak = cash
    worst_drawdown = Decimal(0)
    total_fee = Decimal(0)
    for i, candle in enumerate(req.candles):
        # Signal from completed candle i-1 fills at candle i open.
        if i >= req.slow_window + 1:
            j = i - 1
            fast = sum(closes[j-req.fast_window+1:j+1]) / req.fast_window
            slow = sum(closes[j-req.slow_window+1:j+1]) / req.slow_window
            long_signal = fast > slow
            if long_signal and qty == 0 and cash > 0:
                fill = opens[i] * (1 + slippage)
                spent = cash
                total_fee += spent * fee
                qty = spent * (1-fee) / fill
                cash = Decimal(0)
                trades.append({"action":"buy","timestamp":candle.timestamp,"price":str(round(fill,6))})
            elif not long_signal and qty > 0:
                fill = opens[i] * (1 - slippage)
                received = qty * fill
                total_fee += received * fee
                cash = received * (1-fee)
                qty = Decimal(0)
                trades.append({"action":"sell","timestamp":candle.timestamp,"price":str(round(fill,6))})
        equity = cash + qty * closes[i]
        equity_peak = max(equity_peak, equity)
        worst_drawdown = max(worst_drawdown, (equity_peak-equity) / equity_peak)
        curve.append({"timestamp":candle.timestamp,"equity":round(float(equity),2)})
    ending = cash + qty * closes[-1]
    return {"mode":"historical_simulation_only",
            "assumptions":{"signal":"SMA trend, next candle open fill",
                           "fee_bps":req.fee_bps,"slippage_bps":req.slippage_bps,
                           "caveat":"No liquidity, partial fills, taxes, funding or future performance guarantee."},
            "initial_cash":round(float(req.initial_cash),2),
            "ending_equity":round(float(ending),2),
            "total_return_pct":round(float((ending/Decimal(str(req.initial_cash))-1)*100),3),
            "max_drawdown_pct":round(float(worst_drawdown*100),3),
            "fees_paid":round(float(total_fee),2),"trades":trades,"equity_curve":curve,
            "position_open_at_end":qty>0}
