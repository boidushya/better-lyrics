BetterLyrics.Lyrics = {
  createLyrics: async function (song, artist, videoId) {
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
        if (data && (Array.isArray(data.lyrics) || data.syncedLyrics)) {
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

    try {
      // Fetch from the primary API if cache is empty or invalid
      const url = new URL(BetterLyrics.Constants.LYRICS_API_URL);
      url.searchParams.append("s", BetterLyrics.Utils.unEntity(song));
      url.searchParams.append("a", BetterLyrics.Utils.unEntity(artist));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`${BetterLyrics.Constants.HTTP_ERROR_LOG} ${response.status}`);
        }

        const data = await response.json();
        // Validate API response structure
        if (!data || (!Array.isArray(data.lyrics) && !data.syncedLyrics)) {
          throw new Error("Invalid API response structure");
        }

        BetterLyrics.Lyrics.cacheAndProcessLyrics(cacheKey, data);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          throw new Error("Primary API request timed out");
        }
        throw fetchError;
      }
    } catch (primaryError) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, primaryError);
      // Fallback to LRCLIB if the primary fetch fails
      try {
        const lrclibLyrics = await BetterLyrics.Lyrics.fetchFromLrclib(song, artist);
        if (lrclibLyrics) {
          BetterLyrics.Lyrics.cacheAndProcessLyrics(cacheKey, { lyrics: lrclibLyrics });
        } else {
          throw new Error("No valid lyrics returned from LRCLIB");
        }
      } catch (lrclibError) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, lrclibError);
        setTimeout(BetterLyrics.DOM.injectError, 500);
      }
    }
  },

  // Helper function to fetch from LRCLIB
  async fetchFromLrclib(song, artist) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const url = new URL(BetterLyrics.Constants.LRCLIB_API_URL);
      url.searchParams.append("track_name", BetterLyrics.Utils.unEntity(song));
      url.searchParams.append("artist_name", BetterLyrics.Utils.unEntity(artist));

      const response = await fetch(url.toString(), {
        headers: {
          "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(BetterLyrics.Constants.HTTP_ERROR_LOG + response.status);
      }

      const data = await response.json();

      if (data && data.syncedLyrics && typeof data.duration === "number") {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG);
        return BetterLyrics.Lyrics.parseLRCLIBLyrics(data.syncedLyrics, data.duration);
      } else {
        throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("LRCLIB request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },

  cacheAndProcessLyrics: function (cacheKey, data) {
    try {
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      BetterLyrics.Storage.setTransientStorage(cacheKey, JSON.stringify(data), oneWeekInMs);
      BetterLyrics.Lyrics.processLyrics(data);
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.CACHE_PROCESS_ERROR_LOG, error);
      setTimeout(BetterLyrics.DOM.injectError, 500);
    }
  },

  processLyrics: function (data) {
    const lyrics = data.lyrics;

    BetterLyrics.App.lang = data.language;
    BetterLyrics.DOM.setRtlAttributes(data.isRtlLanguage);

    if (!lyrics || lyrics.length === 0) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.NO_LYRICS_FOUND_LOG);
      setTimeout(BetterLyrics.DOM.injectError, 500);
      return;
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_FOUND_LOG);

    const ytMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR)?.parentElement;
    if (ytMusicLyrics) {
      ytMusicLyrics.style.display = "none";
    }

    const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
    if (existingLyrics) {
      for (let lyrics of existingLyrics) {
        lyrics.style.display = "none";
      }
    }

    const existingFooter = document.getElementsByClassName(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)[0];
    if (existingFooter) {
      existingFooter.style.display = "none";
    }

    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      lyricsElement.innerHTML = "";
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_NOT_DISABLED_LOG);
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach(node => {
            if (
              node.classList?.contains(BetterLyrics.Constants.DESCRIPTION_CLASS) ||
              node.classList?.contains(BetterLyrics.Constants.YT_MUSIC_FOOTER_CLASS)
            ) {
              node.style.display = "none";
            }
          });
        }
      });
    });

    const lyricsContainer = document.querySelector(BetterLyrics.Constants.TAB_RENDERER_SELECTOR);
    if (lyricsContainer) {
      observer.observe(lyricsContainer, {
        childList: true,
        subtree: true,
      });
    }

    BetterLyrics.Lyrics.injectLyrics(lyrics);

    BetterLyrics.App.lyricsObserver = observer;
  },

  injectLyrics: function (lyrics) {
    BetterLyrics.DOM.cleanup();
    let lyricsWrapper = BetterLyrics.DOM.createLyricsWrapper();
    BetterLyrics.DOM.addFooter();

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

      BetterLyrics.Translation.onRomanizationEnabled(
        async () => {
          let romanizedLine = document.createElement("span");
          romanizedLine.classList.add(BetterLyrics.Constants.ROMANIZED_LYRICS_CLASS);

          let source_language = BetterLyrics.App.lang ?? "en";
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

            let source_language = BetterLyrics.App.lang ?? "en";
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

      try {
        document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0].appendChild(line);
      } catch (_err) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_WRAPPER_NOT_VISIBLE_LOG);
      }
    });

    if (!allZero) {
      BetterLyrics.Lyrics.setupLyricsCheckInterval();
      BetterLyrics.App.areLyricsLoaded = true;
    } else {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SYNC_DISABLED_LOG);
      BetterLyrics.App.areLyricsLoaded = true;
    }
  },
  setupLyricsCheckInterval: function () {
    BetterLyrics.App.areLyricsTicking = true;
  },
  parseLRCLIBLyrics: function (syncedLyrics, duration) {
    const lines = syncedLyrics.split("\n");
    const lyricsArray = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const words = match[3].trim();
        const startTimeMs = Math.floor((minutes * 60 + seconds) * 1000);

        lyricsArray.push({
          startTimeMs: startTimeMs.toString(),
          words: words,
          durationMs: "0", // Will calculate later
        });
      }
    }

    // Calculate durationMs for each lyric line
    for (let i = 0; i < lyricsArray.length; i++) {
      if (i < lyricsArray.length - 1) {
        const nextStartTimeMs = parseInt(lyricsArray[i + 1].startTimeMs);
        const currentStartTimeMs = parseInt(lyricsArray[i].startTimeMs);
        lyricsArray[i].durationMs = (nextStartTimeMs - currentStartTimeMs).toString();
      } else {
        // For the last line, use the total duration
        const totalDurationMs = duration * 1000;
        const currentStartTimeMs = parseInt(lyricsArray[i].startTimeMs);
        lyricsArray[i].durationMs = (totalDurationMs - currentStartTimeMs).toString();
      }
    }

    return lyricsArray;
  },
};
