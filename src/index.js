BetterLyrics.App = {
  lang: "en",
  areLyricsTicking: false,
  areLyricsLoaded: false,
  lyricInjectionFailed: false,
  lastVideoId: null,
  lastVideoDetails: null,
  lyricInjectionPromise: null,
  queueLyricInjection: false,
  queueAlbumArtInjection: false,
  shouldInjectAlbumArt: "Unknown",
  queueSongDetailsInjection: false,
  loaderAnimationEndTimeout: null,
  requestCache: null,

  modify: function () {
    BetterLyrics.Utils.setUpLog();
    BetterLyrics.DOM.injectHeadTags();
    BetterLyrics.Observer.enableLyricsTab();
    BetterLyrics.Settings.hideCursorOnIdle();
    BetterLyrics.Settings.handleSettings();
    BetterLyrics.Storage.subscribeToCustomCSS();
    BetterLyrics.Storage.purgeExpiredKeys();
    BetterLyrics.Storage.saveCacheInfo();
    BetterLyrics.Settings.listenForPopupMessages();
    BetterLyrics.Observer.lyricReloader();
    BetterLyrics.Observer.initializeLyrics();
    BetterLyrics.LyricProviders.initProviders();

    BetterLyrics.Utils.log(
      BetterLyrics.Constants.INITIALIZE_LOG,
      "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
    );

    BetterLyrics.Settings.onAlbumArtEnabled(
      () => (BetterLyrics.App.shouldInjectAlbumArt = true),
      () => (BetterLyrics.App.shouldInjectAlbumArt = false)
    );
  },

  handleModifications: function (detail) {
    if (BetterLyrics.App.lyricInjectionPromise) {
      BetterLyrics.App.lyricInjectionPromise.then(() => {
        BetterLyrics.App.lyricInjectionPromise = null;
        BetterLyrics.App.handleModifications(detail);
      });
    } else {
      BetterLyrics.App.lyricInjectionPromise = BetterLyrics.Lyrics.createLyrics(detail)
        .then(() => {
          return BetterLyrics.DOM.tickLyrics(detail.currentTime, detail.playing);
        })
        .catch(err => {
          BetterLyrics.Utils.log(BetterLyrics.App.GENERAL_ERROR_LOG, err);
          BetterLyrics.App.areLyricsLoaded = false;
          BetterLyrics.App.lyricInjectionFailed = true;
        });
    }
  },

  reloadLyrics() {
    BetterLyrics.App.lastVideoId = null;
  },

  init: function () {
    document.addEventListener("DOMContentLoaded", BetterLyrics.App.modify);
  },
};

// Initialize the application
BetterLyrics.App.init();

BetterLyrics.DOM.injectGetSongInfo();
BetterLyrics.RequestSniffing.setupRequestSniffer();
