import { recommendHoldExact } from "../lib/cards/exactStrategyEngine.js";

self.addEventListener("message", (event) => {
  const { requestId, cards, payTable, credits } = event.data || {};
  try {
    const recommendation = recommendHoldExact(cards, payTable, { credits });
    self.postMessage({ requestId, ok: true, recommendation });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: error instanceof Error ? error.message : "Strategy calculation failed",
    });
  }
});
