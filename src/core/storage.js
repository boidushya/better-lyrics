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

  getTransientStorage: async function (key) {
    try {
      const result = await chrome.storage.local.get(key);
      const item = result[key];

      if (!item) return null;

      const { value, expiry } = item;
      if (expiry && Date.now() > expiry) {
        await chrome.storage.local.remove(key);
        return null;
      }

      return value;
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      return null;
    }
  },

  setTransientStorage: async function (key, value, ttl) {
    try {
      const expiry = Date.now() + ttl;
      await chrome.storage.local.set({
        [key]: {
          type: "transient",
          value,
          expiry,
        },
      });
      BetterLyrics.Utils.log(BetterLyrics.Constants.STORAGE_TRANSIENT_SET_LOG, key);
      await BetterLyrics.Storage.saveCacheInfo();
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
    }
  },

  getUpdatedCacheInfo: async function () {
    try {
      const result = await chrome.storage.local.get(null);
      const lyricsKeys = Object.keys(result).filter(key => key.startsWith("blyrics_"));
      const totalSize = lyricsKeys.reduce((acc, key) => {
        const item = result[key];
        return acc + JSON.stringify(item).length;
      }, 0);
      return {
        count: lyricsKeys.length,
        size: totalSize,
      };
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      return { count: 0, size: 0 };
    }
  },

  saveCacheInfo: async function () {
    const cacheInfo = await BetterLyrics.Storage.getUpdatedCacheInfo();
    chrome.storage.sync.set({ cacheInfo: cacheInfo });
  },

  clearCache: async function () {
    try {
      const result = await chrome.storage.local.get(null);
      const lyricsKeys = Object.keys(result).filter(key => key.startsWith("blyrics_"));
      await chrome.storage.local.remove(lyricsKeys);
      await BetterLyrics.Storage.saveCacheInfo();
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
    }
  },

  purgeExpiredKeys: async function () {
    try {
      const now = Date.now();
      const result = await chrome.storage.local.get(null);
      const keysToRemove = [];

      Object.keys(result).forEach(key => {
        if (key.startsWith("blyrics_")) {
          const { expiryTime } = result[key];
          if (expiryTime && now >= expiryTime) {
            keysToRemove.push(key);
          }
        }
      });

      if (keysToRemove.length) {
        await chrome.storage.local.remove(keysToRemove);
      }
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
    }
  },
};
