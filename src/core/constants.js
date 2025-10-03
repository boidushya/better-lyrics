/**
 * @fileoverview export constants and configuration values for the BetterLyrics extension.
 * Contains DOM selectors, API URLs, log messages, and other static values.
 */


  // DOM Class Names
export const TITLE_CLASS = "title ytmusic-player-bar";
export const SUBTITLE_CLASS = "subtitle style-scope ytmusic-player-bar";
export const TAB_HEADER_CLASS = "tab-header style-scope ytmusic-player-page";
export const TAB_CONTENT_CLASS = "tab-content style-scope tp-yt-paper-tab";
export const LYRICS_CLASS = "blyrics-container";
export const CURRENT_LYRICS_CLASS = "blyrics--active";
export const ZERO_DURATION_ANIMATION_CLASS = "blyrics-zero-dur-animate";
export const RTL_CLASS = "blyrics-rtl";
export const ANIMATING_CLASS = "blyrics--animating";
export const PRE_ANIMATING_CLASS = "blyrics--pre-animating";
export const USER_SCROLLING_CLASS = "blyrics-user-scrolling";
export const TRANSLATED_LYRICS_CLASS = "blyrics--translated";
export const ROMANIZED_LYRICS_CLASS = "blyrics--romanized";
export const ERROR_LYRICS_CLASS = "blyrics--error";
export const FOOTER_CLASS = "blyrics-footer";
export const WATERMARK_CLASS = "blyrics-watermark";
export const TIME_INFO_CLASS = "time-info style-scope ytmusic-player-bar";

// DOM Selectors
export const SONG_IMAGE_SELECTOR = "#song-image>#thumbnail>#img";
export const TAB_RENDERER_SELECTOR = "#tab-renderer";
export const NO_LYRICS_TEXT_SELECTOR = "#tab-renderer > ytmusic-message-renderer > yt-formatted-string.text.style-scope.ytmusic-message-renderer";

// DOM IDs and Attributes
export const LYRICS_LOADER_ID = "blyrics-loader";
export const LYRICS_WRAPPER_ID = "blyrics-wrapper";
export const LYRICS_SPACING_ELEMENT_ID = "blyrics-spacing-element";
export const LYRICS_DISABLED_ATTR = "blyrics-dfs";
export const LYRICS_STYLIZED_ATTR = "blyrics-stylized";
export const LYRICS_RTL_ATTR = "blyrics-rtl-enabled";

// Assets and Resources
export const DISCORD_LOGO_SRC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiNhYWEiIGQ9Ik0xOS4yNyA1LjMzQzE3Ljk0IDQuNzEgMTYuNSA0LjI2IDE1IDRhLjA5LjA5IDAgMCAwLS4wNy4wM2MtLjE4LjMzLS4zOS43Ni0uNTMgMS4wOWExNi4wOSAxNi4wOSAwIDAgMC00LjggMGMtLjE0LS4zNC0uMzUtLjc2LS41NC0xLjA5Yy0uMDEtLjAyLS4wNC0uMDMtLjA3LS4wM2MtMS41LjI2LTIuOTMuNzEtNC4yNyAxLjMzYy0uMDEgMC0uMDIuMDEtLjAzLjAyYy0yLjcyIDQuMDctMy40NyA4LjAzLTMuMSAxMS45NWMwIC4wMi4wMS4wNC4wMy4wNWMxLjggMS4zMiAzLjUzIDIuMTIgNS4yNCAyLjY1Yy4wMy4wMS4wNiAwIC4wNy0uMDJjLjQtLjU1Ljc2LTEuMTMgMS4wNy0xLjc0Yy4wMi0uMDQgMC0uMDgtLjA0LS4wOWMtLjU3LS4yMi0xLjExLS40OC0xLjY0LS43OGMtLjA0LS4wMi0uMDQtLjA4LS4wMS0uMTFjLjExLS4wOC4yMi0uMTcuMzMtLjI1Yy4wMi0uMDIuMDUtLjAyLjA3LS4wMWMzLjQ0IDEuNTcgNy4xNSAxLjU3IDEwLjU1IDBjLjAyLS4wMS4wNS0uMDEuMDcuMDFjLjExLjA5LjIyLjE3LjMzLjI2Yy4wNC4wMy4wNC4wOS0uMDEuMTFjLS41Mi4zMS0xLjA3LjU2LTEuNjQuNzhjLS4wNC4wMS0uMDUuMDYtLjA0LjA5Yy4zMi42MS42OCAxLjE5IDEuMDcgMS43NGMuMDMuMDEuMDYuMDIuMDkuMDFjMS43Mi0uNTMgMy40NS0xLjMzIDUuMjUtMi42NWMuMDItLjAxLjAzLS4wMy4wMy0uMDVjLjQ0LTQuNTMtLjczLTguNDYtMy4xLTExLjk1Yy0uMDEtLjAxLS4wMi0uMDItLjA0LS4wMk04LjUyIDE0LjkxYy0xLjAzIDAtMS44OS0uOTUtMS44OS0yLjEycy44NC0yLjEyIDEuODktMi4xMmMxLjA2IDAgMS45Ljk2IDEuODkgMi4xMmMwIDEuMTctLjg0IDIuMTItMS44OSAyLjEybTYuOTcgMGMtMS4wMyAwLTEuODktLjk1LTEuODktMi4xMnMuODQtMi4xMiAxLjg5LTIuMTJjMS4wNiAwIDEuOS45NiAxLjg5IDIuMTJjMCAxLjE3LS44MyAyLjEyLTEuODkgMi4xMiIvPjwvc3ZnPg==";
export const EMPTY_THUMBNAIL_SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
export const FONT_LINK = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap";

// API URLs and Functions
export const LYRICS_API_URL = "https://lyrics-api.boidu.dev/getLyrics";
export const DISCORD_INVITE_URL = "https://discord.gg/UsHE3d5fWF";
export const LRCLIB_API_URL = "https://lrclib.net/api/get";
export const LRCLIB_UPLOAD_URL = "https://lrclibup.boidu.dev/";
export const LRCLIB_CLIENT_HEADER = "BetterLyrics Extension (https://github.com/boidushya/better-lyrics)";
export const TRANSLATE_LYRICS_URL = function (lang, text) {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
};
export const TRANSLATE_IN_ROMAJI = function (lang, text) {
    return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=${lang}-Latn&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
};

// Supported Languages
export const romanizationLanguages = [
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
];

// Log Prefixes
export const LOG_PREFIX = "[BetterLyrics]";
export const IGNORE_PREFIX = "(Safe to ignore)";

// Initialization and General Logs
export const INITIALIZE_LOG = "%c[BetterLyrics] Loaded Successfully. Logs are enabled by default. You can disable them in the extension options.";
export const GENERAL_ERROR_LOG = "[BetterLyrics] Error:";

// Lyrics Fetch and Processing Logs
export const FETCH_LYRICS_LOG = "[BetterLyrics] Fetching lyrics for:";
export const LYRICS_FOUND_LOG = "[BetterLyrics] Lyrics found, injecting into the page";
export const NO_LYRICS_FOUND_LOG = "[BetterLyrics] No lyrics found for the current song";
export const LYRICS_CACHE_FOUND_LOG = "[BetterLyrics] Lyrics found in cache, skipping backend fetch";
export const LYRICS_LEGACY_LOG = "[BetterLyrics] Using legacy method to fetch song info";
export const LRCLIB_LYRICS_FOUND_LOG = "[BetterLyrics] Lyrics found from LRCLIB";
export const NO_LRCLIB_LYRICS_FOUND_LOG = "[BetterLyrics] No lyrics found on LRCLIB";
export const PROVIDER_SWITCHED_LOG = "[BetterLyrics] Switching to provider = ";

// UI State Logs
export const LYRICS_TAB_HIDDEN_LOG = "[BetterLyrics] (Safe to ignore) Lyrics tab is hidden, skipping lyrics fetch";
export const LYRICS_TAB_VISIBLE_LOG = "[BetterLyrics] Lyrics tab is visible, fetching lyrics";
export const LYRICS_TAB_CLICKED_LOG = "[BetterLyrics] Lyrics tab clicked, fetching lyrics";
export const LYRICS_WRAPPER_NOT_VISIBLE_LOG = "[BetterLyrics] (Safe to ignore) Lyrics wrapper is not visible, unable to inject lyrics";
export const LYRICS_WRAPPER_CREATED_LOG = "[BetterLyrics] Lyrics wrapper created";
export const FOOTER_NOT_VISIBLE_LOG = "[BetterLyrics] (Safe to ignore) Footer is not visible, unable to inject source link";
export const LYRICS_TAB_NOT_DISABLED_LOG = "[BetterLyrics] (Safe to ignore) Lyrics tab is not disabled, unable to enable it";
export const SONG_SWITCHED_LOG = "[BetterLyrics] Song has been switched";
export const ALBUM_ART_ADDED_LOG = "[BetterLyrics] Album art added to the layout";
export const ALBUM_ART_ADDED_FROM_MUTATION_LOG = "[BetterLyrics] Album art added to the layout from mutation event";
export const ALBUM_ART_REMOVED_LOG = "[BetterLyrics] Album art removed from the layout";
export const LOADING_WITHOUT_SONG_META = "[BetterLyrics] Trying to load without Song/Artist info";
export const SKIPPING_LOAD_WITH_META = "[BetterLyrics] Skipping Reload From Metadata Available: Already Loaded";
export const LOADER_TRANSITION_ENDED = "[BetterLyrics] Loader Transition Ended";
export const LOADER_ANIMATION_END_FAILED = "[BetterLyrics] Loader Animation Didn't End";
export const LOADER_FOUND_LOG = "[BetterLyrics] Found Loader, waiting for completion";
export const LOADER_NOT_FOUND_LOG = "[BetterLyrics] Timed out waiting for loader";
export const LOADER_FINISHED_LOG = "[BetterLyrics] Loader completed successfully";
export const PAUSING_LYRICS_SCROLL_LOG = "[BetterLyrics] Pausing Lyrics Autoscroll Due to User Scroll";

// Feature State Logs
export const AUTO_SWITCH_ENABLED_LOG = "[BetterLyrics] Auto switch enabled, switching to lyrics tab";
export const TRANSLATION_ENABLED_LOG = "[BetterLyrics] Translation enabled, translating lyrics. Language: ";
export const TRANSLATION_ERROR_LOG = "[BetterLyrics] Unable to translate lyrics due to error";
export const SYNC_DISABLED_LOG = "[BetterLyrics] Syncing lyrics disabled due to all lyrics having a start time of 0";
export const YT_MUSIC_LYRICS_AVAILABLE_LOG = "[BetterLyrics] Lyrics are available on the page & backend failed to fetch lyrics";
export const LOADER_ACTIVE_LOG = "[BetterLyrics] (Safe to ignore) Loader is active, skipping lyrics sync";

// Error and Storage Logs
export const HTTP_ERROR_LOG = "[BetterLyrics] HTTP Error:";
export const SERVER_ERROR_LOG = "[BetterLyrics] Server Error:";
export const CACHE_PROCESS_ERROR_LOG = "[BetterLyrics] Error caching and processing lyrics";
export const PURGE_LOG = "[BetterLyrics] Purged key from storage: ";
export const STORAGE_TRANSIENT_SET_LOG = "[BetterLyrics] Set transient storage for key: ";
export const STORAGE_TRANSIENT_GET_LOG = "[BetterLyrics] Get transient storage for key: ";
export const NO_LYRICS_ELEMENT_LOG = "[BetterLyrics] No lyrics element found on the page, skipping lyrics injection";
export const INVALID_SONG_ARTIST_LOG = "[BetterLyrics] Invalid song or artist data";
export const EMPTY_SONG_ARTIST_LOG = "[BetterLyrics] Empty song or artist name";
export const CACHE_PARSE_ERROR_LOG = "[BetterLyrics] Error parsing cached lyrics";
export const INVALID_API_RESPONSE_LOG = "[BetterLyrics] Invalid API response structure";
export const PRIMARY_API_TIMEOUT_LOG = "[BetterLyrics] Primary API request timed out";
export const LRCLIB_TIMEOUT_LOG = "[BetterLyrics] LRCLIB request timed out";
export const NO_VALID_LRCLIB_LYRICS_LOG = "[BetterLyrics] No valid lyrics returned from LRCLIB";
export const INVALID_CACHE_DATA_LOG = "[BetterLyrics] Invalid data structure in cache";
export const CACHE_PARSING_ERROR = "[BetterLyrics] Error parsing cached data";
export const LYRICS_CHECK_INTERVAL_ERROR = "[BetterLyrics] Error in lyrics check interval:";
export const NO_LYRICS_TEXT = "No lyrics found for this song";
export const MUSIC_NOTES = "♪𝅘𝅥𝅮𝅘𝅥𝅯𝅘𝅥𝅰𝅘𝅥𝅱𝅘𝅥𝅲";

