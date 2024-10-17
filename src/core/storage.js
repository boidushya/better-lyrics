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

  getTransientStorage: function (key, callback) {
    const data = localStorage.getItem(key);
    if (data) {
      const parsedData = JSON.parse(data);
      const now = Date.now();
      if (parsedData.expiryTime && now < parsedData.expiryTime) {
        callback(parsedData.value);
      } else {
        BetterLyrics.Storage.removeStorage(key);
        callback(null);
      }
    } else {
      callback(null);
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.STORAGE_TRANSIENT_GET_LOG, key);
  },

  setTransientStorage: function (key, value, expiryInMs) {
    const data = {
      type: "transient",
      value: value,
      expiryTime: Date.now() + expiryInMs,
    };
    // using localStorage due to sync storage limitations
    localStorage.setItem(key, JSON.stringify(data));
    BetterLyrics.Utils.log(BetterLyrics.Constants.STORAGE_TRANSIENT_SET_LOG, key);
    BetterLyrics.Storage.saveCacheInfo();
  },

  removeStorage: function (key) {
    localStorage.removeItem(key);
    BetterLyrics.Utils.log(BetterLyrics.Constants.PURGE_LOG, key);
  },

  getUpdatedCacheInfo: function () {
    const lyricsKeys = Object.keys(localStorage).filter(key => key.startsWith("blyrics_"));
    const totalSize = lyricsKeys.reduce((acc, key) => acc + localStorage.getItem(key).length, 0);
    return {
      count: lyricsKeys.length,
      size: totalSize,
    };
  },

  saveCacheInfo: function () {
    const cacheInfo = BetterLyrics.Storage.getUpdatedCacheInfo();
    chrome.storage.sync.set({ cacheInfo: cacheInfo });
  },

  clearCache: function () {
    const lyricsKeys = Object.keys(localStorage).filter(key => key.startsWith("blyrics_"));
    lyricsKeys.forEach(key => {
      BetterLyrics.Storage.removeStorage(key);
    });
    BetterLyrics.Storage.saveCacheInfo();
  },

  purgeExpiredKeys: function () {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      const data = localStorage.getItem(key);
      if (!key.startsWith("blyrics_")) return;
      if (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.expiryTime && now >= parsedData.expiryTime) {
          BetterLyrics.Storage.removeStorage(key);
        }
      }
    });
  },
};
