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
        fetch(url.toString(), {
          headers: { "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER },
          signal: AbortSignal.timeout(10000),
        })
          .then(r => (r.ok ? r.json() : []))
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
        fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
          .then(r => (r.ok ? r.json() : null))
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
        fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
          .then(r => (r.ok ? r.json() : null))
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
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lyricsData, BetterLyrics.ChangeLyrics.currentDuration);
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(lyricsData);
        }
      } else if (meta.richSyncLyrics || meta.syncedLyrics || meta.plainLyrics) {
        if (meta.richSyncLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            meta.richSyncLyrics,
            meta.duration || BetterLyrics.ChangeLyrics.currentDuration
          );
        } else if (meta.syncedLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(meta.syncedLyrics, meta.duration || BetterLyrics.ChangeLyrics.currentDuration);
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
        const response = await fetch(url.toString(), {
          headers: { "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error("Invalid lyrics data format");
        const data = await response.json();
        if (data && data.syncedLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(
            data.syncedLyrics,
            data.duration || meta.duration || BetterLyrics.ChangeLyrics.currentDuration
          );
        } else if (data && data.plainLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(data.plainLyrics);
        } else {
          throw new Error("Invalid lyrics data format");
        }
      } else {
        throw new Error("Invalid lyrics data format");
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
    title.textContent = "Change Lyrics";

    const closeBtn = document.createElement("button");
    closeBtn.className = "blyrics-modal-close";
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

    const searchTabBtn = document.createElement("button");
    searchTabBtn.className = "blyrics-tab-btn active";
    searchTabBtn.dataset.tab = "search";
    searchTabBtn.textContent = "Search";

    const manualTabBtn = document.createElement("button");
    manualTabBtn.className = "blyrics-tab-btn";
    manualTabBtn.dataset.tab = "manual";
    manualTabBtn.textContent = "Manual Input";

    tabs.appendChild(searchTabBtn);
    tabs.appendChild(manualTabBtn);

    body.appendChild(tabs);
    body.appendChild(BetterLyrics.ChangeLyrics.createSearchTab());
    body.appendChild(BetterLyrics.ChangeLyrics.createManualTab());

    return body;
  },

  createModal: function () {
    const modal = document.createElement("div");
    modal.id = "blyrics-change-modal";

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

    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) BetterLyrics.ChangeLyrics.closeModal();
    });

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

    document.addEventListener("keydown", BetterLyrics.ChangeLyrics._escapeHandler, true);
  },

  switchTab: function (tabName) {
    const tabBtns = document.querySelectorAll(".blyrics-tab-btn");
    const tabContents = document.querySelectorAll(".blyrics-tab-content");

    tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    tabContents.forEach(content => {
      content.style.display = content.id === `${tabName}-tab` ? "block" : "none";
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

    const query = `${song} ${artist}`;

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

    const providerTag = document.createElement("span");
    providerTag.className = "blyrics-provider-tag";
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
    let modal = document.getElementById("blyrics-change-modal");
    if (modal) {
      modal.remove();
    }
    modal = BetterLyrics.ChangeLyrics.createModal();
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // Calculate and set initial top position
    BetterLyrics.ChangeLyrics.calculateAndSetModalPosition(modal);

    // Trigger animation after a frame to ensure display is set
    requestAnimationFrame(() => {
      modal.classList.add("show");
    });
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

    if (BetterLyrics.ChangeLyrics._escapeHandler) {
      document.removeEventListener("keydown", BetterLyrics.ChangeLyrics._escapeHandler, true);
      BetterLyrics.ChangeLyrics._escapeHandler = null;
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
      console.log("[ChangeLyrics] prefillManualEditor - currentVideoId:", BetterLyrics.ChangeLyrics.currentVideoId);
      if (!BetterLyrics.ChangeLyrics.currentVideoId) {
        console.log("[ChangeLyrics] No currentVideoId - cannot prefill");
        return;
      }
      const cacheKey = `blyrics_${BetterLyrics.ChangeLyrics.currentVideoId}`;
      console.log("[ChangeLyrics] Looking for cache key:", cacheKey);
      const cached = await BetterLyrics.Storage.getTransientStorage(cacheKey);
      console.log("[ChangeLyrics] Cache result:", cached ? "found" : "not found");
      if (!cached) return;
      let data;
      try {
        data = JSON.parse(cached);
      } catch (_e) { return; }
      const fromCache = BetterLyrics.ChangeLyrics._serializeToManualText(data);
      console.log("[ChangeLyrics] Serialized lyrics length:", fromCache.length);
      if (fromCache && fromCache.length) textarea.value = fromCache;
    } catch (_err) {
      console.log("[ChangeLyrics] Error in prefillManualEditor:", _err);
    }
  },
};
