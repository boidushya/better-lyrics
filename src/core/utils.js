/**
 * Utility functions for the BetterLyrics extension.
 * Provides logging, time conversion, text processing, and CSS management utilities.
 *
 * @namespace BetterLyrics.Utils
 */
BetterLyrics.Utils = {
  /**
   * Conditionally logs messages based on the isLogsEnabled setting.
   *
   * @param {...*} message - Messages to log to the console
   */
  log: function (...message) {
    BetterLyrics.Storage.getStorage({ isLogsEnabled: true }, items => {
      if (items.isLogsEnabled) {
        console.log(...message);
      }
    });
  },

  /**
   * Configures the logging function based on user settings.
   * Binds console.log or creates a no-op function depending on isLogsEnabled setting.
   */
  setUpLog: function () {
    BetterLyrics.Storage.getStorage({ isLogsEnabled: true }, items => {
      if (items.isLogsEnabled) {
        BetterLyrics.Utils.log = console.log.bind(window.console);
      } else {
        BetterLyrics.Utils.log = function () {};
      }
    });
  },

  /**
   * Converts time string in MM:SS format to total seconds.
   *
   * @param {string} time - Time string in "MM:SS" format
   * @returns {number} Total time in seconds
   */
  timeToInt: function (time) {
    time = time.split(":");
    time = parseFloat(time[0]) * 60 + parseFloat(time[1]);
    return time;
  },

  /**
   * Unescapes HTML entities in a string.
   * Converts &amp;, &lt;, and &gt; back to their original characters.
   *
   * @param {string} str - String containing HTML entities
   * @returns {string} String with unescaped characters
   */
  unEntity: function (str) {
    return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  },

  /**
   * Applies custom CSS to the page by creating or updating a style tag.
   *
   * @param {string} css - CSS content to apply
   */
  applyCustomCSS: function (css) {
    let styleTag = document.getElementById("blyrics-custom-style");
    if (styleTag) {
      styleTag.textContent = css;
    } else {
      styleTag = document.createElement("style");
      styleTag.id = "blyrics-custom-style";
      styleTag.textContent = css;
      document.head.appendChild(styleTag);
    }
  },

  /**
   * Convert duration to milliseconds. If value looks like seconds (< 1000), multiply by 1000.
   * Returns 0 if value is invalid.
   */
  toMs: function (value) {
    const n = Number(value);
    if (!isFinite(n) || isNaN(n)) return 0;
    return n < 1000 ? Math.round(n * 1000) : Math.round(n);
  },

  /**
   * Fetch with timeout using AbortController. Works across browsers without AbortSignal.timeout.
   *
   * @param {string|URL} url
   * @param {Object} [options]
   * @param {number} [timeoutMs=10000]
   * @returns {Promise<Response>}
   */
  fetchWithTimeout: function (url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => {
      try { controller.abort(); } catch (_e) {}
    }, timeoutMs);
    const opts = Object.assign({}, options, { signal: controller.signal });
    return fetch(url, opts)
      .finally(() => clearTimeout(id));
  },

  /**
   * Fetch JSON helper with timeout. Returns null on network/parse error or non-ok response.
   *
   * @param {string|URL} url
   * @param {Object} [options]
   * @param {number} [timeoutMs=10000]
   * @returns {Promise<any|null>}
   */
  fetchJSON: async function (url, options = {}, timeoutMs = 10000) {
    try {
      const res = await BetterLyrics.Utils.fetchWithTimeout(url, options, timeoutMs);
      if (!res || !res.ok) return null;
      return await res.json();
    } catch (_e) {
      return null;
    }
  },
};
