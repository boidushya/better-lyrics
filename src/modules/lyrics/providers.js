BetterLyrics.LyricProviders = {
  /** @typedef {object} audioTrackData
   * @property {string} id
   * @property {object} kc
   * @property {string} kc.name
   * @property {string} kc.id
   * @property {boolean} kc.isDefault
   * @property {object[]} captionTracks
   * @property {string} captionTracks.languageCode
   * @property {string} captionTracks.languageName
   * @property {string} captionTracks.kind
   * @property {string} captionTracks.name
   * @property {string} captionTracks.displayName
   * @property {null} captionTracks.id
   * @property {boolean} captionTracks.j
   * @property {boolean} captionTracks.isTranslateable
   * @property {string} captionTracks.url
   * @property {string} captionTracks.vssId
   * @property {boolean} captionTracks.isDefault
   * @property {null} captionTracks.translationLanguage
   * @property {string} captionTracks.xtags
   * @property {string} captionTracks.captionId
   * @property {null} D
   * @property {object} C Current Track?
   * @property {string} C.languageCode
   * @property {string} C.languageName
   * @property {string} C.kind
   * @property {string} C.name
   * @property {string} C.displayName
   * @property {null} C.id
   * @property {boolean} C.j
   * @property {boolean} C.isTranslateable
   * @property {string} C.url
   * @property {string} C.vssId
   * @property {boolean} C.isDefault
   * @property {null} C.translationLanguage
   * @property {string} C.xtags
   * @property {string} C.captionId
   * @property {string} xtags
   * @property {boolean} G
   * @property {null} j
   * @property {string} B Current State?
   * @property {string} captionsInitialState
   */


  providersList: [],

  bLyrics: async function (song, artist, duration) {
    // Fetch from the primary API if cache is empty or invalid
    const url = new URL(BetterLyrics.Constants.LYRICS_API_URL);
    url.searchParams.append("s", song);
    url.searchParams.append("a", artist);
    url.searchParams.append("d", duration);

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      throw new Error(`${BetterLyrics.Constants.HTTP_ERROR_LOG} ${response.status}`);
    }

    const data = await response.json();
    // Validate API response structure
    if (!data || (!Array.isArray(data.lyrics) && !data.syncedLyrics)) {
      throw new Error("Invalid API response structure");
    }

    return data;
  },

  lyricLib: async function (song, artist, duration) {
    const url = new URL(BetterLyrics.Constants.LRCLIB_API_URL);
    url.searchParams.append("track_name", song);
    url.searchParams.append("artist_name", artist);
    url.searchParams.append("duration", duration);

    const response = await fetch(url.toString(), {
      headers: {
        "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(BetterLyrics.Constants.HTTP_ERROR_LOG + response.status);
    }

    const data = await response.json();

    if (data && data.syncedLyrics && typeof data.duration === "number") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG);
      return { lyrics: BetterLyrics.LyricProviders.parseLRCLIBLyrics(data.syncedLyrics, data.duration) };
    } else {
      throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
    }
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
  ytLyrics: async function (song, artist, duration) {
    let lyricText;

    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (tabSelector.getAttribute("aria-selected") !== "true") {
      throw new Error("Lyrics Tab Not Visible");
    }

    const hasYtMusicLyrics = document.querySelector(BetterLyrics.Constants.NO_LYRICS_TEXT_SELECTOR);
    if (
      hasYtMusicLyrics &&
      hasYtMusicLyrics.innerText === "Lyrics not available" &&
      hasYtMusicLyrics.parentElement.style.display !== "none"
    ) {
      lyricText = BetterLyrics.Constants.NO_LYRICS_TEXT;
    } else {
      const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
      lyricText = existingLyrics[0].innerText;
    }

    const lyricsArray = [];
    lyricText.split("\n").forEach(words => {
      lyricsArray.push({
        startTimeMs: "0",
        words: words,
        durationMs: "0",
      });
    });

    return { lyrics: lyricsArray };
  },
  /**
   * @type{function(song: string, artist: string, duration:number, videoId: string, audioTrackData:audioTrackData)}
   */
  ytCaptions: async function(song, artist, duration, videoId, audioTrackData) {
    if (audioTrackData.captionTracks.length === 0) {
      return;
    }
    let langCode;
    if (audioTrackData.captionTracks.length === 1) {
      langCode = audioTrackData.captionTracks[0].languageCode;
    } else {
      // Try and determine the language by finding an auto generated track
      for (let captionTracksKey in audioTrackData.captionTracks) {
        let data = audioTrackData.captionTracks[captionTracksKey];
        if (data.displayName.includes("auto-generated")) {
          langCode = data.languageCode;
          break;
        }
      }
    }

    if (!langCode) {
      console.log(audioTrackData);
      throw new Error("Found Caption Tracks, but couldn't determine the default");
    }

    let captionsUrl;
    for (let captionTracksKey in audioTrackData.captionTracks) {
      let data = audioTrackData.captionTracks[captionTracksKey];
      if (!data.displayName.includes("auto-generated") && data.languageCode === langCode) {
        captionsUrl = data.url;
        break;
      }
    }

    if (!captionsUrl) {
      console.log(audioTrackData);
      throw new Error("Only found auto generated lyrics, not using");
    }

    captionsUrl = new URL(captionsUrl);
    captionsUrl.searchParams.set("fmt", "json3");

    let captionData = await fetch(captionsUrl, {
      method: "GET"
    }).then(response => response.json())
    console.log(captionData);

    let lyricsArray = [];

    captionData.events.forEach((event) => {
      let words = "";
      for (let segsKey in event.segs) {
        words += event.segs[segsKey].utf8;
      }

      lyricsArray.push({
        startTimeMs: event.tStartMs,
        words: words,
        durationMs: event.dDurationMs,
      });
    });

    return { lyrics: lyricsArray, language: langCode };
  },
  initProviders: function () {
    BetterLyrics.LyricProviders.providersList = [
      BetterLyrics.LyricProviders.ytCaptions,
      BetterLyrics.LyricProviders.bLyrics,
      BetterLyrics.LyricProviders.lyricLib,
      BetterLyrics.LyricProviders.ytLyrics,
    ];
  },
};
