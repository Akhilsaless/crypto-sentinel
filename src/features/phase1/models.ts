import { z } from "zod";

export const symbolSchema = z.string().trim().min(1, "Symbol is required").max(30).regex(/^[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)?$/, "Use a symbol such as BTC/USDT").transform(v => v.toUpperCase());
export const alertSchema = z.object({ id: z.string(), symbol: symbolSchema, direction: z.enum(["above", "below"]), threshold: z.number().finite().positive("Threshold must be greater than zero"), enabled: z.boolean() });
export type AlertRule = z.infer<typeof alertSchema>;
export const journalSchema = z.object({ id: z.string(), symbol: symbolSchema, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v; }, "Use a valid date"), category: z.enum(["Plan", "Reflection", "Observation"]), notes: z.string().trim().min(1, "Notes are required").max(4000, "Notes must be 4,000 characters or fewer") });
export type JournalEntry = z.infer<typeof journalSchema>;
export function calculateRiskReward(side: "long" | "short", entry: number, stop: number, target: number) {
  if (![entry, stop, target].every(n => Number.isFinite(n) && n > 0)) return { error: "Entry, stop and target must be positive finite numbers." };
  if (side === "long" && !(stop < entry && target > entry)) return { error: "Long: stop must be below entry and target above entry." };
  if (side === "short" && !(stop > entry && target < entry)) return { error: "Short: stop must be above entry and target below entry." };
  const risk = Math.abs(entry - stop), reward = Math.abs(target - entry);
  const ratio = reward / risk;
  if (![risk, reward, ratio].every(Number.isFinite)) return { error: "Values are too large to calculate safely." };
  return { risk, reward, ratio, riskPct: risk / entry * 100, rewardPct: reward / entry * 100 };
}