import Foundation
import StoreKit
import WebKit

@available(iOS 15.0, *)
final class HoldWiseStoreKitBridge: NSObject, WKScriptMessageHandler {
    static let handlerName = "holdwiseStoreKit"

    private weak var webView: WKWebView?
    private let productIDs: Set<String> = [
        "holdwise.premium.monthly",
        "holdwise.premium.yearly",
        "holdwise.premium.lifetime"
    ]
    private var products: [String: Product] = [:]
    private var updateTask: Task<Void, Never>?

    init(webView: WKWebView) {
        self.webView = webView
        super.init()
        webView.configuration.userContentController.add(self, name: Self.handlerName)
        updateTask = listenForTransactions()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: .holdWiseDidBecomeActive,
            object: nil
        )
    }

    deinit {
        updateTask?.cancel()
        NotificationCenter.default.removeObserver(self)
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: Self.handlerName)
    }

    @objc private func appDidBecomeActive() {
        Task { [weak self] in
            guard let self else { return }
            let status = await self.entitlementStatus()
            await MainActor.run { self.dispatchPurchaseUpdate(status) }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == Self.handlerName,
              let body = message.body as? [String: Any],
              let requestID = body["id"] as? String,
              let action = body["action"] as? String else { return }
        let payload = body["payload"] as? [String: Any] ?? [:]

        Task { @MainActor in
            do {
                let response: [String: Any]
                switch action {
                case "getProducts":
                    response = try await getProducts()
                case "purchaseProduct":
                    response = try await purchase(productID: payload["productId"] as? String)
                case "restorePurchases":
                    response = try await restorePurchases()
                case "getEntitlementStatus", "syncEntitlements":
                    response = await entitlementStatus()
                case "manageSubscriptions":
                    response = openSubscriptionManagement()
                default:
                    response = ["ok": false, "code": "unknown-action", "message": "Unknown store action."]
                }
                resolve(requestID, response)
            } catch {
                resolve(requestID, ["ok": false, "code": "store-error", "message": error.localizedDescription])
            }
        }
    }

    @MainActor
    private func loadProducts() async throws {
        if products.count == productIDs.count { return }
        let fetched = try await Product.products(for: productIDs)
        products = Dictionary(uniqueKeysWithValues: fetched.map { ($0.id, $0) })
    }

    @MainActor
    private func getProducts() async throws -> [String: Any] {
        try await loadProducts()
        let list: [[String: Any]] = products.values.sorted { $0.id < $1.id }.map { product in
            [
                "id": product.id,
                "displayName": product.displayName,
                "description": product.description,
                "displayPrice": product.displayPrice,
                "type": product.type.nativeLabel
            ]
        }
        return ["ok": true, "platform": "apple", "products": list]
    }

    @MainActor
    private func purchase(productID: String?) async throws -> [String: Any] {
        guard let productID, productIDs.contains(productID) else {
            return ["ok": false, "code": "unknown-product", "message": "That Premium product is unavailable."]
        }
        try await loadProducts()
        guard let product = products[productID] else {
            return ["ok": false, "code": "product-unavailable", "message": "That Premium product is unavailable in this storefront."]
        }

        switch try await product.purchase() {
        case .success(let verification):
            let transaction = try verified(verification)
            await transaction.finish()
            return transactionPayload(transaction, ok: true)
        case .pending:
            return ["ok": false, "code": "pending", "message": "Your purchase is awaiting approval."]
        case .userCancelled:
            return ["ok": false, "code": "cancelled", "message": "Purchase cancelled."]
        @unknown default:
            return ["ok": false, "code": "unknown-result", "message": "The App Store returned an unknown result."]
        }
    }

    @MainActor
    private func restorePurchases() async throws -> [String: Any] {
        try await AppStore.sync()
        var status = await entitlementStatus()
        status["restored"] = status["active"] as? Bool ?? false
        return status
    }

    private func entitlementStatus() async -> [String: Any] {
        var newest: Transaction?
        let now = Date()
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  productIDs.contains(transaction.productID),
                  transaction.revocationDate == nil else { continue }
            if let expiration = transaction.expirationDate, expiration <= now { continue }
            if newest == nil || transaction.purchaseDate > newest!.purchaseDate {
                newest = transaction
            }
        }

        guard let transaction = newest else {
            return ["ok": true, "active": false, "status": "free", "platform": "apple", "verified": true]
        }
        return transactionPayload(transaction, ok: true)
    }

    private func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let value): return value
        case .unverified(_, let error): throw error
        }
    }

    private func transactionPayload(_ transaction: Transaction, ok: Bool) -> [String: Any] {
        let lifetime = transaction.productID == "holdwise.premium.lifetime"
        let formatter = ISO8601DateFormatter()
        let active = transaction.revocationDate == nil && (transaction.expirationDate == nil || transaction.expirationDate! > Date())
        var payload: [String: Any] = [
            "ok": ok,
            "active": active,
            "status": active ? (lifetime ? "lifetime" : "active") : "free",
            "entitlementType": lifetime ? "lifetime" : "subscription",
            "platform": "apple",
            "productId": transaction.productID,
            "verified": true,
            "originalTransactionId": String(transaction.originalID)
        ]
        if let expiration = transaction.expirationDate { payload["expirationDate"] = formatter.string(from: expiration) }
        if let revocation = transaction.revocationDate { payload["revocationDate"] = formatter.string(from: revocation) }
        return payload
    }

    private func listenForTransactions() -> Task<Void, Never> {
        Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                guard case .verified(let transaction) = update,
                      self.productIDs.contains(transaction.productID) else { continue }
                await transaction.finish()
                let payload = self.transactionPayload(transaction, ok: true)
                await MainActor.run { self.dispatchPurchaseUpdate(payload) }
            }
        }
    }

    @MainActor
    private func openSubscriptionManagement() -> [String: Any] {
        guard let url = URL(string: "https://apps.apple.com/account/subscriptions") else {
            return ["ok": false, "message": "Subscription management is unavailable."]
        }
        UIApplication.shared.open(url)
        return ["ok": true, "opened": true]
    }

    @MainActor
    private func resolve(_ requestID: String, _ payload: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8),
              let idData = try? JSONSerialization.data(withJSONObject: requestID, options: .fragmentsAllowed),
              let idJSON = String(data: idData, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.__holdwiseStoreKitResolve(\(idJSON), \(json));")
    }

    @MainActor
    private func dispatchPurchaseUpdate(_ payload: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('holdwise:purchase-update',{detail:\(json)}));")
    }
}

@available(iOS 15.0, *)
private extension Product.ProductType {
    var nativeLabel: String {
        switch self {
        case .autoRenewable: return "subscription"
        case .nonConsumable: return "lifetime"
        case .consumable: return "consumable"
        case .nonRenewable: return "non-renewing"
        default: return "unknown"
        }
    }
}
