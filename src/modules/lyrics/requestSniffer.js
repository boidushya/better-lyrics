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
  setupRequestSniffer: function () {
    let url = new URL(window.location)
    console.log(url)
    if (url.searchParams.has("v")) {
      firstRequestMissedVideoId = url.searchParams.get("v");
    }

    document.addEventListener("blyrics-send-response", (event) => {
      let {/** @type string */ url, requestJson, responseJson, status, timestamp} = event.detail;
      console.log(url, requestJson, responseJson);

      if (url.includes("https://music.youtube.com/youtubei/v1/next")) {
        let videoId = requestJson.videoId;
        let playlistId = requestJson.playlistId;
        if (!videoId && !playlistId) {
          if (requestJson.watchNextType === "WATCH_NEXT_TYPE_GET_QUEUE") {
            console.log("WATCH_NEXT_TYPE_GET_QUEUE found videoId");
            videoId = responseJson.currentVideoEndpoint.watchEndpoint.videoId;
            playlistId = responseJson.currentVideoEndpoint.watchEndpoint.playlistId
          } else {
            console.log("had no playlistId or videoId");
            return;
          }
        } else if (!videoId) {
          console.log("had no videoId, but playlistId = " + playlistId);
          return;
        }
        let lyricsTab = responseJson.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer.tabs[1].tabRenderer;
        if (lyricsTab.unselectable) {
          videoIdToLyricsMap.set(videoId, {hasLyrics: false, lyrics: "", sourceText: ""});
          console.log("associated " + videoId + " with no lyrics");
        } else {
          let browseId = lyricsTab.endpoint.browseEndpoint.browseId;
          browseIdToVideoIdMap.set(browseId, videoId);
          console.log("associated " + browseId + " with videoId = ", videoId);
        }

      } else if (url.includes("https://music.youtube.com/youtubei/v1/browse")) {
        let browseId = requestJson.browseId;
        let videoId = browseIdToVideoIdMap.get(browseId);

        if (browseId !== undefined && videoId === undefined && firstRequestMissedVideoId !== null) {
          // it is possible that we missed the first request, so lets just try it with this id
          videoId = firstRequestMissedVideoId;
          console.log("had to use firstRequestMissedVideoId");
        }

        if (videoId !== undefined) {
          let lyrics = responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.description.runs[0].text;
          let sourceText = responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.footer.runs[0].text;

          videoIdToLyricsMap.set(videoId, {hasLyrics: true, lyrics, sourceText});
          console.log("associated " + videoId + " with lyrics:\n" + lyrics, sourceText);
          if (videoId === firstRequestMissedVideoId) {
            browseIdToVideoIdMap.set(browseId, videoId);
            firstRequestMissedVideoId = null;
          }
        } else {
          console.log("unknown browse Id", browseId)
        }
      }
    });
  }
}
