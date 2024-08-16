BetterLyrics.Storage = {
  getStorage: function (key, callback) {
    const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
    const inFirefox = typeof browser !== "undefined";
    if (inChrome) {
      if (chrome.runtime?.id) {
        chrome.storage.sync.get(key, callback);
      } else {
        callback(key);
      }
    } else if (inFirefox) {
      browser.storage.sync.get(key, callback);
    } else {
      callback(key);
    }
  },

  getAndApplyCustomCSS: function () {
    chrome.storage.sync.get(["customCSS"], result => {
      if (result.customCSS) {
        BetterLyrics.Utils.applyCustomCSS(result.customCSS);
      }
    });
  },

  subscribeToCustomCSS: function () {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.customCSS) {
        BetterLyrics.Utils.applyCustomCSS(changes.customCSS.newValue);
      }
    });
    BetterLyrics.Storage.getAndApplyCustomCSS();
  },
};
