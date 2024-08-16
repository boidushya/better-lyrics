BetterLyrics.Settings = {
  handleSettings: function () {
    BetterLyrics.Settings.onFullScreenDisabled(() => {
      const layout = document.getElementById("layout");
      const playerPage = document.getElementById("player-page");

      if (layout && playerPage) {
        layout.setAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR, "");
        playerPage.setAttribute(BetterLyrics.Constants.LYRICS_DISABLED_ATTR, "");
      }
    });

    BetterLyrics.Settings.onStylizedAnimationsEnabled(() => {
      const layout = document.getElementById("layout");
      const playerPage = document.getElementById("player-page");
      const appBase = document.getElementsByTagName("ytmusic-app")[0];

      if (layout && playerPage) {
        layout.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
        playerPage.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
        appBase.setAttribute(BetterLyrics.Constants.LYRICS_STYLIZED_ATTR, "");
      }
    });
  },

  onAutoSwitchEnabled: function (callback) {
    BetterLyrics.Storage.getStorage({ isAutoSwitchEnabled: false }, items => {
      if (items.isAutoSwitchEnabled) {
        callback();
      }
    });
  },

  onFullScreenDisabled: function (callback) {
    BetterLyrics.Storage.getStorage({ isFullScreenDisabled: false }, items => {
      if (items.isFullScreenDisabled) {
        callback();
      }
    });
  },

  onAlbumArtEnabled: function (callback) {
    BetterLyrics.Storage.getStorage({ isAlbumArtEnabled: true }, items => {
      if (items.isAlbumArtEnabled) {
        callback();
      }
    });
  },

  onStylizedAnimationsEnabled: function (callback) {
    BetterLyrics.Storage.getStorage({ isStylizedAnimationsEnabled: true }, items => {
      if (items.isStylizedAnimationsEnabled) {
        callback();
      }
    });
  },

  onAutoHideCursor: function (callback) {
    BetterLyrics.Storage.getStorage({ isCursorAutoHideEnabled: true }, items => {
      if (items.isCursorAutoHideEnabled) {
        callback();
      }
    });
  },

  hideCursorOnIdle: function () {
    BetterLyrics.Settings.onAutoHideCursor(() => {
      let mouseTimer = null,
        cursorVisible = true;

      function disappearCursor() {
        mouseTimer = null;
        document.getElementById("layout").setAttribute("cursor-hidden", "");
        cursorVisible = false;
      }

      document.onmousemove = function () {
        if (mouseTimer) {
          window.clearTimeout(mouseTimer);
        }
        if (!cursorVisible) {
          document.getElementById("layout").removeAttribute("cursor-hidden");
          cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
      };
    });
  },

  listenForPopupMessages: function () {
    chrome.runtime.onMessage.addListener(request => {
      if (request.action === "updateCSS") {
        BetterLyrics.Utils.applyCustomCSS(request.css);
      }
    });
  },
};
