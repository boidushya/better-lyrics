
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault(); // Prevent default browser behavior
    const shiftAmount = event.key === 'ArrowLeft' ? 0.5 : -0.5;
    BetterLyrics.Lyrics.shiftLyrics(shiftAmount);
  }
});
 function saveLyricsData(lyricsData) {
  localStorage.setItem('lyricsData', JSON.stringify(lyricsData));
}
// Function to set the offset value for a song
 function setSongOffset(song, offsetValue) {
  const lyricsData = getStoredLyrics();
  lyricsData[song] = offsetValue;
  saveLyricsData(lyricsData);
}
 function getStoredLyrics() {
  const storedLyrics = localStorage.getItem('lyricsData');
  return storedLyrics ? JSON.parse(storedLyrics) : {};
}
// Function to get the offset value for a song
  function getSongOffset(song) {
  const lyricsData = getStoredLyrics();
  if(lyricsData === null) {
    return 0;
  }
  return lyricsData[song] || 0; // Return 0 if the song is not found
}
// let offsetValue = 0;
let songName = "";

BetterLyrics.Lyrics = {
  lyrics: [],
  // shiftAmount: 0.5 second at every clicks,
  // CHANGES: We will shift the lyrics by the offset value stored in the local storage
  shiftLyrics: function(shiftAmount) {
    // console.log("Shifted by: ", shiftAmount);
    // console.log(songName);

    // Check if BetterLyrics.Getters is defined
    // if (typeof BetterLyrics.Getters !== 'undefined') {
        try {
            // Get the current offset and update it
            let currentOffset = getSongOffset(songName);
            let newOffset = currentOffset + shiftAmount;
            
            // Store the new offset in localStorage
            setSongOffset(songName, newOffset);
            
            console.log(`Updated offset for ${songName}: ${newOffset}`);
        } catch (error) {
            console.error("Error accessing Getters methods:", error);
        }
    // } else {
    //     console.warn("BetterLyrics.Getters is not defined. Skipping offset storage.");
    // }

    // Update the lyrics objects in memory
    BetterLyrics.Lyrics.lyrics = BetterLyrics.Lyrics.lyrics.map(lyric => {
        return {
            ...lyric,
            startTimeMs: (parseInt(lyric.startTimeMs) + shiftAmount * 1000).toString(),
        };
    });

    const lyricsElements = document.getElementsByClassName(BetterLyrics.Constants.LYRICS_CLASS)[0].children;
    
    Array.from(lyricsElements).forEach((elem, index) => {
      const lyric = BetterLyrics.Lyrics.lyrics[index];
      elem.dataset.time = (parseInt(lyric.startTimeMs) / 1000).toString();
      elem.style = `--blyrics-duration: ${parseInt(lyric.durationMs) / 1000}s;`;
      
      // Update onClick attribute if it exists
      if (elem.hasAttribute('onClick')) {
        elem.setAttribute(
          'onClick',
          `const player = document.getElementById("movie_player"); player.seekTo(${
            parseInt(lyric.startTimeMs) / 1000
          }, true);player.playVideo();`
        );
      }
    });
    BetterLyrics.Lyrics.showShiftPopup(shiftAmount);
    // Re-render lyrics if necessary
    BetterLyrics.Lyrics.setupLyricsCheckInterval();
  },
  showShiftPopup: function(shiftAmount) {
    // Remove any existing popups
    const existingPopups = document.querySelectorAll('.blyrics--shift-popup');
    existingPopups.forEach(popup => popup.remove());

    // Create and append the new popup
    const popup = document.createElement('div');
    popup.className = 'blyrics--shift-popup';
    const direction = shiftAmount > 0 ? 'backward' : 'forward';
    popup.textContent = `Shifted ${Math.abs(shiftAmount)} second ${direction}`;
    document.body.appendChild(popup);

    // Show the popup
    setTimeout(() => popup.classList.add('show'), 10);

    // Hide and remove the popup after 2 seconds
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => popup.remove(), 300); // Wait for fade-out transition
    }, 2000);
  },
  // DONE: We will make a map or a dictionary to store the lyrics and their respective offset time
  // and before loading we will see whether this music is there in the map or not if yes then we will shift every line with the offset value
  // if not then we will load the lyrics as usual

  createLyrics: function () {
    BetterLyrics.DOM.requestSongInfo(e => {
      const song = e.song;
      const artist = e.artist;
      songName = song;

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
          BetterLyrics.Lyrics.lyrics = lyrics; // store the lyrics in the global variable
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
    BetterLyrics.Lyrics.lyrics = lyrics; // Store lyrics in memory
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

    // CHANGES: if local storage has the offset value for this song then we will shift the lyrics by that amount
    if(getSongOffset(songName) !== 0) {
      const offsetValue = getSongOffset(songName);
      // console.log(`Shifting lyrics by ${offsetValue} seconds`);
      lyrics = lyrics.map(lyric => {
        return {
          ...lyric,
          startTimeMs: (parseInt(lyric.startTimeMs) + offsetValue * 1000).toString(),
        };
      });
    }

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
