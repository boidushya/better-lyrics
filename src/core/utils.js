/**
 * Utility functions for the BetterLyrics extension.
 * Provides logging, time conversion, text processing, and CSS management utilities.
 */

import {getStorage} from "./storage";

/**
 * Conditionally logs messages based on the isLogsEnabled setting.
 *
 * @param {...*} message - Messages to log to the console
 */
export function log(...message) {
  getStorage({isLogsEnabled: true}, items => {
    if (items.isLogsEnabled) {
      console.log(...message);
    }
  });
}

/**
 * Configures the logging function based on user settings.
 * Binds console.log or creates a no-op function depending on isLogsEnabled setting.
 */
export function setUpLog() {
  getStorage({isLogsEnabled: true}, items => {
    if (items.isLogsEnabled) {
      log = console.log.bind(window.console);
    } else {
      log = function () {
      };
    }
  });
}

/**
 * Converts time string in MM:SS format to total seconds.
 *
 * @param {string} time - Time string in "MM:SS" format
 * @returns {number} Total time in seconds
 */
export function timeToInt(time) {
  time = time.split(":");
  time = parseFloat(time[0]) * 60 + parseFloat(time[1]);
  return time;
}

/**
 * Unescapes HTML entities in a string.
 * Converts &amp;, &lt;, and &gt; back to their original characters.
 *
 * @param {string} str - String containing HTML entities
 * @returns {string} String with unescaped characters
 */
export function unEntity(str) {
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/**
 * Applies custom CSS to the page by creating or updating a style tag.
 *
 * @param {string} css - CSS content to apply
 */
export function applyCustomCSS(css) {
  let styleTag = document.getElementById("blyrics-custom-style");
  if (styleTag) {
    styleTag.textContent = css;
  } else {
    styleTag = document.createElement("style");
    styleTag.id = "blyrics-custom-style";
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  }
}

