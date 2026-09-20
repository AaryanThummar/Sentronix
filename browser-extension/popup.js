// SentroniX Active Defense V3 - Popup Logic

const DEFAULT_BACKEND = "http://localhost:8000";
const CLOUD_BACKEND = "https://sentronix.onrender.com";

async function getActiveBackendUrl() {
  try {
    const res = await fetch(`${DEFAULT_BACKEND}/`, { signal: AbortSignal.timeout(1200) });
    if (res.ok) return DEFAULT_BACKEND;
  } catch (e) {}
  return CLOUD_BACKEND;
}

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput");
  const btnScanUrl = document.getElementById("btnScanUrl");
  const scanResult = document.getElementById("scanResult");

  const statScanned = document.getElementById("statScanned");
  const statBlocked = document.getElementById("statBlocked");
  const statDownloads = document.getElementById("statDownloads");

  // Load stats from background
  chrome.runtime.sendMessage({ type: "GET_STATS" }, (stats) => {
    if (stats) {
      statScanned.innerText = (stats.scannedLinks || 0).toLocaleString();
      statBlocked.innerText = (stats.blockedThreats || 0).toLocaleString();
      statDownloads.innerText = (stats.interceptedDownloads || 0).toLocaleString();
    }
  });

  // Handle Quick URL Scan
  btnScanUrl.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    btnScanUrl.innerText = "Analyzing...";
    btnScanUrl.disabled = true;
    scanResult.className = "scan-result";
    scanResult.style.display = "none";

    try {
      const backend = await getActiveBackendUrl();
      const res = await fetch(`${backend}/api/v1/defense/check-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url })
      });
      const data = await res.json();

      scanResult.style.display = "block";
      if (data.is_phishing) {
        scanResult.className = "scan-result threat";
        scanResult.innerHTML = `
          <strong>⚠️ THREAT DETECTED [Risk: ${data.risk_score}/100]</strong><br>
          Category: ${data.category.toUpperCase()}<br>
          ${data.reasons.slice(0, 2).join("<br>")}
        `;
      } else {
        scanResult.className = "scan-result clean";
        scanResult.innerHTML = `
          <strong>✓ CLEAN [Risk Score: ${data.risk_score}/100]</strong><br>
          No phishing or malware signatures detected.
        `;
      }
    } catch (err) {
      // Fallback local client-side evaluation if backend is offline
      scanResult.style.display = "block";
      const isSus = url.includes("paypa1") || url.includes("g00gle") || url.includes("arnazon") || url.includes(".xyz");
      if (isSus) {
        scanResult.className = "scan-result threat";
        scanResult.innerHTML = `<strong>⚠️ SUSPICIOUS PATTERN (Offline Scanner)</strong><br>Typosquatting or high-abuse TLD pattern matched.`;
      } else {
        scanResult.className = "scan-result clean";
        scanResult.innerHTML = `<strong>✓ Basic Syntax Valid (Offline Scanner)</strong><br>Ensure backend is running at http://localhost:8000 for deep AI inspection.`;
      }
    } finally {
      btnScanUrl.innerText = "Scan";
      btnScanUrl.disabled = false;
    }
  });

  // Also trigger scan on Enter key
  urlInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      btnScanUrl.click();
    }
  });

  // Double click stats grid to reset counters if desired
  const statsGrid = document.querySelector(".stats-grid");
  if (statsGrid) {
    statsGrid.title = "Double-click to reset telemetry counters";
    statsGrid.addEventListener("dblclick", () => {
      chrome.runtime.sendMessage({ type: "RESET_STATS" }, () => {
        statScanned.innerText = "0";
        statBlocked.innerText = "0";
        statDownloads.innerText = "0";
      });
    });
  }
});

