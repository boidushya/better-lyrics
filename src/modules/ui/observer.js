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
      BetterLyrics.Settings.onAutoSwitchEnabled(() => {
        tabSelector.click();
        BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
      });
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
  },

  lyricReloader: function () {
    const tabs = document.getElementsByClassName(BetterLyrics.Constants.TAB_CONTENT_CLASS);

    const [tab1, tab2, tab3] = tabs;

    if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
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
  initializeLyrics: function () {
    document.addEventListener("blyrics-send-player-time", function (event) {
      let detail = event.detail;

      let currentVideoId = detail.videoId;
      let currentVideoDetails = detail.song + " " + detail.artist;

      if (
        currentVideoId !== BetterLyrics.App.lastVideoId ||
        currentVideoDetails !== BetterLyrics.App.lastVideoDetails
      ) {
        try {
          if (currentVideoId === BetterLyrics.App.lastVideoId && BetterLyrics.App.areLyricsTicking) {
            console.log(BetterLyrics.Constants.SKIPPING_LOAD_WITH_META);
            return; // We already loaded this video
          }
        } finally {
          BetterLyrics.App.lastVideoId = currentVideoId;
          BetterLyrics.App.lastVideoDetails = currentVideoDetails;
        }

        if (!detail.song || !detail.artist) {
          console.log(BetterLyrics.Constants.LOADING_WITHOUT_SONG_META);
        }

        BetterLyrics.Utils.log(BetterLyrics.Constants.SONG_SWITCHED_LOG, detail.videoId);
        BetterLyrics.App.areLyricsTicking = false;
        BetterLyrics.App.areLyricsLoaded = false;

        BetterLyrics.App.queueLyricInjection = true;
        BetterLyrics.App.queueAlbumArtInjection = true;
        BetterLyrics.App.queueSongDetailsInjection = true;
      }

      if (BetterLyrics.App.queueSongDetailsInjection
          && detail.song && detail.artist
          && document.getElementById("main-panel")) {
        BetterLyrics.App.queueSongDetailsInjection = false;
        BetterLyrics.DOM.injectSongAttributes(detail.song, detail.artist);
      }

      if (BetterLyrics.App.queueAlbumArtInjection === true && BetterLyrics.App.shouldInjectAlbumArt === true) {
        BetterLyrics.App.queueAlbumArtInjection = false;
        BetterLyrics.DOM.addAlbumArtToLayout(detail.videoId);
      }

      if (BetterLyrics.App.queueLyricInjection) {
        const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector) {
          BetterLyrics.App.queueLyricInjection = false;
          if (tabSelector.getAttribute("aria-selected") === "true") {
            BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_VISIBLE_LOG);
            BetterLyrics.App.handleModifications(detail.song, detail.artist, detail.currentTime, detail.videoId);
          } else {
            BetterLyrics.Settings.onAutoSwitchEnabled(() => {
              tabSelector.click();
              BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
              BetterLyrics.App.handleModifications(detail.song, detail.artist, detail.currentTime, detail.videoId);
            });

            BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_HIDDEN_LOG);
          }
        }
      }

      BetterLyrics.DOM.tickLyrics(detail.currentTime);
    });
  },
};
