/**
 * @fileoverview Main lyrics handling module for BetterLyrics.
 * Manages lyrics fetching, caching, processing, and rendering.
 */

/** Current version of the lyrics cache format */
const LYRIC_CACHE_VERSION = "1.1.1";

/**
 * Core lyrics functionality for the BetterLyrics extension.
 * Handles lyrics fetching, caching, processing, and DOM injection.
 *
 * @namespace BetterLyrics.Lyrics
 */
BetterLyrics.Lyrics = {
  /**
   * Main function to create and inject lyrics for the current song.
   * Handles caching, API requests, and fallback mechanisms.
   *
   * @param {PlayerDetails} detail - Song and player details
   */
  createLyrics: async function (detail) {
    let song = detail.song;
    let artist = detail.artist;
    let videoId = detail.videoId;
    let duration = detail.duration;
    const audioTrackData = detail.audioTrackData;
    const isMusicVideo = detail.contentRect.width !== 0 && detail.contentRect.height !== 0;

    if (!videoId || typeof videoId !== "string") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, "Invalid video id");
      return;
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
        BetterLyrics.Utils.log(BetterLyrics.Constants.CACHE_PARSING_ERROR, cacheError);
        // Invalid cache, continue to fetch fresh data
      }
    }

    // We should get recalled if we were executed without a valid song/artist and aren't able to get lyrics

    /**
     * @type SegmentMap
     */
    let segmentMap = null;
    let matchingSong = await BetterLyrics.RequestSniffing.getMatchingSong(videoId, 1);
    if (
      (!matchingSong ||
        !matchingSong.counterpartVideoId ||
        matchingSong.counterpartVideoId !== BetterLyrics.App.lastLoadedVideoId) &&
      BetterLyrics.App.lastLoadedVideoId !== videoId
    ) {
      BetterLyrics.DOM.renderLoader(); // Only render the loader after we've checked the cache & we're not switching between audio and video
      matchingSong = await BetterLyrics.RequestSniffing.getMatchingSong(videoId);
    } else {
      BetterLyrics.Utils.log("Switching between audio/video: Skipping Loader");
    }
    if (isMusicVideo && matchingSong && matchingSong.counterpartVideoId && matchingSong.segmentMap) {
      BetterLyrics.Utils.log("Switching VideoId to Audio Id");
      videoId = matchingSong.counterpartVideoId;
      segmentMap = matchingSong.segmentMap;
    }

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
    let sourceMap = BetterLyrics.LyricProviders.newSourceMap();
    // We depend on the cubey lyrics to fetch certain metadata, so we always call it even if it isn't the top priority
    /**
     * @type {ProviderParameters}
     */
    let providerParameters = {
      song,
      artist,
      duration,
      videoId,
      audioTrackData,
      album: null,
      sourceMap,
    };
    try {
      let cubyLyrics = await BetterLyrics.LyricProviders.getLyrics(providerParameters, "musixmatch-richsync");
      if (cubyLyrics && cubyLyrics.album) {
        providerParameters.album = cubyLyrics.album;
      }
      if (cubyLyrics && cubyLyrics.song && cubyLyrics.song.length > 0 && song !== cubyLyrics.song) {
        BetterLyrics.Utils.log("Using '" + cubyLyrics.song + "' for song instead of '" + song + "'");
        providerParameters.song = cubyLyrics.song;
      }

      if (cubyLyrics && cubyLyrics.artist && cubyLyrics.artist.length > 0 && artist !== cubyLyrics.artist) {
        BetterLyrics.Utils.log("Using '" + cubyLyrics.artist + "' for artist instead of '" + artist + "'");
        providerParameters.artist = cubyLyrics.artist;
      }

      if (cubyLyrics && cubyLyrics.duration && cubyLyrics.duration.length > 0 && duration !== cubyLyrics.duration) {
        BetterLyrics.Utils.log("Using '" + cubyLyrics.duration + "' for duration instead of '" + duration + "'");
        providerParameters.duration = Number(cubyLyrics.duration);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }

    for (let provider of BetterLyrics.LyricProviders.providerPriority) {
      try {
        lyrics = await BetterLyrics.LyricProviders.getLyrics(providerParameters, provider);

        if (lyrics && lyrics.lyrics && Array.isArray(lyrics.lyrics) && lyrics.lyrics.length > 0) {
          let ytLyrics = await BetterLyrics.LyricProviders.getLyrics(providerParameters, "yt-lyrics");

          if (ytLyrics !== null) {
            let lyricText = "";
            lyrics.lyrics.forEach(lyric => {
              lyricText += lyric.words + "\n";
            });

            let matchAmount = stringSimilarity(lyricText.toLowerCase(), ytLyrics.text.toLowerCase());
            if (matchAmount < 0.5) {
              BetterLyrics.Utils.log(
                `Got lyrics from ${lyrics.source}, but they don't match yt lyrics. Rejecting: Match: ${matchAmount}%`
              );
              lyrics = null;
              continue;
            }
          }
          break;
        }
      } catch (err) {
        BetterLyrics.Utils.log(err);
      }
      // lyrics didn't pass validation; don't pass it down
      lyrics = null;
    }

    if (!lyrics) {
      lyrics = {
        lyrics: [
          {
            startTimeMs: 0,
            words: BetterLyrics.Constants.NO_LYRICS_TEXT,
            durationMs: 0,
          },
        ],
        source: "Unknown",
        sourceHref: "",
        musicVideoSynced: false,
        cacheAllowed: false,
      };
    }

    if (isMusicVideo && lyrics.musicVideoSynced !== true && segmentMap) {
      BetterLyrics.Utils.log(segmentMap);
      // We're in a music video and need to sync lyrics to the music video
      const allZero = lyrics.lyrics.every(item => item.startTimeMs === "0" || item.startTimeMs === 0);

      if (!allZero) {
        for (let lyricKey in lyrics.lyrics) {
          let lyric = lyrics.lyrics[lyricKey];
          let lastTimeChange = 0;
          for (let segment of segmentMap.segment) {
            if (lyric.startTimeMs >= segment.counterpartVideoStartTimeMilliseconds) {
              lastTimeChange =
                segment.primaryVideoStartTimeMilliseconds - segment.counterpartVideoStartTimeMilliseconds;
              if (lyric.startTimeMs <= segment.counterpartVideoStartTimeMilliseconds + segment.durationMilliseconds) {
                break;
              }
            }
          }
          lyric.startTimeMs = Number(lyric.startTimeMs) + lastTimeChange;
          if (lyric.parts) {
            lyric.parts.forEach(part => {
              part.startTimeMs = Number(part.startTimeMs) + lastTimeChange;
            });
          }
        }
      }
    }

    if (lyrics.isRtlLanguage === undefined) {
      // Arabic Characters: U+0600..U+06FF (Urdu, Arabic, Kurdish)
      // Arabic Presentation Forms-A: U+FB50..U+FDFF (For Persian, Urdu, Sindhi)
      // Hebrew Characters: U+0590..U+05FF (Yiddish)
      // Thaana Characters: U+0780..U+07BF

      const testRtl = text => /[\u0600-\u06FF]|[\ufb50-\ufdff]|[\u0590-\u05ff]|[\u0780-\u07bf]/.test(text);
      lyrics.isRtlLanguage = lyrics.lyrics.some(({ words }) => testRtl(words));
    }

    BetterLyrics.Utils.log("Got Lyrics from " + lyrics.source);

    // Preserve song and artist information in the lyrics data for the "Add Lyrics" button
    lyrics.song = providerParameters.song;
    lyrics.artist = providerParameters.artist;
    lyrics.album = providerParameters.album;
    lyrics.duration = providerParameters.duration;
    lyrics.videoId = providerParameters.videoId;

    BetterLyrics.App.lastLoadedVideoId = detail.videoId;
    this.cacheAndProcessLyrics(cacheKey, lyrics);
  },

  /**
   * Caches lyrics data and initiates processing.
   *
   * @param {string} cacheKey - Storage key for caching
   * @param {Object} data - Lyrics data to cache and process
   */
  cacheAndProcessLyrics: function (cacheKey, data) {
    if (data.cacheAllowed === undefined || data.cacheAllowed) {
      data.version = LYRIC_CACHE_VERSION;
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      BetterLyrics.Storage.setTransientStorage(cacheKey, JSON.stringify(data), oneWeekInMs);
    }
    BetterLyrics.Lyrics.processLyrics(data);
  },

  /**
   * Processes lyrics data and prepares it for rendering.
   * Sets language settings, validates data, and initiates DOM injection.
   *
   * @param {Object} data - Processed lyrics data
   * @param {string} data.language - Language code for the lyrics
   * @param {boolean} data.isRtlLanguage - Whether lyrics are in RTL language
   * @param {Array} data.lyrics - Array of lyric lines
   */
  processLyrics: function (data) {
    BetterLyrics.App.lang = data.language;
    BetterLyrics.DOM.setRtlAttributes(data.isRtlLanguage);

    const lyrics = data.lyrics;
    if (!lyrics || lyrics.length === 0) {
      throw new Error(BetterLyrics.Constants.NO_LYRICS_FOUND_LOG);
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_FOUND_LOG);

    const ytMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR)?.parentElement;
    if (ytMusicLyrics) {
      ytMusicLyrics.classList.add("blyrics-hidden");
    }

    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      lyricsElement.innerHTML = "";
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_NOT_DISABLED_LOG);
    }

    BetterLyrics.Lyrics.injectLyrics(data);
  },

  /**
   * Injects lyrics into the DOM with timing, click handlers, and animations.
   * Creates the complete lyrics interface including synchronization support.
   *
   * @param {Object} data - Complete lyrics data object
   * @param {Array} data.lyrics - Array of lyric lines with timing
   * @param {string} [data.source] - Source attribution for lyrics
   * @param {string} [data.sourceHref] - URL for source link
   */
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

    const allZero = lyrics.every(item => item.startTimeMs === "0" || item.startTimeMs === 0);

    // Disabled since we want to show the last line even if it's nothing as that ends syncing for the second last line
    //
    // if (lyrics[lyrics.length - 1].words === "") {
    //   lyrics.pop();
    // }

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
    /**
     *
     * @typedef {object} PartData
     * @property {number} time
     * @property {number} duration
     * @property {Element} lyricElement
     * @property {number} animationStartTimeMs
     */

    /**
     * @typedef {object} LineData
     * @property {Element} lyricElement
     * @property {number} time
     * @property {number} duration
     * @property {PartData[]} parts
     * @property {boolean} isScrolled
     * @property {number} animationStartTimeMs
     * @property {boolean} isAnimationPlayStatePlaying
     * @property {boolean} isAnimating
     * @property {boolean} isSelected
     */

    /**
     * @type {LineData[]}
     */
    let lyricsData = [];

    lyrics.forEach((item, lineIndex) => {
      if (!item.parts || item.parts.length === 0) {
        item.parts = [];
        const words = item.words.split(" ");

        words.forEach((word, index) => {
          word = word.trim().length < 1 ? word : word + " ";
          item.parts.push({
            startTimeMs: parseFloat(item.startTimeMs) + index * 50,
            words: word,
            durationMs: 0,
          });
        });
      }

      let line = document.createElement("div");

      /**
       *
       * @type LineData
       */
      let lineData = {
        lyricElement: line,
        time: parseFloat(item.startTimeMs) / 1000,
        duration: parseFloat(item.durationMs) / 1000,
        parts: [],
        isScrolled: false,
        animationStartTimeMs: Infinity,
        isAnimationPlayStatePlaying: false,
        isAnimating: false,
        isSelected: false,
      };

      item.parts.forEach(part => {
        let span = document.createElement("span");
        if (Number(part.durationMs) === 0) {
          span.classList.add(BetterLyrics.Constants.ZERO_DURATION_ANIMATION_CLASS);
        }

        /**
         *
         * @type {PartData}
         */
        let partData = {
          time: parseFloat(part.startTimeMs) / 1000,
          duration: parseFloat(part.durationMs) / 1000,
          lyricElement: span,
          animationStartTimeMs: Infinity,
        };

        span.textContent = part.words;
        span.dataset.time = partData.time;
        span.dataset.duration = partData.duration;
        span.dataset.content = part.words;
        span.style.setProperty("--blyrics-duration", part.durationMs + "ms");
        if (part.words.trim().length === 0) {
          span.style.display = "inline";
        }

        lineData.parts.push(partData);
        line.appendChild(span);
      });

      line.dataset.time = lineData.time;
      line.dataset.duration = lineData.duration;
      line.dataset.lineNumber = lineIndex;
      line.style.setProperty("--blyrics-duration", item.durationMs + "ms");

      if (!allZero) {
        line.setAttribute(
          "onClick",
          `const player = document.getElementById("movie_player"); player.seekTo(${
            item.startTimeMs / 1000
          }, true);player.playVideo();`
        );
        line.addEventListener("click", _e => {
          BetterLyrics.DOM.scrollResumeTime = 0;
        });
      }

      const wrapper = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];

      langPromise.then(source_language => {
        BetterLyrics.Translation.onRomanizationEnabled(
          async () => {
            let romanizedLine = document.createElement("div");
            romanizedLine.classList.add(BetterLyrics.Constants.ROMANIZED_LYRICS_CLASS);

            if (BetterLyrics.Constants.romanizationLanguages.includes(source_language)) {
              if (item.words.trim() !== "♪" && item.words.trim() !== "") {
                const result = await BetterLyrics.Translation.translateTextIntoRomaji(source_language, item.words);
                if (result && result.trim() !== "") {
                  romanizedLine.textContent = result ? "\n" + result : "\n";
                  line.appendChild(romanizedLine);
                  BetterLyrics.DOM.lyricsElementAdded();
                }
              }
            }
          },
          async () => {
            BetterLyrics.Translation.onTranslationEnabled(async items => {
              let translatedLine = document.createElement("div");
              translatedLine.classList.add(BetterLyrics.Constants.TRANSLATED_LYRICS_CLASS);

              let target_language = items.translationLanguage || "en";

              if (source_language !== target_language) {
                if (item.words.trim() !== "♪" && item.words.trim() !== "") {
                  const result = await BetterLyrics.Translation.translateText(item.words, target_language);

                  if (result && result.originalLanguage !== target_language) {
                    translatedLine.textContent = "\n" + result.translatedText;
                    line.appendChild(translatedLine);
                    BetterLyrics.DOM.lyricsElementAdded();
                  }
                }
              }
            });
          }
        );
      });

      try {
        lyricsData.push(lineData);
        wrapper.appendChild(line);
      } catch (_err) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_NOT_VISIBLE_LOG);
      }
    });

    BetterLyrics.DOM.skipScrolls = 2;
    BetterLyrics.DOM.skipScrollsDecayTimes = [];
    for (let i = 0; i < BetterLyrics.DOM.skipScrolls; i++) {
      BetterLyrics.DOM.skipScrollsDecayTimes.push(Date.now() + 2000);
    }
    BetterLyrics.DOM.scrollResumeTime = 0;

    if (lyrics[0].words !== BetterLyrics.Constants.NO_LYRICS_TEXT) {
      BetterLyrics.DOM.addFooter(data.source, data.sourceHref, data.song, data.artist, data.album, data.duration);
    } else {
      BetterLyrics.DOM.addNoLyricsButton(data.song, data.artist, data.album, data.duration);
    }

    if (!allZero) {
      BetterLyrics.App.lyricData = lyricsData;
      BetterLyrics.App.areLyricsTicking = true;
    } else {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SYNC_DISABLED_LOG);
    }
    BetterLyrics.App.areLyricsLoaded = true;
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
