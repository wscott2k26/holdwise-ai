import UIKit

final class StormAndMeBootView: UIView {
    private let markContainer = UIView()
    private let cloudLayer = CAShapeLayer()
    private let boltLayer = CAShapeLayer()
    private let glowLayer = CAShapeLayer()
    private let companyLabel = UILabel()
    private let productLabel = UILabel()
    private let messageLabel = UILabel()
    private let detailsLabel = UILabel()
    private let retryButton = UIButton(type: .system)
    private var retryAction: (() -> Void)?
    private var pulseWorkItems: [DispatchWorkItem] = []

    override init(frame: CGRect) {
        super.init(frame: frame)
        configureView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        configureView()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        updateMarkPaths()
    }

    func showLoading(productName: String) {
        cancelPulses()
        isHidden = false
        alpha = 1
        retryAction = nil
        retryButton.isHidden = true
        messageLabel.isHidden = true
        detailsLabel.isHidden = true
        companyLabel.text = "STORM AND ME"
        productLabel.text = productName
        productLabel.isHidden = false
        markContainer.alpha = 1
        cloudLayer.opacity = 0.9
        boltLayer.opacity = 1
        glowLayer.opacity = 0.28

        guard !UIAccessibility.isReduceMotionEnabled else {
            layer.removeAllAnimations()
            return
        }

        markContainer.transform = CGAffineTransform(scaleX: 0.985, y: 0.985)
        UIView.animate(withDuration: 0.45, delay: 0, options: [.curveEaseOut, .allowUserInteraction]) {
            self.markContainer.transform = .identity
        }
        scheduleLightningPulse(after: 0.20)
        scheduleLightningPulse(after: 0.62)
    }

    func showFailure(message: String, details: String?, retry: @escaping () -> Void) {
        cancelPulses()
        isHidden = false
        alpha = 1
        retryAction = retry
        companyLabel.text = "STORM AND ME"
        productLabel.text = "HoldWise AI"
        messageLabel.text = message
        detailsLabel.text = details
        messageLabel.isHidden = false
        detailsLabel.isHidden = details?.isEmpty ?? true
        retryButton.isHidden = false
        boltLayer.opacity = 0.72
        glowLayer.opacity = 0.12
    }

    func dismissReady() {
        cancelPulses()
        let animations = {
            self.alpha = 0
        }
        let completion: (Bool) -> Void = { _ in
            self.isHidden = true
            self.alpha = 1
        }

        if UIAccessibility.isReduceMotionEnabled {
            UIView.animate(withDuration: 0.18, animations: animations, completion: completion)
        } else {
            UIView.animate(withDuration: 0.28, delay: 0.05, options: [.curveEaseInOut, .allowUserInteraction], animations: animations, completion: completion)
        }
    }

    @objc private func retryTapped() {
        retryAction?()
    }

    private func configureView() {
        backgroundColor = UIColor(red: 0.018, green: 0.043, blue: 0.067, alpha: 1)
        translatesAutoresizingMaskIntoConstraints = false
        accessibilityViewIsModal = true

        let halo = CAGradientLayer()
        halo.name = "stormandmeHalo"
        halo.colors = [
            UIColor(red: 0.05, green: 0.36, blue: 0.36, alpha: 0.20).cgColor,
            UIColor.clear.cgColor,
        ]
        halo.startPoint = CGPoint(x: 0.5, y: 0.25)
        halo.endPoint = CGPoint(x: 0.5, y: 0.85)
        layer.insertSublayer(halo, at: 0)

        markContainer.translatesAutoresizingMaskIntoConstraints = false
        addSubview(markContainer)
        markContainer.layer.addSublayer(glowLayer)
        markContainer.layer.addSublayer(cloudLayer)
        markContainer.layer.addSublayer(boltLayer)

        glowLayer.fillColor = UIColor.clear.cgColor
        glowLayer.strokeColor = UIColor(red: 0.16, green: 0.78, blue: 0.72, alpha: 0.42).cgColor
        glowLayer.lineWidth = 12
        glowLayer.lineCap = .round
        glowLayer.lineJoin = .round
        glowLayer.shadowColor = UIColor(red: 0.18, green: 0.82, blue: 0.77, alpha: 1).cgColor
        glowLayer.shadowRadius = 18
        glowLayer.shadowOpacity = 0.55
        glowLayer.shadowOffset = .zero

        cloudLayer.fillColor = UIColor.clear.cgColor
        cloudLayer.strokeColor = UIColor(red: 0.73, green: 0.96, blue: 0.94, alpha: 0.94).cgColor
        cloudLayer.lineWidth = 3.2
        cloudLayer.lineCap = .round
        cloudLayer.lineJoin = .round

        boltLayer.fillColor = UIColor(red: 0.93, green: 0.76, blue: 0.38, alpha: 1).cgColor
        boltLayer.shadowColor = UIColor(red: 0.96, green: 0.78, blue: 0.36, alpha: 1).cgColor
        boltLayer.shadowRadius = 10
        boltLayer.shadowOpacity = 0.75
        boltLayer.shadowOffset = .zero

        companyLabel.translatesAutoresizingMaskIntoConstraints = false
        companyLabel.text = "STORM AND ME"
        companyLabel.textColor = .white
        companyLabel.textAlignment = .center
        companyLabel.font = .systemFont(ofSize: 21, weight: .semibold)
        companyLabel.adjustsFontForContentSizeCategory = true
        companyLabel.accessibilityTraits = .header
        addSubview(companyLabel)

        productLabel.translatesAutoresizingMaskIntoConstraints = false
        productLabel.textColor = UIColor(red: 0.79, green: 0.86, blue: 0.90, alpha: 1)
        productLabel.textAlignment = .center
        productLabel.font = .systemFont(ofSize: 14, weight: .medium)
        productLabel.adjustsFontForContentSizeCategory = true
        addSubview(productLabel)

        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        messageLabel.textColor = .white
        messageLabel.textAlignment = .center
        messageLabel.numberOfLines = 0
        messageLabel.font = .systemFont(ofSize: 17, weight: .semibold)
        messageLabel.isHidden = true
        addSubview(messageLabel)

        detailsLabel.translatesAutoresizingMaskIntoConstraints = false
        detailsLabel.textColor = UIColor(white: 0.78, alpha: 1)
        detailsLabel.textAlignment = .center
        detailsLabel.numberOfLines = 0
        detailsLabel.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        detailsLabel.isHidden = true
        addSubview(detailsLabel)

        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.setTitle("Retry", for: .normal)
        retryButton.setTitleColor(UIColor(red: 0.04, green: 0.09, blue: 0.12, alpha: 1), for: .normal)
        retryButton.titleLabel?.font = .systemFont(ofSize: 16, weight: .semibold)
        retryButton.backgroundColor = UIColor(red: 0.91, green: 0.76, blue: 0.42, alpha: 1)
        retryButton.layer.cornerRadius = 12
        retryButton.contentEdgeInsets = UIEdgeInsets(top: 12, left: 24, bottom: 12, right: 24)
        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)
        retryButton.isHidden = true
        addSubview(retryButton)

        NSLayoutConstraint.activate([
            markContainer.centerXAnchor.constraint(equalTo: centerXAnchor),
            markContainer.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -90),
            markContainer.widthAnchor.constraint(equalToConstant: 128),
            markContainer.heightAnchor.constraint(equalToConstant: 92),

            companyLabel.topAnchor.constraint(equalTo: markContainer.bottomAnchor, constant: 26),
            companyLabel.leadingAnchor.constraint(greaterThanOrEqualTo: leadingAnchor, constant: 28),
            companyLabel.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor, constant: -28),
            companyLabel.centerXAnchor.constraint(equalTo: centerXAnchor),

            productLabel.topAnchor.constraint(equalTo: companyLabel.bottomAnchor, constant: 8),
            productLabel.leadingAnchor.constraint(greaterThanOrEqualTo: leadingAnchor, constant: 28),
            productLabel.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor, constant: -28),
            productLabel.centerXAnchor.constraint(equalTo: centerXAnchor),

            messageLabel.topAnchor.constraint(equalTo: productLabel.bottomAnchor, constant: 28),
            messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32),
            messageLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -32),

            detailsLabel.topAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 10),
            detailsLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 28),
            detailsLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -28),

            retryButton.topAnchor.constraint(equalTo: detailsLabel.bottomAnchor, constant: 22),
            retryButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            retryButton.heightAnchor.constraint(greaterThanOrEqualToConstant: 44),
        ])
    }

    private func updateMarkPaths() {
        for sublayer in layer.sublayers ?? [] where sublayer.name == "stormandmeHalo" {
            sublayer.frame = bounds
        }

        let w = markContainer.bounds.width
        let h = markContainer.bounds.height
        guard w > 0, h > 0 else { return }

        let cloud = UIBezierPath()
        cloud.move(to: CGPoint(x: w * 0.18, y: h * 0.66))
        cloud.addCurve(to: CGPoint(x: w * 0.35, y: h * 0.42), controlPoint1: CGPoint(x: w * 0.17, y: h * 0.52), controlPoint2: CGPoint(x: w * 0.25, y: h * 0.43))
        cloud.addCurve(to: CGPoint(x: w * 0.60, y: h * 0.34), controlPoint1: CGPoint(x: w * 0.41, y: h * 0.17), controlPoint2: CGPoint(x: w * 0.57, y: h * 0.17))
        cloud.addCurve(to: CGPoint(x: w * 0.83, y: h * 0.61), controlPoint1: CGPoint(x: w * 0.74, y: h * 0.32), controlPoint2: CGPoint(x: w * 0.82, y: h * 0.43))
        cloud.addCurve(to: CGPoint(x: w * 0.72, y: h * 0.73), controlPoint1: CGPoint(x: w * 0.83, y: h * 0.68), controlPoint2: CGPoint(x: w * 0.79, y: h * 0.73))
        cloud.addLine(to: CGPoint(x: w * 0.28, y: h * 0.73))
        cloud.addCurve(to: CGPoint(x: w * 0.18, y: h * 0.66), controlPoint1: CGPoint(x: w * 0.22, y: h * 0.73), controlPoint2: CGPoint(x: w * 0.18, y: h * 0.70))
        glowLayer.path = cloud.cgPath
        cloudLayer.path = cloud.cgPath
        glowLayer.frame = markContainer.bounds
        cloudLayer.frame = markContainer.bounds

        let bolt = UIBezierPath()
        bolt.move(to: CGPoint(x: w * 0.53, y: h * 0.56))
        bolt.addLine(to: CGPoint(x: w * 0.43, y: h * 0.80))
        bolt.addLine(to: CGPoint(x: w * 0.53, y: h * 0.78))
        bolt.addLine(to: CGPoint(x: w * 0.47, y: h * 1.00))
        bolt.addLine(to: CGPoint(x: w * 0.68, y: h * 0.69))
        bolt.addLine(to: CGPoint(x: w * 0.57, y: h * 0.71))
        bolt.close()
        boltLayer.path = bolt.cgPath
        boltLayer.frame = markContainer.bounds
    }

    private func scheduleLightningPulse(after delay: TimeInterval) {
        let item = DispatchWorkItem { [weak self] in
            guard let self else { return }
            UIView.animate(withDuration: 0.06, animations: {
                self.boltLayer.opacity = 0.28
                self.glowLayer.opacity = 0.72
                self.markContainer.alpha = 0.84
            }, completion: { _ in
                UIView.animate(withDuration: 0.13) {
                    self.boltLayer.opacity = 1
                    self.glowLayer.opacity = 0.28
                    self.markContainer.alpha = 1
                }
            })
        }
        pulseWorkItems.append(item)
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: item)
    }

    private func cancelPulses() {
        pulseWorkItems.forEach { $0.cancel() }
        pulseWorkItems.removeAll()
        markContainer.layer.removeAllAnimations()
    }
}
