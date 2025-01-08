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

  local: async function(song, artist, duration){
    const  url = new URL("http://localhost:5000/getLyrics");
    url.searchParams.append("song", song);
    url.searchParams.append("artist", artist);
    url.searchParams.append("duration", duration);
    let lrc = await fetch(url).then(r => r.json());
    let lyrics = BetterLyrics.LyricProviders.parseLRC(lrc.lyrics, duration);
    console.log(lrc);


    return {
      lyrics: lyrics,
      source: "Local Lyrics",
      cacheAllowed: true,
      sourceHref: "https://lrclib.net/",
    };
  },

  bLyrics: async function (song, artist, duration) {
    // Fetch from the primary API if cache is empty or invalid
    const url = new URL(BetterLyrics.Constants.LYRICS_API_URL);
    url.searchParams.append("s", song);
    url.searchParams.append("a", artist);
    url.searchParams.append("d", duration);

    const response = await fetch(url.toString(), {signal: AbortSignal.timeout(10000)});

    if (!response.ok) {
      throw new Error(`${BetterLyrics.Constants.HTTP_ERROR_LOG} ${response.status}`);
    }

    const data = await response.json();
    // Validate API response structure
    if (!data || (!Array.isArray(data.lyrics) && !data.syncedLyrics)) {
      throw new Error("Invalid API response structure");
    }

    data.source = "boidu.dev";
    data.sourceHref = "https://better-lyrics.boidu.dev";

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
      return {
        lyrics: BetterLyrics.LyricProviders.parseLRC(data.syncedLyrics, data.duration),
        source: "LRCLib",
        sourceHref: "https://lrclib.net/",
      };
    } else {
      throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
    }
  },
  ytLyrics: async function (waitForLoaderPromise) {
    const spinner = document.querySelector("#tab-renderer > tp-yt-paper-spinner-lite");

    if (!spinner || !waitForLoaderPromise) {
      throw new Error("Lyrics not ready yet!");
    }

    const delay = ms => new Promise(resolve => setTimeout(() => resolve(false), ms));

    if (await Promise.race([delay(2000), waitForLoaderPromise])) {
      BetterLyrics.Utils.log("Found Loader, waiting for completion");
    } else {
      BetterLyrics.Utils.log("Timed out waiting for loader");
    }

    let waitForLoaderFinishPromise = new Promise(resolve => {
      if (spinner.style.display === "none") {
        resolve(true);
        return;
      }
      let observer = new MutationObserver(() => {
        if (spinner.style.display === "none") {
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(spinner, {
        attributes: true,
      });
    });

    if (await Promise.race([delay(10000), waitForLoaderFinishPromise])) {
      BetterLyrics.Utils.log("Loader finished successfully");
    } else {
      throw new Error("Timed out waiting for ytLyrics");
    }

    let lyricText;

    const tabSelector = document.getElementsByClassName(BetterLyrics.Constants.TAB_HEADER_CLASS)[1];
    if (tabSelector.getAttribute("aria-selected") !== "true") {
      throw new Error("Lyrics aren't ready yet");
    }

    if (
      !document.querySelector("#tab-renderer > ytmusic-section-list-renderer") ||
      document.querySelector("#tab-renderer > ytmusic-section-list-renderer").style.display === "none"
    ) {
      lyricText = BetterLyrics.Constants.NO_LYRICS_TEXT;
    } else {
      let existingLyrics;
      if (document.getElementById("bLyrics-yt-lyrics")) {
        existingLyrics = document.getElementById("bLyrics-yt-lyrics");
      } else {
        existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS)[0];
        existingLyrics.id = "bLyrics-yt-lyrics";
      }
      lyricText = existingLyrics.innerText;
    }

    const source = document.querySelector(
      "#contents > ytmusic-description-shelf-renderer > yt-formatted-string.footer.style-scope.ytmusic-description-shelf-renderer"
    );
    let sourceText;
    if (!source) {
      sourceText = "Unknown";
    } else {
      sourceText = source.innerText.substring(8);
    }

    /**
     *
     * @type {startTimeMs: number, words: string, durationMs: number, {parts: {startTimeMs: number, words: string, durationMs: number}[]}[]}
     */
    const lyricsArray = [];
    lyricText.split("\n").forEach(words => {
      lyricsArray.push({
        startTimeMs: "0",
        words: words,
        durationMs: "0",
      });
    });

    return {
      lyrics: lyricsArray,
      source: sourceText + " (via YT)",
      sourceHref: "",
      cacheAllowed: false,
      text: lyricText,
    };
  },

  /**
   * @type{function(song: string, artist: string, duration:number, videoId: string, audioTrackData:audioTrackData)}
   */
  ytCaptions: async function (_song, _artist, _duration, _videoId, audioTrackData) {
    if (audioTrackData.captionTracks.length === 0) {
      return;
    }
    let langCode;
    if (audioTrackData.captionTracks.length === 1) {
      langCode = audioTrackData.captionTracks[0].languageCode;
    } else {
      // Try and determine the language by finding an auto generated track
      // TODO: This sucks as a method
      for (let captionTracksKey in audioTrackData.captionTracks) {
        let data = audioTrackData.captionTracks[captionTracksKey];
        if (data.displayName.includes("auto-generated")) {
          langCode = data.languageCode;
          break;
        }
      }
    }

    if (!langCode) {
      BetterLyrics.Utils.log(audioTrackData);
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
      BetterLyrics.Utils.log(audioTrackData);
      throw new Error("Only found auto generated lyrics, not using");
    }

    captionsUrl = new URL(captionsUrl);
    captionsUrl.searchParams.set("fmt", "json3");

    let captionData = await fetch(captionsUrl, {
      method: "GET",
    }).then(response => response.json());

    let lyricsArray = [];

    captionData.events.forEach(event => {
      let words = "";
      for (let segsKey in event.segs) {
        words += event.segs[segsKey].utf8;
      }
      words = words.replaceAll("\n", " ");
      for (let c of BetterLyrics.Constants.MUSIC_NOTES) {
        words = words.trim();
        if (words.startsWith(c)) {
          words = words.substring(1);
        }
        if (words.endsWith(c)) {
          words = words.substring(0, words.length - 1);
        }
      }
      words = words.trim();
      lyricsArray.push({
        startTimeMs: event.tStartMs,
        words: words,
        durationMs: event.dDurationMs,
      });
    });
    return {lyrics: lyricsArray, language: langCode, source: "Youtube Captions", sourceHref: ""};
  },

  initProviders: function () {
    const browserAPI = typeof browser !== "undefined" ? browser : chrome;

    const updateProvidersList = preferredProvider => {
      BetterLyrics.LyricProviders.providersList = [BetterLyrics.LyricProviders.local, BetterLyrics.LyricProviders.ytCaptions];

      const providerMap = {
        0: BetterLyrics.LyricProviders.bLyrics,
        1: BetterLyrics.LyricProviders.lyricLib,
      };

      BetterLyrics.Utils.log(BetterLyrics.Constants.PROVIDER_SWITCHED_LOG, preferredProvider);

      if (providerMap[preferredProvider]) {
        BetterLyrics.LyricProviders.providersList.push(providerMap[preferredProvider]);
      }

      Object.entries(providerMap).forEach(([index, provider]) => {
        if (parseInt(index) !== preferredProvider) {
          BetterLyrics.LyricProviders.providersList.push(provider);
        }
      });
    };

    browserAPI.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.preferredProvider) {
        updateProvidersList(changes.preferredProvider.newValue);
      }
    });

    browserAPI.storage.sync.get({preferredProvider: 0}, function (items) {
      updateProvidersList(items.preferredProvider);
    });
  },
  parseLRC: function (lrcText, songDuration) {
    const lines = lrcText.split('\n');
    const result = [];
    const idTags = {};
    const possibleIdTags = ["ti", "ar", "al", "au", "lr", "length", "by", "offset", "re", "tool", "ve", "#"];

    // Parse time in [mm:ss.xx] or <mm:ss.xx> format to milliseconds
    function parseTime(timeStr) {
      const match = timeStr.match(/(\d+):(\d+\.\d+)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      return Math.round((minutes * 60 + seconds) * 1000);
    }

    // Process each line
    lines.forEach(line => {
      line = line.trim();

      // Match ID tags [type:value]
      const idTagMatch = line.match(/^\[(\w+):(.*)]$/);
      if (idTagMatch && possibleIdTags.includes(idTagMatch[1])) {
        idTags[idTagMatch[1]] = idTagMatch[2];
        return;
      }

      // Match time tags with lyrics
      const timeTagRegex = /\[(\d+:\d+\.\d+)]/g;
      const enhancedWordRegex = /<(\d+:\d+\.\d+)>/g;

      const timeTags = [];
      let match;
      while ((match = timeTagRegex.exec(line)) !== null) {
        timeTags.push(parseTime(match[1]));
      }

      if (timeTags.length === 0) return; // Skip lines without time tags

      const lyricPart = line.replace(timeTagRegex, '').trim();

      // Extract enhanced lyrics (if available)
      const parts = [];
      let lastTime = null;
      let plainText = '';

      lyricPart.split(enhancedWordRegex).forEach((fragment, index) => {
        if (index % 2 === 0) {
          // This is a word or plain text segment
          if (fragment.length > 0 && fragment[0] === ' ') {
            fragment = fragment.substring(1);
          }
          if (fragment.length > 0 && fragment[fragment.length - 1] === ' ') {
            fragment = fragment.substring(0, fragment.length - 1);
          }
          plainText += fragment;
          if (parts.length > 0 && parts[parts.length - 1].startTimeMs) {
            parts[parts.length - 1].words += fragment;
          }
        } else {
          // This is a timestamp
          const startTime = parseTime(fragment);
          if (lastTime !== null && parts.length > 0) {
            parts[parts.length - 1].durationMs = startTime - lastTime;
          }
          parts.push({
            startTimeMs: startTime,
            words: '',
            durationMs: 0,
          });
          lastTime = startTime;
        }
      });

      // Calculate fallback duration and add entry
      const startTime = Math.min(...timeTags);
      const endTime = Math.max(...timeTags);
      const duration = endTime - startTime;

      result.push({
        startTimeMs: startTime,
        words: plainText.trim(),
        durationMs: duration,
        parts:
          parts.length > 0
            ? parts
            : [
              {
                startTimeMs: startTime,
                words: lyricPart,
                durationMs: duration,
              },
            ],
      });
    });
    result.forEach((lyric, index) => {
      if (index + 1 < result.length) {
        const lastPart = lyric.parts[lyric.parts.length - 1];
        lastPart.durationMs = result[index + 1].startTimeMs - lastPart.startTimeMs;
        lyric.durationMs = lastPart.startTimeMs - lyric.startTimeMs;
      } else {
        lyric.durationMs = songDuration - lyric.durationMs;
      }
    });

    return result;
  },
};
