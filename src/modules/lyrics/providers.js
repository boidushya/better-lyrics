/**
 * Handles the Turnstile challenge by creating an iframe and returning a Promise.
 * The visibility of the iframe can be controlled for testing purposes.
 * @returns {Promise<string>} A promise that resolves with the Turnstile token.
 */
function handleTurnstile() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = CUBEY_LYRICS_API_URL + "challenge";

    iframe.style.position = "fixed";
    iframe.style.bottom = "calc(20px + var(--ytmusic-player-bar-height))";
    iframe.style.right = "20px";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";
    document.body.appendChild(iframe);

    const messageListener = event => {
      if (event.source !== iframe.contentWindow) {
        return;
      }

      switch (event.data.type) {
        case "turnstile-token":
          Utils.log("[BetterLyrics] ✅ Received Success Token:", event.data.token);
          cleanup();
          resolve(event.data.token);
          break;

        case "turnstile-error":
          console.error("[BetterLyrics] ❌ Received Challenge Error:", event.data.error);
          cleanup();
          reject(new Error(`[BetterLyrics] Turnstile challenge error: ${event.data.error}`));
          break;

        case "turnstile-expired":
          console.warn("⚠️ Token expired. Resetting challenge.");
          iframe.contentWindow.postMessage({ type: "reset-turnstile" }, "*");
          break;

        case "turnstile-timeout":
          console.warn("[BetterLyrics] ⏳ Challenge timed out.");
          cleanup();
          reject(new Error("[BetterLyrics] Turnstile challenge timed out."));
          break;
      }
    };

    const cleanup = () => {
      window.removeEventListener("message", messageListener);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    window.addEventListener("message", messageListener);
  });
}

const CUBEY_LYRICS_API_URL = "https://lyrics.api.dacubeking.com/";

/**
 * Lyrics provider management for the BetterLyrics extension.
 * Handles multiple lyrics sources and provider orchestration.
 *
 *./

 /**
 * @typedef {object} AudioTrackData
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
 * @typedef {Object} LyricSource
 * @property {boolean} filled
 * @property {LyricSourceResult | null} lyricSourceResult
 * @property {function(song, artist, duration, videoId, audioTrackData, album) | null} lyricSourceFiller
 */

/**
 * @typedef {Object} LyricSourceResult
 * @property {Lyric[]} lyrics
 * @property {string | null | undefined} language
 * @property {string} source
 * @property {string} sourceHref
 * @property {boolean | null | undefined} musicVideoSynced
 */

/**
 * @typedef {Lyric[]} LyricsArray
 */

/**
 * @typedef {Object} Lyric
 * @property {number} startTimeMs
 * @property {string} words
 * @property {number} durationMs
 * @property {LyricPart[] | null | undefined} parts
 */

/**
 * @typedef {Object} LyricPart
 * @property {number} startTimeMs
 * @property {string} words
 * @property {number} durationMs
 */

/**
 * @typedef {Object} ProviderParameters
 * @property {string} song
 * @property {string} artist
 * @property {string} duration
 * @property {string} videoId
 * @property {AudioTrackData} audioTrackData
 * @property {string | null} album
 * @property {Map<string, LyricSource>} sourceMap
 * @property {boolean} alwaysFetchMetadata
 * @property {AbortSignal} signal
   */

import {browser} from "../../../extension.config";
import * as Utils from "../../core/utils";
import * as Constants from "../../core/constants";
import * as RequestSniffing from "./requestSniffer";

  /**
   *
   * @param {ProviderParameters} providerParameters
   */
  async function cubey(providerParameters) {

    /**
     * Gets a valid JWT, either from storage or by forcing a new Turnstile challenge.
     * @param {boolean} [forceNew=false] - If true, ignores and overwrites any stored token.
     * @returns {Promise<string|null>} A promise that resolves with the JWT.
     */
    async function getAuthenticationToken(forceNew = false) {
      function isJwtExpired(token) {
        try {
          const payloadBase64Url = token.split(".")[1];
          if (!payloadBase64Url) return true;
          const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = atob(payloadBase64);
          const payload = JSON.parse(decodedPayload);
          const expirationTimeInSeconds = payload.exp;
          if (!expirationTimeInSeconds) return true;
          const nowInSeconds = Date.now() / 1000;
          return nowInSeconds > expirationTimeInSeconds;
        } catch (e) {
          console.error("[BetterLyrics] Error decoding JWT on client-side:", e);
          return true;
        }
      }

      if (forceNew) {
        Utils.log("[BetterLyrics] Forcing new token, removing any existing one.");
        await chrome.storage.local.remove("jwtToken");
      } else {
        const storedData = await chrome.storage.local.get("jwtToken");
        if (storedData.jwtToken) {
          if (isJwtExpired(storedData.jwtToken)) {
            Utils.log("[BetterLyrics]Local JWT has expired. Removing and requesting a new one.");
            await chrome.storage.local.remove("jwtToken");
          } else {
            Utils.log("[BetterLyrics] 🔑 Using valid, non-expired JWT for bypass.");
            return storedData.jwtToken;
          }
        }
      }

      try {
        Utils.log("[BetterLyrics] No valid JWT found, initiating Turnstile challenge...");
        const turnstileToken = await handleTurnstile({ visible: false });

        const response = await fetch(CUBEY_LYRICS_API_URL + "verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
          credentials: "include",
        });

        if (!response.ok) throw new Error(`API verification failed: ${response.statusText}`);

        const data = await response.json();
        const newJwt = data.jwt;

        if (!newJwt) throw new Error("No JWT returned from API after verification.");

        await chrome.storage.local.set({jwtToken: newJwt});
        Utils.log("[BetterLyrics] ✅ New JWT received and stored.");
        return newJwt;
      } catch (error) {
        console.error("[BetterLyrics] Authentication process failed:", error);
        return null;
      }
    }

    /**
     * Helper to construct and send the API request.
     * @param {string} jwt - The JSON Web Token for authorization.
     * @returns {Promise<Response>} The fetch Response object.
     */
    async function makeApiCall(jwt) {
      const url = new URL(CUBEY_LYRICS_API_URL + "lyrics");
      url.searchParams.append("song", providerParameters.song);
      url.searchParams.append("artist", providerParameters.artist);
      url.searchParams.append("duration", providerParameters.duration);
      url.searchParams.append("videoId", providerParameters.videoId);
      if (providerParameters.album) {
        url.searchParams.append("album", providerParameters.album);
      }
      url.searchParams.append("alwaysFetchMetadata", String(providerParameters.alwaysFetchMetadata));

      return await fetch(url, {
        signal: AbortSignal.any([providerParameters.signal, AbortSignal.timeout(10000)]),
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        credentials: "include",
      });
    }

    let jwt = await getAuthenticationToken();
    if (!jwt) {
      console.error("[BetterLyrics] Could not obtain an initial authentication token. Aborting lyrics fetch.");
      // Mark sources as filled to prevent retries
      ["musixmatch-synced", "musixmatch-richsync", "lrclib-synced", "lrclib-plain"].forEach(source => {
        providerParameters.sourceMap.get(source).filled = true;
      });
      return;
    }

  let response = await makeApiCall(jwt);

    // If the request is forbidden (403), it's likely a WAF block.
    // Invalidate the current JWT and try one more time with a fresh one.
    if (response.status === 403) {
      console.warn(
        "[BetterLyrics] Request was blocked (403 Forbidden), possibly by WAF. Forcing new Turnstile challenge."
      );
      jwt = await getAuthenticationToken(true); // `true` forces a new token

      if (!jwt) {
        console.error("[BetterLyrics] Could not obtain a new token after WAF block. Aborting.");
        ["musixmatch-synced", "musixmatch-richsync", "lrclib-synced", "lrclib-plain"].forEach(source => {
          providerParameters.sourceMap.get(source).filled = true;
        });
        return;
      }

      Utils.log("[BetterLyrics] Retrying API call with new token...");
      response = await makeApiCall(jwt);
    }

    if (!response.ok) {
      console.error(`[BetterLyrics] API request failed with status: ${response.status}`);
      ["musixmatch-synced", "musixmatch-richsync", "lrclib-synced", "lrclib-plain"].forEach(source => {
        providerParameters.sourceMap.get(source).filled = true;
      });
      return;
    }

    const responseData = await response.json();

    if (responseData.album) {
      Utils.log("[BetterLyrics] Found Album: " + responseData.album);
    }

    if (responseData.musixmatchWordByWordLyrics) {
    let musixmatchWordByWordLyrics = parseLRC(
      responseData.musixmatchWordByWordLyrics,
      Number(providerParameters.duration)
    );
    lrcFixers(musixmatchWordByWordLyrics);

    providerParameters.sourceMap.get("musixmatch-richsync").lyricSourceResult = {
      lyrics: musixmatchWordByWordLyrics,
      source: "Musixmatch",
      sourceHref: "https://www.musixmatch.com",
      musicVideoSynced: false,
      album: responseData.album,
      artist: responseData.artist,
      song: responseData.song,
      duration: responseData.duration,
    };
  } else {
    providerParameters.sourceMap.get("musixmatch-richsync").lyricSourceResult = {
      lyrics: null,
      source: "Musixmatch",
      sourceHref: "https://www.musixmatch.com",
      musicVideoSynced: false,
      album: responseData.album,
      artist: responseData.artist,
      song: responseData.song,
      duration: responseData.duration,
    };
  }

  if (responseData.musixmatchSyncedLyrics) {
    let musixmatchSyncedLyrics = parseLRC(
      responseData.musixmatchSyncedLyrics,
      Number(providerParameters.duration)
    );
    providerParameters.sourceMap.get("musixmatch-synced").lyricSourceResult = {
      lyrics: musixmatchSyncedLyrics,
      source: "Musixmatch",
      sourceHref: "https://www.musixmatch.com",
      musicVideoSynced: false,
    };
  }

  if (responseData.lrclibSyncedLyrics) {
    let lrclibSyncedLyrics = parseLRC(
      responseData.lrclibSyncedLyrics,
      Number(providerParameters.duration)
    );
    providerParameters.sourceMap.get("lrclib-synced").lyricSourceResult = {
      lyrics: lrclibSyncedLyrics,
      source: "LRCLib",
      sourceHref: "https://lrclib.net",
      musicVideoSynced: false,
    };
  }

  if (responseData.lrclibPlainLyrics) {
    let lrclibPlainLyrics = parsePlainLyrics(responseData.lrclibPlainLyrics);

    providerParameters.sourceMap.get("lrclib-plain").lyricSourceResult = {
      lyrics: lrclibPlainLyrics,
      source: "LRCLib",
      sourceHref: "https://lrclib.net",
      musicVideoSynced: false,
    cacheAllowed: false,};
  }

  ["musixmatch-synced", "musixmatch-richsync", "lrclib-synced", "lrclib-plain"].forEach(source => {
    providerParameters.sourceMap.get(source).filled = true;
  });
}

/**
 *
 * @param {ProviderParameters} providerParameters
 */
async function bLyrics(providerParameters) {
  // Fetch from the primary API if cache is empty or invalid
  const url = new URL(Constants.LYRICS_API_URL);
  url.searchParams.append("s", providerParameters.song);
  url.searchParams.append("a", providerParameters.artist);
  url.searchParams.append("d", providerParameters.duration);

  const response = await fetch(url.toString(), {signal: AbortSignal.any([providerParameters.signal, AbortSignal.timeout(10000)]),
    });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  // Validate API response structure
  if (!data || (!Array.isArray(data.lyrics) && !data.syncedLyrics)) {
    providerParameters.sourceMap.get("bLyrics").filled = true;
    providerParameters.sourceMap.get("bLyrics").lyricSourceResult = null;
  }

  data.source = "boidu.dev";
  data.sourceHref = "https://better-lyrics.boidu.dev";

  providerParameters.sourceMap.get("bLyrics").filled = true;
  providerParameters.sourceMap.get("bLyrics").lyricSourceResult = data;
}

/**
 * @param {ProviderParameters} providerParameters
 */
async function lyricLib(providerParameters) {
  const url = new URL(Constants.LRCLIB_API_URL);
  url.searchParams.append("track_name", providerParameters.song);
  url.searchParams.append("artist_name", providerParameters.artist);
  if (providerParameters.album) {
    url.searchParams.append("album_name", providerParameters.album);
  }
  url.searchParams.append("duration", providerParameters.duration);

  const response = await fetch(url.toString(), {
    headers: {
      "Lrclib-Client": Constants.LRCLIB_CLIENT_HEADER,
    },
    signal: AbortSignal.any([providerParameters.signal, AbortSignal.timeout(10000)]),
  });

  if (!response.ok) {
    providerParameters.sourceMap.get("lrclib-synced").filled = true;
    providerParameters.sourceMap.get("lrclib-plain").filled = true;
    providerParameters.sourceMap.get("lrclib-synced").lyricSourceResult = null;
    providerParameters.sourceMap.get("lrclib-plain").lyricSourceResult = null;
  }

  const data = await response.json();

  if (data) {
    Utils.log(Constants.LRCLIB_LYRICS_FOUND_LOG);

    if (data.syncedLyrics) {
      providerParameters.sourceMap.get("lrclib-synced").lyricSourceResult = {
        lyrics: parseLRC(data.syncedLyrics, data.duration),
        source: "LRCLib",
        sourceHref: "https://lrclib.net",
        musicVideoSynced: false,
      };
    }
    if (data.plainLyrics) {
      providerParameters.sourceMap.get("lrclib-plain").lyricSourceResult = {
        lyrics: parsePlainLyrics(data.plainLyrics),
        source: "LRCLib",
        sourceHref: "https://lrclib.net",
        musicVideoSynced: false,
      cacheAllowed: false,};
    }
  }

  providerParameters.sourceMap.get("lrclib-synced").filled = true;
  providerParameters.sourceMap.get("lrclib-plain").filled = true;
}

/**
 * @param {ProviderParameters} providerParameters
 */
async function ytLyrics(providerParameters) {
  let lyricsObj = await RequestSniffing.getLyrics(providerParameters.videoId);
  if (lyricsObj.hasLyrics) {
    let lyricsText = lyricsObj.lyrics;
    let sourceText = lyricsObj.sourceText.substring(8) + " (via YT)";

    let lyricsArray = parsePlainLyrics(lyricsText);
    providerParameters.sourceMap.get("yt-lyrics").lyricSourceResult = {
      lyrics: lyricsArray,
      text: lyricsText,
      source: sourceText,
      sourceHref: "",
      musicVideoSynced: false,
    cacheAllowed: false,};
  }

  providerParameters.sourceMap.get("yt-lyrics").filled = true;
}

/**
 *
 * @param {ProviderParameters} providerParameters
 * @return {Promise<void>}
 */
async function ytCaptions(providerParameters) {
  let audioTrackData = providerParameters.audioTrackData;
  if (audioTrackData.captionTracks.length === 0) {
    return;
  }

  /**
   * @type string
   */
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
    Utils.log("Found Caption Tracks, but couldn't determine the default", audioTrackData);
    providerParameters.sourceMap.get("yt-captions").filled = true;
    providerParameters.sourceMap.get("yt-captions").lyricSourceResult = null;
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
    Utils.log("Only found auto generated lyrics for youtube captions, not using", audioTrackData);
    providerParameters.sourceMap.get("yt-captions").filled = true;
    providerParameters.sourceMap.get("yt-captions").lyricSourceResult = null;
  return;
    }

  captionsUrl = new URL(captionsUrl);
  captionsUrl.searchParams.set("fmt", "json3");

  let captionData = await fetch(captionsUrl, {
    method: "GET",
  signal: AbortSignal.any([providerParameters.signal, AbortSignal.timeout(10000)]),
    }).then(response => response.json());

  /**
   * @type {LyricsArray}
   */
  let lyricsArray = [];

  captionData.events.forEach(event => {
    let words = "";
    for (let segsKey in event.segs) {
      words += event.segs[segsKey].utf8;
    }
    words = words.replaceAll("\n", " ");
    for (let c of Constants.MUSIC_NOTES) {
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

  let allCaps = lyricsArray.every(lyric => {
    return lyric.words.toUpperCase() === lyric.words;
  });

  if (allCaps) {
    lyricsArray.every(lyric => {
      lyric.words = lyric.words.substring(0, 1).toUpperCase() + lyric.words.substring(1).toLowerCase();
      return true;
    });
  }

  providerParameters.sourceMap.get("yt-captions").filled = true;
  providerParameters.sourceMap.get("yt-captions").lyricSourceResult = {
    lyrics: lyricsArray,
    language: langCode,
    source: "Youtube Captions",
    sourceHref: "",
    musicVideoSynced: true,
  };
}

/**
 * @type {string[]}
 */
export let providerPriority = [];

export function initProviders() {
  /**
   *
   * @param {string[]} preferredProviderList
   */
  const updateProvidersList = preferredProviderList => {
    let defaultPreferredProviderList = [
      "musixmatch-richsync",
      "yt-captions",
      "lrclib-synced",
      "musixmatch-synced",
      "bLyrics",
      "yt-lyrics",
      "lrclib-plain",
    ];

    if (preferredProviderList === null) {
      preferredProviderList = defaultPreferredProviderList;
      Utils.log("No preferred provider list, resetting to default");
    }

    let isValid = defaultPreferredProviderList.every(provider => {
      return preferredProviderList.includes(provider) || preferredProviderList.includes("d_" + provider);
    });

    if (!isValid) {
      preferredProviderList = defaultPreferredProviderList;
      Utils.log("Invalid preferred provider list, resetting to default");
    }

    //Remove any invalid entries in the preferred provider list
    preferredProviderList = preferredProviderList.filter(provider => {
      return (
        defaultPreferredProviderList.includes(provider) ||
        (provider.startsWith("d_") && defaultPreferredProviderList.includes(provider.substring(2)))
      );
    });

    Utils.log(Constants.PROVIDER_SWITCHED_LOG, preferredProviderList);
    providerPriority = preferredProviderList;
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.preferredProviderList) {
      updateProvidersList(changes.preferredProviderList.newValue);
    }
  });

  chrome.storage.sync.get({preferredProviderList: null}, function (items) {
    updateProvidersList(items.preferredProviderList);
  });
}

/**
 * @return {Map<string, LyricSource>} sources
 */
export function newSourceMap() {
  let sources = new Map();

  function addSource(sourceName, sourceFiller) {
    sources.set(sourceName, {
      filled: false,
      lyricSourceResult: null,
      lyricSourceFiller: sourceFiller,
    });
  }

  addSource("musixmatch-richsync", cubey);
  addSource("musixmatch-synced", cubey);
  addSource("lrclib-synced", lyricLib);
  addSource("lrclib-plain", lyricLib);
  addSource("bLyrics", bLyrics);
  addSource("yt-captions", ytCaptions);
  addSource("yt-lyrics", ytLyrics);
  return sources;
}

/**
 * @param {ProviderParameters} providerParameters
 * @param {string} source
 */
export async function getLyrics(providerParameters, source) {
  if (providerParameters.sourceMap.has(source)) {
    let lyricSource = providerParameters.sourceMap.get(source);
    if (!lyricSource.filled) {
      await lyricSource.lyricSourceFiller(providerParameters);
    }
    return lyricSource.lyricSourceResult;
  } else {
    console.error("Tried to get lyrics from an invalid source: " + source);
    return null;
  }
}

/**
 *
 * @param lrcText {string}
 * @param songDuration {number}
 * @return {LyricsArray}
 */
function parseLRC(lrcText, songDuration) {
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
    let offset = Number(idTags["offset"]);
    if (isNaN(offset)) {
      offset = 0;
      Utils.log("[BetterLyrics] Invalid offset in lyrics: " + idTags["offset"]);
    }
    offset = offset * 1000;
    result.forEach(lyric => {
      lyric.startTimeMs -= offset;
      lyric.parts.forEach(part => {
        part.startTimeMs -= offset;
      });
    });
  }

  return result;
}

/**
 * @param lyrics {LyricsArray}
 */
function lrcFixers(lyrics) {
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
    Utils.log("Found a lot of short duration lyrics, fudging durations");
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
}

/**
 *
 * @param {string} lyricsText
 * @return {LyricsArray}
 */
function parsePlainLyrics(lyricsText) {
  /**
   * @type {LyricsArray}
   */
  const lyricsArray = [];
  lyricsText.split("\n").forEach(words => {
    lyricsArray.push({
      startTimeMs: 0,
      words: words,
      durationMs: 0,
      parts: null,
    });
  });
  return lyricsArray;
}

