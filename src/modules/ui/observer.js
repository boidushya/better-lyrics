BetterLyrics.Observer = {
  enableLyricsTab: function () {
    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (!tabSelector) {
      setTimeout(() => {
        BetterLyrics.Observer.enableLyricsTab();
      }, 1000);
      return;
    }
    tabSelector.removeAttribute("disabled");
    tabSelector.setAttribute("aria-disabled", "false");
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
  disableInertWhenFullscreen: function () {
    let panelElem = document.getElementById("side-panel");
    if (!panelElem) {
      setTimeout(() => {
        BetterLyrics.Observer.disableInertWhenFullscreen();
      }, 1000);
      return;
    }
    let observer = new MutationObserver(function (mutations) {
      BetterLyrics.Settings.onFullScreenDisabled(
        () => {},
        () =>
          mutations.forEach(function (mutation) {
            if (mutation.attributeName === "inert") {
              // entering fullscreen mode
              mutation.target.removeAttribute("inert");
              const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
              if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
                // ensure lyrics tab is selected
                tabSelector.click();
              }
            }
          })
      );
    });
    observer.observe(panelElem, { attributes: true });
    panelElem.removeAttribute("inert");
  },

  currentTab: 0,
  scrollPositions: [0, 0, 0],
  lyricReloader: function () {
    const tabs = document.getElementsByClassName(BetterLyrics.Constants.TAB_CONTENT_CLASS);

    const [tab1, tab2, tab3] = tabs;

    if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", () => {
          console.log(BetterLyrics.Observer.currentTab, BetterLyrics.Observer.scrollPositions);
          const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
          BetterLyrics.Observer.scrollPositions[BetterLyrics.Observer.currentTab] = tabRenderer.scrollTop;
          tabRenderer.scrollTop = BetterLyrics.Observer.scrollPositions[i];
          BetterLyrics.Observer.currentTab = i;
          console.log(BetterLyrics.Observer.currentTab, BetterLyrics.Observer.scrollPositions);
        });
      }

      tab2.addEventListener("click", function () {
        BetterLyrics.DOM.getResumeScrollElement().classList.remove("blyrics-hidden");
        if (!BetterLyrics.App.areLyricsLoaded) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_CLICKED_LOG);
          BetterLyrics.DOM.cleanup();
          BetterLyrics.DOM.renderLoader();
          BetterLyrics.App.reloadLyrics();
        }
      });

      let hideAutoscrollResume = () => BetterLyrics.DOM.getResumeScrollElement().classList.add("blyrics-hidden");
      tab1.addEventListener("click", hideAutoscrollResume);
      tab3.addEventListener("click", hideAutoscrollResume);
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
          if (currentVideoId === BetterLyrics.App.lastVideoId && BetterLyrics.App.areLyricsLoaded) {
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

      if (
        BetterLyrics.App.queueSongDetailsInjection &&
        detail.song &&
        detail.artist &&
        document.getElementById("main-panel")
      ) {
        BetterLyrics.App.queueSongDetailsInjection = false;
        BetterLyrics.DOM.injectSongAttributes(detail.song, detail.artist);
      }

      if (BetterLyrics.App.queueAlbumArtInjection === true && BetterLyrics.App.shouldInjectAlbumArt === true) {
        BetterLyrics.App.queueAlbumArtInjection = false;
        BetterLyrics.DOM.addAlbumArtToLayout(currentVideoId);
      }

      if (BetterLyrics.App.lyricInjectionFailed) {
        const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
          BetterLyrics.App.lyricInjectionFailed = false; //ignore failure b/c the tab isn't visible
        }
      }

      if (BetterLyrics.App.queueLyricInjection || BetterLyrics.App.lyricInjectionFailed) {
        const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector) {
          BetterLyrics.App.queueLyricInjection = false;
          BetterLyrics.App.lyricInjectionFailed = false;
          if (tabSelector.getAttribute("aria-selected") !== "true") {
            BetterLyrics.Settings.onAutoSwitchEnabled(() => {
              tabSelector.click();
              BetterLyrics.Utils.log(BetterLyrics.Constants.AUTO_SWITCH_ENABLED_LOG);
            });
          }
          BetterLyrics.App.handleModifications(detail);
        }
      }
      let timeOffset = Date.now() - detail.browserTime;
      if (!detail.playing) {
        timeOffset = 0;
      }
      BetterLyrics.DOM.tickLyrics(detail.currentTime + timeOffset / 1000, detail.playing);
    });
  },
  scrollEventHandler: () => {
    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (tabSelector.getAttribute("aria-selected") !== "true" || !BetterLyrics.App.areLyricsTicking) {
      return;
    }

    if (BetterLyrics.DOM.skipScrolls > 0) {
      BetterLyrics.DOM.skipScrolls--;
      BetterLyrics.DOM.skipScrollsDecayTimes.shift();
      // BetterLyrics.Utils.log("[BetterLyrics] Skipping Lyrics Scroll");
      return;
    }
    if (!BetterLyrics.DOM.isLoaderActive()) {
      if (BetterLyrics.DOM.scrollResumeTime < Date.now()) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.PAUSING_LYRICS_SCROLL_LOG);
      }
      BetterLyrics.DOM.scrollResumeTime = Date.now() + 25000;
    }
  },
};
