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

  cubey: async function (song, artist, duration, videoId, _audioTrackData) {
    const url = new URL("https://lyrics.api.dacubeking.com/");
    url.searchParams.append("song", song);
    url.searchParams.append("artist", artist);
    url.searchParams.append("duration", duration);
    url.searchParams.append("videoId", videoId);
    url.searchParams.append("enhanced", false);
    let response = await fetch(url).then(r => r.json());
    if (response.album) {
      BetterLyrics.Utils.log("Found Album: " + response.album);
    }
    let lyrics = null;
    try {
      if (response.lyrics) {
        lyrics = BetterLyrics.LyricProviders.parseLRC(response.lyrics, duration);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }

    return {
      lyrics: lyrics,
      source: "DaCubeKing",
      album: response.album,
      cacheAllowed: true,
      sourceHref: "https://dacubeking.com",
    };
  },

  // biome-ignore lint: useful for local debugging
  local: async function (song, artist, duration, videoId, _audioTrackData) {
    const url = new URL("http://127.0.0.1:5000");
    url.searchParams.append("videoId", videoId);
    let response = await fetch(url).then(r => r.json());

    let lyrics = null;
    try {
      if (response.lyrics) {
        lyrics = BetterLyrics.LyricProviders.parseLRC(response.lyrics, duration);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }

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

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });

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

  lyricLib: async function (song, artist, duration, _videoId, _audioTrackData, album) {
    const url = new URL(BetterLyrics.Constants.LRCLIB_API_URL);
    url.searchParams.append("track_name", song);
    url.searchParams.append("artist_name", artist);
    if (album) {
      url.searchParams.append("album_name", album);
    }
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
  /**
   * @type{function(song: string, artist: string, duration:number, videoId: string)}
   */
  ytLyrics: async function (_song, _artist, _duration, videoId, audioTrackData, album) {
    let lyrics = await BetterLyrics.RequestSniffing.getLyrics(videoId);
    if (lyrics.hasLyrics) {
      return {
        lyrics: lyrics.lyrics,
        source: lyrics.source + " (via YT)",
        sourceHref: "",
        cacheAllowed: false,
        text: null,
      };
    } else {
      return {
        lyrics: BetterLyrics.Constants.NO_LYRICS_TEXT,
        source: "Unknown",
        sourceHref: "",
        cacheAllowed: false,
        text: null,
      };
    }
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
    return { lyrics: lyricsArray, language: langCode, source: "Youtube Captions", sourceHref: "" };
  },

  initProviders: function () {
    const browserAPI = typeof browser !== "undefined" ? browser : chrome;

    const updateProvidersList = preferredProvider => {
      BetterLyrics.LyricProviders.providersList = [
        BetterLyrics.LyricProviders.ytCaptions,
        BetterLyrics.LyricProviders.cubey,
      ];

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

    browserAPI.storage.sync.get({ preferredProvider: 0 }, function (items) {
      updateProvidersList(items.preferredProvider);
    });
  },
  parseLRC: function (lrcText, songDuration) {
    const lines = lrcText.split("\n");
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

      const lyricPart = line.replace(timeTagRegex, "").trim();

      // Extract enhanced lyrics (if available)
      const parts = [];
      let lastTime = null;
      let plainText = "";

      lyricPart.split(enhancedWordRegex).forEach((fragment, index) => {
        if (index % 2 === 0) {
          // This is a word or plain text segment
          if (fragment.length > 0 && fragment[0] === " ") {
            fragment = fragment.substring(1);
          }
          if (fragment.length > 0 && fragment[fragment.length - 1] === " ") {
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
            words: "",
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
        parts: parts.length > 0 ? parts : null,
      });
    });
    result.forEach((lyric, index) => {
      if (index + 1 < result.length) {
        const nextLyric = result[index + 1];
        if (lyric.parts && lyric.parts.length > 0) {
          const lastPartInLyric = lyric.parts[lyric.parts.length - 1];
          lastPartInLyric.durationMs = nextLyric.startTimeMs - lastPartInLyric.startTimeMs;
        }
        if (lyric.durationMs === 0) {
          lyric.durationMs = nextLyric.startTimeMs - lyric.startTimeMs;
        }
      } else {
        if (lyric.parts && lyric.parts.length > 0) {
          const lastPartInLyric = lyric.parts[lyric.parts.length - 1];
          lastPartInLyric.durationMs = songDuration - lastPartInLyric.startTimeMs;
        }
        if (lyric.durationMs === 0) {
          lyric.durationMs = songDuration - lyric.startTimeMs;
        }
      }
    });


    if (idTags["offset"]) {
      let offset = idTags["offset"];
      console.log("Lyrics have a time offset: " + offset);
      result.forEach((lyric) => {
        lyric.startTimeMs -= offset;
        lyric.parts.forEach((part) => {
          part.startTimeMs -= offset;
        });
        }
      );
    }

    return result;
  },
};
