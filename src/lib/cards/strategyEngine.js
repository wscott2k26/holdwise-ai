import { recommendHoldExact } from "./exactStrategyEngine.js";
export function recommendHold(cards,payTable){return recommendHoldExact(cards,payTable,{credits:5});}
export function compareDecision(userMask,recommended){const correct=userMask.every((v,i)=>v===recommended.holdMask[i]);return{correct,category:recommended.category,reason:recommended.reason,userMask,recommendedMask:recommended.holdMask,source:recommended.source,strategyVersion:recommended.strategyVersion};}
