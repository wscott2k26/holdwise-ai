import UIKit
import WebKit

final class HoldWiseWebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var storeKitBridge: HoldWiseStoreKitBridge!
    private let refreshControl = UIRefreshControl()
    private let bootView = StormAndMeBootView()
    private let hapticHandlerName = "holdwiseHaptics"
    private let bootHandlerName = "holdwiseBoot"
    private let readyMarkerName = "holdwise-boot-ready"
    private let errorMarkerName = "holdwise-boot-error.txt"
    private let minimumIntroDuration: TimeInterval = 1.5
    private var bootExperienceStartedAt: TimeInterval = 0
    private var bootTimeoutWorkItem: DispatchWorkItem?
    private var bootDismissWorkItem: DispatchWorkItem?

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

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.translatesAutoresizingMaskIntoConstraints = false
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

        let rootView = UIView()
        rootView.backgroundColor = webView.backgroundColor
        rootView.addSubview(webView)
        rootView.addSubview(bootView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: rootView.topAnchor),
            webView.leadingAnchor.constraint(equalTo: rootView.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: rootView.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: rootView.bottomAnchor),
            bootView.topAnchor.constraint(equalTo: rootView.topAnchor),
            bootView.leadingAnchor.constraint(equalTo: rootView.leadingAnchor),
            bootView.trailingAnchor.constraint(equalTo: rootView.trailingAnchor),
            bootView.bottomAnchor.constraint(equalTo: rootView.bottomAnchor),
        ])
        view = rootView
    }

    deinit {
        bootTimeoutWorkItem?.cancel()
        bootDismissWorkItem?.cancel()
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: hapticHandlerName)
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: bootHandlerName)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        startBootExperience()
        loadBundledApp()
    }

    @objc private func refresh() {
        retryBoot()
    }

    private func markerURL(named name: String) -> URL? {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first?.appendingPathComponent(name)
    }

    private func clearBootMarkers() {
        let fileManager = FileManager.default
        for name in [readyMarkerName, errorMarkerName] {
            if let url = markerURL(named: name) {
                try? fileManager.removeItem(at: url)
            }
        }
    }

    private func writeBootReadyMarker() {
        guard let url = markerURL(named: readyMarkerName) else { return }
        try? "ready".write(to: url, atomically: true, encoding: .utf8)
    }

    private func writeBootErrorMarker(_ message: String) {
        guard let url = markerURL(named: errorMarkerName) else { return }
        try? message.write(to: url, atomically: true, encoding: .utf8)
    }

    private func beginBrandedBoot() {
        bootDismissWorkItem?.cancel()
        bootExperienceStartedAt = ProcessInfo.processInfo.systemUptime
        bootView.showLoading(productName: "HoldWise AI")
    }

    private func startBootExperience() {
        clearBootMarkers()
        beginBrandedBoot()
        scheduleBootTimeout()
    }

    private func scheduleBootTimeout() {
        bootTimeoutWorkItem?.cancel()
        let item = DispatchWorkItem { [weak self] in
            self?.showBootFailure(
                message: "HoldWise AI took too long to start.",
                details: "The app shell loaded, but the trainer did not report ready."
            )
        }
        bootTimeoutWorkItem = item
        DispatchQueue.main.asyncAfter(deadline: .now() + 15, execute: item)
    }

    private func dismissBootAfterMinimumDuration() {
        bootDismissWorkItem?.cancel()
        let elapsed = max(0, ProcessInfo.processInfo.systemUptime - bootExperienceStartedAt)
        let remaining = max(0, minimumIntroDuration - elapsed)
        let item = DispatchWorkItem { [weak self] in
            self?.bootView.dismissReady()
        }
        bootDismissWorkItem = item
        DispatchQueue.main.asyncAfter(deadline: .now() + remaining, execute: item)
    }

    private func retryBoot() {
        refreshControl.endRefreshing()
        clearBootMarkers()
        beginBrandedBoot()
        scheduleBootTimeout()
        loadBundledApp()
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
        showBootFailure(
            message: "HoldWise AI could not find its bundled game files.",
            details: "www/index.html is missing from this build."
        )
    }

    private func showBootFailure(message: String, details: String?) {
        bootTimeoutWorkItem?.cancel()
        bootDismissWorkItem?.cancel()
        refreshControl.endRefreshing()
        let diagnostic = [message, details].compactMap { $0 }.joined(separator: "\n")
        writeBootErrorMarker(diagnostic)
        bootView.showFailure(message: message, details: details) { [weak self] in
            self?.retryBoot()
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showBootFailure(message: "HoldWise AI could not finish loading.", details: error.localizedDescription)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showBootFailure(message: "HoldWise AI could not start loading.", details: error.localizedDescription)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        showBootFailure(message: "HoldWise AI's web process stopped unexpectedly.", details: "Tap Retry to restart the trainer.")
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
            guard let payload = message.body as? [String: Any], let type = payload["type"] as? String else { return }
            switch type {
            case "ready":
                bootTimeoutWorkItem?.cancel()
                writeBootReadyMarker()
                print("HOLDWISE_BOOT_READY")
                dismissBootAfterMinimumDuration()
            case "error":
                let name = payload["name"] as? String ?? "Error"
                let detail = payload["message"] as? String ?? "Unknown startup error"
                let diagnostic = "\(name): \(detail)"
                writeBootErrorMarker(diagnostic)
                print("HOLDWISE_BOOT_ERROR \(diagnostic)")
                showBootFailure(message: "HoldWise AI hit a startup error.", details: diagnostic)
            default:
                break
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
