BetterLyrics.DOM = {
  createLyricsWrapper: function () {
    const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
    const existingWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);

    if (existingWrapper) {
      existingWrapper.innerHTML = "";
      return existingWrapper;
    }

    const wrapper = document.createElement("div");
    wrapper.id = BetterLyrics.Constants.LYRICS_WRAPPER_ID;
    tabRenderer.appendChild(wrapper);

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_CREATED_LOG);
    return wrapper;
  },

  addFooter: function () {
    if (document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS).length > 0) {
      return;
    }
    const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
    const footer = document.createElement("div");
    footer.classList.add(BetterLyrics.Constants.FOOTER_CLASS);
    tabRenderer.appendChild(footer);
    BetterLyrics.DOM.createFooter();
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
      footerLink.href = "https://better-lyrics.boidu.dev";
      footerLink.target = "_blank";
      footerLink.textContent = "boidu.dev";

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
    try {
      const tabRenderer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
      let loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (!loaderWrapper) {
        loaderWrapper = document.createElement("div");
        loaderWrapper.id = BetterLyrics.Constants.LYRICS_LOADER_ID;
      }

      tabRenderer.prepend(loaderWrapper);
      loaderWrapper.style.display = "inline-block !important";
      loaderWrapper.setAttribute("active", "");
      loaderWrapper.scrollIntoView({
        behavior: "smooth",
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
      if (loaderWrapper) {
        loaderWrapper.style.display = "none !important";
        loaderWrapper.removeAttribute("active");
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  isLoaderActive: function () {
    try {
      const loaderWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_LOADER_ID);
      if (loaderWrapper) {
        return loaderWrapper.hasAttribute("active");
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  clearLyrics: function () {
    try {
      const lyricsWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);
      if (lyricsWrapper) {
        lyricsWrapper.innerHTML = "";
      }
      BetterLyrics.DOM.renderLoader();
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }
  },

  injectError: function () {
    const message = "No lyrics found for this song.";

    try {
      const hasYtMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR);

      if (hasYtMusicLyrics) {
        if (
          hasYtMusicLyrics.innerText === "Lyrics not available" &&
          hasYtMusicLyrics.parentElement.style.display !== "none"
        ) {
          let lyricsWrapper = document.getElementById(BetterLyrics.Constants.LYRICS_WRAPPER_ID);

          if (!lyricsWrapper) {
            lyricsWrapper = BetterLyrics.DOM.createLyricsWrapper();
          }

          const errorContainer = document.createElement("div");
          errorContainer.className = BetterLyrics.Constants.ERROR_LYRICS_CLASS;
          errorContainer.innerText = message;

          if (lyricsWrapper) {
            lyricsWrapper.innerHTML = "";
          }

          lyricsWrapper.appendChild(errorContainer);
          BetterLyrics.DOM.flushLoader();

          return;
        }
      }
      BetterLyrics.Utils.log(BetterLyrics.Constants.YT_MUSIC_LYRICS_AVAILABLE_LOG);
      const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
      const existingFooter = document.getElementsByClassName(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)[0];
      if (existingLyrics && existingFooter) {
        for (let lyrics of existingLyrics) {
          lyrics.classList.add("blyrics--fallback");
        }
        existingFooter.classList.add("blyrics--fallback");
      }
      BetterLyrics.DOM.flushLoader();
    } catch (err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_NOT_VISIBLE_LOG);
      BetterLyrics.Utils.log(err);
    }
  },

  requestSongInfo: function (callback) {
    let timeoutId;

    timeoutId = setTimeout(() => {
      const legacyData = BetterLyrics.DOM.legacySongInfo();
      callback(legacyData);
    }, 1000);

    const handleSongInfo = event => {
      BetterLyrics.DOM.onScriptSendSongInfo(event, callback, timeoutId);
    };

    document.addEventListener("blyrics-send-song-info", handleSongInfo);

    document.dispatchEvent(new Event("blyrics-get-song-info"));

    document.removeEventListener("blyrics-send-song-info", handleSongInfo);
    clearTimeout(timeoutId);
  },

  legacySongInfo: function () {
    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_LEGACY_LOG);
    const song = document.getElementsByClassName(BetterLyrics.Constants.TITLE_CLASS)[0].innerHTML;
    let artist;
    try {
      artist = document.getElementsByClassName(BetterLyrics.Constants.SUBTITLE_CLASS)[0].children[0].children[0]
        .innerHTML;
    } catch (_err) {
      artist = document.getElementsByClassName(BetterLyrics.Constants.SUBTITLE_CLASS)[0].children[0].innerHTML;
    }

    return {
      song,
      artist,
    };
  },

  onScriptSendSongInfo: function (event, callback, timeoutId) {
    clearTimeout(timeoutId);
    const data = event.detail;

    const mainPanel = document.getElementById("main-panel");

    if (mainPanel) {
      const existingSongInfo = document.getElementById("blyrics-song-info");
      const existingWatermark = document.getElementById("blyrics-watermark");

      existingSongInfo?.remove();
      existingWatermark?.remove();

      const title = document.createElement("p");
      title.id = "blyrics-title";
      title.textContent = data.song;

      const artist = document.createElement("p");
      artist.id = "blyrics-artist";
      artist.textContent = data.artist;

      const songInfoWrapper = document.createElement("div");
      songInfoWrapper.id = "blyrics-song-info";
      songInfoWrapper.appendChild(title);
      songInfoWrapper.appendChild(artist);

      const watermark = document.createElement("div");
      watermark.id = BetterLyrics.Constants.WATERMARK_CLASS;

      const watermarkContainer = document.createElement("div");
      watermarkContainer.className = `${BetterLyrics.Constants.WATERMARK_CLASS}__container`;

      const watermarkImage = document.createElement("img");
      watermarkImage.src = "https://better-lyrics.boidu.dev/icon-512.png";
      watermarkImage.alt = "Better Lyrics Logo";
      watermarkImage.width = "20";
      watermarkImage.height = "20";

      watermarkContainer.appendChild(watermarkImage);

      const watermarkLink = document.createElement("p");
      watermarkLink.textContent = "dub.sh/blyt";

      watermarkContainer.appendChild(watermarkLink);

      watermark.appendChild(watermarkContainer);
      watermark.removeAttribute("is-empty");

      const player = document.getElementById("player");
      player.appendChild(watermark);

      mainPanel.appendChild(songInfoWrapper);
    }

    callback(data);
  },

  addAlbumArtToLayout: function () {
    let albumArt = document.querySelector(BetterLyrics.Constants.SONG_IMAGE_SELECTOR).src;
    if (albumArt === BetterLyrics.Constants.EMPTY_THUMBNAIL_SRC) {
      albumArt = BetterLyrics.Utils.generateAlbumArt();
    }
    document.getElementById("layout").style = `--blyrics-background-img: url('${albumArt}')`;
    BetterLyrics.Utils.log(BetterLyrics.Constants.ALBUM_ART_ADDED_LOG);
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
    const existingFooter = document.getElementsByClassName(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)[0];
    const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
    const blyricsFooter = document.getElementsByClassName(BetterLyrics.Constants.FOOTER_CLASS)[0];

    if (blyricsFooter) {
      blyricsFooter.remove();
    }
    if (existingLyrics) {
      for (let lyrics of existingLyrics) {
        if (lyrics.classList.contains("blyrics--fallback")) {
          lyrics.classList.remove("blyrics--fallback");
        }
      }
    }
    if (existingFooter && existingFooter.classList.contains("blyrics--fallback")) {
      existingFooter.classList.remove("blyrics--fallback");
    }

    const existingSongInfo = document.getElementById("blyrics-song-info");
    const existingWatermark = document.getElementById("blyrics-watermark");

    if (existingSongInfo) {
      existingSongInfo.remove();
    }
    if (existingWatermark) {
      existingWatermark.remove();
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
};
