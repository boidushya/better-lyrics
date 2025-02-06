/**
 *
 * @type {Map<string, string>}
 */
const browseIdToVideoIdMap = new Map()

/**
 *
 * @type {Map<string, {hasLyrics: boolean, lyrics: string, sourceText: string}>}
 */
const videoIdToLyricsMap = new Map()

let firstRequestMissedVideoId = null;

BetterLyrics.RequestSniffing = {
  getLyrics: function (videoId) {
    if (videoIdToLyricsMap.has(videoId)) {
      return Promise.resolve(videoIdToLyricsMap.get(videoId));
    } else {
      let checkCount = 0;
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (videoIdToLyricsMap.has(videoId)) {
            clearInterval(checkInterval);
            resolve(videoIdToLyricsMap.get(videoId));
          }
          if (checkCount > 250) {
            clearInterval(checkInterval);
            resolve({hasLyrics: false, lyrics: "", sourceText: ""});
          }
          checkCount += 1;
        }, 20);
      });
    }
  },

  setupRequestSniffer: function () {
    let url = new URL(window.location)
    if (url.searchParams.has("v")) {
      firstRequestMissedVideoId = url.searchParams.get("v");
    }

    document.addEventListener("blyrics-send-response", (event) => {
      let {/** @type string */ url, requestJson, responseJson, status, timestamp} = event.detail;

      if (url.includes("https://music.youtube.com/youtubei/v1/next")) {
        let videoId = requestJson.videoId;
        let playlistId = requestJson.playlistId;
        if (!videoId && !playlistId) {
          if (requestJson.watchNextType === "WATCH_NEXT_TYPE_GET_QUEUE") {
            videoId = responseJson.currentVideoEndpoint.watchEndpoint.videoId;
            playlistId = responseJson.currentVideoEndpoint.watchEndpoint.playlistId
          } else {
            return;
          }
        } else if (!videoId) {
          return;
        }
        let lyricsTab = responseJson.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer.tabs[1].tabRenderer;
        if (lyricsTab.unselectable) {
          videoIdToLyricsMap.set(videoId, {hasLyrics: false, lyrics: "", sourceText: ""});
        } else {
          let browseId = lyricsTab.endpoint.browseEndpoint.browseId;
          browseIdToVideoIdMap.set(browseId, videoId);
        }

      } else if (url.includes("https://music.youtube.com/youtubei/v1/browse")) {
        let browseId = requestJson.browseId;
        let videoId = browseIdToVideoIdMap.get(browseId);

        if (browseId !== undefined && videoId === undefined && firstRequestMissedVideoId !== null) {
          // it is possible that we missed the first request, so lets just try it with this id
          videoId = firstRequestMissedVideoId;
        }

        if (videoId !== undefined) {
          let lyrics = responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.description.runs[0].text;
          let sourceText = responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.footer.runs[0].text;

          videoIdToLyricsMap.set(videoId, {hasLyrics: true, lyrics, sourceText});
          if (videoId === firstRequestMissedVideoId) {
            browseIdToVideoIdMap.set(browseId, videoId);
            firstRequestMissedVideoId = null;
          }
        }
      }
    });
  }
}
