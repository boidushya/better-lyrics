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

/**
 * Main application object for BetterLyrics extension.
 * Manages application state, lyrics injection, and YouTube Music integration.
 *
 * @namespace BetterLyrics.App
 */
BetterLyrics.App = {
  /** @type {string} Current language setting */
  lang: "en",
  /** @type {boolean} Whether lyrics are currently syncing with playback */
  areLyricsTicking: false,
  /** @type {LyricsData|null} Current lyric data object */
  lyricData: null,
  /** @type {boolean} Whether lyrics have been successfully loaded */
  areLyricsLoaded: false,
  /** @type {boolean} Whether lyric injection has failed */
  lyricInjectionFailed: false,
  /** @type {string|null} ID of the last processed video */
  lastVideoId: null,
  /** @type {Lyrics|null} Details of the last processed video */
  lastVideoDetails: null,
  /** @type {Promise|null} Promise for ongoing lyric injection process */
  lyricInjectionPromise: null,
  /** @type {boolean} Whether lyric injection is queued */
  queueLyricInjection: false,
  /** @type {boolean} Whether album art injection is queued */
  queueAlbumArtInjection: false,
  /** @type {string|boolean} Album art injection status */
  shouldInjectAlbumArt: "Unknown",
  /** @type {boolean} Whether song details injection is queued */
  queueSongDetailsInjection: false,
  /** @type {number|null} Timeout ID for loader animation end */
  loaderAnimationEndTimeout: null,
  /** @type {string|null} ID of the last loaded video */
  lastLoadedVideoId: null,

  /**
   * Initializes the BetterLyrics extension by setting up all required components.
   * This method orchestrates the setup of logging, DOM injection, observers, settings,
   * storage, and lyric providers.
   */
  modify: async function () {
    BetterLyrics.Utils.setUpLog();
    await BetterLyrics.DOM.injectHeadTags();
    BetterLyrics.Observer.enableLyricsTab();
    BetterLyrics.Settings.hideCursorOnIdle();
    BetterLyrics.Settings.handleSettings();
    BetterLyrics.Storage.subscribeToCustomCSS();
    BetterLyrics.Storage.purgeExpiredKeys();
    BetterLyrics.Storage.saveCacheInfo();
    BetterLyrics.Settings.listenForPopupMessages();
    BetterLyrics.Observer.lyricReloader();
    BetterLyrics.Observer.initializeLyrics();
    BetterLyrics.Observer.disableInertWhenFullscreen();
    BetterLyrics.LyricProviders.initProviders();

    BetterLyrics.Utils.log(
      BetterLyrics.Constants.INITIALIZE_LOG,
      "background: rgba(10,11,12,1) ; color: rgba(214, 250, 214,1) ; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 1rem; "
    );

    BetterLyrics.Settings.onAlbumArtEnabled(
      () => (BetterLyrics.App.shouldInjectAlbumArt = true),
      () => (BetterLyrics.App.shouldInjectAlbumArt = false)
    );
  },

  /**
   * Handles modifications to player state and manages lyric injection.
   * Ensures only one lyric injection process runs at a time by queueing subsequent calls.
   *
   * @param {PlayerDetails} detail - Player state details
   */
  handleModifications: function (detail) {
    if (BetterLyrics.App.lyricInjectionPromise) {
      BetterLyrics.App.lyricInjectionPromise.then(() => {
        BetterLyrics.App.lyricInjectionPromise = null;
        BetterLyrics.App.handleModifications(detail);
      });
    } else {
      BetterLyrics.App.lyricInjectionPromise = BetterLyrics.Lyrics.createLyrics(detail)
        .then(() => {
          return BetterLyrics.DOM.tickLyrics(detail.currentTime, Date.now(), detail.playing);
        })
        .catch(err => {
          BetterLyrics.Utils.log(BetterLyrics.App.GENERAL_ERROR_LOG, err);
          BetterLyrics.App.areLyricsLoaded = false;
          BetterLyrics.App.lyricInjectionFailed = true;
        });
    }
  },

  /**
   * Reloads lyrics by resetting the last video ID.
   * Forces the extension to re-fetch lyrics for the current video.
   */
  reloadLyrics() {
    BetterLyrics.App.lastVideoId = null;
  },

  /**
   * Initializes the application by setting up the DOM content loaded event listener.
   * Entry point for the BetterLyrics extension.
   */
  init: function () {
    document.addEventListener("DOMContentLoaded", BetterLyrics.App.modify);
  },
};

// Initialize the application
BetterLyrics.App.init();

BetterLyrics.RequestSniffing.setupRequestSniffer();
BetterLyrics.DOM.injectGetSongInfo();
