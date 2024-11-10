BetterLyrics.App = {
  lang: "en",
  areLyricsTicking: false,
  areLyricsLoaded: false,
  lastVideoId: null,
  lastVideoDetails: null,
  lyricInjectionPromise: null,
  queueLyricInjection: false,

  modify: function () {
    BetterLyrics.DOM.injectGetSongInfo();
    BetterLyrics.DOM.injectHeadTags();
    BetterLyrics.Observer.enableLyricsTab();
    BetterLyrics.Settings.hideCursorOnIdle();
    BetterLyrics.Settings.handleSettings();
    BetterLyrics.Storage.subscribeToCustomCSS();
    BetterLyrics.Storage.purgeExpiredKeys();
    BetterLyrics.Storage.saveCacheInfo();
    BetterLyrics.Settings.listenForPopupMessages();
    BetterLyrics.Observer.lyricReloader();

    BetterLyrics.Utils.log(
      BetterLyrics.Constants.INITIALIZE_LOG,
      "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
    );
  },

  handleModifications: function (song, artist, currentTime, videoId) {
    if (BetterLyrics.App.lyricInjectionPromise) {
      BetterLyrics.App.lyricInjectionPromise.then(() => {
        // wait until the prev request finishes, then reru
        BetterLyrics.App.lyricInjectionPromise = null;
        BetterLyrics.App.handleModifications(song, artist, currentTime, videoId);
      });
    } else {
      BetterLyrics.App.lyricInjectionPromise = BetterLyrics.Lyrics.createLyrics(song, artist, videoId)
        .then(() => BetterLyrics.DOM.tickLyrics(currentTime))
        .then(() => console.log("finished loading"));
    }
  },

  reloadLyrics() {
    BetterLyrics.App.lastVideoId = null;
  },

  init: function () {
    try {
      if (document.readyState !== "loading") {
        BetterLyrics.App.modify();
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

            BetterLyrics.Settings.onAlbumArtEnabled(
              BetterLyrics.DOM.addAlbumArtToLayout,
              BetterLyrics.DOM.removeAlbumArtFromLayout
            );
          }

          if (BetterLyrics.App.queueLyricInjection){
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
      } else {
        document.addEventListener("DOMContentLoaded", this.modify.bind(this));
      }
    } catch (err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, err);
    }
  },
};

BetterLyrics.App.init();
