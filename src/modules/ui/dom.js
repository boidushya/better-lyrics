/**
 * DOM manipulation utilities for the BetterLyrics extension.
 * Handles lyrics rendering, scrolling, animations, and UI element management.
 *
 * @namespace BetterLyrics.DOM
 */
BetterLyrics.DOM = {
  /**
   * Creates or reuses the lyrics wrapper element and sets up scroll event handling.
   *
   * @returns {HTMLElement} The lyrics wrapper element
   */
  createLyricsWrapper: () => {
    const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);

    tabRenderer.removeEventListener("scroll", BetterLyrics.Observer.scrollEventHandler);
    tabRenderer.addEventListener("scroll", BetterLyrics.Observer.scrollEventHandler);

    const existingWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);

    if (existingWrapper) {
      existingWrapper.innerHTML = "";
      existingWrapper.style.top = "";
      existingWrapper.style.transition = "";
      return existingWrapper;
    }

    const wrapper = document.createElement("div");
    wrapper.id = BetterLyrics.Constants.LYRICS_WRAPPER_ID;
    tabRenderer.appendChild(wrapper);

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_CREATED_LOG);
    return wrapper;
  },

  /**
   * @param source : {string}
   * @param sourceHref : {string}
   */
  /**
   * Adds a footer with source attribution and action buttons to the lyrics container.
   *
   * @param {string} source - Source name for attribution
   * @param {string} sourceHref - URL for the source link
   * @param {string} song - Song title
   * @param {string} artist - Artist name
   * @param {string} album - Album name
   * @param {number} duration - Song duration in seconds
   * @param {string} videoId - YouTube video ID
   * @param {boolean} showAddLyricsLink - Whether to show the "Add Lyrics to LRCLib" link
   */
  addFooter: (source, sourceHref, song, artist, album, duration, videoId, showAddLyricsLink = false) => {
    if (document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS).length !== 0) {
      document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0].remove();
    }

    const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
    const footer = document.createElement("div");
    footer.classList.add(BetterLyrics.Constants.FOOTER_CLASS);
    lyricsElement.appendChild(footer);

    try {
      footer.innerHTML = "";

      const footerContainer = document.createElement("div");
      footerContainer.className = `${BetterLyrics.Constants.FOOTER_CLASS}__container`;

      const footerImage = document.createElement("img");
      footerImage.src = "https://better-lyrics.boidu.dev/icon-512.png";
      footerImage.alt = "Better Lyrics Logo";
      footerImage.width = "20";
      footerImage.height = "20";

      footerContainer.appendChild(footerImage);
      footerContainer.appendChild(document.createTextNode("Source: "));

      const footerLink = document.createElement("a");
      footerLink.target = "_blank";
      footerLink.id = "betterLyricsFooterLink";
      source = source || "boidu.dev";
      sourceHref = sourceHref || "https://better-lyrics.boidu.dev/";
      footerLink.textContent = source;
      footerLink.href = sourceHref;

      footerContainer.appendChild(footerLink);

      const discordImage = document.createElement("img");
      discordImage.src = BetterLyrics.Constants.DISCORD_LOGO_SRC;
      discordImage.alt = "Better Lyrics Discord";
      discordImage.width = "20";
      discordImage.height = "20";

      const discordLink = document.createElement("a");
      discordLink.className = `${BetterLyrics.Constants.FOOTER_CLASS}__discord`;
      discordLink.href = BetterLyrics.Constants.DISCORD_INVITE_URL;
      discordLink.target = "_blank";

      discordLink.appendChild(discordImage);

      // Only show "Add Lyrics to LRCLib" link when no lyrics are found
      let addLyricsContainer = null;
      if (showAddLyricsLink) {
        addLyricsContainer = document.createElement("div");
        addLyricsContainer.className = `${BetterLyrics.Constants.FOOTER_CLASS}__container`;

        const addLyricsLink = document.createElement("a");
        const url = new URL(BetterLyrics.Constants.LRCLIB_UPLOAD_URL);
        if (song) url.searchParams.append("title", song);
        if (artist) url.searchParams.append("artist", artist);
        if (album) url.searchParams.append("album", album);
        if (duration) url.searchParams.append("duration", duration);
        addLyricsLink.href = url.toString();
        addLyricsLink.textContent = "Add Lyrics to LRCLib";
        addLyricsLink.target = "_blank";
        addLyricsLink.rel = "noreferrer noopener";
        addLyricsLink.style.height = "100%";

        addLyricsContainer.appendChild(addLyricsLink);
      }

      const changeLyricsContainer = document.createElement("div");
      changeLyricsContainer.className = `${BetterLyrics.Constants.FOOTER_CLASS}__container`;

      const changeLyricsLink = document.createElement("a");
      try {
        const man = chrome?.runtime?.getManifest?.();
        const listed = Array.isArray(man?.content_scripts?.[0]?.js) && man.content_scripts[0].js.includes("src/modules/lyrics/changeLyrics.js");
        BetterLyrics.Utils.log("[BetterLyrics] manifest lists changeLyrics:", listed);
        BetterLyrics.Utils.log("[BetterLyrics] typeof BetterLyrics.ChangeLyrics:", typeof BetterLyrics?.ChangeLyrics);
      } catch (_e) {}
      changeLyricsLink.href = "#";
      changeLyricsLink.textContent = "Change Lyrics";
      changeLyricsLink.style.height = "100%";
      const tryOpenChangeLyrics = (attempt = 0) => {
        if (BetterLyrics?.ChangeLyrics && typeof BetterLyrics.ChangeLyrics.showModal === 'function') {
          BetterLyrics.ChangeLyrics.init(song, artist, album, duration, videoId);
          BetterLyrics.ChangeLyrics.showModal();
          return true;
        }
        if (attempt < 10) {
          setTimeout(() => tryOpenChangeLyrics(attempt + 1), 50);
          return false;
        }
        BetterLyrics.Utils.log("[BetterLyrics] ChangeLyrics not available after retries");
        return false;
      };

      changeLyricsLink.addEventListener("click", e => {
        try {
          e.preventDefault();
          e.stopPropagation();
          BetterLyrics.Utils.log("[BetterLyrics] Change Lyrics clicked");
          if (!tryOpenChangeLyrics()) {
            BetterLyrics.Utils.log("[BetterLyrics] ChangeLyrics is not available yet");
          }
        } catch (err) {
          BetterLyrics.Utils.log("[BetterLyrics] Error handling Change Lyrics click:", err);
        }
      });

      changeLyricsContainer.appendChild(changeLyricsLink);

      footer.appendChild(footerContainer);
      if (addLyricsContainer) {
        footer.appendChild(addLyricsContainer);
      }
      footer.appendChild(changeLyricsContainer);
      footer.appendChild(discordLink);

      footer.removeAttribute("is-empty");
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.FOOTER_NOT_VISIBLE_LOG);
    }
  },
  loaderMayBeActive: false,
  /**
   * Renders and displays the loading spinner for lyrics fetching.
   */
  renderLoader: (small = false) => {
    if (!small) {
      BetterLyrics.DOM.cleanup();
    }
    BetterLyrics.DOM.loaderMayBeActive = true;
    try {
      clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
      const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
      let loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (!loaderWrapper) {
        loaderWrapper = document.createElement("div");
        loaderWrapper.id = BetterLyrics.Constants.LYRICS_LOADER_ID;
      }

      let wasActive = loaderWrapper.hasAttribute("active");

      loaderWrapper.setAttribute("active", "");
      loaderWrapper.removeAttribute("no-sync-available");

      if (small) {
        loaderWrapper.setAttribute("small-loader", "");
      } else {
        loaderWrapper.removeAttribute("small-loader");
      }

      if (!wasActive) {
        tabRenderer.prepend(loaderWrapper);
        loaderWrapper.hidden = false;
        loaderWrapper.style.display = "inline-block !important";
        loaderWrapper.scrollIntoView({
          behavior: "instant",
          block: "start",
          inline: "start",
        });
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  /**
   * Removes the loading spinner with animation and cleanup.
   */
  flushLoader: (showNoSyncAvailable = false) => {
    try {
      const loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);

      if (showNoSyncAvailable) {
        loaderWrapper.setAttribute("small-loader", "");
        reflow(loaderWrapper);
        loaderWrapper.setAttribute("no-sync-available", "");
      }
      if (loaderWrapper?.hasAttribute("active")) {
        clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
        loaderWrapper.dataset.animatingOut = true;
        loaderWrapper.removeAttribute("active");

        loaderWrapper.addEventListener("transitionend", function handleTransitionEnd(_event) {
          clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
          loaderWrapper.dataset.animatingOut = false;
          BetterLyrics.DOM.loaderMayBeActive = false;
          loaderWrapper.removeEventListener("transitionend", handleTransitionEnd);
          BetterLyrics.Utils.log(BetterLyrics.Constants.LOADER_TRANSITION_ENDED);
        });

        let timeout = 1000;
        let transitionDelay = window.getComputedStyle(loaderWrapper).getPropertyValue("transition-delay");
        if (transitionDelay) {
          timeout += toMs(transitionDelay);
        }

        BetterLyrics.App.loaderAnimationEndTimeout = setTimeout(() => {
          loaderWrapper.dataset.animatingOut = String(false);
          BetterLyrics.DOM.loaderMayBeActive = false;
          BetterLyrics.Utils.log(BetterLyrics.Constants.LOADER_ANIMATION_END_FAILED);
        }, timeout);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  /**
   * Checks if the loader is currently active or animating.
   *
   * @returns {boolean} True if loader is active
   */
  isLoaderActive: () => {
    try {
      if (!BetterLyrics.DOM.loaderMayBeActive) {
        return false;
      }
      const loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (loaderWrapper) {
        return loaderWrapper.hasAttribute("active") || loaderWrapper.dataset.animatingOut === "true";
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
    return false;
  },

  /**
   * Clears all lyrics content from the wrapper element.
   */
  clearLyrics: () => {
    try {
      const lyricsWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);
      if (lyricsWrapper) {
        lyricsWrapper.innerHTML = "";
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },
  /** @type {MutationObserver | null} */
  backgroundChangeObserver: null,
  /**
   * Adds album art as a background image to the layout.
   * Sets up mutation observer to watch for art changes.
   *
   * @param {string} videoId - YouTube video ID for fallback image
   */
  addAlbumArtToLayout: videoId => {
    if (!videoId) return;

    if (BetterLyrics.DOM.backgroundChangeObserver) {
      BetterLyrics.DOM.backgroundChangeObserver.disconnect();
    }

    const injectAlbumArt = () => {
      if (albumArt.src.startsWith("data:image")) {
        BetterLyrics.DOM.injectAlbumArt("https://img.youtube.com/vi/" + videoId + "/0.jpg");
      } else {
        BetterLyrics.DOM.injectAlbumArt(albumArt.src);
      }
    };

    const albumArt = document.querySelector(BetterLyrics.Constants.SONG_IMAGE_SELECTOR);
    const observer = new MutationObserver(() => {
      injectAlbumArt();
      BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_ADDED_FROM_MUTATION_LOG);
    });

    observer.observe(albumArt, { attributes: true });
    BetterLyrics.DOM.backgroundChangeObserver = observer;

    injectAlbumArt();
    BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_ADDED_LOG);
  },

  /**
   * Injects album art URL as a CSS custom property.
   *
   * @param {string} src - Image source URL
   */
  injectAlbumArt: src => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      document.getElementById("layout").style = `--blyrics-background-img: url('${src}')`;
    };
  },

  /**
   * Removes album art from layout and disconnects observers.
   */
  removeAlbumArtFromLayout: () => {
    if (BetterLyrics.DOM.backgroundChangeObserver) {
      BetterLyrics.DOM.backgroundChangeObserver.disconnect();
      BetterLyrics.DOM.backgroundChangeObserver = null;
    }
    const layout = document.getElementById("layout");
    if (layout) {
      layout.style.removeProperty("--blyrics-background-img");
      BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_REMOVED_LOG);
    }
  },

  /**
   * Adds a button for users to contribute lyrics.
   *
   * @param {string} song - Song title
   * @param {string} artist - Artist name
   * @param {string} album - Album name
   * @param {number} duration - Song duration in seconds
   */
  addNoLyricsButton: (song, artist, album, duration) => {
    const lyricsWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);
    if (!lyricsWrapper) return;

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "blyrics-no-lyrics-button-container";

    const addLyricsButton = document.createElement("button");
    addLyricsButton.className = "blyrics-add-lyrics-button";
    addLyricsButton.textContent = "Add Lyrics to LRCLib";

    const url = new URL(BetterLyrics.Constants.LRCLIB_UPLOAD_URL);
    if (song) url.searchParams.append("title", song);
    if (artist) url.searchParams.append("artist", artist);
    if (album) url.searchParams.append("album", album);
    if (duration) url.searchParams.append("duration", duration);

    addLyricsButton.addEventListener("click", () => {
      window.open(url.toString(), "_blank");
    });

    buttonContainer.appendChild(addLyricsButton);
    lyricsWrapper.appendChild(buttonContainer);
  },

  /**
   * Injects required head tags including font links and image preloads.
   */
  injectHeadTags: async () => {
    const imgURL = "https://better-lyrics.boidu.dev/icon-512.png";

    const imagePreload = document.createElement("link");
    imagePreload.rel = "preload";
    imagePreload.as = "image";
    imagePreload.href = imgURL;

    document.head.appendChild(imagePreload);

    const fontLink = document.createElement("link");
    fontLink.href = BetterLyrics.Constants.FONT_LINK;
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const cssFiles = ["src/css/ytmusic.css", "src/css/blyrics.css", "src/css/themesong.css"];

    let css = "";
    const responses = await Promise.all(
      cssFiles.map(file =>
        fetch(chrome.runtime.getURL(file), {
          cache: "no-store",
        })
      )
    );

    for (let i = 0; i < cssFiles.length; i++) {
      css += "/* " + cssFiles[i] + " */\n";
      css += await responses[i].text();
    }

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  },

  /**
   * Cleans up DOM elements and resets state when switching songs.
   */
  cleanup: () => {
    BetterLyrics.DOM.scrollPos = -1;

    if (BetterLyrics.App.lyricsObserver) {
      BetterLyrics.App.lyricsObserver.disconnect();
      BetterLyrics.App.lyricsObserver = null;
    }

    const ytMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR)?.parentElement;
    if (ytMusicLyrics) {
      ytMusicLyrics.style.display = "";
    }

    const blyricsFooter = document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0];

    if (blyricsFooter) {
      blyricsFooter.remove();
    }

    BetterLyrics.DOM.getResumeScrollElement().setAttribute("autoscroll-hidden", "true");

    const buttonContainer = document.querySelector(".blyrics-no-lyrics-button-container");
    if (buttonContainer) {
      buttonContainer.remove();
    }

    const changeLyricsModal = document.getElementById("blyrics-change-modal");
    if (changeLyricsModal && BetterLyrics.ChangeLyrics) {
      BetterLyrics.ChangeLyrics.closeModal();
    }

    BetterLyrics.DOM.clearLyrics();
  },
  /**
   * Injects the player information script into the page.
   */
  injectGetSongInfo: () => {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("src/script.js");
    s.id = "blyrics-script";
    s.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  },
  skipScrolls: 0,
  skipScrollsDecayTimes: [],
  scrollResumeTime: 0,
  scrollPos: 0,
  selectedElementIndex: 0,
  nextScrollAllowedTime: 0,
  wasUserScrolling: false,
  lastTime: 0,
  lastPlayState: false,
  lastEventCreationTime: 0,
  /**
   * @type {Map<string, number>}
   */
  cachedDurations: new Map(),
  /**
   * Gets and caches a css duration.
   * Note this function does not key its cache on the element provided --
   * it assumes that it isn't relevant to the calling code
   *
   * @param lyricsElement - the element to look up against
   * @param property - the css property to look up
   * @return {number} - in ms
   */
  getCSSDurationInMs(lyricsElement, property) {
    let duration = BetterLyrics.DOM.cachedDurations.get(lyricsElement);
    if (duration === undefined) {
      duration = toMs(window.getComputedStyle(lyricsElement).getPropertyValue(property));
      BetterLyrics.DOM.cachedDurations.set(property, duration);
    }

    return duration;
  },
  /**
   * Main lyrics synchronization function that handles timing, highlighting, and scrolling.
   *
   * @param {number} currentTime - Current playback time in seconds
   * @param {number} eventCreationTime - Timestamp when the event was created
   * @param {boolean} [isPlaying=true] - Whether audio is currently playing
   * @param {boolean} [smoothScroll=true] - Whether to use smooth scrolling
   */
  tickLyrics: function (currentTime, eventCreationTime, isPlaying = true, smoothScroll = true) {
    const now = Date.now();
    if (BetterLyrics.DOM.isLoaderActive() || !BetterLyrics.App.areLyricsTicking || (currentTime === 0 && !isPlaying)) {
      return;
    }
    BetterLyrics.DOM.lastTime = currentTime;
    BetterLyrics.DOM.lastPlayState = isPlaying;
    BetterLyrics.DOM.lastEventCreationTime = eventCreationTime;

    let timeOffset = now - eventCreationTime;
    if (!isPlaying) {
      timeOffset = 0;
    }

    currentTime += timeOffset / 1000;

    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    console.assert(tabSelector != null);

    const playerState = document.getElementById("player-page").getAttribute("player-ui-state");
    const isPlayerOpen =
      playerState === "PLAYER_PAGE_OPEN" || playerState === "FULLSCREEN" || playerState === "MINIPLAYER_IN_PLAYER_PAGE";
    // Don't tick lyrics if they're not visible
    if (tabSelector.getAttribute("aria-selected") !== "true" || !isPlayerOpen) {
      return;
    }

    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      // If lyrics element doesn't exist, clear the interval and return silently
      if (!lyricsElement) {
        BetterLyrics.App.areLyricsTicking = false;
        BetterLyrics.Utils.log(BetterLyrics.Constants.NO_LYRICS_ELEMENT_LOG);
        return;
      }

      let lyricData = BetterLyrics.App.lyricData;
      if (!lyricData) {
        BetterLyrics.App.areLyricsTicking = false;
        BetterLyrics.Utils.log("Lyrics are ticking, but lyricData are null!");
        return;
      }

      if (lyricData.syncType === "richsync") {
        currentTime += BetterLyrics.DOM.getCSSDurationInMs(lyricsElement, "--blyrics-richsync-timing-offset") / 1000;
      } else {
        currentTime += BetterLyrics.DOM.getCSSDurationInMs(lyricsElement, "--blyrics-timing-offset") / 1000;
      }

      const lyricScrollTime =
        currentTime + BetterLyrics.DOM.getCSSDurationInMs(lyricsElement, "--blyrics-scroll-timing-offset") / 1000;

      const lines = BetterLyrics.App.lyricData.lines;

      let selectedLyricHeight = 0;
      let targetScrollPos = 0;
      let availableScrollTime = 999;
      lines.every((lineData, index) => {
        const time = lineData.time;
        let nextTime = Infinity;
        if (index + 1 < lines.length) {
          const nextLyric = lines[index + 1];
          nextTime = nextLyric.time;
        }

        if (lyricScrollTime >= time && (lyricScrollTime < nextTime || lyricScrollTime < time + lineData.duration)) {
          const elemBounds = getRelativeBounds(lyricsElement, lineData.lyricElement);
          targetScrollPos = elemBounds.y;
          selectedLyricHeight = elemBounds.height;
          availableScrollTime = nextTime - lyricScrollTime;
          const timeDelta = lyricScrollTime - time;
          if (BetterLyrics.DOM.selectedElementIndex !== index && timeDelta > 0.05 && index > 0) {
            BetterLyrics.Utils.log(`[BetterLyrics] Scrolling to new lyric was late, dt: ${timeDelta.toFixed(5)}s`);
          }
          BetterLyrics.DOM.selectedElementIndex = index;
          if (!lineData.isScrolled) {
            lineData.lyricElement.classList.add(BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
            lineData.isScrolled = true;
          }
        } else {
          if (lineData.isScrolled) {
            lineData.lyricElement.classList.remove(BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
            lineData.isScrolled = false;
          }
        }

        /**
         * Time in seconds to set up animations. This shouldn't affect any visible effects, just help when the browser stutters
         * @type {number}
         */
        let setUpAnimationEarlyTime = 2;

        if (!isPlaying) {
          setUpAnimationEarlyTime = 0;
        }
        if (
          currentTime + setUpAnimationEarlyTime >= time &&
          (currentTime < nextTime || currentTime < time + lineData.duration)
        ) {
          lineData.selected = true;

          const timeDelta = currentTime - time;
          const animationTimingOffset = (now - lineData.animationStartTimeMs) / 1000 - timeDelta;
          lineData.accumulatedOffsetMs = lineData.accumulatedOffsetMs / 1.08;
          lineData.accumulatedOffsetMs += animationTimingOffset * 1000 * 0.4;
          if (lineData.isAnimating && Math.abs(lineData.accumulatedOffsetMs) > 100 && isPlaying) {
            // Our sync is off for some reason
            lineData.isAnimating = false;
            // BetterLyrics.Utils.log("[BetterLyrics] Animation time sync is off, resetting");
          }

          if (!lineData.isAnimating) {
            const children = [lineData, ...lineData.parts];
            children.forEach(part => {
              const elDuration = part.duration;
              const elTime = part.time;
              const timeDelta = currentTime - elTime;

              part.lyricElement.classList.remove(BetterLyrics.Constants.ANIMATING_CLASS);

              //correct for the animation not starting at 0% and instead at -10%
              const swipeAnimationDelay = -timeDelta - elDuration * 0.1 + "s";
              const everythingElseDelay = -timeDelta + "s";
              part.lyricElement.style.setProperty("--blyrics-swipe-delay", swipeAnimationDelay);
              part.lyricElement.style.setProperty("--blyrics-anim-delay", everythingElseDelay);

              part.lyricElement.classList.add(BetterLyrics.Constants.PRE_ANIMATING_CLASS);
              reflow(part.lyricElement);
              part.lyricElement.classList.add(BetterLyrics.Constants.ANIMATING_CLASS);
              part.animationStartTimeMs = now - timeDelta * 1000;
            });

            lineData.isAnimating = true;
            lineData.accumulatedOffsetMs = 0;
          }

          if (isPlaying !== lineData.isAnimationPlayStatePlaying) {
            lineData.isAnimationPlayStatePlaying = isPlaying;
            if (!isPlaying) {
              lineData.selected = false;
              const children = [lineData, ...lineData.parts];
              children.forEach(part => {
                if (part.animationStartTimeMs > now) {
                  part.lyricElement.classList.remove(BetterLyrics.Constants.ANIMATING_CLASS);
                  part.lyricElement.classList.remove(BetterLyrics.Constants.PRE_ANIMATING_CLASS);
                }
              });
            }
          }
        } else {
          if (lineData.selected) {
            const children = [lineData, ...lineData.parts];
            children.forEach(part => {
              part.lyricElement.style.setProperty("--blyrics-swipe-delay", "");
              part.lyricElement.style.setProperty("--blyrics-anim-delay", "");
              part.lyricElement.classList.remove(BetterLyrics.Constants.ANIMATING_CLASS);
              part.lyricElement.classList.remove(BetterLyrics.Constants.PRE_ANIMATING_CLASS);
              part.isAnimating = false;
              part.animationStartTimeMs = Infinity;
            });
            lineData.selected = false;
          }
        }
        return true;
      });

      // lyricsHeight can change slightly due to animations
      const lyricsHeight = lyricsElement.getBoundingClientRect().height;
      const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
      const tabRendererHeight = tabRenderer.getBoundingClientRect().height;
      let scrollTop = tabRenderer.scrollTop;

      const topOffsetMultiplier = 0.37; // 0.5 means the selected lyric will be in the middle of the screen, 0 means top, 1 means bottom

      if (BetterLyrics.DOM.scrollResumeTime < Date.now() || BetterLyrics.DOM.scrollPos === -1) {
        if (BetterLyrics.DOM.wasUserScrolling) {
          BetterLyrics.DOM.getResumeScrollElement().setAttribute("autoscroll-hidden", "true");
          lyricsElement.classList.remove(BetterLyrics.Constants.USER_SCROLLING_CLASS);
          BetterLyrics.DOM.wasUserScrolling = false;
        }

        const scrollPosOffset = Math.max(0, tabRendererHeight * topOffsetMultiplier - selectedLyricHeight / 2);
        let scrollPos = Math.max(0, targetScrollPos - scrollPosOffset);
        scrollPos = Math.max(Math.min(lyricsHeight - tabRendererHeight, scrollPos), 0);

        if (Math.abs(scrollTop - scrollPos) > 2 && Date.now() > BetterLyrics.DOM.nextScrollAllowedTime) {
          if (smoothScroll) {
            lyricsElement.style.transitionTimingFunction = "";
            lyricsElement.style.transitionProperty = "";
            lyricsElement.style.transitionDuration = "";

            let scrollTime = BetterLyrics.DOM.getCSSDurationInMs(lyricsElement, "transition-duration");
            if (scrollTime > availableScrollTime * 1000 - 50) {
              scrollTime = availableScrollTime * 1000 - 50;
            }
            if (scrollTime < 200) {
              scrollTime = 200;
            }

            lyricsElement.style.transition = "transform 0s ease-in-out 0s";
            lyricsElement.style.transform = `translate(0px, ${-(scrollTop - scrollPos)}px)`;
            reflow(lyricsElement);
            if (scrollTime < 500) {
              lyricsElement.style.transitionProperty = "transform";
              lyricsElement.style.transitionTimingFunction = "ease";
            } else {
              lyricsElement.style.transition = "";
            }
            lyricsElement.style.transitionDuration = `${scrollTime}ms`;
            lyricsElement.style.transform = "translate(0px, 0px)";

            BetterLyrics.DOM.nextScrollAllowedTime = scrollTime + Date.now() + 20;
          }
          let extraHeight = Math.max(tabRendererHeight * (1 - topOffsetMultiplier), tabRendererHeight - lyricsHeight);

          document.getElementById(BetterLyrics.Constants.LYRICS_SPACING_ELEMENT_ID).style.height =
            `${extraHeight.toFixed(0)}px`;
          scrollTop = scrollPos;
          BetterLyrics.DOM.scrollPos = scrollPos;
        }
      } else {
        if (!BetterLyrics.DOM.wasUserScrolling) {
          BetterLyrics.DOM.getResumeScrollElement().removeAttribute("autoscroll-hidden");
          lyricsElement.classList.add(BetterLyrics.Constants.USER_SCROLLING_CLASS);
          BetterLyrics.DOM.wasUserScrolling = true;
        }
      }

      if (Math.abs(scrollTop - tabRenderer.scrollTop) > 1) {
        tabRenderer.scrollTop = scrollTop;
        BetterLyrics.DOM.skipScrolls += 1;
        BetterLyrics.DOM.skipScrollsDecayTimes.push(Date.now() + 2000);
      }

      let j = 0;
      for (; j < BetterLyrics.DOM.skipScrollsDecayTimes.length; j++) {
        if (BetterLyrics.DOM.skipScrollsDecayTimes[j] > now) {
          break;
        }
      }
      BetterLyrics.DOM.skipScrollsDecayTimes = BetterLyrics.DOM.skipScrollsDecayTimes.slice(j);
      BetterLyrics.DOM.skipScrolls -= j;
      if (BetterLyrics.DOM.skipScrolls < 1) {
        BetterLyrics.DOM.skipScrolls = 1; // Always leave at least one for when the window is refocused.
      }
    } catch (err) {
      if (!err.message?.includes("undefined")) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_CHECK_INTERVAL_ERROR, err);
      }
      return true;
    }
  },

  /**
   * Called when a new lyrics element is added to trigger re-sync.
   */
  lyricsElementAdded: () => {
    if (!BetterLyrics.App.areLyricsTicking) {
      return;
    }
    BetterLyrics.DOM.tickLyrics(
      BetterLyrics.DOM.lastTime,
      BetterLyrics.DOM.lastEventCreationTime,
      BetterLyrics.DOM.lastPlayState,
      false
    );
  },
  /**
   * Injects song title and artist information used in fullscreen mode.
   *
   * @param {string} title - Song title
   * @param {string} artist - Artist name
   */
  injectSongAttributes: (title, artist) => {
    const mainPanel = document.getElementById("main-panel");
    console.assert(mainPanel != null);
    const existingSongInfo = document.getElementById("blyrics-song-info");
    const existingWatermark = document.getElementById("blyrics-watermark");

    existingSongInfo?.remove();
    existingWatermark?.remove();

    const titleElm = document.createElement("p");
    titleElm.id = "blyrics-title";
    titleElm.textContent = title;

    const artistElm = document.createElement("p");
    artistElm.id = "blyrics-artist";
    artistElm.textContent = artist;

    const songInfoWrapper = document.createElement("div");
    songInfoWrapper.id = "blyrics-song-info";
    songInfoWrapper.appendChild(titleElm);
    songInfoWrapper.appendChild(artistElm);
    mainPanel.appendChild(songInfoWrapper);
  },

  /**
   * Gets or creates the resume autoscroll button element.
   *
   * @returns {HTMLElement} The resume scroll button element
   */
  getResumeScrollElement() {
    let elem = document.getElementById("autoscroll-resume-button");
    if (!elem) {
      const wrapper = document.createElement("div");
      wrapper.id = "autoscroll-resume-wrapper";
      wrapper.className = "autoscroll-resume-wrapper";
      elem = document.createElement("button");
      elem.id = "autoscroll-resume-button";
      elem.innerText = "Resume Autoscroll";
      elem.classList.add("autoscroll-resume-button");
      elem.setAttribute("autoscroll-hidden", "true");
      elem.addEventListener("click", () => {
        BetterLyrics.DOM.scrollResumeTime = 0;
        elem.setAttribute("autoscroll-hidden", "true");
      });

      document.querySelector("#side-panel > tp-yt-paper-tabs").after(wrapper);
      wrapper.appendChild(elem);
    }
    return elem;
  },
};

/**
 * Returns the position and dimensions of a child element relative to its parent.
 *
 * @param {Element} parent - The parent element
 * @param {Element} child - The child element
 * @returns {DOMRect} Rectangle with relative position and dimensions
 */
function getRelativeBounds(parent, child) {
  const parentBound = parent.getBoundingClientRect();
  const childBound = child.getBoundingClientRect();
  return new DOMRect(childBound.x - parentBound.x, childBound.y - parentBound.y, childBound.width, childBound.height);
}

/**
 * Converts CSS duration value to milliseconds.
 *
 * @returns {number} Duration in milliseconds
 */
function toMs(cssDuration) {
  if (cssDuration.endsWith("s")) {
    return parseFloat(cssDuration.slice(0, -1)) * 1000;
  } else if (cssDuration.endsWith("ms")) {
    return parseFloat(cssDuration.slice(0, -2));
  }
}

/**
 * Forces a reflow/repaint of the element by accessing its offsetHeight.
 *
 * @param {HTMLElement} elt - Element to reflow
 */
function reflow(elt) {
  void elt.offsetHeight;
}
