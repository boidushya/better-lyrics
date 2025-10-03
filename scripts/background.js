/**
 * Handles runtime messages from extension components.
 * Processes CSS updates for YouTube Music tabs and settings updates.
 *
 * @param {Object} request - The message request object
 * @param {string} request.action - The action type ('updateCSS' or 'updateSettings')
 * @param {string} [request.css] - CSS content for updateCSS action
 * @param {Object} [request.settings] - Settings object for updateSettings action
 * @returns {boolean} Returns true to indicate asynchronous response
 */
import {handleSettings} from "../src/modules/settings/settings";

chrome.runtime.onMessage.addListener(request => {
  if (request.action === "updateCSS") {
    chrome.tabs.query({url: "*://music.youtube.com/*"}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: "updateCSS", css: request.css}).catch(error => {
          console.log(`[BetterLyrics] (Safe to ignore) Error sending message to tab ${tab.id}:`, error);
        });
      });
    });
  } else if (request.action === "updateSettings") {
    handleSettings(request.settings);
  }
  return true;
});
