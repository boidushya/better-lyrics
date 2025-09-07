/**
 * Storage management utilities for the BetterLyrics extension.
 * Handles both sync and local storage across Chrome and Firefox browsers.
 *
 * @namespace BetterLyrics.Storage
 */
BetterLyrics.Storage = {
  /**
   * Cross-browser storage getter that works with both Chrome and Firefox.
   *
   * @param {Object|string} key - Storage key or object with default values
   * @param {Function} callback - Callback function to handle the retrieved data
   */
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

  /**
   * Retrieves and applies custom CSS from storage.
   */
  getAndApplyCustomCSS: function () {
    chrome.storage.sync.get(["customCSS"], result => {
      if (result.customCSS) {
        BetterLyrics.Utils.applyCustomCSS(result.customCSS);
      }
    });
  },

  /**
   * Subscribes to custom CSS changes and applies them automatically.
   * Also invalidates cached transition duration when CSS changes.
   */
  subscribeToCustomCSS: function () {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.customCSS) {
        BetterLyrics.Utils.applyCustomCSS(changes.customCSS.newValue);
        BetterLyrics.DOM.cachedDurations = new Map();
      }
    });
    BetterLyrics.Storage.getAndApplyCustomCSS();
    BetterLyrics.DOM.cachedDurations = new Map();
  },

  /**
   * Retrieves a value from transient storage with automatic expiry handling.
   *
   * @param {string} key - Storage key to retrieve
   * @returns {Promise<*|null>} The stored value or null if expired/not found
   */
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

  /**
   * Stores a value in transient storage with automatic expiry.
   *
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {number} ttl - Time to live in milliseconds
   */
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

  /**
   * Calculates current cache information including count and size of stored lyrics.
   *
   * @returns {Promise<{count: number, size: number}>} Cache statistics
   */
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

  /**
   * Updates and saves current cache information to sync storage.
   */
  saveCacheInfo: async function () {
    const cacheInfo = await BetterLyrics.Storage.getUpdatedCacheInfo();
    chrome.storage.sync.set({ cacheInfo: cacheInfo });
  },

  /**
   * Clears all cached lyrics data from local storage.
   */
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

  /**
   * Removes expired cache entries from local storage.
   * Scans all BetterLyrics cache keys and removes those past their expiry time.
   */
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
