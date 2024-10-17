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
    const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
    const inFirefox = typeof browser !== "undefined";

    const handleStorageResult = result => {
      const data = result[key];
      if (data && data.value && data.expiryTime) {
        const now = Date.now();
        if (now < data.expiryTime) {
          callback(data.value);
        } else {
          this.removeStorage(key);
          callback(null);
        }
      } else {
        callback(null);
      }
    };

    if (inChrome) {
      if (chrome.runtime?.id) {
        chrome.storage.sync.get(key, handleStorageResult);
      } else {
        callback(null);
      }
    } else if (inFirefox) {
      browser.storage.sync.get(key, handleStorageResult);
    } else {
      callback(null);
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.STORAGE_TRANSIENT_GET_LOG, key);
  },

  setTransientStorage: function (key, value, expiryInMs) {
    const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
    const inFirefox = typeof browser !== "undefined";

    const data = {
      type: "transient",
      value: value,
      expiryTime: Date.now() + expiryInMs,
    };

    if (inChrome) {
      if (chrome.runtime?.id) {
        chrome.storage.sync.set({ [key]: data });
      }
    } else if (inFirefox) {
      browser.storage.sync.set({ [key]: data });
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.STORAGE_TRANSIENT_SET_LOG, key);
  },

  removeStorage: function (key) {
    const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
    const inFirefox = typeof browser !== "undefined";

    if (inChrome) {
      if (chrome.runtime?.id) {
        chrome.storage.sync.remove(key);
      }
    } else if (inFirefox) {
      browser.storage.sync.remove(key);
    }
    BetterLyrics.Utils.log(BetterLyrics.Constants.PURGE_LOG, key);
  },

  purgeExpiredKeys: function () {
    const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
    const inFirefox = typeof browser !== "undefined";

    const handleStorageResult = items => {
      const now = Date.now();

      Object.keys(items).forEach(key => {
        const data = items[key];

        if (data && data.expiryTime && now >= data.expiryTime) {
          this.removeStorage(key);
        }
      });
    };

    if (inChrome) {
      if (chrome.runtime?.id) {
        chrome.storage.sync.get(null, handleStorageResult);
      }
    } else if (inFirefox) {
      browser.storage.sync.get(null, handleStorageResult);
    }
  },
};
