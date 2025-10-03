import * as DOM from "../ui/dom";
import * as Constants from "../../core/constants";
import * as Utils from "../../core/utils";
import * as Translation from "../lyrics/translation";
import * as Storage from "../../core/storage"
import * as BetterLyrics from "../../index"

/**
 * Handles settings initialization and applies user preferences.
 * Sets up fullscreen behavior, animations, and other settings.
 */
export function handleSettings() {
  this.onFullScreenDisabled(
    () => {
      const layout = document.getElementById("layout");
      const playerPage = document.getElementById("player-page");

      if (layout && playerPage) {
        layout.setAttribute(Constants.LYRICS_DISABLED_ATTR, "");
        playerPage.setAttribute(Constants.LYRICS_DISABLED_ATTR, "");
      }
    },
    () => {
      const layout = document.getElementById("layout");
      const playerPage = document.getElementById("player-page");

      if (layout && playerPage) {
        layout.removeAttribute(Constants.LYRICS_DISABLED_ATTR);
        playerPage.removeAttribute(Constants.LYRICS_DISABLED_ATTR);
      }
    }
  );

  this.onStylizedAnimationsEnabled(
    () => {
      let styleElm = document.getElementById("blyrics-disable-effects");
      if (styleElm) {
        styleElm.remove();
      }
    },
    async () => {
      let styleElem = document.getElementById("blyrics-disable-effects");
      if (!styleElem) {
        styleElem = document.createElement("style");
        styleElem.id = "blyrics-disable-effects";

        styleElem.textContent = await fetch(chrome.runtime.getURL("src/css/disablestylizedanimations.css")).then(
          res => res.text()
        );
        document.head.appendChild(styleElem);
      }
    }
  );
}

export function onAutoSwitchEnabled(enableAutoSwitch) {
  Storage.getStorage({isAutoSwitchEnabled: false}, items => {
    if (items.isAutoSwitchEnabled) {
      enableAutoSwitch();
    }
  });
}

export function onFullScreenDisabled(disableFullScreen, enableFullScreen) {
  Storage.getStorage({isFullScreenDisabled: false}, items => {
    if (items.isFullScreenDisabled) {
      disableFullScreen();
    } else {
      enableFullScreen();
    }
  });
}

export function onAlbumArtEnabled(enableAlbumArt, disableAlbumArt) {
  Storage.getStorage({isAlbumArtEnabled: true}, items => {
    if (items.isAlbumArtEnabled) {
      enableAlbumArt();
    } else {
      disableAlbumArt();
    }
  });
}

export function onStylizedAnimationsEnabled(enableAnimations, disableAnimations) {
  Storage.getStorage({isStylizedAnimationsEnabled: true}, items => {
    if (items.isStylizedAnimationsEnabled) {
      enableAnimations();
    } else {
      disableAnimations();
    }
  });
}

export function onAutoHideCursor(enableCursorAutoHide, disableCursorAutoHide) {
  Storage.getStorage({isCursorAutoHideEnabled: true}, items => {
    if (items.isCursorAutoHideEnabled) {
      enableCursorAutoHide();
    } else {
      disableCursorAutoHide();
    }
  });
}

let mouseTimer = null;
let cursorEventListener = null;

export function hideCursorOnIdle() {
  this.onAutoHideCursor(
    () => {
      let cursorVisible = true;

      function disappearCursor() {
        mouseTimer = null;
        document.getElementById("layout").setAttribute("cursor-hidden", "");
        cursorVisible = false;
      }

      function handleMouseMove() {
        if (mouseTimer) {
          window.clearTimeout(mouseTimer);
        }
        if (!cursorVisible) {
          document.getElementById("layout").removeAttribute("cursor-hidden");
          cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
      }

      if (cursorEventListener) {
        document.removeEventListener("mousemove", cursorEventListener);
      }

      cursorEventListener = handleMouseMove;
      document.addEventListener("mousemove", handleMouseMove);
    },
    () => {
      if (mouseTimer) {
        window.clearTimeout(mouseTimer);
      }
      document.getElementById("layout").removeAttribute("cursor-hidden");
      if (cursorEventListener) {
        document.removeEventListener("mousemove", cursorEventListener);
        cursorEventListener = null;
      }
    }
  );
}

export function listenForPopupMessages() {
  chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "updateCSS") {
      // Enhanced CSS handling - use the new loadCustomCSS method
      if (request.css) {
        // Direct CSS provided (from editor)
        Utils.applyCustomCSS(request.css);
      } else {
        // Load CSS from storage (hybrid storage support)
        Storage.getAndApplyCustomCSS();
      }
    } else if (request.action === "updateSettings") {
      Translation.clearCache();
      Utils.setUpLog();
      this.hideCursorOnIdle();
      this.handleSettings();
      BetterLyrics.shouldInjectAlbumArt = "Unknown";
      this.onAlbumArtEnabled(
        () => (BetterLyrics.shouldInjectAlbumArt = true),
        () => {
          BetterLyrics.shouldInjectAlbumArt = false;
          DOM.removeAlbumArtFromLayout();
        }
      );
      BetterLyrics.reloadLyrics();
    } else if (request.action === "clearCache") {
      try {
        Storage.clearCache();
        BetterLyrics.reloadLyrics();

        sendResponse({success: true});
      } catch {
        sendResponse({success: false});
      }
    }
  });
}

