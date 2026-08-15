import UIKit
import WebKit

final class HoldWiseWebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var storeKitBridge: HoldWiseStoreKitBridge!
    private let refreshControl = UIRefreshControl()
    private let hapticHandlerName = "holdwiseHaptics"
    private let bootHandlerName = "holdwiseBoot"

    override func loadView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(self, name: hapticHandlerName)
        configuration.userContentController.add(self, name: bootHandlerName)

        let nativeScript = """
        window.HoldWiseNative = Object.freeze({
          platform: 'ios',
          version: '\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0")',
          build: '\(Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1")'
        });
        document.documentElement.classList.add('holdwise-native-ios');
        """
        configuration.userContentController.addUserScript(
            WKUserScript(source: nativeScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        )

        let diagnosticsScript = """
        window.addEventListener('error', function(event) {
          window.webkit?.messageHandlers?.holdwiseBoot?.postMessage({
            type: 'error',
            message: String(event?.message || 'Unknown JavaScript error').slice(0, 500)
          });
        });
        window.addEventListener('unhandledrejection', function(event) {
          window.webkit?.messageHandlers?.holdwiseBoot?.postMessage({
            type: 'error',
            message: String(event?.reason?.message || event?.reason || 'Unhandled promise rejection').slice(0, 500)
          });
        });
        """
        configuration.userContentController.addUserScript(
            WKUserScript(source: diagnosticsScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        )

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.keyboardDismissMode = .interactive
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.035, green: 0.075, blue: 0.12, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor

        if #available(iOS 16.4, *) {
            #if DEBUG
            webView.isInspectable = true
            #endif
        }

        refreshControl.addTarget(self, action: #selector(refresh), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl

        storeKitBridge = HoldWiseStoreKitBridge(webView: webView)
        view = webView
    }

    deinit {
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: hapticHandlerName)
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: bootHandlerName)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadBundledApp()
    }

    @objc private func refresh() {
        webView.reload()
    }

    private func runtimeLog(_ message: String) {
        NSLog("%@", message)
    }

    private func loadBundledApp() {
        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            runtimeLog("HOLDWISE_NAV_ERROR:missing bundled www/index.html")
            showMissingBundlePage()
            return
        }
        let directoryURL = indexURL.deletingLastPathComponent()
        runtimeLog("HOLDWISE_LOAD_URL:\(indexURL.path)")
        webView.loadFileURL(indexURL, allowingReadAccessTo: directoryURL)
    }

    private func showMissingBundlePage() {
        let html = """
        <!doctype html><meta name='viewport' content='width=device-width,initial-scale=1'>
        <style>body{font-family:-apple-system;background:#07131f;color:#fff;padding:48px 24px}h1{color:#e4bf64}code{background:#132537;padding:2px 6px;border-radius:6px}</style>
        <h1>HoldWise AI needs its web bundle</h1>
        <p>Run <code>npm run ios:prepare</code> from the project root, then rebuild the iOS target.</p>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }

    private func probeDOM(after delay: TimeInterval, label: String) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
            guard let self else { return }
            let script = """
            JSON.stringify({
              readyState: document.readyState,
              href: String(window.location.href || ''),
              rootExists: Boolean(document.getElementById('root')),
              rootChildren: document.getElementById('root')?.childElementCount ?? -1,
              rootHTMLLength: document.getElementById('root')?.innerHTML?.length ?? -1,
              rootText: String(document.getElementById('root')?.innerText || '').slice(0, 160),
              bodyText: String(document.body?.innerText || '').slice(0, 160),
              scripts: Array.from(document.scripts || []).map(s => s.src || '[inline]').slice(0, 12),
              stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href).slice(0, 12)
            })
            """
            self.webView.evaluateJavaScript(script) { [weak self] result, error in
                guard let self else { return }
                if let error {
                    self.runtimeLog("HOLDWISE_DOM_STATE:\(label):probe-error:\(error.localizedDescription)")
                    return
                }
                self.runtimeLog("HOLDWISE_DOM_STATE:\(label):\(String(describing: result ?? "nil"))")
            }
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
        runtimeLog("HOLDWISE_NAV_FINISHED")
        probeDOM(after: 0.5, label: "t+0.5")
        probeDOM(after: 5.0, label: "t+5")
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
        runtimeLog("HOLDWISE_NAV_ERROR:\(error.localizedDescription)")
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
        runtimeLog("HOLDWISE_NAV_ERROR:\(error.localizedDescription)")
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        runtimeLog("HOLDWISE_WEB_ERROR:web content process terminated")
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        if ["mailto", "tel", "sms"].contains(url.scheme?.lowercased() ?? "") {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }

        if navigationAction.navigationType == .linkActivated,
           let scheme = url.scheme?.lowercased(),
           !["file", "https", "http", "about"].contains(scheme) {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == bootHandlerName {
            guard let payload = message.body as? [String: Any],
                  let type = payload["type"] as? String else { return }
            if type == "error" {
                let detail = (payload["message"] as? String ?? "Unknown JavaScript startup error")
                    .replacingOccurrences(of: "\n", with: " ")
                    .prefix(500)
                runtimeLog("HOLDWISE_WEB_ERROR:\(detail)")
            }
            return
        }

        guard message.name == hapticHandlerName, let type = message.body as? String else { return }
        switch type {
        case "success":
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        case "warning":
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        default:
            UISelectionFeedbackGenerator().selectionChanged()
        }
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
            webView.load(URLRequest(url: url))
        }
        return nil
    }
}
