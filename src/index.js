BetterLyrics.App = {
  lang: "en",
  areLyricsTicking: false,
  lastVideo: null,
  lyricInjectionPromise: null,

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

  handleModifications: function (song, artist) {
    if (BetterLyrics.App.lyricInjectionPromise) {
      BetterLyrics.App.lyricInjectionPromise.then(() => {
        // wait until the prev request finishes, then reru
        BetterLyrics.App.lyricInjectionPromise = null;
        BetterLyrics.App.handleModifications(song, artist);
      })
    } else {
      BetterLyrics.DOM.cleanup();
      BetterLyrics.DOM.renderLoader();
      BetterLyrics.DOM.scrollToTop();
      BetterLyrics.App.lyricInjectionPromise = BetterLyrics.Lyrics.createLyrics(song, artist);
    }
  },

  reloadLyrics() {
    BetterLyrics.App.lastVideo = null;
  },

  init: function () {
    try {
      if (document.readyState !== "loading") {
        BetterLyrics.App.modify();
        document.addEventListener("blyrics-send-player-time", function (event) {
          let detail = event.detail;
          BetterLyrics.DOM.tickLyrics(detail.currentTime);

          // Video ID can change before the song & artist are available; also encode them, so we listen to when they change
          // If the song and artist are available it seems to be safe to inject our lyrics w/o any sort of delay
          let currentVideo = detail.videoId + " " + detail.song + " " + detail.artist;

          if (currentVideo !== BetterLyrics.App.lastVideo) {
            BetterLyrics.App.lastVideo = currentVideo;

            if (!detail.song || !detail.artist) {
              return;
            }

            let targetNode = document.getElementsByClassName(BetterLyrics.Constants.TITLE_CLASS)[0];

            BetterLyrics.Utils.log(BetterLyrics.Constants.SONG_SWITCHED_LOG, targetNode.innerHTML);
            BetterLyrics.Settings.onAlbumArtEnabled(
                BetterLyrics.DOM.addAlbumArtToLayout,
                BetterLyrics.DOM.removeAlbumArtFromLayout
            );

            const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
            if (tabSelector.getAttribute("aria-selected") === "true") {
              BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_VISIBLE_LOG);
              BetterLyrics.App.handleModifications(detail.song, detail.artist);
            } else {
              BetterLyrics.Settings.onAutoSwitchEnabled(() => {
                tabSelector.click();
                BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
                BetterLyrics.App.handleModifications(detail.song, detail.artist);
              });

              BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_HIDDEN_LOG);
            }
          }
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
