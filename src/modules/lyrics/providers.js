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

  /**
   * @typedef {{startTimeMs: number, words: string, durationMs: number, parts: ({startTimeMs: number, words: string, durationMs: number}[] | null)}[]} LyricsArray
   */

  providersList: [],

  cubey: async function (song, artist, duration, videoId, _audioTrackData) {
    const url = new URL("https://lyrics.api.dacubeking.com/");
    url.searchParams.append("song", song);
    url.searchParams.append("artist", artist);
    url.searchParams.append("duration", duration);
    url.searchParams.append("videoId", videoId);
    url.searchParams.append("enhanced", await BetterLyrics.Settings.shouldUseKaraokeLyrics());
    let response = await fetch(url, { signal: AbortSignal.timeout(10000) }).then(r => r.json());
    if (response.album) {
      BetterLyrics.Utils.log("Found Album: " + response.album);
    }
    let lyrics = null;
    try {
      if (response.lyrics) {
        lyrics = BetterLyrics.LyricProviders.parseLRC(response.lyrics, duration);
        BetterLyrics.LyricProviders.lrcFixers(lyrics);
      }
    } catch (err) {
      BetterLyrics.Utils.log(err);
    }

    return {
      lyrics: lyrics,
      source: "DaCubeKing",
      album: response.album,
      song: response.song,
      duration: response.duration,
      artist: response.artist,
      cacheAllowed: true,
      sourceHref: "https://dacubeking.com",
    };
  },

  local: async function (song, artist, duration, videoId, _audioTrackData) {
    const url = new URL("http://127.0.0.1:8787", { signal: AbortSignal.timeout(1000) });
    url.searchParams.append("song", song);
    url.searchParams.append("artist", artist);
    url.searchParams.append("duration", duration);
    url.searchParams.append("videoId", videoId);
    url.searchParams.append("enhanced", true);
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
      album: response.album,
      cacheAllowed: false,
      sourceHref: "https://dacubeking.com",
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

    if (data) {
      // First try synced lyrics
      if (data.syncedLyrics && typeof data.duration === "number") {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG);
        return {
          lyrics: BetterLyrics.LyricProviders.parseLRC(data.syncedLyrics, data.duration),
          source: "LRCLib",
          sourceHref: "https://lrclib.net/",
        };
      }
      // Fall back to plain lyrics if available
      else if (data.plainLyrics) {
        BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG + " (plain lyrics)");
        return {
          lyrics: BetterLyrics.LyricProviders.formatPlainLyrics(data.plainLyrics),
          source: "LRCLib (Plain)",
          sourceHref: "https://lrclib.net/",
          isPlainLyrics: true,
        };
      }
    }
    
    throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
  },
  /**
   * @type{function(song: string, artist: string, duration:number, videoId: string)}
   */
  ytLyrics: async function (_song, _artist, _duration, videoId, _audioTrackData, _album) {
    let lyricsObj = await BetterLyrics.RequestSniffing.getLyrics(videoId);
    let lyricsText = BetterLyrics.Constants.NO_LYRICS_TEXT;
    let sourceText = "Unknown";
    const lyricsArray = [];
    if (lyricsObj.hasLyrics) {
      lyricsText = lyricsObj.lyrics;
      sourceText = lyricsObj.sourceText.substring(8) + " (via YT)";
    }

    lyricsText.split("\n").forEach(words => {
      lyricsArray.push({
        startTimeMs: "0",
        words: words,
        durationMs: "0",
      });
    });

    return {
      lyrics: lyricsArray,
      source: sourceText,
      sourceHref: "",
      cacheAllowed: false,
      text: lyricsText,
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
    return {
      lyrics: lyricsArray,
      language: langCode,
      source: "Youtube Captions",
      sourceHref: "",
      musicVideoSynced: true,
    };
  },

  formatPlainLyrics: function (plainLyrics) {
    const lines = plainLyrics.split('\n').filter(line => line.trim().length > 0);
    const lyricsArray = [];
    
    lines.forEach((line) => {
      lyricsArray.push({
        startTimeMs: 0,
        words: line.trim(),
        durationMs: 0,
      });
    });
    
    return lyricsArray;
  },

  initProviders: function () {
    const browserAPI = typeof browser !== "undefined" ? browser : chrome;

    const updateProvidersList = preferredProviderList => {
      BetterLyrics.LyricProviders.providersList = [];

      if (!preferredProviderList) {
        preferredProviderList = ["p-dacubeking", "p-better-lyrics", "p-lrclib", "p-yt-captions"];
      }

      const providerMap = {
        "p-dacubeking": BetterLyrics.LyricProviders.cubey,
        "p-better-lyrics": BetterLyrics.LyricProviders.bLyrics,
        "p-lrclib": BetterLyrics.LyricProviders.lyricLib,
        "p-yt-captions": BetterLyrics.LyricProviders.ytCaptions,
      };

      BetterLyrics.Utils.log(BetterLyrics.Constants.PROVIDER_SWITCHED_LOG, preferredProviderList);

      preferredProviderList.forEach(providerString => {
        let provider = providerMap[providerString];
        if (provider) {
          BetterLyrics.LyricProviders.providersList.push(provider);
        } else {
          console.error("Invalid Provider string supplied: ", providerString);
        }
      });
    };

    browserAPI.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.preferredProviderList) {
        updateProvidersList(changes.preferredProviderList.newValue);
      }
    });

    browserAPI.storage.sync.get({ preferredProviderList: null }, function (items) {
      updateProvidersList(items.preferredProviderList);
    });
  },
  /**
   *
   * @param lrcText {string}
   * @param songDuration {number}
   * @return {LyricsArray}
   */
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
      result.forEach(lyric => {
        lyric.startTimeMs -= offset;
        lyric.parts.forEach(part => {
          part.startTimeMs -= offset;
        });
      });
    }

    return result;
  },

  /**
   * @param lyrics {LyricsArray}
   */
  lrcFixers: function (lyrics) {
    // if the duration of the space after a word is a similar duration to the word,
    // move the duration of the space into the word.
    // or if it's short, remove the break to improve smoothness
    for (let lyric of lyrics) {
      if (lyric.parts !== null) {
        for (let i = 1; i < lyric.parts.length; i++) {
          let thisPart = lyric.parts[i];
          let prevPart = lyric.parts[i - 1];
          if (thisPart.words === " " && prevPart.words !== " ") {
            let deltaTime = thisPart.durationMs - prevPart.durationMs;
            if (Math.abs(deltaTime) <= 15 || thisPart.durationMs <= 100) {
              let durationChange = thisPart.durationMs;
              prevPart.durationMs += durationChange;
              thisPart.durationMs -= durationChange;
              thisPart.startTimeMs += durationChange;
            }
          }
        }
      }
    }

    // check if we have very short duration for most lyrics,
    // if we do, calculate the duration of the next lyric
    let shortDurationCount = 0;
    let durationCount = 0;
    for (let lyric of lyrics) {
      // skipping the last two parts is on purpose
      // (weather they have a valid duration seems uncorrelated with the rest of them being correct)
      if (!lyric.parts || lyric.parts.length === 0) {
        continue;
      }

      for (let i = 0; i < lyric.parts.length - 2; i++) {
        let part = lyric.parts[i];
        if (part.words !== " ") {
          if (part.durationMs <= 100) {
            shortDurationCount++;
          }
          durationCount++;
        }
      }
    }
    if (durationCount > 0 && shortDurationCount / durationCount > 0.5) {
      BetterLyrics.Utils.log("Found a lot of short duration lyrics, fudging durations");
      for (let i = 0; i < lyrics.length; i++) {
        let lyric = lyrics[i];
        if (!lyric.parts || lyric.parts.length === 0) {
          continue;
        }

        for (let j = 0; j < lyric.parts.length; j++) {
          let part = lyric.parts[j];
          if (part.words === " ") {
            continue;
          }
          if (part.durationMs <= 400) {
            let nextPart;
            if (j + 1 < lyric.parts.length) {
              nextPart = lyric.parts[j + 1];
            } else if (i + 1 < lyric.parts.length && lyrics[i].parts.length > 0) {
              nextPart = lyrics[i].parts[0];
            } else {
              nextPart = null;
            }

            if (nextPart === null) {
              part.durationMs = 300;
            } else {
              if (nextPart.words === " ") {
                part.durationMs += nextPart.durationMs;
                nextPart.startTimeMs += nextPart.durationMs;
                nextPart.durationMs = 0;
              } else {
                part.durationMs = nextPart.startTimeMs - part.startTimeMs;
              }
            }
          }
        }
      }
    }
  },
};
