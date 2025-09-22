import * as Observer from "./observer";
import * as Settings from "../settings/settings";
import * as Dom from "./dom";
import * as Constants from "../../core/constants"

/**
 * Enables the lyrics tab and prevents it from being disabled by YouTube Music.
 * Sets up a MutationObserver to watch for attribute changes.
 */
export function enableLyricsTab() {
  const tabSelector = document.getElementsByClassName(Constants.TAB_HEADER_CLASS)[1];
  if (!tabSelector) {
    setTimeout(() => {
      Observer.enableLyricsTab();
    }, 1000);
    return;
  }
  tabSelector.removeAttribute("disabled");
  tabSelector.setAttribute("aria-disabled", "false");
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === "disabled") {
        tabSelector.removeAttribute("disabled");
        tabSelector.setAttribute("aria-disabled", "false");
      }
    });
  });
  observer.observe(tabSelector, {attributes: true});
}

/**
 * Disables the inert attribute on the side panel when entering fullscreen.
 * Ensures lyrics tab remains accessible in fullscreen mode.
 */
export function disableInertWhenFullscreen() {
  const panelElem = document.getElementById("side-panel");
  if (!panelElem) {
    setTimeout(() => {
      Observer.disableInertWhenFullscreen();
    }, 1000);
    return;
  }
  const observer = new MutationObserver(mutations => {
    Settings.onFullScreenDisabled(
      () => {
      },
      () =>
        mutations.forEach(mutation => {
          if (mutation.attributeName === "inert") {
            // entering fullscreen mode
            mutation.target.removeAttribute("inert");
            const tabSelector = document.getElementsByClassName(Constants.TAB_HEADER_CLASS)[1];
            if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
              // ensure lyrics tab is selected
              tabSelector.click();
            }
          }
        })
    );
  });
  observer.observe(panelElem, {attributes: true});
  panelElem.removeAttribute("inert");
}

let currentTab = 0;
let scrollPositions = [0, 0, 0];

/**
 * Sets up tab click handlers and manages scroll positions between tabs.
 * Handles lyrics reloading when the lyrics tab is clicked.
 */
export function lyricReloader() {
  const tabs = document.getElementsByClassName(Constants.TAB_CONTENT_CLASS);

  const [tab1, tab2, tab3] = tabs;

  if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", () => {
        const tabRenderer = document.querySelector(Constants.TAB_RENDERER_SELECTOR);
        scrollPositions[currentTab] = tabRenderer.scrollTop;
        tabRenderer.scrollTop = scrollPositions[i];
        currentTab = i;
      });
    }

    tab2.addEventListener("click", () => {
      Dom.getResumeScrollElement().classList.remove("blyrics-hidden");
      if (!BetterLyrics.areLyricsLoaded) {
        Utils.log(Constants.LYRICS_TAB_CLICKED_LOG);
        DOM.cleanup();
        DOM.renderLoader();

      }
    });

    const hideAutoscrollResume = () => DOM.getResumeScrollElement().classList.add("blyrics-hidden");
    tab1.addEventListener("click", hideAutoscrollResume);
    tab3.addEventListener("click", hideAutoscrollResume);
  } else {
    setTimeout(() => Observer.lyricReloader(), 1000);
  }
}

/**
 * Initializes the main player time event listener.
 * Handles video changes, lyric injection, and player state updates.
 */
export function initializeLyrics() {
  document.addEventListener(
    "blyrics-send-player-time",
    /**
     * @param {CustomEvent<PlayerDetails>} event - Custom event with player details
     */
    event => {
      const detail = event.detail;

      const currentVideoId = detail.videoId;
      const currentVideoDetails = detail.song + " " + detail.artist;

      if (
        currentVideoId !== App.lastVideoId ||
        currentVideoDetails !== App.lastVideoDetails
      ) {
        try {
          if (currentVideoId === App.lastVideoId && App.areLyricsLoaded) {
            console.log(Constants.SKIPPING_LOAD_WITH_META);
            return; // We already loaded this video
          }
        } finally {
          App.lastVideoId = currentVideoId;
          App.lastVideoDetails = currentVideoDetails;
        }

        if (!detail.song || !detail.artist) {
          console.log(Constants.LOADING_WITHOUT_SONG_META);
        }

        Utils.log(Constants.SONG_SWITCHED_LOG, detail.videoId);
        App.areLyricsTicking = false;
        App.areLyricsLoaded = false;

        App.queueLyricInjection = true;
        App.queueAlbumArtInjection = true;
        App.queueSongDetailsInjection = true;
      }

      if (
        App.queueSongDetailsInjection &&
        detail.song &&
        detail.artist &&
        document.getElementById("main-panel")
      ) {
        App.queueSongDetailsInjection = false;
        DOM.injectSongAttributes(detail.song, detail.artist);
      }

      if (App.queueAlbumArtInjection === true && App.shouldInjectAlbumArt === true) {
        App.queueAlbumArtInjection = false;
        DOM.addAlbumArtToLayout(currentVideoId);
      }

      if (App.lyricInjectionFailed) {
        const tabSelector = document.getElementsByClassName(Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector && tabSelector.getAttribute("aria-selected") !== "true") {
          App.lyricInjectionFailed = false; //ignore failure b/c the tab isn't visible
        }
      }

      if (App.queueLyricInjection || App.lyricInjectionFailed) {
        const tabSelector = document.getElementsByClassName(Constants.TAB_HEADER_CLASS)[1];
        if (tabSelector) {
          App.queueLyricInjection = false;
          App.lyricInjectionFailed = false;
          if (tabSelector.getAttribute("aria-selected") !== "true") {
            Settings.onAutoSwitchEnabled(() => {
              tabSelector.click();
              Utils.log(Constants.AUTO_SWITCH_ENABLED_LOG);
            });
          }
          App.handleModifications(detail);
        }
      }
      DOM.tickLyrics(detail.currentTime, detail.browserTime, detail.playing);
    }
  );
}

/**
 * Handles scroll events on the tab renderer.
 * Manages autoscroll pause/resume functionality.
 */
export function scrollEventHandler() {
  const tabSelector = document.getElementsByClassName(Constants.TAB_HEADER_CLASS)[1];
  if (tabSelector.getAttribute("aria-selected") !== "true" || !App.areLyricsTicking) {
    return;
  }

  if (DOM.skipScrolls > 0) {
    DOM.skipScrolls--;
    DOM.skipScrollsDecayTimes.shift();
    // Utils.log("[BetterLyrics] Skipping Lyrics Scroll");
    return;
  }
  if (!DOM.isLoaderActive()) {
    if (DOM.scrollResumeTime < Date.now()) {
      Utils.log(Constants.PAUSING_LYRICS_SCROLL_LOG);
    }
    DOM.scrollResumeTime = Date.now() + 25000;
  }
}

