/**
 *
 * @type {Map<string, string>}
 */
const browseIdToVideoIdMap = new Map();


/** @typedef {object} SegmentMap
 * @property {object[]} segment
 * @property {string} segment.primaryVideoStartTimeMilliseconds
 * @property {string} segment.counterpartVideoStartTimeMilliseconds
 * @property {string} segment.durationMilliseconds
 */

/**
 *
 * @type {Map<string, {hasLyrics: boolean, lyrics: string, sourceText: string}>}
 */
const videoIdToLyricsMap = new Map();
/**
 *
 * @type {Map<string, {counterpartVideoId: string, segmentMap: SegmentMap}>}
 */
const counterpartVideoIdMap = new Map();

let firstRequestMissedVideoId = null;

BetterLyrics.RequestSniffing = {
  getLyrics: function (videoId) {
    if (videoIdToLyricsMap.has(videoId)) {
      return Promise.resolve(videoIdToLyricsMap.get(videoId));
    } else {
      let checkCount = 0;
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (videoIdToLyricsMap.has(videoId)) {
            clearInterval(checkInterval);
            resolve(videoIdToLyricsMap.get(videoId));
          }
          if (counterpartVideoIdMap.has(videoId)) {
            let counterpart = counterpartVideoIdMap.get(videoId)
            if (videoIdToLyricsMap.has(counterpart.counterpartVideoId)) {
              clearInterval(checkInterval);
              resolve(videoIdToLyricsMap.get(counterpart.counterpartVideoId));
            }
          }
          if (checkCount > 250) {
            clearInterval(checkInterval);
            BetterLyrics.Utils.log("Failed to sniff lyrics");
            resolve({ hasLyrics: false, lyrics: "", sourceText: "" });
          }
          checkCount += 1;
        }, 20);
      });
    }
  },

  setupRequestSniffer: function () {
    let url = new URL(window.location);
    if (url.searchParams.has("v")) {
      firstRequestMissedVideoId = url.searchParams.get("v");
    }

    document.addEventListener("blyrics-send-response", event => {
      let { /** @type string */ url, requestJson, responseJson } = event.detail;

      if (url.includes("https://music.youtube.com/youtubei/v1/next")) {
        let videoId = requestJson.videoId;
        let playlistId = requestJson.playlistId;

        let playlistPanelRendererContents = responseJson.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.
          watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents;


        if (!videoId && !playlistId) {
          if (requestJson.watchNextType === "WATCH_NEXT_TYPE_GET_QUEUE") {
            videoId = responseJson.currentVideoEndpoint.watchEndpoint.videoId;
            playlistId = responseJson.currentVideoEndpoint.watchEndpoint.playlistId;

          } else {
            return;
          }
        } else if (!videoId) {
          return;
        }
        let lyricsTab =
          responseJson.contents.singleColumnMusicWatchNextResultsRenderer.tabbedRenderer.watchNextTabbedResultsRenderer
            .tabs[1].tabRenderer;
        if (lyricsTab.unselectable) {
          videoIdToLyricsMap.set(videoId, { hasLyrics: false, lyrics: "", sourceText: "" });
        } else {
          let browseId = lyricsTab.endpoint.browseEndpoint.browseId;
          browseIdToVideoIdMap.set(browseId, videoId);
        }


        for (let playlistPanelRendererContent of playlistPanelRendererContents) {
          let counterpartId = playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]?.counterpartRenderer?.playlistPanelVideoRenderer?.videoId;
          let primaryId = playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer.primaryRenderer.playlistPanelVideoRenderer.videoId;

          /**
           * @type {SegmentMap}
           */
          let segmentMap = playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]?.segmentMap;

          if (counterpartId && primaryId) {

            if (segmentMap) {
              counterpartVideoIdMap.set(primaryId, {counterpartVideoId: counterpartId, segmentMap});

              /**
               * @type {SegmentMap}
               */
              let reversedSegmentMap = segmentMap; //TODO
              counterpartVideoIdMap.set(counterpartId, {counterpartVideoId: primaryId, reversedSegmentMap});
            }
          }
        }
      } else if (url.includes("https://music.youtube.com/youtubei/v1/browse")) {
        let browseId = requestJson.browseId;
        let videoId = browseIdToVideoIdMap.get(browseId);

        if (browseId !== undefined && videoId === undefined && firstRequestMissedVideoId !== null) {
          // it is possible that we missed the first request, so lets just try it with this id
          videoId = firstRequestMissedVideoId;
        }

        if (videoId !== undefined) {
          let lyrics =
            responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.description.runs[0]
              .text;
          let sourceText =
            responseJson.contents.sectionListRenderer.contents[0].musicDescriptionShelfRenderer.footer.runs[0].text;

          videoIdToLyricsMap.set(videoId, { hasLyrics: true, lyrics, sourceText });
          if (videoId === firstRequestMissedVideoId) {
            browseIdToVideoIdMap.set(browseId, videoId);
            firstRequestMissedVideoId = null;
          }
        }
      }
    });
  },
};
