BetterLyrics.DOM = {
  createLyricsWrapper: function () {
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
  addFooter: function (source, sourceHref) {
    if (document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS).length !== 0) {
      document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0].remove();
    }

    const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
    const footer = document.createElement("div");
    footer.classList.add(BetterLyrics.Constants.FOOTER_CLASS);
    lyricsElement.appendChild(footer);
    BetterLyrics.DOM.createFooter();

    let footerLink = document.getElementById("betterLyricsFooterLink");
    source = source || "boidu.dev";
    sourceHref = sourceHref || "https://better-lyrics.boidu.dev/";
    footerLink.textContent = source;
    footerLink.href = sourceHref;
  },

  createFooter: function () {
    try {
      const footer = document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0];
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

      footer.appendChild(footerContainer);
      footer.appendChild(discordLink);

      footer.removeAttribute("is-empty");
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.FOOTER_NOT_VISIBLE_LOG);
    }
  },

  setRtlAttributes: function (isRtl) {
    const layout = document.getElementById("layout");
    const playerPage = document.getElementById("player-page");

    if (layout && playerPage) {
      if (isRtl) {
        layout.setAttribute(BetterLyrics.Constants.LYRICS_RTL_ATTR, "");
        playerPage.setAttribute(BetterLyrics.Constants.LYRICS_RTL_ATTR, "");
      } else {
        layout.removeAttribute(BetterLyrics.Constants.LYRICS_RTL_ATTR);
        playerPage.removeAttribute(BetterLyrics.Constants.LYRICS_RTL_ATTR);
      }
    }
  },

  renderLoader: function () {
    BetterLyrics.DOM.cleanup();
    try {
      clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
      const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
      let loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (!loaderWrapper) {
        loaderWrapper = document.createElement("div");
        loaderWrapper.id = BetterLyrics.Constants.LYRICS_LOADER_ID;
      } else if (loaderWrapper.hasAttribute("active")) {
        return;
      }

      tabRenderer.prepend(loaderWrapper);
      loaderWrapper.style.display = "inline-block !important";
      loaderWrapper.setAttribute("active", "");
      loaderWrapper.hidden = false;
      loaderWrapper.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "start",
      });
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  flushLoader: function () {
    try {
      const loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (loaderWrapper && loaderWrapper.hasAttribute("active")) {
        clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
        loaderWrapper.dataset.animatingOut = true;
        loaderWrapper.removeAttribute("active");

        loaderWrapper.addEventListener("transitionend", function handleTransitionEnd(_event) {
          clearTimeout(BetterLyrics.App.loaderAnimationEndTimeout);
          loaderWrapper.dataset.animatingOut = false;
          loaderWrapper.removeEventListener("transitionend", handleTransitionEnd);
          BetterLyrics.Utils.log(BetterLyrics.Constants.LOADER_TRANSITION_ENDED);
        });

        BetterLyrics.App.loaderAnimationEndTimeout = setTimeout(() => {
          loaderWrapper.dataset.animatingOut = false;
          BetterLyrics.Utils.log(BetterLyrics.Constants.LOADER_ANIMATION_END_FAILED);
        }, 1000);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  isLoaderActive: function () {
    try {
      const loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (loaderWrapper) {
        return loaderWrapper.hasAttribute("active") || loaderWrapper.dataset.animatingOut === "true";
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
    return false;
  },

  clearLyrics: function () {
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
  addAlbumArtToLayout: function () {
    if (BetterLyrics.DOM.backgroundChangeObserver) {
      BetterLyrics.DOM.backgroundChangeObserver.disconnect();
    }

    let albumArt = document.querySelector(BetterLyrics.Constants.SONG_IMAGE_SELECTOR);
    const observer = new MutationObserver(() => {
      BetterLyrics.DOM.injectAlbumArt(albumArt.src);
      BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_ADDED_FROM_MUTATION_LOG);
    });

    observer.observe(albumArt, { attributes: true });
    BetterLyrics.DOM.backgroundChangeObserver = observer;

    if (!albumArt.src !== BetterLyrics.Constants.EMPTY_THUMBNAIL_SRC) {
      BetterLyrics.DOM.injectAlbumArt(albumArt.src);
      BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_ADDED_LOG);
    }
  },

  injectAlbumArt: function (src) {
    let img = new Image();
    img.src = src;

    img.onload = () => {
      document.getElementById("layout").style = `--blyrics-background-img: url('${src}')`;
    };
  },

  removeAlbumArtFromLayout: function () {
    if (BetterLyrics.DOM.backgroundChangeObserver) {
      BetterLyrics.DOM.backgroundChangeObserver.disconnect();
      BetterLyrics.DOM.backgroundChangeObserver = null;
    }
    const layout = document.getElementById("layout");
    if (layout) {
      layout.style.removeProperty("--blyrics-background-img");
      BetterLyrics.Utils.log("Album art removed from layout");
    }
  },

  injectHeadTags: function () {
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
  },

  cleanup: function () {
    BetterLyrics.DOM.scrollPos = -1;

    if (BetterLyrics.App.lyricsObserver) {
      BetterLyrics.App.lyricsObserver.disconnect();
      BetterLyrics.App.lyricsObserver = null;
    }

    const ytMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR)?.parentElement;
    if (ytMusicLyrics) {
      ytMusicLyrics.style.display = "";
    }

    const existingFooter = document.getElementsByClassName(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)[0];
    const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
    const blyricsFooter = document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0];

    if (blyricsFooter) {
      blyricsFooter.remove();
    }
    if (existingLyrics) {
      for (let lyrics of existingLyrics) {
        lyrics.style.display = "";
        if (lyrics.classList.contains("blyrics--fallback")) {
          lyrics.classList.remove("blyrics--fallback");
        }
      }
    }
    if (existingFooter && existingFooter.classList.contains("blyrics--fallback")) {
      existingFooter.classList.remove("blyrics--fallback");
    }

    BetterLyrics.DOM.clearLyrics();
  },
  injectGetSongInfo: function () {
    let s = document.createElement("script");
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
  tickLyrics: function (currentTime) {
    if (BetterLyrics.DOM.isLoaderActive() || !BetterLyrics.App.areLyricsTicking) {
      return;
    }

    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    console.assert(tabSelector != null);
    // Don't tick lyrics if they're not visible
    if (tabSelector.getAttribute("aria-selected") !== "true") {
      return;
    }

    currentTime += 0.25; //adjust time to account for scroll time
    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      // If lyrics element doesn't exist, clear the interval and return silently
      if (!lyricsElement) {
        BetterLyrics.App.areLyricsTicking = false;
        BetterLyrics.Utils.log(BetterLyrics.Constants.NO_LYRICS_ELEMENT_LOG);
        return;
      }

      const lyrics = [...lyricsElement.children];
      lyrics.pop(); // remove the footer

      let selectedLyricHeight = 0;
      let targetScrollPos = 0;
      lyrics.every((elem, index) => {
        if (!elem.hasAttribute("data-time")) {
          return true;
        }

        const time = parseFloat(elem.getAttribute("data-time"));
        let nextTime = Infinity;
        if (index + 1 < lyrics.length) {
          const nextLyric = lyrics[index + 1];
          nextTime = parseFloat(nextLyric.getAttribute("data-time"));
        }

        if (currentTime > time && currentTime < nextTime) {
          elem.setAttribute("class", BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
          if (elem) {
            let elemBounds = getRelativeBounds(lyricsElement, elem);
            targetScrollPos = elemBounds.y;
            selectedLyricHeight = elemBounds.height;
            BetterLyrics.DOM.selectedElementIndex = index;
            elem.setAttribute("data-scrolled", true);
          }
          return true;
        } else {
          elem.setAttribute("data-scrolled", false);
          elem.setAttribute("class", "");
          return true;
        }
      });
      // lyricsHeight can change slightly due to animations
      const lyricsHeight = lyricsElement.getBoundingClientRect().height;
      const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
      const tabRendererHeight = tabRenderer.getBoundingClientRect().height;
      let scrollTop = tabRenderer.scrollTop;

      if (BetterLyrics.DOM.scrollResumeTime < Date.now() || BetterLyrics.DOM.scrollPos === -1) {
        let scrollPosOffset = Math.max(0, tabRendererHeight * 0.37 - selectedLyricHeight / 2);
        let scrollPos = Math.max(0, targetScrollPos - scrollPosOffset);
        scrollPos = Math.min(lyricsHeight - tabRendererHeight, scrollPos);

        if (Math.abs(scrollTop - scrollPos) > 2 && BetterLyrics.DOM.scrollPos !== -1
          && Date.now() > BetterLyrics.DOM.nextScrollAllowedTime) {
          lyricsElement.style.transition = "top 0s ease-in-out 0s";
          lyricsElement.style.top = `${-(scrollTop - scrollPos)}px`;
          // console.log(` - (${scrollTop} - ${scrollPos})px = `, - (scrollTop - scrollPos));

          scrollTop = scrollPos;
          BetterLyrics.DOM.scrollPos = -1; //force syncing position on the next tick
        } else if (BetterLyrics.DOM.scrollPos === -1) {
          if (lyricsElement.style.transition === "top 0s ease-in-out 0s") {
            BetterLyrics.DOM.nextScrollAllowedTime = toMs(lyricsElement.computedStyleMap().get("transition-duration")) + Date.now();
          }
          lyricsElement.style.transition = "";
          lyricsElement.style.top = "0px";
          BetterLyrics.DOM.scrollPos = scrollPos;
        }
      }

      if (Math.abs(scrollTop - tabRenderer.scrollTop) > 1) {
        tabRenderer.scrollTop = scrollTop;
        BetterLyrics.DOM.skipScrolls += 1;
        BetterLyrics.DOM.skipScrollsDecayTimes.push(Date.now() + 2000);
      }
      while (BetterLyrics.DOM.skipScrollsDecayTimes.length > 0 && BetterLyrics.DOM.skipScrollsDecayTimes[0] < Date.now()) {
        BetterLyrics.DOM.skipScrollsDecayTimes.shift();
        BetterLyrics.DOM.skipScrolls -= 1;
        if (BetterLyrics.DOM.skipScrolls < 1) {
          BetterLyrics.DOM.skipScrolls = 1; // Always leave at least one for when the window is refocused.
        }
      }
    } catch (err) {
      if (!(err.message && err.message.includes("undefined"))) {
        BetterLyrics.Utils.log("Error in lyrics check interval:", err);
      }
      return true;
    }
  },
  lyricsHeightAdjusted: function (index, amount, autoScrollOffset) {
    const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
    BetterLyrics.DOM.skipScrolls += 1;
    BetterLyrics.DOM.skipScrollsDecayTimes.push(Date.now() + 2000);

    if (index >= BetterLyrics.DOM.selectedElementIndex) {
      amount = 0;
    }
    if (BetterLyrics.DOM.nextScrollAllowedTime < Date.now()) {
      tabRenderer.scrollTop += amount - autoScrollOffset;
    } // else let the browser handle it

  },
  injectSongAttributes: function (title, artist) {
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
};

/**
 * Return the position relative to the center of the parent
 * @param parent {Element}
 * @param child {Element}
 */
function getRelativeBounds(parent, child) {
  const parentBound = parent.getBoundingClientRect();
  const childBound = child.getBoundingClientRect();
  return new DOMRect(childBound.x - parentBound.x, childBound.y - parentBound.y, childBound.width, childBound.height);
}

function toMs(cssDuration) {
  if (cssDuration.unit === "s") {
    return cssDuration.value * 1000;
  } else {
    return cssDuration.value;
  }
}
