BetterLyrics.Settings = {
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
        const layout = document.getElementById("layout");
        const playerPage = document.getElementById("player-page");
        const appBase = document.getElementsByTagName("ytmusic-app")[0];

        if (layout && playerPage) {
          layout.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
          playerPage.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
          appBase.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
        }
      },
      () => {
        const layout = document.getElementById("layout");
        const playerPage = document.getElementById("player-page");
        const appBase = document.getElementsByTagName("ytmusic-app")[0];

        if (layout && playerPage) {
          layout.removeAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR);
          playerPage.removeAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR);
          appBase.removeAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR);
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
        BetterLyrics.Utils.applyCustomCSS(request.css);
      } else if (request.action === "updateSettings") {
        BetterLyrics.Utils.setUpLog();
        BetterLyrics.Settings.hideCursorOnIdle();
        BetterLyrics.Settings.handleSettings();
        BetterLyrics.App.shouldInjectAlbumArt = "Unknown"
        BetterLyrics.Settings.onAlbumArtEnabled(
            () => BetterLyrics.App.shouldInjectAlbumArt = true,
            () => {
              BetterLyrics.App.shouldInjectAlbumArt = false;
              BetterLyrics.DOM.removeAlbumArtFromLayout();
            }
        );
        BetterLyrics.App.reloadLyrics();
      } else if (request.action === "clearCache") {
        try {
          BetterLyrics.Storage.clearCache();
          sendResponse({ success: true });
        } catch {
          sendResponse({ success: false });
        }
      }
    });
  },
};
