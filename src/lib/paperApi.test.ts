import { afterEach, describe, expect, it, vi } from "vitest";
import { paperRequest, PaperApiError } from "./paperApi";

afterEach(() => vi.unstubAllGlobals());
describe("paper-only API client", () => {
  it("uses the same-origin development proxy and bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ok:true,json:async()=>({mode:"paper_only"})});
    vi.stubGlobal("fetch",fetchMock);
    expect(await paperRequest("/paper/account","test-token")).toEqual({mode:"paper_only"});
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/paper-api/paper/account");
    expect(options.headers.Authorization).toBe("Bearer test-token");
    expect(options.cache).toBe("no-store");
  });
  it("rejects stale server failures, including non-JSON gateway outages", async () => {
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:false,status:503,json:async()=>{throw new Error("HTML response");}}));
    await expect(paperRequest("/market/BTC","token")).rejects.toBeInstanceOf(PaperApiError);
  });
  it("does not send credentials without an explicit bearer token", async () => {
    const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({status:"ok"})});
    vi.stubGlobal("fetch",fetchMock);
    await paperRequest("/health");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});
