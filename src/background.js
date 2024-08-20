chrome.runtime.onMessage.addListener(request => {
  if (request.action === "updateCSS") {
    chrome.tabs.query({ url: "*://music.youtube.com/*" }, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "updateCSS", css: request.css });
      });
    });
    return true;
  }
});
