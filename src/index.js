BetterLyrics.App = {
  lang: "en",
  areLyricsTicking: false,
  areLyricsLoaded: false,
  lastVideoId: null,
  lastVideoDetails: null,
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
    BetterLyrics.Observer.lyricsInitialize();

    BetterLyrics.Utils.log(
      BetterLyrics.Constants.INITIALIZE_LOG,
      "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
    );
  },

  handleModifications: function (song, artist, currentTime, videoId) {
    if (!song || !artist || !videoId) return;

    if (BetterLyrics.App.lyricInjectionPromise) {
      BetterLyrics.App.lyricInjectionPromise
        .then(() => {
          BetterLyrics.App.lyricInjectionPromise = null;
          BetterLyrics.App.handleModifications(song, artist, currentTime, videoId);
        })
        .catch(err => {
          BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, err);
          BetterLyrics.App.lyricInjectionPromise = null;
        });
    } else {
      BetterLyrics.App.lyricInjectionPromise = BetterLyrics.Lyrics.createLyrics(song, artist, videoId)
        .then(() => {
          BetterLyrics.App.areLyricsLoaded = true;
          return BetterLyrics.DOM.tickLyrics(currentTime);
        })
        .catch(err => {
          BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, err);
          BetterLyrics.App.areLyricsLoaded = false;
        });
    }
  },

  reloadLyrics() {
    BetterLyrics.App.lastVideoId = null;
    BetterLyrics.App.areLyricsLoaded = false;
    BetterLyrics.App.areLyricsTicking = false;
  },

  init: function () {
    try {
      if (document.readyState !== "loading") {
        BetterLyrics.App.modify();
      } else {
        document.addEventListener("DOMContentLoaded", BetterLyrics.App.modify);
      }
    } catch (err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, err);
    }
  },
};

// Initialize the application
BetterLyrics.App.init();
