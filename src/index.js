/**
 * Player state details object passed from YouTube Music player
 * @typedef {Object} PlayerDetails
 * @property {number} currentTime - Current playback time in seconds
 * @property {string} videoId - YouTube video ID
 * @property {string} song - Song title
 * @property {string} artist - Artist name
 * @property {string} duration - Total duration of the track
 * @property {AudioTrackData} audioTrackData - Audio track and caption data
 * @property {number} browserTime - Browser timestamp in milliseconds
 * @property {boolean} playing - Whether the song/video is currently playing
 * @property {Object} contentRect - Dimensions of the player
 * @property {number} contentRect.width - Player width
 * @property {number} contentRect.height - Player height
 */

import * as Utils from "./core/utils";
import * as DOM from "./modules/ui/dom";
import * as Observer from "./modules/ui/observer";
import * as Settings from "./modules/settings/settings";
import * as Constants from "./core/constants";
import * as RequestSniffing from "./modules/lyrics/requestSniffer";
import * as Providers from "./modules/lyrics/providers";
import * as Lyrics from "./modules/lyrics/lyrics";
import * as Storage from "./core/storage";

/** @type {boolean} Whether lyrics are currently syncing with playback */
export let areLyricsTicking = false;
/** @type {LyricsData|null} Current lyric data object */
export let lyricData = null;
/** @type {boolean} Whether lyrics have been successfully loaded */
export let areLyricsLoaded = false;
/** @type {boolean} Whether lyric injection has failed */
export let lyricInjectionFailed = false;
/** @type {string|null} ID of the last processed video */
export let lastVideoId = null;
/** @type {Lyrics|null} Details of the last processed video */
export let lastVideoDetails = null;
/** @type {Promise|null} Promise for the ongoing lyric injection process */
export let lyricInjectionPromise = null;
/** @type {boolean} Whether lyric injection is queued */
export let queueLyricInjection = false;
/** @type {boolean} Whether album art injection is queued */
export let queueAlbumArtInjection = false;
/** @type {string|boolean} Album art injection status */
export let shouldInjectAlbumArt = "Unknown";
/** @type {boolean} Whether song details injection is queued */
export let queueSongDetailsInjection = false;
/** @type {number|null} Timeout ID for loader animation end */
export let loaderAnimationEndTimeout = null;
/** @type {string|null} ID of the last loaded video */
export let lastLoadedVideoId = null;
/** @type {AbortController|null} Abort controller for lyric fetching */
let lyricAbortController = null;

/**
 * Initializes the BetterLyrics extension by setting up all required components.
 * This method orchestrates the setup of logging, DOM injection, observers, settings,
 * storage, and lyric providers.
 */
export async function modify() {
  Utils.setUpLog();
  await DOM.injectHeadTags();
  Observer.enableLyricsTab();
  Settings.hideCursorOnIdle();
  Settings.handleSettings();
  Storage.subscribeToCustomCSS();
  await Storage.purgeExpiredKeys();
  await Storage.saveCacheInfo();
  Settings.listenForPopupMessages();
  Observer.lyricReloader();
  Observer.initializeLyrics();
  Observer.disableInertWhenFullscreen();
  Providers.initProviders()
  Utils.log(
    Constants.INITIALIZE_LOG,
    "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
  );

  Settings.onAlbumArtEnabled(
    () => (this.shouldInjectAlbumArt = true),
    () => (this.shouldInjectAlbumArt = false)
  );
}

/**
 * Handles modifications to player state and manages lyric injection.
 * Ensures only one lyric injection process runs at a time by queueing subsequent calls.
 *
 * @param {PlayerDetails} detail - Player state details
 */
export function handleModifications(detail) {
  if (this.lyricInjectionPromise) {
    this.lyricAbortController.abort("New song is being loaded");
    this.lyricInjectionPromise.then(() => {
      this.lyricInjectionPromise = null;
      this.handleModifications(detail);
    });
  } else {
    this.lyricAbortController = new AbortController();
    this.lyricInjectionPromise = Lyrics.createLyrics(detail, this.lyricAbortController.signal)
      .then(() => {
        return DOM.tickLyrics(detail.currentTime, Date.now(), detail.playing);
      })
      .catch(err => {
        Utils.log(this.GENERAL_ERROR_LOG, err);
        this.areLyricsLoaded = false;
        this.lyricInjectionFailed = true;
      });
  }
}

/**
 * Reloads lyrics by resetting the last video ID.
 * Forces the extension to re-fetch lyrics for the current video.
 */
export function reloadLyrics() {
  this.lastVideoId = null;
}

/**
 * Initializes the application by setting up the DOM content loaded event listener.
 * Entry point for the BetterLyrics extension.
 */
export function init() {
  document.addEventListener("DOMContentLoaded", modify);
}


// Initialize the application
init();

RequestSniffing.setupRequestSniffer();
DOM.injectGetSongInfo();
