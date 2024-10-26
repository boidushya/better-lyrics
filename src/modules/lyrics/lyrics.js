BetterLyrics.Lyrics = {
  createLyrics: function () {
    BetterLyrics.DOM.requestSongInfo(e => {
      const song = e.song;
      const artist = e.artist;

      BetterLyrics.Utils.log(BetterLyrics.Constants.FETCH_LYRICS_LOG, song, artist);

      const cacheKey = `blyrics_${song}_${artist}`;

      // Check for cached lyrics
      BetterLyrics.Storage.getTransientStorage(cacheKey, cachedLyrics => {
        if (cachedLyrics) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_CACHE_FOUND_LOG);
          const data = JSON.parse(cachedLyrics);
          BetterLyrics.Lyrics.processLyrics(data);
          return;
        }

        // Fetch lyrics from the primary API if not found in cache
        const url = `${BetterLyrics.Constants.LYRICS_API_URL}?s=${encodeURIComponent(BetterLyrics.Utils.unEntity(song))}&a=${encodeURIComponent(BetterLyrics.Utils.unEntity(artist))}`;

        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`${BetterLyrics.Constants.HTTP_ERROR_LOG} ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            BetterLyrics.Lyrics.cacheAndProcessLyrics(cacheKey, data);
          })
          .catch(err => {
            // If the primary API fails, fall back to LRCLIB
            BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, err);
            fetchFromLrclib(song, artist)
              .then(lrclibLyrics => {
                BetterLyrics.Lyrics.cacheAndProcessLyrics(cacheKey, { lyrics: lrclibLyrics });
              })
              .catch(lrclibErr => {
                BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG, lrclibErr);
                setTimeout(BetterLyrics.DOM.injectError, 500);
                return;
              });
          });
      });

      async function fetchFromLrclib(song, artist) {
        const lrclibUrl = `${BetterLyrics.Constants.LRCLIB_API_URL}?track_name=${encodeURIComponent(BetterLyrics.Utils.unEntity(song))}&artist_name=${encodeURIComponent(BetterLyrics.Utils.unEntity(artist))}`;

        const response = await fetch(lrclibUrl, {
          headers: {
            "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER,
          },
        });

        if (!response.ok) {
          throw new Error(BetterLyrics.Constants.HTTP_ERROR_LOG + response.status);
        }

        const data = await response.json();

        if (data && data.syncedLyrics) {
          BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG);
          const parsedLyrics = BetterLyrics.Lyrics.parseLRCLIBLyrics(data.syncedLyrics, data.duration);
          return parsedLyrics;
        } else {
          throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
        }
      }
    });
  },

  cacheAndProcessLyrics: function (cacheKey, data) {
    // Cache the lyrics in storage with a 1-week expiry (7 days * 24 hours * 60 minutes * 60 seconds * 1000 ms)
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    BetterLyrics.Storage.setTransientStorage(cacheKey, JSON.stringify(data), oneWeekInMs);
    BetterLyrics.Lyrics.processLyrics(data);
  },

  processLyrics: function (data) {
    const lyrics = data.lyrics;

    BetterLyrics.App.lang = data.language;
    BetterLyrics.DOM.setRtlAttributes(data.isRtlLanguage);

    BetterLyrics.App.areLyricsTicking = false;

    if (!lyrics || lyrics.length === 0) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.NO_LYRICS_FOUND_LOG);
      setTimeout(BetterLyrics.DOM.injectError, 500);
      return;
    }

    BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_FOUND_LOG);
    try {
      const lyricsElement = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0];
      lyricsElement.innerHTML = "";
    } catch (_err) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LYRICS_TAB_NOT_DISABLED_LOG);
    }
    BetterLyrics.Lyrics.injectLyrics(lyrics);
  },

  injectLyrics: function (lyrics) {
    let lyricsWrapper = BetterLyrics.DOM.createLyricsWrapper();
    BetterLyrics.DOM.addFooter();

    try {
      lyricsWrapper.innerHTML = "";
      const lyricsContainer = document.createElement("div");
      lyricsContainer.className = BetterLyrics.Constants.LYRICS_CLASS;
      lyricsWrapper.appendChild(lyricsContainer);
      BetterLyrics.DOM.flushLoader();

      lyricsWrapper.removeAttribute("is-empty");
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
    } else {
      BetterLyrics.Utils.log(BetterLyrics.Constants.SYNC_DISABLED_LOG);
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

document.addEventListener("blyrics-send-player-time", function(event) {
  tickLyrics(event.detail.currentTime + 0.25);
});

let tickLyrics = function (currentTime) {
  if (BetterLyrics.DOM.isLoaderActive() || !BetterLyrics.App.areLyricsTicking) {
    return;
  }
  try {
    const lyrics = [...document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0].children];

    lyrics.every((elem, index) => {
      const time = parseFloat(elem.getAttribute("data-time"));

      if (currentTime >= time && index + 1 === lyrics.length && elem.getAttribute("data-scrolled") !== "true") {
        elem.setAttribute("class", BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
        elem.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        elem.setAttribute("data-scrolled", true);
        return true;
      } else if (currentTime > time && currentTime < parseFloat(lyrics[index + 1].getAttribute("data-time"))) {
        const current = document.getElementsByClassName(BetterLyrics.Constants.CURRENT_LYRICS_CLASS)[0];
        elem.setAttribute("class", BetterLyrics.Constants.CURRENT_LYRICS_CLASS);
        if (current !== undefined && current.getAttribute("data-scrolled") !== "true") {
          current.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          current.setAttribute("data-scrolled", true);
        }
        return true;
      } else {
        elem.setAttribute("data-scrolled", false);
        elem.setAttribute("class", "");
        return true;
      }
    });
  } catch (err) {
    BetterLyrics.Utils.log(err);
    return true;
  }
}
