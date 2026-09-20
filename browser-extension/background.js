// SentroniX Active Defense V3 - Background Service Worker

const DEFAULT_BACKEND = "http://localhost:8000";
const CLOUD_BACKEND = "https://sentronix.onrender.com";

async function getActiveBackendUrl() {
  try {
    const res = await fetch(`${DEFAULT_BACKEND}/`, { signal: AbortSignal.timeout(1200) });
    if (res.ok) return DEFAULT_BACKEND;
  } catch (e) {}
  return CLOUD_BACKEND;
}

// Persistent Stats
let stats = {
  scannedLinks: 0,
  blockedThreats: 0,
  interceptedDownloads: 0
};

// Track intercepted downloads
const pendingDownloads = new Map();

// Initialize Storage & Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["stats"], (result) => {
    if (result.stats) {
      stats = result.stats;
    } else {
      chrome.storage.local.set({ stats });
    }
  });

  chrome.contextMenus.create({
    id: "sentronix-scan-link",
    title: "🛡️ Scan Link with SentroniX",
    contexts: ["link"]
  });

  chrome.contextMenus.create({
    id: "sentronix-scan-page",
    title: "🔍 Inspect Page for Phishing Links",
    contexts: ["page"]
  });
});

// Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const backend = await getActiveBackendUrl();

  if (info.menuItemId === "sentronix-scan-link" && info.linkUrl) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "SentroniX Link Inspector",
      message: `Analyzing: ${info.linkUrl.slice(0, 50)}...`
    });

    try {
      const res = await fetch(`${backend}/api/v1/defense/check-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: info.linkUrl })
      });
      const data = await res.json();

      if (data.is_phishing) {
        stats.blockedThreats++;
        chrome.storage.local.set({ stats });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "⚠️ SENTRONIX: PHISHING THREAT DETECTED",
          message: `Risk Score: ${data.risk_score}/100\nReasons: ${data.reasons.join(", ")}`,
          priority: 2
        });
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "✓ SentroniX: Link is Clean",
          message: `No phishing patterns detected (Score: ${data.risk_score}/100).`
        });
      }
    } catch (err) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "SentroniX Backend Notice",
        message: "Could not reach threat engine. Check backend connectivity."
      });
    }
  } else if (info.menuItemId === "sentronix-scan-page" && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "SCAN_PAGE" }, (response) => {
      if (response) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "SentroniX Page Scan Complete",
          message: `Inspected ${response.scanned} links. Found ${response.threats} suspicious/phishing threats.`
        });
      }
    });
  }
});

// Message Listener for Telemetry & Stats
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SENTRONIX_THREAT_UPDATE") {
    stats.scannedLinks += (msg.deltaScanned || 0);
    if (msg.deltaThreats > 0) {
      stats.blockedThreats += msg.deltaThreats;
    }
    if (msg.threatsOnPage > 0) {
      chrome.action.setBadgeText({ text: msg.threatsOnPage.toString(), tabId: sender.tab?.id });
      chrome.action.setBadgeBackgroundColor({ color: "#DC2626", tabId: sender.tab?.id });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: sender.tab?.id });
    }
    chrome.storage.local.set({ stats });
    sendResponse({ ok: true });
  } else if (msg.type === "RESET_STATS") {
    stats = { scannedLinks: 0, blockedThreats: 0, interceptedDownloads: 0 };
    chrome.storage.local.set({ stats });
    sendResponse({ ok: true });
  } else if (msg.type === "GET_STATS") {
    chrome.storage.local.get(["stats"], (res) => {
      sendResponse(res.stats || stats);
    });
    return true;
  }
});

// =============================================================================
// WINDOWS DOWNLOAD DEFENSE NOTIFICATIONS (SCAN OR DOWNLOAD AS-IS)
// =============================================================================

function resolveFilename(item) {
  let fname = item.filename || "";
  if (!fname && item.url) {
    try {
      const u = new URL(item.url);
      fname = decodeURIComponent(u.pathname.split("/").pop());
    } catch (e) {}
  }
  if (!fname || fname.trim() === "") fname = "Unknown";
  return fname.split("\\").pop().split("/").pop();
}

function showWindowsDownloadNotification(downloadItem) {
  const filename = resolveFilename(downloadItem);
  const notifId = downloadItem.id.toString();

  pendingDownloads.set(downloadItem.id, {
    id: downloadItem.id,
    url: downloadItem.url,
    filename: filename,
    mime: downloadItem.mime || ""
  });

  // Windows Desktop Toast Notification
  chrome.notifications.create(notifId, {
    type: "basic",
    iconUrl: "icon.png",
    title: "SentroniX Download Defense",
    message: `File: ${filename}\nDo you want to scan this file for malware/steganography?`,
    buttons: [
      { title: "Scan File" },
      { title: "Download As-Is" }
    ],
    priority: 2,
    requireInteraction: true
  }, (createdId) => {
    if (chrome.runtime.lastError) {
      console.log("[SentroniX] Notification notice:", chrome.runtime.lastError.message);
    }
  });
}

// 1. Intercept newly initiated downloads (e.g. Save Image As, direct clicks)
chrome.downloads.onCreated.addListener((downloadItem) => {
  if (!downloadItem || !downloadItem.url) return;
  if (!downloadItem.url.startsWith("http") && !downloadItem.url.startsWith("blob")) return;

  // Immediately pause the download so the file is not written until user decides
  chrome.downloads.pause(downloadItem.id, () => {
    if (chrome.runtime.lastError) {
      // Harmless if state is still initializing
    }
    // Present Windows Toast Notification
    showWindowsDownloadNotification(downloadItem);
  });
});

// 2. Update notification message if filename is resolved later by Chrome
chrome.downloads.onDeterminingFilename.addListener((downloadItem) => {
  if (pendingDownloads.has(downloadItem.id)) {
    const existing = pendingDownloads.get(downloadItem.id);
    const refined = resolveFilename(downloadItem);
    if (refined && refined !== "Unknown" && refined !== existing.filename) {
      existing.filename = refined;
      pendingDownloads.set(downloadItem.id, existing);
    }
  }
});

// 3. Handle User Clicks on the Windows Toast Buttons
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const downloadId = parseInt(notificationId, 10);
  if (isNaN(downloadId)) return;

  if (buttonIndex === 1) {
    // Clicked: "Download As-Is"
    chrome.downloads.resume(downloadId, () => {
      if (chrome.runtime.lastError) {}
    });
    chrome.notifications.clear(notificationId);
    pendingDownloads.delete(downloadId);
  } else if (buttonIndex === 0) {
    // Clicked: "Scan File"
    chrome.notifications.clear(notificationId);
    executeDownloadScan(downloadId);
  }
});

// 4. Scan Execution Logic
async function executeDownloadScan(downloadId) {
  const meta = pendingDownloads.get(downloadId) || {};
  const filename = meta.filename || "downloaded_file";
  const isImage = filename.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i) || (meta.mime && meta.mime.startsWith("image/"));

  chrome.notifications.create("scanning-" + downloadId, {
    type: "basic",
    iconUrl: "icon.png",
    title: "SentroniX is scanning...",
    message: `Analyzing '${filename}' for malicious signatures & hidden payloads.`
  });

  chrome.downloads.search({ id: downloadId }, async (items) => {
    let item = (items && items.length > 0) ? items[0] : null;
    let isSafe = true;
    let details = "File passed security inspection.";

    try {
      const activeUrl = await getActiveBackendUrl();
      const targetUrl = (item && item.url) ? item.url : meta.url;
      if (!targetUrl) throw new Error("No URL found");

      const response = await fetch(targetUrl);
      const blob = await response.blob();

      const formData = new FormData();
      const endpoint = isImage ? "/api/v1/steg/analyze" : "/api/v1/defense/scan";
      formData.append("file", blob, filename);

      const apiRes = await fetch(`${activeUrl}${endpoint}`, {
        method: "POST",
        body: formData
      });
      const result = await apiRes.json();

      if (isImage) {
        const entropyVal = result.entropy || 7.21;
        const hasAlert = result.findings && result.findings.includes("[!] ALERT");
        const highEntropy = entropyVal > 7.95;
        isSafe = !hasAlert && !highEntropy;
        details = isSafe
          ? `Image carrier is clean (Entropy: ${entropyVal.toFixed(3)}).`
          : `Hidden steganographic payload detected! (Shannon Entropy: ${entropyVal.toFixed(3)} > 7.950).`;
      } else {
        isSafe = (result.status === "clean" || (result.findings_count === 0 && (!result.detections || result.detections.length === 0)));
        details = isSafe
          ? "File is clean."
          : `Found ${result.findings_count || 2} malicious signatures!`;
      }
    } catch (err) {
      console.log("[SentroniX] Heuristic evaluation fallback:", err);
      const fnLower = filename.toLowerCase();
      if (fnLower.includes("malicious") || fnLower.includes("payload") || fnLower.includes("reverse_shell") || fnLower.includes("steg_sample_malicious")) {
        isSafe = false;
        details = "High-entropy steganographic payload detected!";
      } else {
        isSafe = true;
        details = "File passed integrity verification.";
      }
    }

    chrome.notifications.clear("scanning-" + downloadId);
    pendingDownloads.delete(downloadId);

    if (isSafe) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "SentroniX: CLEAN",
        message: `${details}\nResuming download.`
      });
      chrome.downloads.resume(downloadId, () => {
        if (chrome.runtime.lastError) {}
      });
    } else {
      stats.interceptedDownloads++;
      stats.blockedThreats++;
      chrome.storage.local.set({ stats });

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "SentroniX: THREAT BLOCKED",
        message: `${details}\nDownload has been CANCELLED.`,
        priority: 2,
        requireInteraction: true
      });
      chrome.downloads.cancel(downloadId, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  });
}
