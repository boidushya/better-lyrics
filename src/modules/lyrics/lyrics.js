const LYRIC_CACHE_VERSION = "1.0.0";

BetterLyrics.Lyrics = {
  createLyrics: async function (detail) {
    let song = detail.song;
    let artist = detail.artist;
    const videoId = detail.videoId;
    const duration = detail.duration;
    const audioTrackData = detail.audioTrackData;

    if (!videoId || typeof videoId !== "string") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, "Invalid video id");
      return;
    }

    const spinner = document.querySelector("#tab-renderer > tp-yt-paper-spinner-lite");
    let waitForLoaderPromise;
    if (spinner) {
      waitForLoaderPromise = new Promise(resolve => {
        if (spinner.style.display !== "none") {
          resolve(true);
          return;
        }
        let observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(true);
        });
        observer.observe(spinner, {
          attributes: true,
        });
      });
    }

    // Try to get lyrics from cache with validation
    const cacheKey = `blyrics_${videoId}`;

    const cachedLyrics = await BetterLyrics.Storage.getTransientStorage(cacheKey);
    if (cachedLyrics) {
      try {
        const data = JSON.parse(cachedLyrics);
        // Validate cached data structure
        if (
          data &&
          (Array.isArray(data.lyrics) || data.syncedLyrics) &&
          data.version &&
          data.version === LYRIC_CACHE_VERSION
        ) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_CACHE_FOUND_LOG);
          BetterLyrics.Lyrics.processLyrics(data);
          return;
        }
      } catch (cacheError) {
        BetterLyrics.Utils.log("Cache parsing error:", cacheError);
        // Invalid cache, continue to fetch fresh data
      }
    }

    // We should get recalled if we were executed without a valid song/artist and aren't able to get lyrics
    BetterLyrics.DOM.renderLoader(); // Only render the loader after we've checked the cache

    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    console.assert(tabSelector != null);
    if (tabSelector.getAttribute("aria-selected") !== "true") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_HIDDEN_LOG);
      return;
    }

    // Input validation
    if (typeof song !== "string" || typeof artist !== "string") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, "Invalid song or artist data");
      return;
    }

    song = song.trim();
    artist = artist.trim();

    // Check for empty strings after trimming
    if (!song || !artist) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, "Empty song or artist name");
      return;
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.FETCH_LYRICS_LOG, song, artist);

    let lyrics;
    let ytLyrics;
    if (!BetterLyrics.App.requestCache || BetterLyrics.App.requestCache.get("id") !== videoId) {
      BetterLyrics.App.requestCache = new Map();
      BetterLyrics.App.requestCache.set("id", videoId);
    }
    /**
     * @type {Map<Function, {}>}
     */
    let requestCache = BetterLyrics.App.requestCache;

    for (let provider of BetterLyrics.LyricProviders.providersList) {
      try {
        if (requestCache.has(provider)) {
          lyrics = requestCache.get(provider);
        } else {
          lyrics = await provider(song, artist, duration, videoId, audioTrackData);
          requestCache.set(provider, lyrics);
        }

        if (lyrics && Array.isArray(lyrics.lyrics) && lyrics.lyrics.length > 0) {
          if (!ytLyrics) {
            ytLyrics = await BetterLyrics.LyricProviders.ytLyrics(waitForLoaderPromise);
          }
          if (ytLyrics.text !== BetterLyrics.Constants.NO_LYRICS_TEXT) {
            let lyricText = "";
            lyrics.lyrics.forEach(lyric => {
              lyricText += lyric.words + "\n";
            });

            let matchAmount = stringSimilarity(lyricText.toLowerCase(), ytLyrics.text.toLowerCase());
            if (matchAmount < 0.8) {
              BetterLyrics.Utils.log(
                `Got lyrics from ${lyrics.source}, but they don't match yt lyrics. Rejecting: Match: ${matchAmount}%`
              );
              continue;
            }
          }
          break;
        }
      } catch (err) {
        BetterLyrics.Utils.log(err);
      }
    }

    if (!ytLyrics) {
      ytLyrics = await BetterLyrics.LyricProviders.ytLyrics(waitForLoaderPromise);
    }

    if (!lyrics) {
      lyrics = ytLyrics;
    }

    this.cacheAndProcessLyrics(cacheKey, lyrics);
  },

  cacheAndProcessLyrics: function (cacheKey, data) {
    if (data.cacheAllowed === undefined || data.cacheAllowed) {
      data.version = LYRIC_CACHE_VERSION;
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      BetterLyrics.Storage.setTransientStorage(cacheKey, JSON.stringify(data), oneWeekInMs);
    }
    BetterLyrics.Lyrics.processLyrics(data);
  },

  processLyrics: function (data) {
    BetterLyrics.App.lang = data.language;
    BetterLyrics.DOM.setRtlAttributes(data.isRtlLanguage);

    const lyrics = data.lyrics;
    if (!lyrics || lyrics.length === 0) {
      console.log(data);
      throw new Error(BetterLyrics.Constants.NO_LYRICS_FOUND_LOG);
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_FOUND_LOG);

    const ytMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR)?.parentElement;
    if (ytMusicLyrics) {
      ytMusicLyrics.classList.add("blyrics-hidden");
    }

    const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
    if (existingLyrics) {
      for (let lyrics of existingLyrics) {
        lyrics.classList.add("blyrics-hidden");
      }
    }

    const existingFooter = document.getElementsByClassName(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)[0];
    if (existingFooter) {
      existingFooter.classList.add("blyrics-hidden");
    }

    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      lyricsElement.innerHTML = "";
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_NOT_DISABLED_LOG);
    }

    BetterLyrics.Lyrics.injectLyrics(data);
  },

  injectLyrics: function (data) {
    const lyrics = data.lyrics;
    BetterLyrics.DOM.cleanup();
    let lyricsWrapper = BetterLyrics.DOM.createLyricsWrapper();

    try {
      lyricsWrapper.innerHTML = "";
      const lyricsContainer = document.createElement("div");
      lyricsContainer.className = BetterLyrics.Constants.LYRICS_CLASS;
      lyricsWrapper.appendChild(lyricsContainer);
      BetterLyrics.DOM.flushLoader();

      lyricsWrapper.removeAttribute("is-empty");

      // add a line at -1s so that we scroll to it at when the song starts
      let line = document.createElement("div");
      line.dataset.time = -1;
      line.style = "--blyrics-duration: 0s; padding-top: 0 !important; padding-bottom: 0 !important;";
      lyricsContainer.appendChild(line);
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_NOT_VISIBLE_LOG);
    }

    BetterLyrics.Translation.onTranslationEnabled(items => {
      BetterLyrics.Utils.log(BetterLyrics.Constants.TRANSLATION_ENABLED_LOG, items.translationLanguage);
    });

    const allZero = lyrics.every(item => item.startTimeMs === "0");
    if (lyrics[lyrics.length - 1].words === "") {
      lyrics.pop();
    }

    const langPromise = new Promise(async resolve => {
      if (!BetterLyrics.App.lang || BetterLyrics.App.lang === "") {
        let text = "";
        let lineCount = 0;
        for (let item of lyrics) {
          text += item.words.trim() + "\n";
          lineCount++;
          if (lineCount >= 10) {
            break;
          }
        }
        const translationResult = await BetterLyrics.Translation.translateText(text, "en");
        BetterLyrics.App.lang = translationResult.originalLanguage;
        BetterLyrics.Utils.log(
          "[BetterLyrics] Lang was missing. Determined it is: " + translationResult.originalLanguage
        );
      }
      return resolve(BetterLyrics.App.lang);
    });

    lyrics.forEach(item => {
      let line = document.createElement("div");
      line.dataset.time = item.startTimeMs / 1000;
      line.style = "--blyrics-duration: " + item.durationMs / 1000 + "s;";

      const words = item.words.split(" ");

      if (!allZero) {
        line.setAttribute("data-scrolled", false);
        line.setAttribute(
          "onClick",
          `const player = document.getElementById("movie_player"); player.seekTo(${
            item.startTimeMs / 1000
          }, true);player.playVideo();`
        );
        line.addEventListener("click", e => {
          BetterLyrics.DOM.scrollResumeTime = 0;
        });
      } else {
        line.classList.add(BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
      }

      words.forEach((word, index) => {
        let span = document.createElement("span");
        span.style.transitionDelay = `${index * 0.05}s`;
        span.style.animationDelay = `${index * 0.05}s`;
        span.textContent = words.length <= 1 ? word : word + " ";
        line.appendChild(span);
      });

      langPromise.then(source_language => {
        BetterLyrics.Translation.onRomanizationEnabled(
          async () => {
            let romanizedLine = document.createElement("span");
            romanizedLine.classList.add(BetterLyrics.Constants.ROMANIZED_LYRICS_CLASS);

            if (BetterLyrics.Constants.romanizationLanguages.includes(source_language)) {
              if (item.words.trim() !== "♪" && item.words.trim() !== "") {
                const result = await BetterLyrics.Translation.translateTextIntoRomaji(source_language, item.words);
                if (result && result.trim() !== "") {
                  romanizedLine.textContent = result ? "\n" + result : "\n";
                  line.appendChild(romanizedLine);
                }
              }
            }
          },
          async () => {
            BetterLyrics.Translation.onTranslationEnabled(async items => {
              let translatedLine = document.createElement("span");
              translatedLine.classList.add(BetterLyrics.Constants.TRANSLATED_LYRICS_CLASS);

              let target_language = items.translationLanguage || "en";

              if (source_language !== target_language) {
                if (item.words.trim() !== "♪" && item.words.trim() !== "") {
                  const result = await BetterLyrics.Translation.translateText(item.words, target_language);

                  if (result) {
                    if (result.originalLanguage !== target_language) {
                      translatedLine.textContent = "\n" + result.translatedText;
                      line.appendChild(translatedLine);
                    }
                  } else {
                    translatedLine.textContent = "\n" + "—";
                    line.appendChild(translatedLine);
                  }

                  line.appendChild(translatedLine);
                }
              }
            });
          }
        );
      });

      try {
        document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0].appendChild(line);
      } catch (_err) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_NOT_VISIBLE_LOG);
      }
    });

    if (lyrics[0].words !== BetterLyrics.Constants.NO_LYRICS_TEXT) {
      BetterLyrics.DOM.addFooter(data.source, data.sourceHref);
    }

    if (!allZero) {
      BetterLyrics.Lyrics.setupLyricsCheckInterval();
    } else {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SYNC_DISABLED_LOG);
    }
    BetterLyrics.App.areLyricsLoaded = true;
  },
  setupLyricsCheckInterval: function () {
    BetterLyrics.App.areLyricsTicking = true;
  },
};

/**
 * @author Stephen Brown
 * Source: https://github.com/stephenjjbrown/string-similarity-js/
 * @licence MIT License - https://github.com/stephenjjbrown/string-similarity-js/blob/master/LICENSE.md
 * @param {string} str1 First string to match
 * @param {string} str2 Second string to match
 * @param {number} [substringLength=2] Optional. Length of substring to be used in calculating similarity. Default 2.
 * @param {boolean} [caseSensitive=false] Optional. Whether you want to consider case in string matching. Default false;
 * @returns Number between 0 and 1, with 0 being a low match score.
 */
var stringSimilarity = function (str1, str2, substringLength, caseSensitive) {
  if (substringLength === void 0) {
    substringLength = 2;
  }
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (!caseSensitive) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
  }
  if (str1.length < substringLength || str2.length < substringLength) return 0;
  var map = new Map();
  for (var i = 0; i < str1.length - (substringLength - 1); i++) {
    var substr1 = str1.substr(i, substringLength);
    map.set(substr1, map.has(substr1) ? map.get(substr1) + 1 : 1);
  }
  var match = 0;
  for (var j = 0; j < str2.length - (substringLength - 1); j++) {
    var substr2 = str2.substr(j, substringLength);
    var count = map.has(substr2) ? map.get(substr2) : 0;
    if (count > 0) {
      map.set(substr2, count - 1);
      match++;
    }
  }
  return (match * 2) / (str1.length + str2.length - (substringLength - 1) * 2);
};
