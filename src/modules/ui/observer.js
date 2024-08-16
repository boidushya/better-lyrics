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

  observeSongChanges: function () {
    let song = {
      title: "",
      artist: "",
    };
    let targetNode = document.getElementsByClassName(BetterLyrics.Constants.TITLE_CLASS)[0];
    let config = {
      attributes: true,
      childList: true,
    };

    let callback = function (mutationsList) {
      for (let mutation of mutationsList) {
        if (mutation.type == "attributes") {
          if (
            song.title !== targetNode.innerHTML &&
            !targetNode.innerHTML.startsWith("<!--") &&
            targetNode.innerHTML !== ""
          ) {
            BetterLyrics.Utils.log(BetterLyrics.Constants.SONG_SWITCHED_LOG, targetNode.innerHTML);
            song.title = targetNode.innerHTML;
            BetterLyrics.Settings.onAlbumArtEnabled(BetterLyrics.DOM.addAlbumArtToLayout);

            const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
            if (tabSelector.getAttribute("aria-selected") === "true") {
              BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_VISIBLE_LOG);
              BetterLyrics.App.handleModifications();
            } else {
              BetterLyrics.Settings.onAutoSwitchEnabled(() => {
                tabSelector.click();
                BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
                BetterLyrics.App.handleModifications();
              });

              BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_HIDDEN_LOG);
            }
          }
        }
      }
    };

    let observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  },

  lyricReloader: function () {
    const tabs = document.getElementsByClassName(BetterLyrics.Constants.TAB_CONTENT_CLASS);

    const [tab1, tab2, tab3] = tabs;

    if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
      tab2.addEventListener("click", function () {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_CLICKED_LOG);
        BetterLyrics.App.handleModifications();
      });
    } else {
      setTimeout(() => BetterLyrics.Observer.lyricReloader(), 1000);
    }
  },
};
