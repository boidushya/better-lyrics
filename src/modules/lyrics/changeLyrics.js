BetterLyrics.ChangeLyrics = {
  searchResults: [],
  currentSong: null,
  currentArtist: null,
  currentAlbum: null,
  currentDuration: null,
  currentVideoId: null,

  init: function (song, artist, album, duration, videoId) {
    this.currentSong = song;
    this.currentArtist = artist;
    this.currentAlbum = album;
    this.currentDuration = duration;
    this.currentVideoId = videoId;
  },

  searchLyrics: async function (params, enabledProviders = ['lrclib']) {
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

    if (enabledProviders.includes('lrclib')) {
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
              result.__provider = 'LRCLib';
              result.__providerHref = 'https://lrclib.net';
            });
            return results;
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, 'LRCLib search error:', error);
            return [];
          })
      );
    }

    if (enabledProviders.includes('blyrics') && song) {
      const url = new URL(BetterLyrics.Constants.LYRICS_API_URL);
      url.searchParams.append("s", song);
      url.searchParams.append("a", artist);
      if (this.currentDuration) {
        url.searchParams.append("d", this.currentDuration);
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
              duration: data.duration || this.currentDuration || 180,
              plainLyrics: data.lyrics ? (Array.isArray(data.lyrics) ? data.lyrics.map(l => l.words).join('\n') : data.lyrics) : null,
              syncedLyrics: data.syncedLyrics,
              __provider: 'bLyrics',
              __providerHref: 'https://better-lyrics.boidu.dev'
            };
            return [result];
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, 'bLyrics search error:', error);
            return [];
          })
      );
    }

    if (enabledProviders.includes('musixmatch') && song) {
      const url = new URL("https://lyrics.api.dacubeking.com/");
      url.searchParams.append("song", song);
      url.searchParams.append("artist", artist);
      if (this.currentDuration) {
        url.searchParams.append("duration", this.currentDuration);
      }
      url.searchParams.append("videoId", this.currentVideoId || "");
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
              duration: data.duration || this.currentDuration || 180,
              richSyncLyrics: data.musixmatchWordByWordLyrics,
              syncedLyrics: data.musixmatchSyncedLyrics,
              __provider: 'Musixmatch',
              __providerHref: 'https://www.musixmatch.com'
            };
            return [result];
          })
          .catch(error => {
            BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, 'Musixmatch search error:', error);
            return [];
          })
      );
    }

    return Promise.all(promises).then(resultsArrays => {
      const allResults = [].concat(...resultsArrays);
      this.searchResults = allResults;
      return allResults;
    });
  },

  applyLyrics: async function (lyricsData, source = "Manual", sourceHref = "") {
    try {
      BetterLyrics.Utils.log("[BetterLyrics] Applying lyrics data:", lyricsData);
      let parsedLyrics;

      if (typeof lyricsData === "string") {
        if (lyricsData.includes("[") && lyricsData.includes("]")) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lyricsData, this.currentDuration);
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(lyricsData);
        }
      } else if (
        lyricsData.richSyncLyrics ||
        lyricsData.syncedLyrics ||
        lyricsData.plainLyrics
      ) {
        if (lyricsData.richSyncLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lyricsData.richSyncLyrics, lyricsData.duration || this.currentDuration);
        } else if (lyricsData.syncedLyrics) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lyricsData.syncedLyrics, lyricsData.duration || this.currentDuration);
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(lyricsData.plainLyrics);
        }
      } else {
        throw new Error("Invalid lyrics data format");
      }

      const resultData = {
        lyrics: parsedLyrics,
        source: lyricsData.__provider || source,
        sourceHref: lyricsData.__providerHref || sourceHref,
        musicVideoSynced: false,
        song: lyricsData.trackName || this.currentSong,
        artist: lyricsData.artistName || this.currentArtist,
        album: lyricsData.albumName || this.currentAlbum,
        duration: lyricsData.duration || this.currentDuration,
      };

      await this.cacheLyrics(resultData);
      BetterLyrics.Lyrics.processLyrics(resultData);

      BetterLyrics.DOM.scrollResumeTime = 0;

      BetterLyrics.Utils.log("[BetterLyrics] Custom lyrics applied successfully");
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      this.showError(`Failed to apply lyrics: ${error.message || "Please check the format and try again."}`);
    }
  },

  cacheLyrics: async function (lyricsData) {
    if (!this.currentVideoId) return;

    // Use the same cache key format as the main lyrics system
    const cacheKey = `blyrics_${this.currentVideoId}`;

    // Add version and format the data to match the main lyrics cache format
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

    const title = document.createElement("h3");
    title.textContent = "Change Lyrics";

    const closeBtn = document.createElement("button");
    closeBtn.className = "blyrics-modal-close";
    closeBtn.textContent = "×";

    header.appendChild(title);
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
    songLabel.textContent = "Song Title:";
    const songInput = document.createElement("input");
    songInput.type = "text";
    songInput.id = "blyrics-song-input";
    songInput.value = this.currentSong || "";
    songGroup.appendChild(songLabel);
    songGroup.appendChild(songInput);

    const artistGroup = document.createElement("div");
    artistGroup.className = "blyrics-field-group";
    const artistLabel = document.createElement("label");
    artistLabel.setAttribute("for", "blyrics-artist-input");
    artistLabel.textContent = "Artist:";
    const artistInput = document.createElement("input");
    artistInput.type = "text";
    artistInput.id = "blyrics-artist-input";
    artistInput.value = this.currentArtist || "";
    artistGroup.appendChild(artistLabel);
    artistGroup.appendChild(artistInput);

    const albumGroup = document.createElement("div");
    albumGroup.className = "blyrics-field-group";
    const albumLabel = document.createElement("label");
    albumLabel.setAttribute("for", "blyrics-album-input");
    albumLabel.textContent = "Album:";
    const albumInput = document.createElement("input");
    albumInput.type = "text";
    albumInput.id = "blyrics-album-input";
    albumInput.value = this.currentAlbum || "";
    albumGroup.appendChild(albumLabel);
    albumGroup.appendChild(albumInput);

    const providersGroup = document.createElement("div");
    providersGroup.className = "blyrics-field-group";
    const providersSpan = document.createElement("span");
    providersSpan.textContent = "Search Providers:";
    providersGroup.appendChild(providersSpan);

    const providers = [
      { id: "provider-lrclib", text: " LRCLib" },
      { id: "provider-musixmatch", text: " Musixmatch" },
      { id: "provider-blyrics", text: " bLyrics" }
    ];

    providers.forEach(provider => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = provider.id;
      checkbox.checked = true;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(provider.text));
      providersGroup.appendChild(label);
    });

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
    label.textContent = "Enter lyrics in LRC format or plain text:";

    const textarea = document.createElement("textarea");
    textarea.id = "blyrics-manual-input";
    textarea.placeholder = "[00:12.50]Line 1 lyrics\n[00:17.20]Line 2 lyrics\n\nOr just plain text without timestamps...";

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
    body.appendChild(this.createSearchTab());
    body.appendChild(this.createManualTab());

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

    content.appendChild(this.createModalHeader());
    content.appendChild(this.createModalBody());
    content.appendChild(errorMessage);

    backdrop.appendChild(content);
    modal.appendChild(backdrop);

    document.body.appendChild(modal);
    this.attachModalEvents(modal);
    return modal;
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

    closeBtn.addEventListener("click", () => this.closeModal());

    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) this.closeModal();
    });

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    searchBtn.addEventListener("click", () => this.performSearch());

    songInput.addEventListener("keypress", e => {
      if (e.key === "Enter") this.performSearch();
    });
    artistInput.addEventListener("keypress", e => {
      if (e.key === "Enter") this.performSearch();
    });

    applyManualBtn.addEventListener("click", () => {
      const lyricsText = manualInput.value.trim();
      if (lyricsText) {
        this.applyLyrics(lyricsText);
      } else {
        this.showError("Please enter some lyrics");
      }
    });

    this._escapeHandler = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.closeModal();
      }
    };
    document.addEventListener("keydown", this._escapeHandler, true);
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
      this.showError("Enter both song title and artist");
      return;
    }

    // Get enabled providers
    const enabledProviders = [];
    if (document.querySelector("#provider-lrclib")?.checked) enabledProviders.push('lrclib');
    if (document.querySelector("#provider-musixmatch")?.checked) enabledProviders.push('musixmatch');
    if (document.querySelector("#provider-blyrics")?.checked) enabledProviders.push('blyrics');

    if (enabledProviders.length === 0) {
      this.showError("Please select at least one provider");
      return;
    }

    const query = `${song} ${artist}`;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultsContainer.textContent = "";
    resultsContainer.appendChild(this.createLoadingElement());

    try {
      const results = await this.searchLyrics({ song, artist, query }, enabledProviders);
      this.displaySearchResults(results);
    } catch (_error) {
      console.error(_error);
      this.showError("Search failed. Please try again.");
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  },

  displaySearchResults: function (results) {
    const resultsContainer = document.querySelector("#blyrics-search-results");

    resultsContainer.textContent = "";

    if (!results || results.length === 0) {
      resultsContainer.appendChild(this.createNoResultsElement());
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

    results.forEach((result, index) => {
      const resultElement = this.createSearchResultElement(result, index);
      resultsContainer.appendChild(resultElement);

      const useBtn = resultElement.querySelector(".blyrics-use-result");
      useBtn.addEventListener("click", e => {
        const index = parseInt(e.target.dataset.index);
        this.applyLyrics(results[index]);
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
    title.textContent = result.trackName || "Unknown Title";

    const useBtn = document.createElement("button");
    useBtn.className = "blyrics-use-result";
    useBtn.dataset.index = index;
    useBtn.textContent = "Use These Lyrics";

    header.appendChild(title);
    header.appendChild(useBtn);

    const meta = document.createElement("div");
    meta.className = "blyrics-result-meta";

    const artist = document.createElement("span");
    artist.className = "blyrics-result-artist";
    artist.textContent = result.artistName || "Unknown Artist";
    meta.appendChild(artist);

    if (result.albumName) {
      const album = document.createElement("span");
      album.className = "blyrics-result-album";
      album.textContent = result.albumName;
      meta.appendChild(album);
    }

    const footer = document.createElement("div");
    footer.className = "blyrics-result-footer";

    const providerTag = document.createElement("span");
    providerTag.className = "blyrics-provider-tag";
    providerTag.textContent = result.__provider || 'LRCLib';

    const typeTag = document.createElement("span");
    typeTag.className = `blyrics-type-tag blyrics-type-${result.__type}`;
    const typeText = result.__type === "rich" ? "Rich Synced" :
      result.__type === "synced" ? "Synced" : "Plain";
    typeTag.textContent = typeText;

    const duration = document.createElement("span");
    duration.className = "blyrics-result-duration";
    duration.textContent = this.formatDuration(result.duration || 0);

    footer.appendChild(providerTag);
    footer.appendChild(typeTag);
    footer.appendChild(duration);

    resultDiv.appendChild(header);
    resultDiv.appendChild(meta);
    resultDiv.appendChild(footer);

    return resultDiv;
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
    modal = this.createModal();
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  },

  closeModal: function () {
    const modal = document.getElementById("blyrics-change-modal");
    if (modal) {
      modal.remove();
    }
    if (this._escapeHandler) {
      document.removeEventListener("keydown", this._escapeHandler, true);
      this._escapeHandler = null;
    }
    document.body.style.overflow = "";
    this.hideError();
  },

  showError: function (message) {
    const errorEl = document.getElementById("blyrics-error-message");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
      setTimeout(() => this.hideError(), 5000);
    }
  },

  hideError: function () {
    const errorEl = document.getElementById("blyrics-error-message");
    if (errorEl) {
      errorEl.style.display = "none";
    }
  },
};
