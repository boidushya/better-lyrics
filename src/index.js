BetterLyrics.App = {
  lang: "en",
  areLyricsTicking: false,

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
    BetterLyrics.Observer.observeSongChanges();
    BetterLyrics.Observer.lyricReloader();

    BetterLyrics.Utils.log(
      BetterLyrics.Constants.INITIALIZE_LOG,
      "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
    );
  },

  handleModifications: function () {
    BetterLyrics.DOM.cleanup();
    BetterLyrics.DOM.renderLoader();
    BetterLyrics.DOM.scrollToTop();
    setTimeout(() => {
      BetterLyrics.Lyrics.createLyrics();
    }, 1000);
  },

  init: function () {
    try {
      if (document.readyState !== "loading") {
        BetterLyrics.App.modify();
        document.addEventListener("blyrics-send-player-time", function (event) {
          BetterLyrics.DOM.tickLyrics(event.detail.currentTime);
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
