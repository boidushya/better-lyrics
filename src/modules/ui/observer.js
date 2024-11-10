BetterLyrics.Observer = {
  enableLyricsTab: function () {
    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (!tabSelector) {
      setTimeout(() => {
        BetterLyrics.Observer.enableLyricsTab();
      }, 1000);
      return;
    }

    if (tabSelector.hasAttribute("disabled")) {
      tabSelector.removeAttribute("disabled");
      tabSelector.setAttribute("aria-disabled", "false");
    }

    let observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "disabled") {
          tabSelector.removeAttribute("disabled");
          tabSelector.setAttribute("aria-disabled", "false");
        }
      });
    });
    observer.observe(tabSelector, { attributes: true });

    BetterLyrics.Settings.onAutoSwitchEnabled(() => {
      BetterLyrics.Observer.performAutoSwitch();
      BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
    });
  },

  performAutoSwitch: function () {
    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (tabSelector) {
      tabSelector.click();
      setTimeout(() => {
        if (!BetterLyrics.App.areLyricsLoaded) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_CLICKED_LOG);
          BetterLyrics.DOM.cleanup();
          BetterLyrics.DOM.renderLoader();
          BetterLyrics.App.reloadLyrics();
          BetterLyrics.App.handleModifications(detail.song, detail.artist, detail.currentTime, detail.videoId);
        }
      }, 100);
    }
  },

  lyricReloader: function () {
    const tabs = document.getElementsByClassName(BetterLyrics.Constants.TAB_CONTENT_CLASS);

    if (tabs.length >= 3) {
      const tab2 = tabs[1];
      tab2.addEventListener("click", function () {
        if (!BetterLyrics.App.areLyricsLoaded) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_CLICKED_LOG);
          BetterLyrics.DOM.cleanup();
          BetterLyrics.DOM.renderLoader();
          BetterLyrics.App.reloadLyrics();
        }
      });
    } else {
      setTimeout(() => BetterLyrics.Observer.lyricReloader(), 1000);
    }
  },

  lyricsInitialize: function () {
    document.addEventListener("blyrics-send-player-time", function (event) {
      let detail = event.detail;
      if (!detail || !detail.videoId) return;

      let currentVideoId = detail.videoId;
      let currentVideoDetails = (detail.song || "") + " " + (detail.artist || "");

      const isNewVideo =
        currentVideoId !== BetterLyrics.App.lastVideoId || currentVideoDetails !== BetterLyrics.App.lastVideoDetails;

      if (isNewVideo) {
        if (currentVideoId === BetterLyrics.App.lastVideoId && BetterLyrics.App.areLyricsTicking) {
          console.log(BetterLyrics.Constants.SKIPPING_LOAD_WITH_META);
          return;
        }

        BetterLyrics.App.lastVideoId = currentVideoId;
        BetterLyrics.App.lastVideoDetails = currentVideoDetails;
        BetterLyrics.App.areLyricsTicking = false;
        BetterLyrics.App.areLyricsLoaded = false;

        if (!detail.song || !detail.artist) {
          console.log(BetterLyrics.Constants.LOADING_WITHOUT_SONG_META);
          return;
        }

        BetterLyrics.Utils.log(BetterLyrics.Constants.SONG_SWITCHED_LOG, detail.videoId);

        BetterLyrics.Settings.onAlbumArtEnabled(
          BetterLyrics.DOM.addAlbumArtToLayout,
          BetterLyrics.DOM.removeAlbumArtFromLayout
        );

        const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector) {
          if (tabSelector.getAttribute("aria-selected") === "true") {
            BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_VISIBLE_LOG);
            BetterLyrics.App.handleModifications(detail.song, detail.artist, detail.currentTime, detail.videoId);
          } else {
            BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_HIDDEN_LOG);
            BetterLyrics.Settings.onAutoSwitchEnabled(() => {
              BetterLyrics.Observer.performAutoSwitch();
              BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
              BetterLyrics.App.handleModifications(detail.song, detail.artist, detail.currentTime, detail.videoId);
            });
          }
        }
      }

      if (detail.currentTime !== undefined) {
        BetterLyrics.DOM.tickLyrics(detail.currentTime);
      }
    });
  },
};
