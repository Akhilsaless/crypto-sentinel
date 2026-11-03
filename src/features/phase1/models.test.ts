import { describe, it, expect } from "vitest";
import { alertSchema, journalSchema, calculateRiskReward } from "./models";
describe('safe local rules',()=>{
 it('accepts positive thresholds and rejects zero',()=>{expect(alertSchema.safeParse({id:'1',symbol:'btc/usdt',direction:'above',threshold:100,enabled:true}).success).toBe(true);expect(alertSchema.safeParse({id:'1',symbol:'BTC',direction:'above',threshold:0,enabled:true}).success).toBe(false);});
 it('requires manual notes and a valid date',()=>{const entry={id:'1',symbol:'BTC',date:'2026-02-30',category:'Plan',notes:'Review'};expect(journalSchema.safeParse(entry).success).toBe(false);expect(journalSchema.safeParse({...entry,date:'2026-11-03',notes:''}).success).toBe(false);expect(journalSchema.safeParse({...entry,date:'2026-11-03'}).success).toBe(true);});
 it('calculates long risk/reward',()=>{expect(calculateRiskReward('long',100,90,120)).toEqual({risk:10,reward:20,ratio:2,riskPct:10,rewardPct:20});});
 it('calculates short risk/reward',()=>{expect(calculateRiskReward('short',100,110,80)).toEqual({risk:10,reward:20,ratio:2,riskPct:10,rewardPct:20});});
 it('rejects long stops or targets on the wrong side',()=>{expect(calculateRiskReward('long',100,110,120).error).toBeDefined();expect(calculateRiskReward('long',100,90,80).error).toBeDefined();});
 it('rejects short stops or targets on the wrong side',()=>{expect(calculateRiskReward('short',100,90,80).error).toBeDefined();expect(calculateRiskReward('short',100,110,120).error).toBeDefined();});
 it('rejects zero, equal entry/stop and nonfinite prices',()=>{expect(calculateRiskReward('long',0,1,2).error).toBeDefined();expect(calculateRiskReward('long',100,100,120).error).toBeDefined();expect(calculateRiskReward('long',100,90,Infinity).error).toBeDefined();});
});