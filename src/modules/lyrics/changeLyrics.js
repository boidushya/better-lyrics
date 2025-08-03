BetterLyrics.ChangeLyrics = {
  searchResults: [],
  currentSong: null,
  currentArtist: null,
  currentDuration: null,

  init: function (song, artist, duration) {
    this.currentSong = song;
    this.currentArtist = artist;
    this.currentDuration = duration;
  },

  searchLyrics: async function (query) {
    if (!query || query.trim() === "") {
      return [];
    }

    try {
      const url = new URL(BetterLyrics.Constants.LRCLIB_SEARCH_URL);
      url.searchParams.append("q", query);

      const response = await fetch(url.toString(), {
        headers: {
          "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const results = await response.json();
      this.searchResults = Array.isArray(results) ? results : [];
      return this.searchResults;
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      return [];
    }
  },

  applyLyrics: async function (lyricsData, source = "Manual", sourceHref = "") {
    try {
      BetterLyrics.Utils.log("[BetterLyrics] Applying lyrics data:", lyricsData);
      let parsedLyrics;
      let resultData;

      if (typeof lyricsData === "string") {
        if (lyricsData.includes("[") && lyricsData.includes("]")) {
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lyricsData, this.currentDuration);
        } else {
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(lyricsData);
        }

        resultData = {
          lyrics: parsedLyrics,
          source: source,
          sourceHref: sourceHref,
          musicVideoSynced: false,
        };
      } else if (
        lyricsData.richSyncLyrics ||
        lyricsData.richSyncLyricsUri ||
        lyricsData.syncedLyrics ||
        lyricsData.syncedLyricsUri ||
        lyricsData.plainLyrics ||
        lyricsData.plainLyricsUri
      ) {
        if (lyricsData.richSyncLyrics || lyricsData.richSyncLyricsUri) {
          let lrc = lyricsData.richSyncLyrics;
          if (!lrc && lyricsData.richSyncLyricsUri) {
            try {
              const response = await fetch(lyricsData.richSyncLyricsUri);
              if (response.ok) {
                lrc = await response.text();
              }
            } catch (_e) {
              throw new Error("Failed to fetch rich sync lyrics");
            }
          }
          if (!lrc) throw new Error("No rich sync lyrics content found");
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lrc, lyricsData.duration || this.currentDuration);
        } else if (lyricsData.syncedLyrics || lyricsData.syncedLyricsUri) {
          let lrc = lyricsData.syncedLyrics;
          if (!lrc && lyricsData.syncedLyricsUri) {
            try {
              const response = await fetch(lyricsData.syncedLyricsUri);
              if (response.ok) {
                lrc = await response.text();
              }
            } catch (_e) {
              throw new Error("Failed to fetch synced lyrics");
            }
          }
          if (!lrc) throw new Error("No synced lyrics content found");
          parsedLyrics = BetterLyrics.LyricProviders.parseLRC(lrc, lyricsData.duration || this.currentDuration);
        } else {
          let text = lyricsData.plainLyrics;
          if (!text && lyricsData.plainLyricsUri) {
            try {
              const response = await fetch(lyricsData.plainLyricsUri);
              if (response.ok) {
                text = await response.text();
              }
            } catch (_e) {
              throw new Error("Failed to fetch plain lyrics");
            }
          }
          if (!text) throw new Error("No plain lyrics content found");
          parsedLyrics = BetterLyrics.LyricProviders.parsePlainLyrics(text);
        }

        resultData = {
          lyrics: parsedLyrics,
          source: "LRCLib",
          sourceHref: "https://lrclib.net",
          musicVideoSynced: false,
        };
      } else {
        throw new Error("Invalid lyrics data format");
      }

      await this.cacheLyrics(resultData);
      BetterLyrics.Lyrics.processLyrics(resultData);

      this.closeModal();

      BetterLyrics.Utils.log("[BetterLyrics] Custom lyrics applied successfully");
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
      this.showError(`Failed to apply lyrics: ${error.message || "Please check the format and try again."}`);
    }
  },

  cacheLyrics: async function (lyricsData) {
    if (!this.currentSong || !this.currentArtist) return;

    const cacheKey = `blyrics_${this.currentSong}_${this.currentArtist}`;
    const cacheData = {
      type: "transient",
      value: lyricsData,
      expiryTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    try {
      await chrome.storage.local.set({ [cacheKey]: cacheData });
      await BetterLyrics.Storage.saveCacheInfo();
    } catch (error) {
      BetterLyrics.Utils.log(BetterLyrics.Constants.GENERAL_ERROR_LOG, error);
    }
  },

  createModal: function () {
    const modal = document.createElement("div");
    modal.id = "blyrics-change-modal";
    modal.innerHTML = `
      <div class="blyrics-modal-backdrop">
        <div class="blyrics-modal-content">
          <div class="blyrics-modal-header">
            <h3>Change Lyrics</h3>
            <button class="blyrics-modal-close">&times;</button>
          </div>
          <div class="blyrics-modal-body">
            <div class="blyrics-tabs">
              <button class="blyrics-tab-btn active" data-tab="search">Search</button>
              <button class="blyrics-tab-btn" data-tab="manual">Manual Input</button>
            </div>
            <div class="blyrics-tab-content" id="search-tab">
              <div class="blyrics-field-group">
                <label for="blyrics-song-input">Song Title:</label>
                <input type="text" id="blyrics-song-input" value="${this.currentSong || ""}" />
              </div>
              <div class="blyrics-field-group">
                <label for="blyrics-artist-input">Artist:</label>
                <input type="text" id="blyrics-artist-input" value="${this.currentArtist || ""}" />
              </div>
              <div class="blyrics-field-group">
                <label for="blyrics-album-input">Album:</label>
                <input type="text" id="blyrics-album-input" />
              </div>
              <div class="blyrics-field-group">
                <span>Search Providers:</span>
                <label><input type="checkbox" id="provider-lrclib" checked /> LRCLib</label>
              </div>
              <button id="blyrics-search-btn" class="blyrics-primary-btn">Search</button>
              <div id="blyrics-search-results"></div>
            </div>
            <div class="blyrics-tab-content" id="manual-tab" style="display: none;">
              <div class="blyrics-manual-container">
                <label for="blyrics-manual-input">Enter lyrics in LRC format or plain text:</label>
                <textarea id="blyrics-manual-input" placeholder="[00:12.50]Line 1 lyrics
[00:17.20]Line 2 lyrics

Or just plain text without timestamps..."></textarea>
                <button id="blyrics-apply-manual">Apply Lyrics</button>
              </div>
            </div>
          </div>
          <div id="blyrics-error-message" style="display: none;"></div>
        </div>
      </div>
    `;

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

    const query = `${song} ${artist}`;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultsContainer.innerHTML = '<div class="blyrics-loading">Searching for lyrics...</div>';

    try {
      const results = await this.searchLyrics(query);
      this.displaySearchResults(results);
    } catch (_error) {
      this.showError("Search failed. Please try again.");
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  },

  displaySearchResults: function (results) {
    const resultsContainer = document.querySelector("#blyrics-search-results");

    if (!results || results.length === 0) {
      resultsContainer.innerHTML =
        '<div class="blyrics-no-results">No lyrics found. Try a different search term.</div>';
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
      if (r.richSyncLyrics || r.richSyncLyricsUri) type = "rich";
      else if (r.syncedLyrics || r.syncedLyricsUri) type = "synced";
      else if (r.plainLyrics || r.plainLyricsUri) type = "plain";
      r.__type = type;
      r.__priority = priority[type] ?? 2;
    });

    results.sort((a, b) => a.__priority - b.__priority);

    const resultsHTML = results
      .map(
        (result, index) => `
      <div class="blyrics-search-result" data-index="${index}">
        <div class="blyrics-result-header">
          <h4 class="blyrics-result-title">${result.trackName || "Unknown Title"}</h4>
          <button class="blyrics-use-result" data-index="${index}">Use These Lyrics</button>
        </div>
        <div class="blyrics-result-meta">
          <span class="blyrics-result-artist">${result.artistName || "Unknown Artist"}</span>
          ${result.albumName ? `<span class="blyrics-result-album">${result.albumName}</span>` : ""}
        </div>
        <div class="blyrics-result-footer">
          <span class="blyrics-provider-tag">LRCLib</span>
          <span class="blyrics-type-tag blyrics-type-${result.__type}">${result.__type === "rich" ? "Rich Synced" : result.__type === "synced" ? "Synced" : "Plain"}</span>
          <span class="blyrics-result-duration">${this.formatDuration(result.duration || 0)}</span>
        </div>
      </div>
    `
      )
      .join("");

    resultsContainer.innerHTML = resultsHTML;

    resultsContainer.querySelectorAll(".blyrics-use-result").forEach(btn => {
      btn.addEventListener("click", e => {
        const index = parseInt(e.target.dataset.index);
        this.applyLyrics(results[index]);
      });
    });
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
