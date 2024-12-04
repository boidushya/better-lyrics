BetterLyrics.LyricProviders = {
  providersList: [],

  bLyrics: async function(song, artist, duration) {
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

    return data;
  },

  lyricLib: async function(song, artist, duration) {
    const url = new URL(BetterLyrics.Constants.LRCLIB_API_URL);
    url.searchParams.append("track_name", song);
    url.searchParams.append("artist_name", artist);
    url.searchParams.append("duration", duration);

    const response = await fetch(url.toString(), {
      headers: {
        "Lrclib-Client": BetterLyrics.Constants.LRCLIB_CLIENT_HEADER,
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(BetterLyrics.Constants.HTTP_ERROR_LOG + response.status);
    }

    const data = await response.json();

    if (data && data.syncedLyrics && typeof data.duration === "number") {
      BetterLyrics.Utils.log(BetterLyrics.Constants.LRCLIB_LYRICS_FOUND_LOG);
      return {lyrics: BetterLyrics.LyricProviders.parseLRCLIBLyrics(data.syncedLyrics, data.duration)};
    } else {
      throw new Error(BetterLyrics.Constants.NO_LRCLIB_LYRICS_FOUND_LOG);
    }
  },

  parseLRCLIBLyrics: function(syncedLyrics, duration) {
    const lines = syncedLyrics.split("\n");
    const lyricsArray = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseFloat(match[2]);
        const words = match[3].trim();
        const startTimeMs = Math.floor((minutes * 60 + seconds) * 1000);

        lyricsArray.push({
          startTimeMs: startTimeMs.toString(),
          words: words,
          durationMs: "0", // Will calculate later
        });
      }
    }

    // Calculate durationMs for each lyric line
    for (let i = 0; i < lyricsArray.length; i++) {
      if (i < lyricsArray.length - 1) {
        const nextStartTimeMs = parseInt(lyricsArray[i + 1].startTimeMs);
        const currentStartTimeMs = parseInt(lyricsArray[i].startTimeMs);
        lyricsArray[i].durationMs = (nextStartTimeMs - currentStartTimeMs).toString();
      } else {
        // For the last line, use the total duration
        const totalDurationMs = duration * 1000;
        const currentStartTimeMs = parseInt(lyricsArray[i].startTimeMs);
        lyricsArray[i].durationMs = (totalDurationMs - currentStartTimeMs).toString();
      }
    }

    return lyricsArray;
  },
  ytLyrics: async function(song, artist, duration){
    const existingLyrics = document.getElementsByClassName(BetterLyrics.Constants.DESCRIPTION_CLASS);
    const lyricText = existingLyrics[0].innerText;

    const lyricsArray = [];
    lyricText.split("\n").forEach(
      words => {
        lyricsArray.push({
          startTimeMs: "0",
          words: words,
          durationMs: "0",
        });
      }
    )

    return {lyrics: lyricsArray};

  },
  initProviders: function (){
    BetterLyrics.LyricProviders.providersList = [BetterLyrics.LyricProviders.bLyrics, BetterLyrics.LyricProviders.lyricLib, BetterLyrics.LyricProviders.ytLyrics];
  }
}