chrome.downloads.onCreated.addListener((downloadItem) => {
  // We only care about complete URLs, not data URIs or blob URIs
  if (!downloadItem.url.startsWith('http')) return;

  // Pause the download immediately while we ask the user
  chrome.downloads.pause(downloadItem.id, () => {
    // Send a rich notification asking for permission to scan
    chrome.notifications.create(downloadItem.id.toString(), {
      type: 'basic',
      iconUrl: 'icon.png', // We'll need a placeholder icon
      title: 'SentroniX Defense',
      message: `File: ${downloadItem.filename || 'Unknown'}\nDo you want to scan this file for malware/steganography?`,
      buttons: [
        { title: 'Scan File' },
        { title: 'Download As-Is' }
      ],
      priority: 2
    });
  });
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const downloadId = parseInt(notificationId, 10);
  
  if (buttonIndex === 1) {
    // User clicked "Download As-Is"
    chrome.downloads.resume(downloadId);
    chrome.notifications.clear(notificationId);
  } else if (buttonIndex === 0) {
    // User clicked "Scan File"
    chrome.notifications.clear(notificationId);
    
    // Notify user we are scanning
    chrome.notifications.create('scanning-' + downloadId, {
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'SentroniX is scanning...',
      message: 'Downloading file to local memory for active analysis.'
    });

    // 1. Get the DownloadItem to find the URL
    chrome.downloads.search({ id: downloadId }, async (items) => {
      if (items.length === 0) return;
      const item = items[0];

      try {
        // 2. Fetch the file into memory as a Blob
        const response = await fetch(item.url);
        const blob = await response.blob();

        // 3. Prepare FormData to send to SentroniX Backend
        const formData = new FormData();
        // Determine which endpoint to hit based on mime type
        const isImage = blob.type.startsWith('image/');
        const endpoint = isImage ? '/api/v1/steg/analyze' : '/api/v1/defense/scan';
        const url = `http://localhost:8000${endpoint}`;

        formData.append('file', blob, item.filename || 'downloaded_file');

        // 4. Send to backend
        const apiRes = await fetch(url, {
          method: 'POST',
          body: formData
        });

        const result = await apiRes.json();
        
        chrome.notifications.clear('scanning-' + downloadId);

        // 5. Evaluate Result
        let isSafe = false;
        let details = "";
        
        if (isImage) {
           isSafe = !(result.findings && result.findings.includes("[!] ALERT"));
           details = isSafe ? "Image is clean." : "Hidden steganography payload detected!";
        } else {
           isSafe = (result.status === 'clean');
           details = isSafe ? "File is clean." : `Found ${result.findings_count} malicious signatures!`;
        }

        if (isSafe) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'SentroniX: CLEAN',
            message: `${details}\nResuming download.`
          });
          chrome.downloads.resume(downloadId);
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'SentroniX: THREAT DETECTED',
            message: `${details}\nDownload has been CANCELLED.`
          });
          chrome.downloads.cancel(downloadId);
        }

      } catch (err) {
        console.error("SentroniX Scan Error:", err);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'SentroniX: Error',
          message: 'Failed to connect to SentroniX backend. Resuming download.'
        });
        chrome.downloads.resume(downloadId);
      }
    });
  }
});
