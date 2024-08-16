BetterLyrics.App = {
  lang: "en",
  lyricsCheckInterval: null,

  modify: function () {
    BetterLyrics.DOM.injectGetSongInfo();
    BetterLyrics.DOM.injectHeadTags();
    BetterLyrics.Observer.enableLyricsTab();
    BetterLyrics.Settings.hideCursorOnIdle();
    BetterLyrics.Settings.handleSettings();
    BetterLyrics.Storage.subscribeToCustomCSS();
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
    setTimeout(() => {
      BetterLyrics.Lyrics.createLyrics();
    }, 1000);
  },

  init: function () {
    try {
      if (document.readyState !== "loading") {
        BetterLyrics.App.modify();
      } else {
        document.addEventListener("DOMContentLoaded", this.modify.bind(this));
      }
    } catch (err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, err);
    }
  },
};

BetterLyrics.App.init();
