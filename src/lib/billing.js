// Verified billing abstraction for the HoldWise mobile wrappers.
// Normal web users can never grant themselves an entitlement. Installed iOS
// builds use the StoreKit 2 bridge in native/ios; Android wrappers may provide
// the same interface through window.HoldWisePlayBilling.

import React from "react";
import { useApp } from "./appContext";
import { invokeNativeStore, nativeStoreAvailable, nativeStorePlatform } from "./nativeBillingBridge";

export const PRODUCT_IDS = {
  monthly: "holdwise.premium.monthly",
  yearly: "holdwise.premium.yearly",
  lifetime: "holdwise.premium.lifetime",
};

const PRODUCTS = [
  { id: PRODUCT_IDS.monthly, name: "HoldWise Premium Monthly", price: "$7.99", period: "month", entitlementType: "monthly" },
  { id: PRODUCT_IDS.yearly, name: "HoldWise Premium Yearly", price: "$39.99", period: "year", entitlementType: "yearly", bestValue: true },
  { id: PRODUCT_IDS.lifetime, name: "HoldWise Premium Lifetime", price: "$79.99", period: "lifetime", entitlementType: "lifetime" },
];

function normalizeEntitlement(result = {}) {
  const active = Boolean(result.active || result.status === "active" || result.status === "lifetime");
  const lifetime = result.entitlementType === "lifetime" || result.status === "lifetime" || result.productId === PRODUCT_IDS.lifetime;
  return {
    status: active ? (lifetime ? "lifetime" : "active") : "free",
    platform: result.platform || nativeStorePlatform(),
    productId: result.productId || null,
    verified: Boolean(result.verified),
    expirationDate: result.expirationDate || null,
    originalTransactionId: result.originalTransactionId || null,
  };
}

export const BillingService = {
  fallbackProducts() {
    return PRODUCTS.map((product) => ({ ...product, storeAvailable: nativeStoreAvailable() }));
  },

  async getProducts() {
    if (!nativeStoreAvailable()) return this.fallbackProducts();
    try {
      const result = await invokeNativeStore("getProducts", { productIds: PRODUCTS.map((item) => item.id) });
      const storeProducts = Array.isArray(result?.products) ? result.products : [];
      return PRODUCTS.map((product) => {
        const live = storeProducts.find((item) => item.id === product.id || item.productId === product.id);
        return { ...product, price: live?.displayPrice || live?.price || product.price, displayName: live?.displayName || product.name, storeAvailable: true };
      });
    } catch {
      return this.fallbackProducts();
    }
  },

  async purchaseProduct(productId, { asAdmin = false } = {}) {
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) throw new Error("Unknown product");

    if (nativeStoreAvailable()) {
      const result = await invokeNativeStore("purchaseProduct", { productId });
      return { ...result, ...normalizeEntitlement(result), ok: Boolean(result?.ok ?? result?.active), entitlementType: result?.entitlementType || product.entitlementType };
    }

    if (asAdmin) {
      return { ok: true, verified: false, simulated: true, entitlementType: product.entitlementType, productId, adminBypass: true, platform: "dev-mock", note: "Administrator test entitlement enabled on this device." };
    }

    return { ok: false, code: "installed-app-required", productId, note: "Open HoldWise from its installed App Store or Google Play app to purchase Premium." };
  },

  async restorePurchases() {
    if (!nativeStoreAvailable()) return { restored: false, code: "installed-app-required", note: "Open the installed HoldWise mobile app to restore purchases." };
    const result = await invokeNativeStore("restorePurchases");
    return { ...result, ...normalizeEntitlement(result), restored: Boolean(result?.restored || result?.active) };
  },

  async getEntitlementStatus() {
    if (!nativeStoreAvailable()) return { status: "free", platform: null, verified: false };
    const result = await invokeNativeStore("getEntitlementStatus");
    return normalizeEntitlement(result);
  },

  async syncEntitlements() {
    const entitlement = await this.getEntitlementStatus();
    return { synced: true, ...entitlement };
  },

  handlePurchaseUpdate(callback) {
    if (typeof callback !== "function" || typeof window === "undefined") return () => {};
    const handler = (event) => callback(normalizeEntitlement(event.detail || {}));
    window.addEventListener("holdwise:purchase-update", handler);
    return () => window.removeEventListener("holdwise:purchase-update", handler);
  },

  handleRefundOrExpiration(result = {}) {
    return normalizeEntitlement(result);
  },
};

export function useEntitlement() {
  const { premium, setPremium, user } = useApp();
  const isAdmin = user?.role === "admin";
  const isPremium = premium.status === "active" || premium.status === "lifetime";

  React.useEffect(() => {
    let active = true;
    BillingService.getEntitlementStatus().then((status) => {
      if (active && status.verified && status.status !== "free") setPremium(status);
    }).catch(() => {});
    const unsubscribe = BillingService.handlePurchaseUpdate((status) => { if (active) setPremium(status); });
    return () => { active = false; unsubscribe?.(); };
  }, [setPremium]);

  return {
    isPremium,
    premium,
    isAdmin,
    storePlatform: nativeStorePlatform(),
    storeAvailable: nativeStoreAvailable(),
    devUnlock: (type = "lifetime") => {
      if (!isAdmin) throw new Error("Administrator access required");
      setPremium({ status: type === "lifetime" ? "lifetime" : "active", platform: "dev-mock", productId: "dev.mock", verified: false });
    },
    revoke: () => setPremium({ status: "free", platform: null, productId: null, verified: false }),
    purchase: async (productId) => {
      const result = await BillingService.purchaseProduct(productId, { asAdmin: isAdmin });
      if (result.ok && (result.verified || (result.adminBypass && isAdmin))) {
        setPremium({ status: result.status || (result.entitlementType === "lifetime" ? "lifetime" : "active"), platform: result.platform || "dev-mock", productId, verified: Boolean(result.verified), expirationDate: result.expirationDate || null, originalTransactionId: result.originalTransactionId || null });
      }
      return result;
    },
    restore: async () => {
      const result = await BillingService.restorePurchases();
      if (result.restored && result.verified) setPremium(result);
      return result;
    },
  };
}
