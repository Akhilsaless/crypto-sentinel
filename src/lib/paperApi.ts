/** Same-origin local-development API only. No live order execution. */
export const API_ROOT = "/paper-api";
export class PaperApiError extends Error { constructor(message: string, public status: number) { super(message); this.name = "PaperApiError"; } }
export type PaperAccount = { mode: "paper_only"; cash_usd: string; killed: boolean; positions: { symbol: string; quantity: string; cost_basis_usd: string }[]; warning: string };
export type PaperTrade = { id: string; side: string; symbol: string; quantity: string; price_usd: string; timestamp: string };
export async function paperRequest<T>(path: string, token?: string, method = "GET", payload?: unknown): Promise<T> {
  const result = await fetch(API_ROOT + path, {
    method, headers: { ...(payload ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    cache: "no-store",
  });
  let body: Record<string, unknown> = {};
  try { body = await result.json() as Record<string, unknown>; } catch { /* An HTML proxy error must not be mistaken for JSON. */ }
  if (!result.ok) {
    const detail = typeof body.detail === "string" ? body.detail : "Paper API unavailable or rejected the request";
    throw new PaperApiError(detail, result.status);
  }
  return body as T;
}
