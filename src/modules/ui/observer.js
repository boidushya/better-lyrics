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
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_CLICKED_LOG);
        BetterLyrics.App.reloadLyrics();
      });
    } else {
      setTimeout(() => BetterLyrics.Observer.lyricReloader(), 1000);
    }
  },
};
