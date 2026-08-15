const REQUEST_TIMEOUT_MS = 45000;
let requestCounter = 0;
const pending = new Map();

function inBrowser() {
  return typeof window !== "undefined";
}

function installResolver() {
  if (!inBrowser() || window.__holdwiseStoreKitResolve) return;
  window.__holdwiseStoreKitResolve = (requestId, payload) => {
    const waiter = pending.get(requestId);
    if (!waiter) return;
    pending.delete(requestId);
    window.clearTimeout(waiter.timeoutId);
    const result = typeof payload === "string" ? safeParse(payload) : payload;
    if (result?.ok === false) waiter.reject(new Error(result.message || result.code || "Store request failed"));
    else waiter.resolve(result || { ok: true });
  };
}

function safeParse(value) {
  try { return JSON.parse(value); } catch { return { ok: false, message: String(value) }; }
}

function invokeObjectBridge(bridge, action, payload) {
  const method = bridge?.[action];
  if (typeof method !== "function") return null;
  return Promise.resolve(method.call(bridge, payload));
}

function invokeMessageHandler(action, payload) {
  if (!inBrowser()) return null;
  const handler = window.webkit?.messageHandlers?.holdwiseStoreKit;
  if (!handler?.postMessage) return null;
  installResolver();
  const id = `hw-store-${Date.now()}-${++requestCounter}`;
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      pending.delete(id);
      reject(new Error("The App Store did not answer in time."));
    }, REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timeoutId });
    handler.postMessage({ id, action, payload: payload || {} });
  });
}

export function nativeStorePlatform() {
  if (!inBrowser()) return null;
  if (window.HoldWiseStoreKit || window.webkit?.messageHandlers?.holdwiseStoreKit) return "apple";
  if (window.HoldWisePlayBilling) return "google";
  return null;
}

export function nativeStoreAvailable() {
  return Boolean(nativeStorePlatform());
}

export async function invokeNativeStore(action, payload = {}) {
  if (!inBrowser()) throw new Error("Store purchases require the installed mobile app.");

  const directApple = invokeObjectBridge(window.HoldWiseStoreKit, action, payload);
  if (directApple) return directApple;

  const appleMessage = invokeMessageHandler(action, payload);
  if (appleMessage) return appleMessage;

  const google = invokeObjectBridge(window.HoldWisePlayBilling, action, payload);
  if (google) return google;

  throw new Error("Store purchases are available in the installed HoldWise mobile app.");
}
