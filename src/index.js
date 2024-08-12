// Selectors and classnames
const TITLE_CLASS = "title ytmusic-player-bar"; // Class for the song title
const SUBTITLE_CLASS = "subtitle style-scope ytmusic-player-bar"; // Class for the artist name
const TAB_HEADER_CLASS = "tab-header style-scope ytmusic-player-page"; // Class for the tab headers
const TAB_CONTENT_CLASS = "tab-content style-scope tp-yt-paper-tab"; // Class for the tab content
const LYRICS_CLASS = "blyrics-container"; // Class for the lyrics container
const CURRENT_LYRICS_CLASS = "blyrics--active"; // Class for the current lyrics line
const TRANSLATED_LYRICS_CLASS = "blyrics--translated"; // Class for the translated lyrics line
const ERROR_LYRICS_CLASS = "blyrics--error"; // Class for the error message
const DESCRIPTION_CLASS = "description style-scope ytmusic-description-shelf-renderer"; // Class for the description container
const FOOTER_CLASS = "blyrics-footer"; // Class for the footer
const WATERMARK_CLASS = "blyrics-watermark"; // Class for the watermark
const TIME_INFO_CLASS = "time-info style-scope ytmusic-player-bar"; // Class for the time info
const YT_MUSIC_FOOTER_CLASS = "footer style-scope ytmusic-description-shelf-renderer"; // Class for the default footer
const SONG_IMAGE_SELECTOR = "#song-image>#thumbnail>#img"; // Selector for the song image
const TAB_RENDERER_SELECTOR = "#tab-renderer"; // Class for the tab renderer
const NO_LYRICS_TEXT_SELECTOR =
  "#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer"; // Selector for the no lyrics text
const LYRICS_LOADER_ID = "blyrics-loader"; // Selector for the lyrics loader
const LYRICS_WRAPPER_ID = "blyrics-wrapper"; // Class for the lyrics wrapper
const LYRICS_DISABLED_ATTR = "blyrics-dfs"; // Attribute for the disabled full screen
const LYRICS_STYLIZED_ATTR = "blyrics-stylized"; // Attribute for the stylized animations
const LYRICS_RTL_ATTR = "blyrics-rtl-enabled"; // Attribute for the RTL direction
const DISCORD_LOGO_SRC =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhYWEiIGQ9Ik0xOS4yNyA1LjMzQzE3Ljk0IDQuNzEgMTYuNSA0LjI2IDE1IDRhLjA5LjA5IDAgMCAwLS4wNy4wM2MtLjE4LjMzLS4zOS43Ni0uNTMgMS4wOWExNi4wOSAxNi4wOSAwIDAgMC00LjggMGMtLjE0LS4zNC0uMzUtLjc2LS41NC0xLjA5Yy0uMDEtLjAyLS4wNC0uMDMtLjA3LS4wM2MtMS41LjI2LTIuOTMuNzEtNC4yNyAxLjMzYy0uMDEgMC0uMDIuMDEtLjAzLjAyYy0yLjcyIDQuMDctMy40NyA4LjAzLTMuMSAxMS45NWMwIC4wMi4wMS4wNC4wMy4wNWMxLjggMS4zMiAzLjUzIDIuMTIgNS4yNCAyLjY1Yy4wMy4wMS4wNiAwIC4wNy0uMDJjLjQtLjU1Ljc2LTEuMTMgMS4wNy0xLjc0Yy4wMi0uMDQgMC0uMDgtLjA0LS4wOWMtLjU3LS4yMi0xLjExLS40OC0xLjY0LS43OGMtLjA0LS4wMi0uMDQtLjA4LS4wMS0uMTFjLjExLS4wOC4yMi0uMTcuMzMtLjI1Yy4wMi0uMDIuMDUtLjAyLjA3LS4wMWMzLjQ0IDEuNTcgNy4xNSAxLjU3IDEwLjU1IDBjLjAyLS4wMS4wNS0uMDEuMDcuMDFjLjExLjA5LjIyLjE3LjMzLjI2Yy4wNC4wMy4wNC4wOS0uMDEuMTFjLS41Mi4zMS0xLjA3LjU2LTEuNjQuNzhjLS4wNC4wMS0uMDUuMDYtLjA0LjA5Yy4zMi42MS42OCAxLjE5IDEuMDcgMS43NGMuMDMuMDEuMDYuMDIuMDkuMDFjMS43Mi0uNTMgMy40NS0xLjMzIDUuMjUtMi42NWMuMDItLjAxLjAzLS4wMy4wMy0uMDVjLjQ0LTQuNTMtLjczLTguNDYtMy4xLTExLjk1Yy0uMDEtLjAxLS4wMi0uMDItLjA0LS4wMk04LjUyIDE0LjkxYy0xLjAzIDAtMS44OS0uOTUtMS44OS0yLjEycy44NC0yLjEyIDEuODktMi4xMmMxLjA2IDAgMS45Ljk2IDEuODkgMi4xMmMwIDEuMTctLjg0IDIuMTItMS44OSAyLjEybTYuOTcgMGMtMS4wMyAwLTEuODktLjk1LTEuODktMi4xMnMuODQtMi4xMiAxLjg5LTIuMTJjMS4wNiAwIDEuOS45NiAxLjg5IDIuMTJjMCAxLjE3LS44MyAyLjEyLTEuODkgMi4xMiIvPjwvc3ZnPg=="; // Source for the discord logo
const EMPTY_THUMBNAIL_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Constants
const LYRICS_API_URL = "https://lyrics-api.boidu.dev/getLyrics"; // URL for the lyrics API
const DISCORD_INVITE_URL = "https://discord.gg/UsHE3d5fWF"; // URL for the discord invite
const FONT_LINK = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap"; // URL for the font
const TRANSLATE_LYRICS_URL = (lang, text) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(
    text
  )}`; // URL for the translation API

// Console log constants

const LOG_PREFIX = "[BetterLyrics]";
const IGNORE_PREFIX = "(Safe to ignore)";
const INITIALIZE_LOG = `%c${LOG_PREFIX} Loaded Successfully. Logs are enabled by default. You can disable them in the extension options.`;
const FETCH_LYRICS_LOG = `${LOG_PREFIX} Attempting to fetch lyrics for`;
const SERVER_ERROR_LOG = `${LOG_PREFIX} Unable to fetch lyrics due to server error`;
const NO_LYRICS_FOUND_LOG = `${LOG_PREFIX} No lyrics found for the current song`;
const LYRICS_LEGACY_LOG = `${LOG_PREFIX} Using legacy method to fetch song info`;
const LYRICS_FOUND_LOG = `${LOG_PREFIX} Lyrics found, injecting into the page`;
const LYRICS_TAB_HIDDEN_LOG = `${LOG_PREFIX} ${IGNORE_PREFIX} Lyrics tab is hidden, skipping lyrics fetch`;
const LYRICS_TAB_VISIBLE_LOG = `${LOG_PREFIX} Lyrics tab is visible, fetching lyrics`;
const LYRICS_TAB_CLICKED_LOG = `${LOG_PREFIX} Lyrics tab clicked, fetching lyrics`;
const LYRICS_WRAPPER_NOT_VISIBLE_LOG = `${LOG_PREFIX} ${IGNORE_PREFIX} Lyrics wrapper is not visible, unable to inject lyrics`;
const LYRICS_WRAPPER_CREATED_LOG = `${LOG_PREFIX} Lyrics wrapper created`;
const FOOTER_NOT_VISIBLE_LOG = `${LOG_PREFIX} ${IGNORE_PREFIX} Footer is not visible, unable to inject source link`;
const LYRICS_TAB_NOT_DISABLED_LOG = `${LOG_PREFIX} ${IGNORE_PREFIX} Lyrics tab is not disabled, unable to enable it`;
const SONG_SWITCHED_LOG = `${LOG_PREFIX} Song has been switched`;
const ALBUM_ART_ADDED_LOG = `${LOG_PREFIX} Album art added to the layout`;
const AUTO_SWITCH_ENABLED_LOG = `${LOG_PREFIX} Auto switch enabled, switching to lyrics tab`;
const TRANSLATION_ENABLED_LOG = `${LOG_PREFIX} Translation enabled, translating lyrics. Language: `;
const TRANSLATION_ERROR_LOG = `${LOG_PREFIX} Unable to translate lyrics due to error`;
const SYNC_DISABLED_LOG = `${LOG_PREFIX} Syncing lyrics disabled due to all lyrics having a start time of 0`;
const YT_MUSIC_LYRICS_AVAILABLE_LOG = `${LOG_PREFIX} Lyrics are available on the page & backend failed to fetch lyrics`;
const LOADER_ACTIVE_LOG = `${LOG_PREFIX} ${IGNORE_PREFIX} Loader is active, skipping lyrics sync`;
const GENERAL_ERROR_LOG = `${LOG_PREFIX} Error:`;

// Global variables

let lang = "en"; // Default language
let lyricsCheckInterval; // Interval for syncing lyrics with video playback

// Storage get function
const getStorage = (key, callback) => {
  const inChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
  const inFirefox = typeof browser !== "undefined";
  if (inChrome) {
    if (chrome.runtime?.id) {
      chrome.storage.sync.get(key, callback);
    } else {
      callback(key);
    }
  } else if (inFirefox) {
    browser.storage.sync.get(key, callback);
  } else {
    callback(key);
  }
};

// Utility functions
const log = (...message) => {
  getStorage({ isLogsEnabled: true }, items => {
    if (items.isLogsEnabled) {
      console.log(...message);
    }
  });
};

const onAutoSwitchEnabled = callback => {
  getStorage({ isAutoSwitchEnabled: false }, items => {
    if (items.isAutoSwitchEnabled) {
      callback();
    }
  });
};

const onFullScreenDisabled = callback => {
  getStorage({ isFullScreenDisabled: false }, items => {
    if (items.isFullScreenDisabled) {
      callback();
    }
  });
};

const onAlbumArtEnabled = callback => {
  getStorage({ isAlbumArtEnabled: true }, items => {
    if (items.isAlbumArtEnabled) {
      callback();
    }
  });
};

const onStylizedAnimationsEnabled = callback => {
  getStorage({ isStylizedAnimationsEnabled: true }, items => {
    if (items.isStylizedAnimationsEnabled) {
      callback();
    }
  });
};

const onTranslationEnabled = callback => {
  getStorage(["isTranslateEnabled", "translationLanguage"], items => {
    if (items.isTranslateEnabled) {
      callback(items);
    }
  });
};

const onAutoHideCursor = callback => {
  getStorage({ isCursorAutoHideEnabled: true }, items => {
    if (items.isCursorAutoHideEnabled) {
      callback();
    }
  });
};

const onScriptSendSongInfo = (event, callback, timeoutId, cleanup) => {
  clearTimeout(timeoutId);
  const data = event.detail;

  const mainPanel = document.getElementById("main-panel");

  if (mainPanel) {
    // Remove the existing song info

    const existingSongInfo = document.getElementById("blyrics-song-info");

    const existingWatermark = document.getElementById("blyrics-watermark");

    existingSongInfo?.remove();
    existingWatermark?.remove();

    // Create the song info wrapper

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

    // Create the footer/watermark

    const watermark = document.createElement("div");
    watermark.id = WATERMARK_CLASS;

    const watermarkContainer = document.createElement("div");
    watermarkContainer.className = `${WATERMARK_CLASS}__container`;

    // Watermark source pill
    const watermarkImage = document.createElement("img");
    watermarkImage.src = "https://better-lyrics.boidu.dev/icon-512.png";
    watermarkImage.alt = "Better Lyrics Logo";
    watermarkImage.width = "20";
    watermarkImage.height = "20";

    watermarkContainer.appendChild(watermarkImage);

    const watermarkLink = document.createElement("p");
    watermarkLink.textContent = "dub.sh/blyt";

    watermarkContainer.appendChild(watermarkLink);

    // Add the watermark container to the watermark
    watermark.appendChild(watermarkContainer);

    watermark.removeAttribute("is-empty");

    const player = document.getElementById("player");

    player.appendChild(watermark);

    mainPanel.appendChild(songInfoWrapper);
  }

  callback(data);

  cleanup && cleanup();
};

// Function to inject or update the <style> tag with the custom CSS
const applyCustomCSS = css => {
  // Check if a <style> tag with the ID 'custom-style' already exists
  let styleTag = document.getElementById("blyrics-custom-style");

  // If it exists, update its content
  if (styleTag) {
    styleTag.textContent = css;
  } else {
    // If it doesn't exist, create a new <style> tag and append it to the <head>
    styleTag = document.createElement("style");
    styleTag.id = "blyrics-custom-style";
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
  }
};

// Function to get the custom CSS from storage and apply it
const getAndApplyCustomCSS = () => {
  chrome.storage.sync.get(["customCSS"], result => {
    if (result.customCSS) {
      applyCustomCSS(result.customCSS);
    }
  });
};

// Listen for changes in the storage
const subscribeToCustomCSS = () => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.customCSS) {
      applyCustomCSS(changes.customCSS.newValue);
    }
  });
  getAndApplyCustomCSS();
};

// Initial application of CSS when the script loads

// Helper function to convert time string to integer
const timeToInt = time => {
  time = time.split(":");
  time = parseFloat(time[0]) * 60 + parseFloat(time[1]);
  return time;
};

// Function to convert &amp; to &
function unEntity(str) {
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// Function for translate lyrics
function translateText(text, targetLanguage) {
  let url = TRANSLATE_LYRICS_URL(targetLanguage, text);

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      let originalLanguage = data[2];
      let translatedText = "";
      data[0].forEach(part => {
        translatedText += part[0];
      });
      return { originalLanguage, translatedText };
    })
    .catch(error => {
      log(TRANSLATION_ERROR_LOG, error);
      return null;
    });
}

// Function to inject the script to get song info
const injectGetSongInfo = () => {
  let s = document.createElement("script");
  s.src = chrome.runtime.getURL("src/script.js");
  s.id = "blyrics-script";
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
};

// Function to request song info from the injected script
// This fixes the issue with localization of song title and artist name
const requestSongInfo = callback => {
  let timeoutId;

  // Set a timeout to invoke the callback with legacySongInfo if event doesn't trigger within 1 second
  timeoutId = setTimeout(() => {
    const legacyData = legacySongInfo();
    callback(legacyData);
  }, 1000);

  const handleSongInfo = event => {
    onScriptSendSongInfo(event, callback, timeoutId);
  };

  document.addEventListener("blyrics-send-song-info", handleSongInfo);

  document.dispatchEvent(new Event("blyrics-get-song-info"));

  // Cleanup the event listener and timeout
  document.removeEventListener("blyrics-send-song-info", handleSongInfo);
  clearTimeout(timeoutId);
  return;
};

// Legacy function to fetch song info. Replaced in favor of injected script or used as a fallback
const legacySongInfo = () => {
  log(LYRICS_LEGACY_LOG);
  const song = document.getElementsByClassName(TITLE_CLASS)[0].innerHTML; // Get the song title
  let artist;
  try {
    artist = document.getElementsByClassName(SUBTITLE_CLASS)[0].children[0].children[0].innerHTML; // Get the artist name
  } catch (_err) {
    artist = document.getElementsByClassName(SUBTITLE_CLASS)[0].children[0].innerHTML; // Get the artist name (alternative way)
  }

  return {
    song,
    artist,
  };
};

// Function to scroll to the top of the lyrics container when song is switched
const scrollToTop = () => {
  try {
    const lyricsContainer = document.getElementsByClassName(LYRICS_CLASS)[0];
    if (!lyricsContainer) {
      return;
    }
    const lyrics = lyricsContainer.children;
    lyrics[0].scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
    lyricsContainer.scrollTop = 0;
  } catch (err) {
    log(err);
  }
};

// Function to render loader
const renderLoader = () => {
  try {
    const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR);
    let loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (!loaderWrapper) {
      loaderWrapper = document.createElement("div");
      loaderWrapper.id = LYRICS_LOADER_ID;
    }

    tabRenderer.prepend(loaderWrapper);
    loaderWrapper.style.display = "inline-block !important";
    loaderWrapper.setAttribute("active", "");
    // scroll loader to top
    loaderWrapper.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  } catch (err) {
    log(err);
  }
};

// Function to flush loader
const flushLoader = () => {
  try {
    const loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (loaderWrapper) {
      loaderWrapper.style.display = "none !important";
      loaderWrapper.removeAttribute("active");
    }
  } catch (err) {
    log(err);
  }
};

// Function to check if loader is active
const isLoaderActive = () => {
  try {
    const loaderWrapper = document.getElementById(LYRICS_LOADER_ID);
    if (loaderWrapper) {
      return loaderWrapper.hasAttribute("active");
    }
  } catch (err) {
    log(err);
  }
};

// Function to clear the lyrics container
const clearLyrics = () => {
  try {
    const lyricsWrapper = getLyricsWrapper();
    if (lyricsWrapper) {
      lyricsWrapper.innerHTML = "";
    }

    renderLoader();
  } catch (err) {
    log(err);
  }
};

// Function to inject error message
const injectError = () => {
  const message = "No lyrics found for this song.";

  try {
    // Check if youtube music lyrics are available
    const hasYtMusicLyrics = document.querySelector(NO_LYRICS_TEXT_SELECTOR);

    if (hasYtMusicLyrics) {
      if (
        hasYtMusicLyrics.innerText === "Lyrics not available" &&
        hasYtMusicLyrics.parentElement.style.display !== "none"
      ) {
        // Lyrics are not available on the page and the backend failed to fetch lyrics
        // Display no lyrics found message
        let lyricsWrapper = getLyricsWrapper();

        if (!lyricsWrapper) {
          lyricsWrapper = createLyricsWrapper();
        }

        const errorContainer = document.createElement("div");
        errorContainer.className = ERROR_LYRICS_CLASS;
        errorContainer.innerText = message;

        if (lyricsWrapper) {
          lyricsWrapper.innerHTML = "";
        } // Clear the lyrics container

        lyricsWrapper.appendChild(errorContainer); // Append error message to lyrics container
        flushLoader();

        return;
      }
    }
    log(YT_MUSIC_LYRICS_AVAILABLE_LOG);
    const existingLyrics = document.getElementsByClassName(DESCRIPTION_CLASS);
    const existingFooter = document.getElementsByClassName(YT_MUSIC_FOOTER_CLASS)[0];
    if (existingLyrics && existingFooter) {
      for (let lyrics of existingLyrics) {
        lyrics.classList.add("blyrics--fallback");
      }
      existingFooter.classList.add("blyrics--fallback");
    }
    flushLoader();

    return;
  } catch (err) {
    log(LYRICS_WRAPPER_NOT_VISIBLE_LOG); // Log lyrics wrapper not visible
    log(err);
  }
};

// Function to create and inject lyrics
const createLyrics = () => {
  requestSongInfo(e => {
    const song = e.song;
    const artist = e.artist;

    log(FETCH_LYRICS_LOG, song, artist); // Log fetching lyrics

    const url = `${LYRICS_API_URL}?s=${encodeURIComponent(unEntity(song))}&a=${encodeURIComponent(unEntity(artist))}`; // Construct the API URL with song and artist

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const lyrics = data.lyrics;

        lang = data.language;
        setRtlAttributes(data.isRtlLanguage);

        clearInterval(lyricsCheckInterval); // Clear the lyrics interval

        if (!lyrics || lyrics.length === 0) {
          log(NO_LYRICS_FOUND_LOG); // Log no lyrics found
          setTimeout(injectError, 500);

          return;
        }
        log(LYRICS_FOUND_LOG); // Log lyrics found
        try {
          const lyrics = document.getElementsByClassName(LYRICS_CLASS)[0];
          lyrics.innerHTML = ""; // Clear the lyrics container
        } catch (_err) {
          log(LYRICS_TAB_NOT_DISABLED_LOG); // Log lyrics tab not disabled
        }
        injectLyrics(lyrics); // Inject lyrics
      })
      .catch(err => {
        clearInterval(lyricsCheckInterval); // Clear the lyrics interval

        log(SERVER_ERROR_LOG); // Log server error
        log(err);
        setTimeout(injectError, 500);

        return;
      });
  });
};

// Function to get lyrics wrapper
const getLyricsWrapper = () => {
  return document.getElementById(LYRICS_WRAPPER_ID);
};

// Function to add footer
const addFooter = () => {
  if (document.getElementsByClassName(FOOTER_CLASS).length > 0) {
    return;
  }
  const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR);
  const footer = document.createElement("div");

  footer.classList.add(FOOTER_CLASS);
  tabRenderer.appendChild(footer);
  createFooter();
};

// Function to create lyrics wrapper
const createLyricsWrapper = () => {
  // Append the section list renderer to the body or any desired parent element
  const tabRenderer = document.querySelector(TAB_RENDERER_SELECTOR);

  // Check if the wrapper already exists
  const existingWrapper = getLyricsWrapper();
  if (existingWrapper) {
    existingWrapper.innerHTML = "";
    return existingWrapper;
  }

  // Create the wrapper
  const wrapper = document.createElement("div");
  wrapper.id = LYRICS_WRAPPER_ID;

  // Append the wrapper and add footer to the tab renderer
  tabRenderer.appendChild(wrapper);

  log(LYRICS_WRAPPER_CREATED_LOG); // Log lyrics wrapper created
  return getLyricsWrapper();
};

// Function to create footer

const createFooter = () => {
  try {
    const footer = document.getElementsByClassName(FOOTER_CLASS)[0];
    footer.innerHTML = "";

    const footerContainer = document.createElement("div");
    footerContainer.className = `${FOOTER_CLASS}__container`;

    // Footer source pill
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

    // Footer discord link
    const discordImage = document.createElement("img");
    discordImage.src = DISCORD_LOGO_SRC;
    discordImage.alt = "Better Lyrics Discord";
    discordImage.width = "20";
    discordImage.height = "20";

    const discordLink = document.createElement("a");
    discordLink.className = `${FOOTER_CLASS}__discord`;
    discordLink.href = DISCORD_INVITE_URL;
    discordLink.target = "_blank";

    discordLink.appendChild(discordImage);

    // Add the footer container to the footer
    footer.appendChild(footerContainer);

    // Add the discord link to the footer
    footer.appendChild(discordLink);

    footer.removeAttribute("is-empty");
  } catch (_err) {
    log(FOOTER_NOT_VISIBLE_LOG); // Log footer not visible
  }
};

const setRtlAttributes = isRtl => {
  const layout = document.getElementById("layout");
  const playerPage = document.getElementById("player-page");

  if (layout && playerPage) {
    if (isRtl) {
      layout.setAttribute(LYRICS_RTL_ATTR, "");
      playerPage.setAttribute(LYRICS_RTL_ATTR, "");

      return;
    }
    layout.removeAttribute(LYRICS_RTL_ATTR);
    playerPage.removeAttribute(LYRICS_RTL_ATTR);

    return;
  }
};

// Function to inject lyrics into the DOM
const injectLyrics = lyrics => {
  // Inject Lyrics into DOM
  let lyricsWrapper;

  lyricsWrapper = createLyricsWrapper();

  addFooter();

  try {
    lyricsWrapper.innerHTML = "";
    const lyricsContainer = document.createElement("div");
    lyricsContainer.className = LYRICS_CLASS;
    lyricsWrapper.appendChild(lyricsContainer); // Append the lyrics container to the wrapper
    flushLoader();

    lyricsWrapper.removeAttribute("is-empty");
  } catch (_err) {
    log(LYRICS_WRAPPER_NOT_VISIBLE_LOG); // Log lyrics wrapper not visible
  }

  onTranslationEnabled(items => {
    log(TRANSLATION_ENABLED_LOG, items.translationLanguage);
  });

  // Set an interval to sync the lyrics with the video playback
  const allZero = lyrics.every(item => item.startTimeMs === "0");

  lyrics.forEach(item => {
    let line = document.createElement("div");
    line.dataset.time = item.startTimeMs / 1000; // Set the start time of the line
    line.style = "--blyrics-duration: " + item.durationMs / 1000 + "s;"; // Set the duration of the line

    const words = item.words.split(" ");

    if (!allZero) {
      line.setAttribute("data-scrolled", false);

      line.setAttribute(
        "onClick",
        `const player = document.getElementById("movie_player"); player.seekTo(${
          item.startTimeMs / 1000
        }, true);player.playVideo();` // Set the onClick event to seek to the start time and play the video
      );
    } else {
      line.classList.add(CURRENT_LYRICS_CLASS);
    }

    words.forEach((word, index) => {
      let span = document.createElement("span");
      span.style.transitionDelay = `${index * 0.05}s`;
      span.style.animationDelay = `${index * 0.05}s`;
      span.textContent = words.length <= 1 ? word : word + " ";
      line.appendChild(span);
    });

    onTranslationEnabled(items => {
      let translatedLine = document.createElement("span"); // Create a span element
      translatedLine.classList.add(TRANSLATED_LYRICS_CLASS);

      let source_language = lang ?? "en"; // Use the saved language or the default 'en'
      let target_language = items.translationLanguage || "en"; // Use the saved language or the default 'en'

      if (source_language !== target_language) {
        if (item.words.trim() !== "♪" && item.words.trim() !== "") {
          translateText(item.words, target_language).then(result => {
            if (result) {
              if (result.originalLanguage !== target_language) {
                // If the translation was successful, set the translated text as the content for translatedLine
                translatedLine.textContent = "\n" + result.translatedText;
                line.appendChild(translatedLine);
              }
            } else {
              // If an error occurred during translation, we show the line as "—" since we don't want to take away from the UX
              translatedLine.textContent = "\n" + "—";
              line.appendChild(translatedLine); // Add span to the line
            }
          });
        }
      }
    });

    try {
      document.getElementsByClassName(LYRICS_CLASS)[0].appendChild(line); // Append the line to the lyrics container
    } catch (_err) {
      log(LYRICS_WRAPPER_NOT_VISIBLE_LOG); // Log lyrics wrapper not visible
    }
  });

  if (!allZero) {
    lyricsCheckInterval = setInterval(function () {
      if (isLoaderActive()) {
        log(LOADER_ACTIVE_LOG);
        return;
      }
      try {
        let currentTime =
          timeToInt(
            document
              .getElementsByClassName(TIME_INFO_CLASS)[0]
              .innerHTML.replaceAll(" ", "")
              .replaceAll("\n", "")
              .split("/")[0]
          ) + 0.75; // Get the current time of the video
        const lyrics = [...document.getElementsByClassName(LYRICS_CLASS)[0].children]; // Get all the lyrics lines

        lyrics.every((elem, index) => {
          const time = parseFloat(elem.getAttribute("data-time")); // Get the start time of the line

          if (currentTime >= time && index + 1 === lyrics.length && elem.getAttribute("data-scrolled") !== "true") {
            // If it's the last line
            elem.setAttribute("class", CURRENT_LYRICS_CLASS); // Set it as the current line

            elem.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            }); // Scroll to the current line

            elem.setAttribute("data-scrolled", true); // Mark as scrolled

            return true;
          } else if (currentTime > time && currentTime < parseFloat(lyrics[index + 1].getAttribute("data-time"))) {
            // If it's between the current and next line
            const current = document.getElementsByClassName(CURRENT_LYRICS_CLASS)[0];

            elem.setAttribute("class", CURRENT_LYRICS_CLASS); // Set it as the current line
            if (current !== undefined && current.getAttribute("data-scrolled") !== "true") {
              current.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
              }); // Scroll to the current line
              current.setAttribute("data-scrolled", true); // Mark as scrolled
            }
            return true;
          } else {
            elem.setAttribute("data-scrolled", false); // Reset the scrolled flag
            elem.setAttribute("class", ""); // Remove the current class
            return true;
          }
        });
      } catch (err) {
        log(err);
        return true;
      }
    }, 50); // Check every 50ms
  } else {
    log(SYNC_DISABLED_LOG);
  }
};

// Function to generate album art from the youtube video's thumbnail
const generateAlbumArt = () => {
  const videoId = new URLSearchParams(window.location.search).get("v"); // Get the video ID from the URL
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Return the URL for the video thumbnail
};

// Function to add the album art to the layout
const addAlbumArtToLayout = () => {
  let albumArt = document.querySelector(SONG_IMAGE_SELECTOR).src; // Get the album art URL
  if (albumArt === EMPTY_THUMBNAIL_SRC) {
    albumArt = generateAlbumArt();
  }
  document.getElementById("layout").style = `--blyrics-background-img: url('${albumArt}')`; // Set the background image of the layout

  log(ALBUM_ART_ADDED_LOG); // Log album art added
};

// Mutation Observer to check if lyrics tab button is disabled and remove the disabled attribute
const enableLyricsTab = () => {
  const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1];
  if (!tabSelector) {
    setTimeout(() => {
      enableLyricsTab();
    }, 1000);
    return;
  }
  if (tabSelector.hasAttribute("disabled")) {
    tabSelector.removeAttribute("disabled");
    tabSelector.setAttribute("aria-disabled", "false");
    onAutoSwitchEnabled(() => {
      tabSelector.click();
      log(AUTO_SWITCH_ENABLED_LOG);
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
};

// Function to cleanup classnames and footer
const cleanup = () => {
  const existingFooter = document.getElementsByClassName(YT_MUSIC_FOOTER_CLASS)[0];

  const existingLyrics = document.getElementsByClassName(DESCRIPTION_CLASS);

  const blyricsFooter = document.getElementsByClassName(FOOTER_CLASS)[0];
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

  clearLyrics();
};

// Function to handle the main modifications to the page
const handleModifications = () => {
  cleanup();
  scrollToTop();
  renderLoader();
  setTimeout(() => createLyrics(), 1000);
};

const injectHeadTags = () => {
  const imgURL = "https://better-lyrics.boidu.dev/icon-512.png";

  const imagePreload = document.createElement("link");
  imagePreload.rel = "preload";
  imagePreload.as = "image";
  imagePreload.href = imgURL;

  document.head.appendChild(imagePreload);

  const fontLink = document.createElement("link");
  fontLink.href = FONT_LINK;
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink); // Add the font link to the head
};

// Function to hide cursor on idle
const hideCursorOnIdle = () => {
  onAutoHideCursor(() => {
    let mouseTimer = null,
      cursorVisible = true;

    function disappearCursor() {
      mouseTimer = null;
      document.getElementById("layout").setAttribute("cursor-hidden", "");
      cursorVisible = false;
    }

    document.onmousemove = function () {
      if (mouseTimer) {
        window.clearTimeout(mouseTimer);
      }
      if (!cursorVisible) {
        document.getElementById("layout").removeAttribute("cursor-hidden");
        cursorVisible = true;
      }
      mouseTimer = window.setTimeout(disappearCursor, 3000);
    };
  });
};

// Function to handle settings
const handleSettings = () => {
  // Handle full screen disabled
  onFullScreenDisabled(() => {
    const layout = document.getElementById("layout");
    const playerPage = document.getElementById("player-page");

    if (layout && playerPage) {
      layout.setAttribute(LYRICS_DISABLED_ATTR, "");
      playerPage.setAttribute(LYRICS_DISABLED_ATTR, "");
    }
  });

  onStylizedAnimationsEnabled(() => {
    const layout = document.getElementById("layout");
    const playerPage = document.getElementById("player-page");
    const appBase = document.getElementsByTagName("ytmusic-app")[0];

    if (layout && playerPage) {
      layout.setAttribute(LYRICS_STYLIZED_ATTR, "");
      playerPage.setAttribute(LYRICS_STYLIZED_ATTR, "");
      appBase.setAttribute(LYRICS_STYLIZED_ATTR, "");
    }
  });
};

// Main function to modify the page
const modify = () => {
  injectGetSongInfo();
  enableLyricsTab();
  injectHeadTags();
  hideCursorOnIdle();
  handleSettings();
  subscribeToCustomCSS();

  log(
    INITIALIZE_LOG,
    "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
  ); // Log initialization

  // Detect Song Changes
  let song = {
    title: "",
    artist: "",
  };
  let targetNode = document.getElementsByClassName(TITLE_CLASS)[0]; // Get the song title element
  let config = {
    attributes: true,
    childList: true,
  };

  let callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type == "attributes") {
        // SONG TITLE UPDATED
        if (
          song.title !== targetNode.innerHTML &&
          !targetNode.innerHTML.startsWith("<!--") &&
          targetNode.innerHTML !== ""
        ) {
          log(SONG_SWITCHED_LOG, targetNode.innerHTML); // Log song switch
          song.title = targetNode.innerHTML;
          onAlbumArtEnabled(addAlbumArtToLayout);

          // Check if lyrics tab is visible
          const tabSelector = document.getElementsByClassName(TAB_HEADER_CLASS)[1];
          if (tabSelector.getAttribute("aria-selected") === "true") {
            log(LYRICS_TAB_VISIBLE_LOG); // Log lyrics tab visible
            handleModifications();
          } else {
            onAutoSwitchEnabled(() => {
              tabSelector.click();
              log(AUTO_SWITCH_ENABLED_LOG);
              handleModifications();
            });

            log(LYRICS_TAB_HIDDEN_LOG); // Log lyrics tab hidden
          }
        }
      }
    }
  };

  let observer = new MutationObserver(callback);
  observer.observe(targetNode, config); // Observe the song title element for changes

  // Fetch Lyrics once the lyrics tab is clicked
  function lyricReloader() {
    const tabs = document.getElementsByClassName(TAB_CONTENT_CLASS);

    const [tab1, tab2, tab3] = tabs;

    if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
      tab2.addEventListener("click", function () {
        log(LYRICS_TAB_CLICKED_LOG); // Log lyrics tab clicked
        handleModifications();
      });
    } else {
      setTimeout(() => lyricReloader(), 1000); // Try again after a delay if the tabs aren't loaded yet
    }
  }
  lyricReloader();
};

try {
  if (document.readyState !== "loading") {
    modify(); // Call the modify function if the page is already loaded
  } else {
    document.addEventListener("DOMContentLoaded", modify); // Call the modify function when the page is loaded
  }
} catch (err) {
  log(GENERAL_ERROR_LOG, err); // Log any errors
}
