// SentroniX Active Defense V3 - Content Script
// Real-time Phishing, Malicious Link & Webmail Threat Inspector

(function () {
  const KNOWN_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix",
    "facebook", "instagram", "chase", "bankofamerica", "wellsfargo",
    "binance", "coinbase", "github", "linkedin", "twitter", "whatsapp"
  ];

  const SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".zip", ".mov",
    ".buzz", ".icu", ".work", ".click", ".link", ".cc", ".su", ".fit"
  ];

  const PHISHING_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "banking", "signin",
    "password", "auth", "confirm", "wallet", "suspended", "billing", "payment"
  ];

  const DANGEROUS_EXTENSIONS = [
    ".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".hta", ".iso", ".pif"
  ];

  let totalScanned = 0;
  let threatsFound = 0;
  let lastReportedScanned = 0;
  let lastReportedThreats = 0;

  function analyzeLink(a) {
    if (!a.href || a.href.startsWith("javascript:") || a.href.startsWith("#") || a.dataset.sentronixScanned) {
      return;
    }
    a.dataset.sentronixScanned = "true";
    totalScanned++;

    const href = a.href.toLowerCase();
    const anchorText = (a.innerText || "").trim().toLowerCase();

    let riskScore = 0;
    let reasons = [];

    // 1. Text vs Href Domain Mismatch (Classic Phishing)
    for (const brand of KNOWN_BRANDS) {
      if (anchorText.includes(brand + ".com") || anchorText.includes(brand)) {
        try {
          const urlObj = new URL(a.href);
          const host = urlObj.hostname.toLowerCase();
          if (!host.endsWith(brand + ".com") && !host.endsWith(brand + ".org") && !host.endsWith(brand + ".net")) {
            riskScore += 60;
            reasons.push(`Anchor text impersonates '${brand}', but actual destination is '${host}'.`);
            break;
          }
        } catch (e) {}
      }
    }

    // 2. Numerical IP Hostname
    if (/^https?:\/\/(\d{1,3}\.){3}\d{1,3}/i.test(href)) {
      riskScore += 45;
      reasons.push("Direct numerical IP address detected instead of domain name.");
    }

    // 3. Typosquatting
    const typos = [
      { p: /paypa[l1i]/i, l: "paypal" },
      { p: /g[0o]{2}gle/i, l: "google" },
      { p: /arnazon/i, l: "amazon" },
      { p: /rnicrosoft|micros0ft/i, l: "microsoft" },
      { p: /netf[l1i]x/i, l: "netflix" }
    ];
    for (const typo of typos) {
      if (typo.p.test(href) && !href.includes(typo.l)) {
        riskScore += 55;
        reasons.push(`Typosquatting detected: domain mimics legitimate '${typo.l}'.`);
      }
    }

    // 4. Suspicious TLD combined with sensitive keywords
    const hasSusTld = SUSPICIOUS_TLDS.some(tld => href.includes(tld));
    const hasPhishWord = PHISHING_KEYWORDS.some(kw => href.includes(kw));
    if (hasSusTld && hasPhishWord) {
      riskScore += 40;
      reasons.push("High-risk TLD combined with security/account keywords.");
    } else if (hasSusTld) {
      riskScore += 20;
    }

    // 5. Dangerous executable downloads
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (href.endsWith(ext) || href.includes(ext + "?")) {
        riskScore += 70;
        reasons.push(`Direct link to executable / malware container file (${ext}).`);
        break;
      }
    }

    // 6. Punycode IDN Homograph
    if (href.includes("xn--")) {
      riskScore += 40;
      reasons.push("Punycode (xn--) domain detected; potential homoglyph spoofing.");
    }

    // If High Risk, flag and intercept
    if (riskScore >= 45) {
      threatsFound++;
      flagThreatLink(a, riskScore, reasons);
    }
  }

  function flagThreatLink(a, score, reasons) {
    a.classList.add("sentronix-threat-link");

    // Create Warning Badge
    const badge = document.createElement("span");
    badge.className = "sentronix-threat-badge";
    badge.innerHTML = "⚠️ PHISHING RISK";
    badge.title = reasons.join(" ");

    // Insert badge adjacent to the link
    if (a.nextSibling) {
      a.parentNode.insertBefore(badge, a.nextSibling);
    } else {
      a.parentNode.appendChild(badge);
    }

    // Intercept click on the link
    a.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      showInterceptionModal(a.href, score, reasons);
    }, true);

    badge.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      showInterceptionModal(a.href, score, reasons);
    });
  }

  function showInterceptionModal(targetUrl, score, reasons) {
    // Remove existing modal if any
    const existing = document.getElementById("sentronix-interception-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "sentronix-interception-overlay";

    const reasonItems = reasons.map(r => `<li>${r}</li>`).join("");

    overlay.innerHTML = `
      <div class="sentronix-modal-card">
        <div class="sentronix-modal-header">
          <div class="sentronix-modal-icon">🛡️</div>
          <div>
            <h3 class="sentronix-modal-title">SentroniX: Phishing & Threat Intercepted</h3>
            <div style="font-size:12px; color:#dc2626; font-weight:bold; margin-top:2px;">
              Threat Risk Score: ${score}/100 [HIGH RISK]
            </div>
          </div>
        </div>
        <p style="font-size:13px; margin:0 0 8px 0; color:#334155;">
          SentroniX Active Defense intercepted a link that appears deceptive, malicious, or designed to harvest your credentials.
        </p>
        <div class="sentronix-modal-url">${targetUrl}</div>
        <div class="sentronix-modal-reasons">
          <strong>Identified Threat Indicators:</strong>
          <ul>${reasonItems}</ul>
        </div>
        <div class="sentronix-modal-actions">
          <button id="sentronix-btn-cancel" class="sentronix-btn-safe">
            ✓ Return to Safety (Recommended)
          </button>
          <button id="sentronix-btn-proceed" class="sentronix-btn-danger">
            Proceed Anyway (Unsafe)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("sentronix-btn-cancel").addEventListener("click", () => {
      overlay.remove();
    });

    document.getElementById("sentronix-btn-proceed").addEventListener("click", () => {
      overlay.remove();
      window.location.href = targetUrl;
    });
  }

  function scanAllLinks() {
    const links = document.querySelectorAll("a[href]");
    links.forEach(analyzeLink);

    const deltaScanned = totalScanned - lastReportedScanned;
    const deltaThreats = threatsFound - lastReportedThreats;

    if (deltaScanned > 0 || deltaThreats > 0) {
      lastReportedScanned = totalScanned;
      lastReportedThreats = threatsFound;
      try {
        chrome.runtime.sendMessage({
          type: "SENTRONIX_THREAT_UPDATE",
          deltaScanned: deltaScanned,
          deltaThreats: deltaThreats,
          threatsOnPage: threatsFound
        });
      } catch (e) {}
    }
  }

  // Initial scan on page load
  scanAllLinks();

  // Watch for dynamic links (e.g. in Gmail, Outlook webmail, single page apps)
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      scanAllLinks();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "SCAN_PAGE") {
      scanAllLinks();
      sendResponse({ scanned: totalScanned, threats: threatsFound });
    }
  });
})();


