import UIKit
import WebKit

final class HoldWiseWebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private var webView: WKWebView!
    private var storeKitBridge: HoldWiseStoreKitBridge!
    private let refreshControl = UIRefreshControl()

    override func loadView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.websiteDataStore = .default()

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

    override func viewDidLoad() {
        super.viewDidLoad()
        loadBundledApp()
    }

    @objc private func refresh() {
        webView.reload()
    }

    private func loadBundledApp() {
        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            showMissingBundlePage()
            return
        }
        let directoryURL = indexURL.deletingLastPathComponent()
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

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        refreshControl.endRefreshing()
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
