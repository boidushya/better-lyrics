BetterLyrics.Lyrics = {
  createLyrics: function () {
    BetterLyrics.DOM.requestSongInfo(e => {
      const song = e.song;
      const artist = e.artist;

      BetterLyrics.Utils.log(BetterLyrics.Constants.FETCH_LYRICS_LOG, song, artist);

      const url = `${BetterLyrics.Constants.LYRICS_API_URL}?s=${encodeURIComponent(BetterLyrics.Utils.unEntity(song))}&a=${encodeURIComponent(BetterLyrics.Utils.unEntity(artist))}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response.json();
        })
        .then(data => {
          const lyrics = data.lyrics;

          BetterLyrics.App.lang = data.language;
          BetterLyrics.DOM.setRtlAttributes(data.isRtlLanguage);

          clearInterval(BetterLyrics.App.lyricsCheckInterval);

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
        })
        .catch(err => {
          clearInterval(BetterLyrics.App.lyricsCheckInterval);
          BetterLyrics.Utils.log(BetterLyrics.Constants.SERVER_ERROR_LOG);
          BetterLyrics.Utils.log(err);
          setTimeout(BetterLyrics.DOM.injectError, 500);
        });
    });
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
      BetterLyrics.Translation.getRomanizationStatus(() => {
        let translatedLine = document.createElement("span");
        translatedLine.classList.add(BetterLyrics.Constants.ROMANIZED_LYRICS_CLASS);

        translatedLine.style.display = "block";
        let source_language = BetterLyrics.App.lang ?? "en";
        if(BetterLyrics.Constants.romanizationLanguages.includes(source_language)) {
          if (item.words.trim() !== "♪" && item.words.trim() !== "") {
            BetterLyrics.Translation.translateTextIntoRomaji(source_language , item.words).then(result => {
              if (result) {
                translatedLine.textContent = "\n" + result;
                line.appendChild(translatedLine);
              }
              else {
                translatedLine.textContent = "\n";
                line.appendChild(translatedLine);
              }
            });
          }
        }
      });

      BetterLyrics.Translation.onTranslationEnabled(items => {
        let translatedLine = document.createElement("span");
        translatedLine.classList.add(BetterLyrics.Constants.TRANSLATED_LYRICS_CLASS);

        let source_language = BetterLyrics.App.lang ?? "en";
        let target_language = items.translationLanguage || "en";

        if (source_language !== target_language) {
          if (item.words.trim() !== "♪" && item.words.trim() !== "") {
            BetterLyrics.Translation.translateText(item.words, target_language).then(result => {
              if (result) {
                if (result.originalLanguage !== target_language) {
                  translatedLine.textContent = "\n" + result.translatedText;
                  line.appendChild(translatedLine);
                }
              } else {
                translatedLine.textContent = "\n" + "—";
                line.appendChild(translatedLine);
              }
            });
          }
        }
      });
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
    BetterLyrics.App.lyricsCheckInterval = setInterval(function () {
      if (BetterLyrics.DOM.isLoaderActive()) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LOADER_ACTIVE_LOG);
        return;
      }
      try {
        let currentTime =
          BetterLyrics.Utils.timeToInt(
            document
              .getElementsByClassName(BetterLyrics.Constants.TIME_INFO_CLASS)[0]
              .innerHTML.replaceAll(" ", "")
              .replaceAll("\n", "")
              .split("/")[0]
          ) + 0.75;
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
    }, 50);
  },
};
