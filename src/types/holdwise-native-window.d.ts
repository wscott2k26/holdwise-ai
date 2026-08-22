export {};

declare global {
  interface Window {
    __holdwiseStoreKitResolve?: (requestId: string, payload: any) => void;
    webkit?: {
      messageHandlers?: {
        holdwiseStoreKit?: { postMessage: (message: any) => void };
      };
    };
    webkitAudioContext?: typeof AudioContext;
    HoldWiseStoreKit?: Record<string, (payload?: any) => any>;
    HoldWisePlayBilling?: Record<string, (payload?: any) => any>;
  }
}
