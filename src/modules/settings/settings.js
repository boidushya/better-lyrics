/**
 * Settings management for the BetterLyrics extension.
 * Handles user preferences and their application to the UI.
 *
 * @namespace BetterLyrics.Settings
 */
BetterLyrics.Settings = {
  /**
   * Handles settings initialization and applies user preferences.
   * Sets up fullscreen behavior, animations, and other settings.
   */
  handleSettings: function () {
    BetterLyrics.Settings.onFullScreenDisabled(
      () => {
        const layout = document.getElementById("layout");
        const playerPage = document.getElementById("player-page");

        if (layout && playerPage) {
          layout.setAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR, "");
          playerPage.setAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR, "");
        }
      },
      () => {
        const layout = document.getElementById("layout");
        const playerPage = document.getElementById("player-page");

        if (layout && playerPage) {
          layout.removeAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR);
          playerPage.removeAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR);
        }
      }
    );

    BetterLyrics.Settings.onStylizedAnimationsEnabled(
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
  },

  onAutoSwitchEnabled: function (enableAutoSwitch) {
    BetterLyrics.Storage.getStorage({ isAutoSwitchEnabled: false }, items => {
      if (items.isAutoSwitchEnabled) {
        enableAutoSwitch();
      }
    });
  },

  onFullScreenDisabled: function (disableFullScreen, enableFullScreen) {
    BetterLyrics.Storage.getStorage({ isFullScreenDisabled: false }, items => {
      if (items.isFullScreenDisabled) {
        disableFullScreen();
      } else {
        enableFullScreen();
      }
    });
  },

  onAlbumArtEnabled: function (enableAlbumArt, disableAlbumArt) {
    BetterLyrics.Storage.getStorage({ isAlbumArtEnabled: true }, items => {
      if (items.isAlbumArtEnabled) {
        enableAlbumArt();
      } else {
        disableAlbumArt();
      }
    });
  },

  onStylizedAnimationsEnabled: function (enableAnimations, disableAnimations) {
    BetterLyrics.Storage.getStorage({ isStylizedAnimationsEnabled: true }, items => {
      if (items.isStylizedAnimationsEnabled) {
        enableAnimations();
      } else {
        disableAnimations();
      }
    });
  },

  onAutoHideCursor: function (enableCursorAutoHide, disableCursorAutoHide) {
    BetterLyrics.Storage.getStorage({ isCursorAutoHideEnabled: true }, items => {
      if (items.isCursorAutoHideEnabled) {
        enableCursorAutoHide();
      } else {
        disableCursorAutoHide();
      }
    });
  },

  mouseTimer: null,
  cursorEventListener: null,
  hideCursorOnIdle: function () {
    BetterLyrics.Settings.onAutoHideCursor(
      () => {
        let cursorVisible = true;

        function disappearCursor() {
          this.mouseTimer = null;
          document.getElementById("layout").setAttribute("cursor-hidden", "");
          cursorVisible = false;
        }

        function handleMouseMove() {
          if (BetterLyrics.Settings.mouseTimer) {
            window.clearTimeout(BetterLyrics.Settings.mouseTimer);
          }
          if (!cursorVisible) {
            document.getElementById("layout").removeAttribute("cursor-hidden");
            cursorVisible = true;
          }
          BetterLyrics.Settings.mouseTimer = window.setTimeout(disappearCursor, 3000);
        }

        if (BetterLyrics.Settings.cursorEventListener) {
          document.removeEventListener("mousemove", BetterLyrics.Settings.cursorEventListener);
        }

        BetterLyrics.Settings.cursorEventListener = handleMouseMove;
        document.addEventListener("mousemove", handleMouseMove);
      },
      () => {
        if (BetterLyrics.Settings.mouseTimer) {
          window.clearTimeout(BetterLyrics.Settings.mouseTimer);
        }
        document.getElementById("layout").removeAttribute("cursor-hidden");
        if (BetterLyrics.Settings.cursorEventListener) {
          document.removeEventListener("mousemove", BetterLyrics.Settings.cursorEventListener);
          BetterLyrics.Settings.cursorEventListener = null;
        }
      }
    );
  },

  listenForPopupMessages: function () {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.action === "updateCSS") {
        // Enhanced CSS handling - use the new loadCustomCSS method
        if (request.css) {
          // Direct CSS provided (from editor)
          BetterLyrics.Utils.applyCustomCSS(request.css);
        } else {
          // Load CSS from storage (hybrid storage support)
          BetterLyrics.Storage.loadCustomCSS()
            .then(css => {
              if (css) {
                BetterLyrics.Utils.applyCustomCSS(css);
              }
            })
            .catch(error => {
              console.error("[BetterLyrics] Error loading CSS:", error);
            });
        }
      } else if (request.action === "updateSettings") {
        BetterLyrics.Translation.clearCache();
        BetterLyrics.Utils.setUpLog();
        BetterLyrics.Settings.hideCursorOnIdle();
        BetterLyrics.Settings.handleSettings();
        BetterLyrics.App.shouldInjectAlbumArt = "Unknown";
        BetterLyrics.Settings.onAlbumArtEnabled(
          () => (BetterLyrics.App.shouldInjectAlbumArt = true),
          () => {
            BetterLyrics.App.shouldInjectAlbumArt = false;
            BetterLyrics.DOM.removeAlbumArtFromLayout();
          }
        );
        BetterLyrics.App.reloadLyrics();
      } else if (request.action === "clearCache") {
        try {
          BetterLyrics.Storage.clearCache();
          BetterLyrics.App.reloadLyrics();

          sendResponse({ success: true });
        } catch {
          sendResponse({ success: false });
        }
      }
    });
  },
};
