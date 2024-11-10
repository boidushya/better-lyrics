// Using a namespace pattern
var BetterLyrics = BetterLyrics || {};

BetterLyrics.Constants = {
  // DOM Class Names
  TITLE_CLASS: "title ytmusic-player-bar",
  SUBTITLE_CLASS: "subtitle style-scope ytmusic-player-bar",
  TAB_HEADER_CLASS: "tab-header style-scope ytmusic-player-page",
  TAB_CONTENT_CLASS: "tab-content style-scope tp-yt-paper-tab",
  LYRICS_CLASS: "blyrics-container",
  CURRENT_LYRICS_CLASS: "blyrics--active",
  TRANSLATED_LYRICS_CLASS: "blyrics--translated",
  ROMANIZED_LYRICS_CLASS: "blyrics--romanized",
  ERROR_LYRICS_CLASS: "blyrics--error",
  DESCRIPTION_CLASS: "description style-scope ytmusic-description-shelf-renderer",
  FOOTER_CLASS: "blyrics-footer",
  WATERMARK_CLASS: "blyrics-watermark",
  TIME_INFO_CLASS: "time-info style-scope ytmusic-player-bar",
  YT_MUSIC_FOOTER_CLASS: "footer style-scope ytmusic-description-shelf-renderer",

  // DOM Selectors
  SONG_IMAGE_SELECTOR: "#song-image>#thumbnail>#img",
  TAB_RENDERER_SELECTOR: "#tab-renderer",
  NO_LYRICS_TEXT_SELECTOR:
    "#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer",

  // DOM IDs and Attributes
  LYRICS_LOADER_ID: "blyrics-loader",
  LYRICS_WRAPPER_ID: "blyrics-wrapper",
  LYRICS_DISABLED_ATTR: "blyrics-dfs",
  LYRICS_STYLIZED_ATTR: "blyrics-stylized",
  LYRICS_RTL_ATTR: "blyrics-rtl-enabled",

  // Assets and Resources
  DISCORD_LOGO_SRC:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhYWEiIGQ9Ik0xOS4yNyA1LjMzQzE3Ljk0IDQuNzEgMTYuNSA0LjI2IDE1IDRhLjA5LjA5IDAgMCAwLS4wNy4wM2MtLjE4LjMzLS4zOS43Ni0uNTMgMS4wOWExNi4wOSAxNi4wOSAwIDAgMC00LjggMGMtLjE0LS4zNC0uMzUtLjc2LS41NC0xLjA5Yy0uMDEtLjAyLS4wNC0uMDMtLjA3LS4wM2MtMS41LjI2LTIuOTMuNzEtNC4yNyAxLjMzYy0uMDEgMC0uMDIuMDEtLjAzLjAyYy0yLjcyIDQuMDctMy40NyA4LjAzLTMuMSAxMS45NWMwIC4wMi4wMS4wNC4wMy4wNWMxLjggMS4zMiAzLjUzIDIuMTIgNS4yNCAyLjY1Yy4wMy4wMS4wNiAwIC4wNy0uMDJjLjQtLjU1Ljc2LTEuMTMgMS4wNy0xLjc0Yy4wMi0uMDQgMC0uMDgtLjA0LS4wOWMtLjU3LS4yMi0xLjExLS40OC0xLjY0LS43OGMtLjA0LS4wMi0uMDQtLjA4LS4wMS0uMTFjLjExLS4wOC4yMi0uMTcuMzMtLjI1Yy4wMi0uMDIuMDUtLjAyLjA3LS4wMWMzLjQ0IDEuNTcgNy4xNSAxLjU3IDEwLjU1IDBjLjAyLS4wMS4wNS0uMDEuMDcuMDFjLjExLjA5LjIyLjE3LjMzLjI2Yy4wNC4wMy4wNC4wOS0uMDEuMTFjLS41Mi4zMS0xLjA3LjU2LTEuNjQuNzhjLS4wNC4wMS0uMDUuMDYtLjA0LjA5Yy4zMi42MS42OCAxLjE5IDEuMDcgMS43NGMuMDMuMDEuMDYuMDIuMDkuMDFjMS43Mi0uNTMgMy40NS0xLjMzIDUuMjUtMi42NWMuMDItLjAxLjAzLS4wMy4wMy0uMDVjLjQ0LTQuNTMtLjczLTguNDYtMy4xLTExLjk1Yy0uMDEtLjAxLS4wMi0uMDItLjA0LS4wMk04LjUyIDE0LjkxYy0xLjAzIDAtMS44OS0uOTUtMS44OS0yLjEycy44NC0yLjEyIDEuODktMi4xMmMxLjA2IDAgMS45Ljk2IDEuODkgMi4xMmMwIDEuMTctLjg0IDIuMTItMS44OSAyLjEybTYuOTcgMGMtMS4wMyAwLTEuODktLjk1LTEuODktMi4xMnMuODQtMi4xMiAxLjg5LTIuMTJjMS4wNiAwIDEuOS45NiAxLjg5IDIuMTJjMCAxLjE3LS44MyAyLjEyLTEuODkgMi4xMiIvPjwvc3ZnPg==",
  EMPTY_THUMBNAIL_SRC: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  FONT_LINK: "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap",

  // API URLs and Functions
  LYRICS_API_URL: "https://lyrics-api.boidu.dev/getLyrics",
  DISCORD_INVITE_URL: "https://discord.gg/UsHE3d5fWF",
  LRCLIB_API_URL: "https://lrclib.net/api/get",
  LRCLIB_CLIENT_HEADER: "BetterLyrics Extension (https://github.com/boidushya/better-lyrics)",
  TRANSLATE_LYRICS_URL: function (lang, text) {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
  },
  TRANSLATE_IN_ROMAJI: function (lang, text) {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
  },

  // Supported Languages
  romanizationLanguages: [
    "ja", // Japanese - Romaji
    "ru", // Russian - Romanization
    "ko", // Korean - Romanization
    "zh-CN", // Simplified Chinese - Pinyin
    "zh-TW", // Traditional Chinese - Pinyin
    // "hi" , // Hindi
    "zh", // Chinese
    "bn", // Bengali - Romanization
    "th", // Thai - Romanization
    "el", // Greek - Romanization
    "he", // Hebrew - Romanization
    "ar", // Arabic - Romanization
    "ta", // Tamil - Romanization
    "te", // Telugu - Romanization
    "ml", // Malayalam - Romanization
    "kn", // Kannada - Romanization
    "gu", // Gujarati - Romanization
    "pa", // Punjabi - Romanization
    "mr", // Marathi - Romanization
    "ur", // Urdu - Romanization
    "si", // Sinhala - Romanization
    "my", // Burmese - Romanization
    "ka", // Georgian - Romanization
    "km", // Khmer - Romanization
    "lo", // Lao - Romanization
    "fa", // Persian - Romanization
  ],

  // Log Prefixes
  LOG_PREFIX: "[BetterLyrics]",
  IGNORE_PREFIX: "(Safe to ignore)",

  // Initialization and General Logs
  INITIALIZE_LOG:
    "%c[BetterLyrics] Loaded Successfully. Logs are enabled by default. You can disable them in the extension options.",
  GENERAL_ERROR_LOG: "[BetterLyrics] Error:",

  // Lyrics Fetch and Processing Logs
  FETCH_LYRICS_LOG: "[BetterLyrics] Fetching lyrics for:",
  LYRICS_FOUND_LOG: "[BetterLyrics] Lyrics found, injecting into the page",
  NO_LYRICS_FOUND_LOG: "[BetterLyrics] No lyrics found for the current song",
  LYRICS_CACHE_FOUND_LOG: "[BetterLyrics] Lyrics found in cache, skipping backend fetch",
  LYRICS_LEGACY_LOG: "[BetterLyrics] Using legacy method to fetch song info",
  LRCLIB_LYRICS_FOUND_LOG: "[BetterLyrics] Lyrics found from LRCLIB",
  NO_LRCLIB_LYRICS_FOUND_LOG: "[BetterLyrics] No lyrics found on LRCLIB",

  // UI State Logs
  LYRICS_TAB_HIDDEN_LOG: "[BetterLyrics] (Safe to ignore) Lyrics tab is hidden, skipping lyrics fetch",
  LYRICS_TAB_VISIBLE_LOG: "[BetterLyrics] Lyrics tab is visible, fetching lyrics",
  LYRICS_TAB_CLICKED_LOG: "[BetterLyrics] Lyrics tab clicked, fetching lyrics",
  LYRICS_WRAPPER_NOT_VISIBLE_LOG:
    "[BetterLyrics] (Safe to ignore) Lyrics wrapper is not visible, unable to inject lyrics",
  LYRICS_WRAPPER_CREATED_LOG: "[BetterLyrics] Lyrics wrapper created",
  FOOTER_NOT_VISIBLE_LOG: "[BetterLyrics] (Safe to ignore) Footer is not visible, unable to inject source link",
  LYRICS_TAB_NOT_DISABLED_LOG: "[BetterLyrics] (Safe to ignore) Lyrics tab is not disabled, unable to enable it",
  SONG_SWITCHED_LOG: "[BetterLyrics] Song has been switched",
  ALBUM_ART_ADDED_LOG: "[BetterLyrics] Album art added to the layout",
  ALBUM_ART_REMOVED_LOG: "[BetterLyrics] Album art removed from the layout",
  LOADING_WITHOUT_SONG_META: "[BetterLyrics] Trying to load without Song/Artist info",
  SKIPPING_LOAD_WITH_META: "[BetterLyrics] Skipping Reload From Metadata Available: Already Loaded",
  LOADER_TRANSITION_ENDED: "[BetterLyrics] Loader Transition Ended",

  // Feature State Logs
  AUTO_SWITCH_ENABLED_LOG: "[BetterLyrics] Auto switch enabled, switching to lyrics tab",
  TRANSLATION_ENABLED_LOG: "[BetterLyrics] Translation enabled, translating lyrics. Language: ",
  TRANSLATION_ERROR_LOG: "[BetterLyrics] Unable to translate lyrics due to error",
  SYNC_DISABLED_LOG: "[BetterLyrics] Syncing lyrics disabled due to all lyrics having a start time of 0",
  YT_MUSIC_LYRICS_AVAILABLE_LOG: "[BetterLyrics] Lyrics are available on the page & backend failed to fetch lyrics",
  LOADER_ACTIVE_LOG: "[BetterLyrics] (Safe to ignore) Loader is active, skipping lyrics sync",

  // Error and Storage Logs
  HTTP_ERROR_LOG: "[BetterLyrics] HTTP Error:",
  SERVER_ERROR_LOG: "[BetterLyrics] Server Error:",
  CACHE_PROCESS_ERROR_LOG: "[BetterLyrics] Error caching and processing lyrics",
  PURGE_LOG: "[BetterLyrics] Purged key from storage: ",
  STORAGE_TRANSIENT_SET_LOG: "[BetterLyrics] Set transient storage for key: ",
  STORAGE_TRANSIENT_GET_LOG: "[BetterLyrics] Get transient storage for key: ",
  NO_LYRICS_ELEMENT_LOG: "[BetterLyrics] No lyrics element found on the page, skipping lyrics injection",
  INVALID_SONG_ARTIST_LOG: "[BetterLyrics] Invalid song or artist data",
  EMPTY_SONG_ARTIST_LOG: "[BetterLyrics] Empty song or artist name",
  CACHE_PARSE_ERROR_LOG: "[BetterLyrics] Error parsing cached lyrics",
  INVALID_API_RESPONSE_LOG: "[BetterLyrics] Invalid API response structure",
  PRIMARY_API_TIMEOUT_LOG: "[BetterLyrics] Primary API request timed out",
  LRCLIB_TIMEOUT_LOG: "[BetterLyrics] LRCLIB request timed out",
  NO_VALID_LRCLIB_LYRICS_LOG: "[BetterLyrics] No valid lyrics returned from LRCLIB",
  INVALID_CACHE_DATA_LOG: "[BetterLyrics] Invalid data structure in cache",
};
