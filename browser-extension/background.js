// SentroniX Active Defense V3 - Background Service Worker

const BACKEND_URL = "http://localhost:8000";

// Persistent Stats
let stats = {
  scannedLinks: 0,
  blockedThreats: 0,
  interceptedDownloads: 0
};

// Initialize Storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["stats"], (result) => {
    if (result.stats) {
      stats = result.stats;
    } else {
      chrome.storage.local.set({ stats });
    }
  });

  // Create Context Menu Items
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

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sentronix-scan-link" && info.linkUrl) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "SentroniX Link Inspector",
      message: `Analyzing: ${info.linkUrl.slice(0, 50)}...`
    });

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/defense/check-url`, {
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
          message: `Risk Score: ${data.risk_score}/100\nReasons: ${data.reasons.join(", ")}`
        });
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "✓ SentroniX: Link is Clean",
          message: `No phishing patterns or malicious signatures detected (Score: ${data.risk_score}/100).`
        });
      }
    } catch (err) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "SentroniX Backend Offline",
        message: "Could not connect to local SentroniX engine at http://localhost:8000."
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

// Update Badge and Stats from Content Script
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
    return true; // async
  }
});

// =============================================================================
// DOWNLOAD INTERCEPTION (FROM V2 - STEGANOGRAPHY & MALWARE DEFENSE)
// =============================================================================
chrome.downloads.onCreated.addListener((downloadItem) => {
  if (!downloadItem.url.startsWith("http")) return;

  chrome.downloads.pause(downloadItem.id, () => {
    chrome.notifications.create(downloadItem.id.toString(), {
      type: "basic",
      iconUrl: "icon.png",
      title: "SentroniX Download Defense",
      message: `File: ${downloadItem.filename || "Unknown"}\nScan this file for malware/steganography before downloading?`,
      buttons: [
        { title: "Scan File" },
        { title: "Download As-Is" }
      ],
      priority: 2
    });
  });
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const downloadId = parseInt(notificationId, 10);
  if (isNaN(downloadId)) return;

  if (buttonIndex === 1) {
    chrome.downloads.resume(downloadId);
    chrome.notifications.clear(notificationId);
  } else if (buttonIndex === 0) {
    chrome.notifications.clear(notificationId);
    
    chrome.notifications.create("scanning-" + downloadId, {
      type: "basic",
      iconUrl: "icon.png",
      title: "SentroniX Scanning File...",
      message: "Analyzing file contents for malicious signatures & hidden payloads."
    });

    chrome.downloads.search({ id: downloadId }, async (items) => {
      if (items.length === 0) return;
      const item = items[0];

      try {
        const response = await fetch(item.url);
        const blob = await response.blob();

        const formData = new FormData();
        const isImage = blob.type.startsWith("image/");
        const endpoint = isImage ? "/api/v1/steg/analyze" : "/api/v1/defense/scan";
        const url = `${BACKEND_URL}${endpoint}`;

        formData.append("file", blob, item.filename || "downloaded_file");

        const apiRes = await fetch(url, {
          method: "POST",
          body: formData
        });
        const result = await apiRes.json();
        
        chrome.notifications.clear("scanning-" + downloadId);

        let isSafe = false;
        let details = "";
        
        if (isImage) {
          isSafe = !(result.findings && result.findings.includes("[!] ALERT"));
          details = isSafe ? "Image carrier is clean." : "Hidden steganographic payload detected!";
        } else {
          isSafe = (result.status === "clean");
          details = isSafe ? "File is clean." : `Found ${result.findings_count} malicious signatures!`;
        }

        if (isSafe) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "SentroniX: CLEAN",
            message: `${details}\nResuming safe download.`
          });
          chrome.downloads.resume(downloadId);
        } else {
          stats.interceptedDownloads++;
          chrome.storage.local.set({ stats });
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "SentroniX: THREAT BLOCKED",
            message: `${details}\nDownload has been cancelled for your protection.`
          });
          chrome.downloads.cancel(downloadId);
        }
      } catch (err) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "SentroniX: Engine Connection Error",
          message: "Failed to connect to local engine. Resuming download."
        });
        chrome.downloads.resume(downloadId);
      }
    });
  }
});
