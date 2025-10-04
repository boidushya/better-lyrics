var BetterLyrics = window.BetterLyrics || (window.BetterLyrics = {});
BetterLyrics.ChangeLyrics = {
  searchResults: [],
  currentSong: null,
  currentArtist: null,
  currentAlbum: null,
  currentDuration: null,
  currentVideoId: null,

  init: function (song, artist, album, duration, videoId) {
    BetterLyrics.ChangeLyrics.currentSong = song;
    BetterLyrics.ChangeLyrics.currentArtist = artist;
    BetterLyrics.ChangeLyrics.currentAlbum = album;
    BetterLyrics.ChangeLyrics.currentDuration = duration;
    BetterLyrics.ChangeLyrics.currentVideoId = videoId;
  },

  searchLyrics: async function (params, enabledProviders = ["lrclib"]) {
    let song = "";
    let artist = "";
    let query = "";
    if (params && typeof params === "object") {
      song = (params.song || "").trim();
      artist = (params.artist || "").trim();
      query = params.query;
    } else {
      query = (params || "").toString().trim();
    }
    if (!query) {
      return [];
    }

    const promises = [];

    if (enabledProviders.includes("lrclib")) {
      const url = new URL(BetterLyrics.Constants.LRCLIB_SEARCH_URL);
      url.searchParams.append("q", query);
      promises.push(
        BetterLyrics.Utils.fetchJSON(
          url.toString(),
          { headers: { "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER } },
          10000
        )
          .then(results => {
            if (!Array.isArray(results)) return [];
            results.forEach(result => {
              result.__provider = "LRCLib";
              result.__providerHref = "https://lrclib.net";
            });
            return results;
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, "LRCLib search error:", error);
            return [];
          })
      );
    }

    if (enabledProviders.includes("blyrics") && song) {
      const url = new URL(BetterLyrics.Constants.LYRICS_API_URL);
      url.searchParams.append("s", song);
      url.searchParams.append("a", artist);
      if (BetterLyrics.ChangeLyrics.currentDuration) {
        url.searchParams.append("d", BetterLyrics.ChangeLyrics.currentDuration);
      }
      promises.push(
        BetterLyrics.Utils.fetchJSON(url.toString(), {}, 10000)
          .then(data => {
            if (!data || !(data.lyrics || data.syncedLyrics)) return [];
            const result = {
              trackName: data.song || song,
              artistName: data.artist || artist,
              albumName: data.album || null,
              duration: data.duration || BetterLyrics.ChangeLyrics.currentDuration || 180,
              plainLyrics: data.lyrics
                ? Array.isArray(data.lyrics)
                  ? data.lyrics.map(l => l.words).join("\n")
                  : data.lyrics
                : null,
              syncedLyrics: data.syncedLyrics,
              __provider: "bLyrics",
              __providerHref: "https://better-lyrics.boidu.dev",
            };
            return [result];
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, "bLyrics search error:", error);
            return [];
          })
      );
    }

    if (enabledProviders.includes("musixmatch") && song) {
      const url = new URL("https://lyrics.api.dacubeking.com/");
      url.searchParams.append("song", song);
      url.searchParams.append("artist", artist);
      if (BetterLyrics.ChangeLyrics.currentDuration) {
        url.searchParams.append("duration", BetterLyrics.ChangeLyrics.currentDuration);
      }
      url.searchParams.append("videoId", BetterLyrics.ChangeLyrics.currentVideoId || "");
      url.searchParams.append("enhanced", "true");
      url.searchParams.append("useLrcLib", "false");
      promises.push(
        BetterLyrics.Utils.fetchJSON(url.toString(), {}, 10000)
          .then(data => {
            if (!data || !(data.musixmatchWordByWordLyrics || data.musixmatchSyncedLyrics)) return [];
            const result = {
              trackName: data.song || song,
              artistName: data.artist || artist,
              albumName: data.album,
              duration: data.duration || BetterLyrics.ChangeLyrics.currentDuration || 180,
              richSyncLyrics: data.musixmatchWordByWordLyrics,
              syncedLyrics: data.musixmatchSyncedLyrics,
              __provider: "Musixmatch",
              __providerHref: "https://www.musixmatch.com",
            };
            return [result];
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, "Musixmatch search error:", error);
            return [];
          })
      );
    }

    return Promise.all(promises).then(resultsArrays => {
      const allResults = [].concat(...resultsArrays);
      BetterLyrics.ChangeLyrics.searchResults = allResults;
      return allResults;
    });
  },

  applyLyrics: async function (lyricsData, source = "Manual", sourceHref = "") {
    try {
      BetterLyrics.Utils.log("[BetterLyrics] Applying lyrics data:", lyricsData);
      let parsedLyrics;
      let meta = typeof lyricsData === "object" && lyricsData !== null ? lyricsData : {};

      if (typeof lyricsData === "string") {
        if (lyricsData.includes("[") && lyricsData.includes("]")) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            lyricsData,
            BetterLyrics.Utils.toMs(BetterLyrics.ChangeLyrics.currentDuration)
          );
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(lyricsData);
        }
      } else if (meta.richSyncLyrics || meta.syncedLyrics || meta.plainLyrics) {
        if (meta.richSyncLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            meta.richSyncLyrics,
            BetterLyrics.Utils.toMs(meta.duration || BetterLyrics.ChangeLyrics.currentDuration)
          );
        } else if (meta.syncedLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            meta.syncedLyrics,
            BetterLyrics.Utils.toMs(meta.duration || BetterLyrics.ChangeLyrics.currentDuration)
          );
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(meta.plainLyrics);
        }
      } else if (meta && Array.isArray(meta.lyrics)) {
        parsedLyrics = meta.lyrics;
      } else if (
        meta &&
        (meta.__provider === "LRCLib" || meta.__provider === "LRClib" || meta.__provider === "LRCLIB")
      ) {
        const url = new URL(BetterLyrics.Constants.LRCLIB_API_URL);
        const tn = meta.trackName || BetterLyrics.ChangeLyrics.currentSong || "";
        const an = meta.artistName || BetterLyrics.ChangeLyrics.currentArtist || "";
        if (!tn || !an) throw new Error("Invalid lyrics data format");
        url.searchParams.append("track_name", tn);
        url.searchParams.append("artist_name", an);
        if (meta.albumName) url.searchParams.append("album_name", meta.albumName);
        if (meta.duration || BetterLyrics.ChangeLyrics.currentDuration)
          url.searchParams.append("duration", meta.duration || BetterLyrics.ChangeLyrics.currentDuration);
        const data = await BetterLyrics.Utils.fetchJSON(
          url.toString(),
          { headers: { "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER } },
          10000
        );
        if (data && data.syncedLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            data.syncedLyrics,
            BetterLyrics.Utils.toMs(data.duration || meta.duration || BetterLyrics.ChangeLyrics.currentDuration)
          );
        } else if (data && data.plainLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(data.plainLyrics);
        } else {
          throw new Error("Invalid lyrics data format");
        }
      } else {
        throw new Error("Invalid lyrics data format");
      }

      // Attempt to resync lyrics for music videos using segment maps (if available)
      if (Array.isArray(parsedLyrics)) {
        try {
          const match = await BetterLyrics.RequestSniffing.getMatchingSong(
            BetterLyrics.ChangeLyrics.currentVideoId
          );
          const allZero = parsedLyrics.every(item => item.startTimeMs === "0" || item.startTimeMs === 0);
          if (match && match.segmentMap && !allZero) {
            for (let lyric of parsedLyrics) {
              let lastTimeChange = 0;
              for (let segment of match.segmentMap.segment) {
                if (lyric.startTimeMs >= segment.counterpartVideoStartTimeMilliseconds) {
                  lastTimeChange =
                    segment.primaryVideoStartTimeMilliseconds - segment.counterpartVideoStartTimeMilliseconds;
                  if (
                    lyric.startTimeMs <=
                    segment.counterpartVideoStartTimeMilliseconds + segment.durationMilliseconds
                  ) {
                    break;
                  }
                }
              }
              lyric.startTimeMs = Number(lyric.startTimeMs) + lastTimeChange;
              if (lyric.parts) {
                lyric.parts.forEach(part => {
                  part.startTimeMs = Number(part.startTimeMs) + lastTimeChange;
                });
              }
            }
          }
        } catch (e) {
          BetterLyrics.Utils.log(e);
        }
      }

      const resultData = {
        lyrics: parsedLyrics,
        source: meta.__provider || source,
        sourceHref: meta.__providerHref || sourceHref,
        musicVideoSynced: false,
        song: BetterLyrics.ChangeLyrics.sanitizeMetaValue(meta.trackName) || BetterLyrics.ChangeLyrics.currentSong,
        artist: BetterLyrics.ChangeLyrics.sanitizeMetaValue(meta.artistName) || BetterLyrics.ChangeLyrics.currentArtist,
        album: BetterLyrics.ChangeLyrics.sanitizeMetaValue(meta.albumName) || BetterLyrics.ChangeLyrics.currentAlbum,
        duration: meta.duration || BetterLyrics.ChangeLyrics.currentDuration,
        videoId: BetterLyrics.ChangeLyrics.currentVideoId,
      };

      await BetterLyrics.ChangeLyrics.cacheLyrics(resultData);
      BetterLyrics.Lyrics.processLyrics(resultData);

      BetterLyrics.DOM.scrollResumeTime = 0;

      BetterLyrics.Utils.log("[BetterLyrics] Custom lyrics applied successfully");
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      BetterLyrics.ChangeLyrics.showError(
        `Failed to apply lyrics: ${error.message || "Please check the format and try again."}`
      );
    }
  },

  cacheLyrics: async function (lyricsData) {
    if (!BetterLyrics.ChangeLyrics.currentVideoId) return;

    const cacheKey = `blyrics_${BetterLyrics.ChangeLyrics.currentVideoId}`;

    lyricsData.version = BetterLyrics.Lyrics.LYRIC_CACHE_VERSION;
    lyricsData.cacheAllowed = true;

    try {
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      await BetterLyrics.Storage.setTransientStorage(cacheKey, JSON.stringify(lyricsData), oneWeekInMs);
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
    }
  },

  createModalHeader: function () {
    const header = document.createElement("div");
    header.className = "blyrics-modal-header";

    const logo = document.createElement("img");
    logo.src = "https://better-lyrics.boidu.dev/icon-512.png";
    logo.alt = "BetterLyrics Logo";
    logo.className = "blyrics-modal-logo";

    const titleContainer = document.createElement("div");
    titleContainer.className = "blyrics-modal-title-container";

    const title = document.createElement("h3");
    title.id = "blyrics-change-modal-title";
    title.textContent = "Change Lyrics";

    const closeBtn = document.createElement("button");
    closeBtn.className = "blyrics-modal-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";

    titleContainer.appendChild(logo);
    titleContainer.appendChild(title);

    header.appendChild(titleContainer);
    header.appendChild(closeBtn);
    return header;
  },

  createSearchTab: function () {
    const searchTab = document.createElement("div");
    searchTab.className = "blyrics-tab-content";
    searchTab.id = "search-tab";

    const songGroup = document.createElement("div");
    songGroup.className = "blyrics-field-group";
    const songLabel = document.createElement("label");
    songLabel.setAttribute("for", "blyrics-song-input");
    songLabel.textContent = "Song Title";
    const songInput = document.createElement("input");
    songInput.type = "text";
    songInput.id = "blyrics-song-input";
    songInput.value = BetterLyrics.ChangeLyrics.currentSong || "";
    songGroup.appendChild(songLabel);
    songGroup.appendChild(songInput);

    const artistGroup = document.createElement("div");
    artistGroup.className = "blyrics-field-group";
    const artistLabel = document.createElement("label");
    artistLabel.setAttribute("for", "blyrics-artist-input");
    artistLabel.textContent = "Artist";
    const artistInput = document.createElement("input");
    artistInput.type = "text";
    artistInput.id = "blyrics-artist-input";
    artistInput.value = BetterLyrics.ChangeLyrics.currentArtist || "";
    artistGroup.appendChild(artistLabel);
    artistGroup.appendChild(artistInput);

    const albumGroup = document.createElement("div");
    albumGroup.className = "blyrics-field-group";
    const albumLabel = document.createElement("label");
    albumLabel.setAttribute("for", "blyrics-album-input");
    albumLabel.textContent = "Album";
    const albumInput = document.createElement("input");
    albumInput.type = "text";
    albumInput.id = "blyrics-album-input";
    albumInput.value = BetterLyrics.ChangeLyrics.currentAlbum || "";
    albumGroup.appendChild(albumLabel);
    albumGroup.appendChild(albumInput);

    const providersGroup = document.createElement("div");
    providersGroup.className = "blyrics-field-group";
    const providersSpan = document.createElement("span");
    providersSpan.textContent = "Search Providers";
    providersGroup.appendChild(providersSpan);

    const providers = [
      { id: "provider-lrclib", text: "LRCLib" },
      { id: "provider-musixmatch", text: "Musixmatch" },
      { id: "provider-blyrics", text: "bLyrics" },
    ];

    const providersContainer = document.createElement("div");
    providersContainer.className = "blyrics-providers-container";

    providers.forEach(provider => {
      const label = document.createElement("label");
      label.className = "blyrics-checkbox-container";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = provider.id;
      checkbox.checked = true;

      const checkmark = document.createElement("span");
      checkmark.className = "blyrics-checkmark";

      const providerName = document.createElement("span");
      providerName.className = "blyrics-provider-name";
      providerName.textContent = provider.text;

      label.appendChild(checkbox);
      label.appendChild(checkmark);
      label.appendChild(providerName);
      providersContainer.appendChild(label);
    });

    providersGroup.appendChild(providersContainer);

    const searchBtn = document.createElement("button");
    searchBtn.id = "blyrics-search-btn";
    searchBtn.className = "blyrics-primary-btn";
    searchBtn.textContent = "Search";

    const searchResults = document.createElement("div");
    searchResults.id = "blyrics-search-results";

    searchTab.appendChild(songGroup);
    searchTab.appendChild(artistGroup);
    searchTab.appendChild(albumGroup);
    searchTab.appendChild(providersGroup);
    searchTab.appendChild(searchBtn);
    searchTab.appendChild(searchResults);

    return searchTab;
  },

  createManualTab: function () {
    const manualTab = document.createElement("div");
    manualTab.className = "blyrics-tab-content";
    manualTab.id = "manual-tab";
    manualTab.style.display = "none";

    const container = document.createElement("div");
    container.className = "blyrics-manual-container";

    const label = document.createElement("label");
    label.setAttribute("for", "blyrics-manual-input");
    label.textContent = "Enter lyrics in LRC format or plain text";

    const textarea = document.createElement("textarea");
    textarea.id = "blyrics-manual-input";
    textarea.placeholder =
      "[00:12.50]Line 1 lyrics\n[00:17.20]Line 2 lyrics\n\nOr just plain text without timestamps...";

    const applyBtn = document.createElement("button");
    applyBtn.id = "blyrics-apply-manual";
    applyBtn.textContent = "Apply Lyrics";

    container.appendChild(label);
    container.appendChild(textarea);
    container.appendChild(applyBtn);
    manualTab.appendChild(container);

    return manualTab;
  },

  createModalBody: function () {
    const body = document.createElement("div");
    body.className = "blyrics-modal-body";

    const tabs = document.createElement("div");
    tabs.className = "blyrics-tabs";
    tabs.setAttribute("role", "tablist");

    const searchTabBtn = document.createElement("button");
    searchTabBtn.className = "blyrics-tab-btn active";
    searchTabBtn.dataset.tab = "search";
    searchTabBtn.id = "blyrics-tab-search";
    searchTabBtn.setAttribute("role", "tab");
    searchTabBtn.setAttribute("aria-selected", "true");
    searchTabBtn.textContent = "Search";

    const manualTabBtn = document.createElement("button");
    manualTabBtn.className = "blyrics-tab-btn";
    manualTabBtn.dataset.tab = "manual";
    manualTabBtn.id = "blyrics-tab-manual";
    manualTabBtn.setAttribute("role", "tab");
    manualTabBtn.setAttribute("aria-selected", "false");
    manualTabBtn.textContent = "Manual Input";

    tabs.appendChild(searchTabBtn);
    tabs.appendChild(manualTabBtn);

    body.appendChild(tabs);

    const searchTab = BetterLyrics.ChangeLyrics.createSearchTab();
    searchTab.setAttribute("role", "tabpanel");
    searchTab.setAttribute("aria-labelledby", "blyrics-tab-search");
    const manualTab = BetterLyrics.ChangeLyrics.createManualTab();
    manualTab.setAttribute("role", "tabpanel");
    manualTab.setAttribute("aria-labelledby", "blyrics-tab-manual");

    body.appendChild(searchTab);
    body.appendChild(manualTab);

    return body;
  },

  createModal: function () {
    const modal = document.createElement("div");
    modal.id = "blyrics-change-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "blyrics-change-modal-title");

    const backdrop = document.createElement("div");
    backdrop.className = "blyrics-modal-backdrop";

    const content = document.createElement("div");
    content.className = "blyrics-modal-content";

    const errorMessage = document.createElement("div");
    errorMessage.id = "blyrics-error-message";
    errorMessage.style.display = "none";

    content.appendChild(BetterLyrics.ChangeLyrics.createModalHeader());
    content.appendChild(BetterLyrics.ChangeLyrics.createModalBody());
    content.appendChild(errorMessage);

    backdrop.appendChild(content);
    modal.appendChild(backdrop);

    document.body.appendChild(modal);
    BetterLyrics.ChangeLyrics.attachModalEvents(modal);
    return modal;
  },

  _escapeHandler: e => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      BetterLyrics.ChangeLyrics.closeModal();
    }
  },
  _resizeHandler: null,

  attachModalEvents: function (modal) {
    const closeBtn = modal.querySelector(".blyrics-modal-close");
    const backdrop = modal.querySelector(".blyrics-modal-backdrop");
    const tabBtns = modal.querySelectorAll(".blyrics-tab-btn");
    const searchBtn = modal.querySelector("#blyrics-search-btn");
    const songInput = modal.querySelector("#blyrics-song-input");
    const artistInput = modal.querySelector("#blyrics-artist-input");
    const applyManualBtn = modal.querySelector("#blyrics-apply-manual");
    const manualInput = modal.querySelector("#blyrics-manual-input");

    closeBtn.addEventListener("click", () => BetterLyrics.ChangeLyrics.closeModal());

    // Close only if the press starts AND ends on the backdrop (avoid closing after drag-selection leaving modal)
    const onMouseDownBackdrop = e => {
      if (e.button === 0 && e.target === backdrop) {
        backdrop.__pressOnBackdrop = true;
      } else {
        backdrop.__pressOnBackdrop = false;
      }
    };
    const onMouseUpBackdrop = e => {
      if (e.button === 0 && e.target === backdrop && backdrop.__pressOnBackdrop) {
        BetterLyrics.ChangeLyrics.closeModal();
      }
      backdrop.__pressOnBackdrop = false;
    };
    backdrop.addEventListener("mousedown", onMouseDownBackdrop);
    backdrop.addEventListener("mouseup", onMouseUpBackdrop);

    // Also support pointer events where available
    if (window.PointerEvent) {
      backdrop.addEventListener("pointerdown", e => {
        if (e.button === 0 && e.target === backdrop) {
          backdrop.__pressOnBackdrop = true;
        } else {
          backdrop.__pressOnBackdrop = false;
        }
      });
      backdrop.addEventListener("pointerup", e => {
        if (e.button === 0 && e.target === backdrop && backdrop.__pressOnBackdrop) {
          BetterLyrics.ChangeLyrics.closeModal();
        }
        backdrop.__pressOnBackdrop = false;
      });
    }

    // Tabs and their ARIA state
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => BetterLyrics.ChangeLyrics.switchTab(btn.dataset.tab));
    });

    searchBtn.addEventListener("click", () => BetterLyrics.ChangeLyrics.performSearch());

    songInput.addEventListener("keypress", e => {
      if (e.key === "Enter") BetterLyrics.ChangeLyrics.performSearch();
    });
    artistInput.addEventListener("keypress", e => {
      if (e.key === "Enter") BetterLyrics.ChangeLyrics.performSearch();
    });

    applyManualBtn.addEventListener("click", () => {
      const lyricsText = manualInput.value.trim();
      if (lyricsText) {
        BetterLyrics.ChangeLyrics.applyLyrics(lyricsText);
      } else {
        BetterLyrics.ChangeLyrics.showError("Please enter some lyrics");
      }
    });

    // Focus trap inside modal
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(modal.querySelectorAll(focusableSelectors));
    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];
    BetterLyrics.ChangeLyrics._focusTrapHandler = function (e) {
      if (e.key === 'Tab') {
        if (focusables.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl || !modal.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !modal.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    modal.addEventListener('keydown', BetterLyrics.ChangeLyrics._focusTrapHandler, true);

    document.addEventListener("keydown", BetterLyrics.ChangeLyrics._escapeHandler, true);
  },

  switchTab: function (tabName) {
    const tabBtns = document.querySelectorAll(".blyrics-tab-btn");
    const tabContents = document.querySelectorAll(".blyrics-tab-content");

    tabBtns.forEach(btn => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    tabContents.forEach(content => {
      const isActive = content.id === `${tabName}-tab`;
      content.style.display = isActive ? "block" : "none";
    });

    if (tabName === "manual") {
      BetterLyrics.ChangeLyrics.prefillManualEditor();
    }
  },

  performSearch: async function () {
    const songInput = document.querySelector("#blyrics-song-input");
    const artistInput = document.querySelector("#blyrics-artist-input");
    const _albumInput = document.querySelector("#blyrics-album-input");

    const searchBtn = document.querySelector("#blyrics-search-btn");
    const resultsContainer = document.querySelector("#blyrics-search-results");

    const song = songInput.value.trim();
    const artist = artistInput.value.trim();
    const album = _albumInput.value.trim();

    if (!song || !artist) {
      BetterLyrics.ChangeLyrics.showError("Enter both song title and artist");
      return;
    }

    // Get enabled providers
    const enabledProviders = [];
    if (document.querySelector("#provider-lrclib")?.checked) enabledProviders.push("lrclib");
    if (document.querySelector("#provider-musixmatch")?.checked) enabledProviders.push("musixmatch");
    if (document.querySelector("#provider-blyrics")?.checked) enabledProviders.push("blyrics");

    if (enabledProviders.length === 0) {
      BetterLyrics.ChangeLyrics.showError("Please select at least one provider");
      return;
    }

    const query = album ? `${song} ${artist} ${album}` : `${song} ${artist}`;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultsContainer.textContent = "";
    resultsContainer.appendChild(BetterLyrics.ChangeLyrics.createLoadingElement());

    try {
      const results = await BetterLyrics.ChangeLyrics.searchLyrics({ song, artist, query }, enabledProviders);
      BetterLyrics.ChangeLyrics.displaySearchResults(results);
    } catch (error) {
      console.error(error);
      BetterLyrics.ChangeLyrics.showError("Search failed. Please try again.");
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  },

  displaySearchResults: function (results) {
    const resultsContainer = document.querySelector("#blyrics-search-results");

    resultsContainer.textContent = "";

    if (!results || results.length === 0) {
      resultsContainer.appendChild(BetterLyrics.ChangeLyrics.createNoResultsElement());
      return;
    }

    // classify type for sorting
    const priority = {
      rich: 0,
      synced: 1,
      plain: 2,
    };

    results.forEach(r => {
      let type = "plain";
      if (r.richSyncLyrics) type = "rich";
      else if (r.syncedLyrics) type = "synced";
      else if (r.plainLyrics) type = "plain";
      r.__type = type;
      r.__priority = priority[type] ?? 2;
    });

    results.sort((a, b) => a.__priority - b.__priority);

    results.forEach(r => {
      r.trackName = BetterLyrics.ChangeLyrics.sanitizeMetaValue(r.trackName);
      r.artistName = BetterLyrics.ChangeLyrics.sanitizeMetaValue(r.artistName);
      r.albumName = BetterLyrics.ChangeLyrics.sanitizeMetaValue(r.albumName);
    });

    results.forEach((result, index) => {
      const resultElement = BetterLyrics.ChangeLyrics.createSearchResultElement(result, index);
      resultsContainer.appendChild(resultElement);

      const useBtn = resultElement.querySelector(".blyrics-use-result");
      useBtn.addEventListener("click", async e => {
        const index = parseInt(e.target.dataset.index);
        await BetterLyrics.ChangeLyrics.applyLyrics(results[index]);
        BetterLyrics.ChangeLyrics.switchTab("manual");
        BetterLyrics.ChangeLyrics.prefillManualEditor();
      });
    });

    // Keyboard navigation for results
    resultsContainer.tabIndex = 0;
    const useButtons = Array.from(resultsContainer.querySelectorAll('.blyrics-use-result'));
    if (useButtons.length) {
      useButtons.forEach(btn => btn.setAttribute('tabindex', '0'));
      resultsContainer.addEventListener('keydown', e => {
        const active = document.activeElement;
        const idx = useButtons.indexOf(active);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = useButtons[Math.min((idx + 1 + useButtons.length) % useButtons.length, useButtons.length - 1)] || useButtons[0];
          next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = useButtons[(idx - 1 + useButtons.length) % useButtons.length] || useButtons[useButtons.length - 1];
          prev.focus();
        } else if (e.key === 'Enter' && idx >= 0) {
          e.preventDefault();
          active.click();
        }
      });
      // Focus first result for convenience
      useButtons[0].focus();
    }
  },

  createLoadingElement: function () {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "blyrics-loading";
    loadingDiv.textContent = "Searching for lyrics...";
    return loadingDiv;
  },

  createNoResultsElement: function () {
    const noResultsDiv = document.createElement("div");
    noResultsDiv.className = "blyrics-no-results";
    noResultsDiv.textContent = "No lyrics found. Try a different search term.";
    return noResultsDiv;
  },

  createSearchResultElement: function (result, index) {
    const resultDiv = document.createElement("div");
    resultDiv.className = "blyrics-search-result";
    resultDiv.dataset.index = index;

    const header = document.createElement("div");
    header.className = "blyrics-result-header";

    const title = document.createElement("h4");
    title.className = "blyrics-result-title";
    title.textContent = BetterLyrics.ChangeLyrics.sanitizeMetaValue(result.trackName) || "";

    const useBtn = document.createElement("button");
    useBtn.className = "blyrics-use-result";
    useBtn.dataset.index = index;
    useBtn.textContent = "Apply";

    header.appendChild(title);
    header.appendChild(useBtn);

    const meta = document.createElement("div");
    meta.className = "blyrics-result-meta";

    const artist = document.createElement("span");
    artist.className = "blyrics-result-artist";
    artist.textContent = BetterLyrics.ChangeLyrics.sanitizeMetaValue(result.artistName) || "";
    meta.appendChild(artist);

    const sanitizedAlbum = BetterLyrics.ChangeLyrics.sanitizeMetaValue(result.albumName);
    if (sanitizedAlbum) {
      const album = document.createElement("span");
      album.className = "blyrics-result-album";
      album.textContent = sanitizedAlbum;
      meta.appendChild(album);
    }

    const footer = document.createElement("div");
    footer.className = "blyrics-result-footer";

    const providerTag = document.createElement(result.__providerHref ? "a" : "span");
    providerTag.className = "blyrics-provider-tag";
    if (result.__providerHref) {
      providerTag.href = result.__providerHref;
      providerTag.target = "_blank";
      providerTag.rel = "noreferrer noopener";
    }
    providerTag.textContent = result.__provider || "LRCLib";

    const typeTag = document.createElement("span");
    typeTag.className = `blyrics-type-tag blyrics-type-${result.__type}`;
    const typeText = result.__type === "rich" ? "Rich Synced" : result.__type === "synced" ? "Synced" : "Plain";
    typeTag.textContent = typeText;

    const duration = document.createElement("span");
    duration.className = "blyrics-result-duration";
    duration.textContent = BetterLyrics.ChangeLyrics.formatDuration(result.duration || 0);

    footer.appendChild(providerTag);
    footer.appendChild(typeTag);
    footer.appendChild(duration);

    resultDiv.appendChild(header);
    resultDiv.appendChild(meta);
    resultDiv.appendChild(footer);

    return resultDiv;
  },

  sanitizeMetaValue: function (value) {
    if (!value || value === "null" || value === "unknown") return "";
    return value;
  },

  formatDuration: function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  showModal: function () {
    try {
      BetterLyrics.Utils.log("[BetterLyrics] showModal invoked");
      let modal = document.getElementById("blyrics-change-modal");
      if (modal) {
        modal.remove();
      }
      modal = BetterLyrics.ChangeLyrics.createModal();
      BetterLyrics.Utils.log("[BetterLyrics] modal created and appended");
      modal.style.display = "block";
      document.body.style.overflow = "hidden";

      // Calculate and set initial top position
      BetterLyrics.ChangeLyrics.calculateAndSetModalPosition(modal);
      // Recalculate on window resize
      BetterLyrics.ChangeLyrics._resizeHandler = () =>
        BetterLyrics.ChangeLyrics.calculateAndSetModalPosition(modal);
      window.addEventListener("resize", BetterLyrics.ChangeLyrics._resizeHandler);

      // Trigger animation after a frame to ensure display is set
      requestAnimationFrame(() => {
        BetterLyrics.Utils.log("[BetterLyrics] modal show class added");
        modal.classList.add("show");
        // Focus the first input (song) for better UX
        const firstInput = document.getElementById("blyrics-song-input");
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
          try { firstInput.select(); } catch (_e) {}
        }
      });
    } catch (err) {
      BetterLyrics.Utils.log("[BetterLyrics] showModal error:", err);
    }
  },

  calculateAndSetModalPosition: function (modal) {
    const content = modal.querySelector(".blyrics-modal-content");
    if (!content) return;

    // Get viewport height
    const viewportHeight = window.innerHeight;

    // Temporarily make content visible to measure its height
    const originalTransform = content.style.transform;
    const originalOpacity = content.style.opacity;
    content.style.transform = "translateX(-50%) scale(1)";
    content.style.opacity = "0";
    content.style.visibility = "hidden";

    // Force layout calculation
    const contentHeight = content.offsetHeight;

    // Calculate optimal top position (centered with some padding)
    const padding = Math.min(40, viewportHeight * 0.1); // 10% of viewport or 40px, whichever is smaller
    const availableHeight = viewportHeight - padding * 2;

    let topPosition;
    if (contentHeight <= availableHeight) {
      // Center it vertically
      topPosition = (viewportHeight - contentHeight) / 2;
    } else {
      // Position at top with padding
      topPosition = padding;
    }

    // Store the calculated position
    BetterLyrics.ChangeLyrics._modalTopPosition = topPosition;

    // Apply the position
    content.style.top = topPosition + "px";

    // Restore original transform and opacity for animation
    content.style.transform = originalTransform;
    content.style.opacity = originalOpacity;
    content.style.visibility = "visible";
  },

  updateModalPosition: function () {
    const modal = document.getElementById("blyrics-change-modal");
    const content = modal?.querySelector(".blyrics-modal-content");
    if (!content || BetterLyrics.ChangeLyrics._modalTopPosition === undefined) return;

    // Use the stored position to maintain consistency
    content.style.top = BetterLyrics.ChangeLyrics._modalTopPosition + "px";
  },

  closeModal: function () {
    const modal = document.getElementById("blyrics-change-modal");
    if (modal) {
      modal.classList.remove("show");

      // Wait for animation to complete before removing
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300); // Match the CSS transition duration
    }

    if (BetterLyrics.ChangeLyrics._resizeHandler) {
      window.removeEventListener("resize", BetterLyrics.ChangeLyrics._resizeHandler);
      BetterLyrics.ChangeLyrics._resizeHandler = null;
    }

    if (BetterLyrics.ChangeLyrics._escapeHandler) {
      document.removeEventListener("keydown", BetterLyrics.ChangeLyrics._escapeHandler, true);
    }
    document.body.style.overflow = "";
    BetterLyrics.ChangeLyrics.hideError();
  },

  showError: function (message) {
    const errorEl = document.getElementById("blyrics-error-message");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
      setTimeout(() => BetterLyrics.ChangeLyrics.hideError(), 5000);
    }
  },

  hideError: function () {
    const errorEl = document.getElementById("blyrics-error-message");
    if (errorEl) {
      errorEl.style.display = "none";
    }
  },
  _serializeToManualText: function (input) {
    if (!input) return "";
    if (typeof input === "string") return input;
    if (input.richSyncLyrics && typeof input.richSyncLyrics === "string") return input.richSyncLyrics;
    if (input.syncedLyrics && typeof input.syncedLyrics === "string") return input.syncedLyrics;
    if (input.plainLyrics) {
      if (Array.isArray(input.plainLyrics)) return input.plainLyrics.map(l => (typeof l === "string" ? l : l.words || "")).join("\n");
      if (typeof input.plainLyrics === "string") return input.plainLyrics;
    }
    if (Array.isArray(input.lyrics) && input.lyrics.length > 0) {
      const hasTimedEntries = input.lyrics.some(item => typeof item.startTimeMs !== "undefined" && !isNaN(Number(item.startTimeMs)) && Number(item.startTimeMs) > 0);
      const toTag = ms => {
        const m = Math.floor(Number(ms) / 60000);
        const s = ((Number(ms) % 60000) / 1000).toFixed(2).padStart(5, "0");
        return `[${m}:${s}]`;
      };
      return input.lyrics
        .map(item => {
          const text = typeof item.words === "string" ? item.words : "";
          return hasTimedEntries ? `${toTag(item.startTimeMs || 0)}${text}` : text;
        })
        .join("\n");
    }
    return "";
  },
  prefillManualEditor: async function () {
    try {
      const textarea = document.getElementById("blyrics-manual-input");
      if (!textarea) return;
      BetterLyrics.Utils.log(
        "[ChangeLyrics] prefillManualEditor - currentVideoId:",
        BetterLyrics.ChangeLyrics.currentVideoId
      );
      if (!BetterLyrics.ChangeLyrics.currentVideoId) {
        BetterLyrics.Utils.log("[ChangeLyrics] No currentVideoId - cannot prefill");
        return;
      }
      const cacheKey = `blyrics_${BetterLyrics.ChangeLyrics.currentVideoId}`;
      BetterLyrics.Utils.log("[ChangeLyrics] Looking for cache key:", cacheKey);
      const cached = await BetterLyrics.Storage.getTransientStorage(cacheKey);
      BetterLyrics.Utils.log("[ChangeLyrics] Cache result:", cached ? "found" : "not found");
      if (!cached) return;
      let data;
      try {
        data = JSON.parse(cached);
      } catch (_e) {
        return;
      }
      const fromCache = BetterLyrics.ChangeLyrics._serializeToManualText(data);
      BetterLyrics.Utils.log("[ChangeLyrics] Serialized lyrics length:", fromCache.length);
      if (fromCache && fromCache.length) textarea.value = fromCache;
    } catch (_err) {
      BetterLyrics.Utils.log("[ChangeLyrics] Error in prefillManualEditor:", _err);
    }
  },

  _persistProviderPrefs: function () {
    try {
      const state = {
        lrclib: !!document.querySelector('#provider-lrclib')?.checked,
        musixmatch: !!document.querySelector('#provider-musixmatch')?.checked,
        blyrics: !!document.querySelector('#provider-blyrics')?.checked,
      };
      const browserAPI = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
      if (browserAPI?.storage?.sync) {
        browserAPI.storage.sync.set({ changeLyricsProviders: state });
      } else {
        localStorage.setItem('blyrics_changeProviders', JSON.stringify(state));
      }
    } catch (_e) {}
  },

  _loadProviderPrefs: function (root) {
    try {
      const apply = (state) => {
        if (!state) return;
        const set = (id, val) => { const cb = root.querySelector(id); if (cb) cb.checked = !!val; };
        set('#provider-lrclib', state.lrclib);
        set('#provider-musixmatch', state.musixmatch);
        set('#provider-blyrics', state.blyrics);
      };
      const browserAPI = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
      if (browserAPI?.storage?.sync) {
        browserAPI.storage.sync.get({ changeLyricsProviders: { lrclib: true, musixmatch: true, blyrics: true } }, items => {
          apply(items.changeLyricsProviders);
        });
      } else {
        const raw = localStorage.getItem('blyrics_changeProviders');
        if (raw) apply(JSON.parse(raw));
      }
    } catch (_e) {}
  },
};
