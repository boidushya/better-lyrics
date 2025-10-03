import * as Utils from "./utils";
import * as Dom from "../modules/ui/dom";
import * as Constants from "./constants";

/**
 * Cross-browser storage getter that works with both Chrome and Firefox.
 *
 * @param {Object|string} key - Storage key or object with default values
 * @param {Function} callback - Callback function to handle the retrieved data
 */
export function getStorage(key, callback) {
  chrome.storage.sync.get(key, callback);
}

/**
 * Retrieves and applies custom CSS from storage.
 */
export function getAndApplyCustomCSS() {
  chrome.storage.sync.get(["customCSS"], result => {
    if (result.customCSS) {
      Utils.applyCustomCSS(result.customCSS);
    }
  });
}

/**
 * Subscribes to custom CSS changes and applies them automatically.
 * Also invalidates cached transition duration when CSS changes.
 */
export function subscribeToCustomCSS() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.customCSS) {
      Utils.applyCustomCSS(changes.customCSS.newValue);
      Dom.cachedDurations.clear();
    }
  });
  this.getAndApplyCustomCSS();
  Dom.cachedDurations.clear();
}

/**
 * Retrieves a value from transient storage with automatic expiry handling.
 *
 * @param {string} key - Storage key to retrieve
 * @returns {Promise<*|null>} The stored value or null if expired/not found
 */
export async function getTransientStorage(key) {
  try {
    const result = await chrome.storage.local.get(key);
    const item = result[key];

    if (!item) return null;

    const {value, expiry} = item;
    if (expiry && Date.now() > expiry) {
      await chrome.storage.local.remove(key);
      return null;
    }

    return value;
  } catch (error) {
    Utils.log(Constants.GENERAL_ERROR_LOG, error);
    return null;
  }
}

/**
 * Stores a value in transient storage with automatic expiry.
 *
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export async function setTransientStorage(key, value, ttl) {
  try {
    const expiry = Date.now() + ttl;
    await chrome.storage.local.set({
      [key]: {
        type: "transient",
        value,
        expiry,
      }
    });
    Utils.log(Constants.STORAGE_TRANSIENT_SET_LOG, key);
    await this.saveCacheInfo();
  } catch (error) {
    Utils.log(Constants.GENERAL_ERROR_LOG, error);
  }
}

/**
 * Calculates current cache information including count and size of stored lyrics.
 *
 * @returns {Promise<{count: number, size: number}>} Cache statistics
 */
export async function getUpdatedCacheInfo() {
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
    Utils.log(Constants.GENERAL_ERROR_LOG, error);
    return {count: 0, size: 0};
  }
}

/**
 * Updates and saves current cache information to sync storage.
 */
export async function saveCacheInfo() {
  const cacheInfo = await this.getUpdatedCacheInfo();
  await chrome.storage.sync.set({cacheInfo: cacheInfo});
}

/**
 * Clears all cached lyrics data from local storage.
 */
export async function clearCache() {
  try {
    const result = await chrome.storage.local.get(null);
    const lyricsKeys = Object.keys(result).filter(key => key.startsWith("blyrics_"));
    await chrome.storage.local.remove(lyricsKeys);
    await this.saveCacheInfo();
  } catch (error) {
    Utils.log(Constants.GENERAL_ERROR_LOG, error);
  }
}

/**
 * Removes expired cache entries from local storage.
 * Scans all BetterLyrics cache keys and removes those past their expiry time.
 */
export async function purgeExpiredKeys() {
  try {
    const now = Date.now();
    const result = await chrome.storage.local.get(null);
    const keysToRemove = [];

    Object.keys(result).forEach(key => {
      if (key.startsWith("blyrics_")) {
        const {expiryTime} = result[key];
        if (expiryTime && now >= expiryTime) {
          keysToRemove.push(key);
        }
      }
    });

    if (keysToRemove.length) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch (error) {
    Utils.log(Constants.GENERAL_ERROR_LOG, error);
  }
}
