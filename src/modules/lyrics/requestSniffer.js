/**
 *
 * @type {Map<string, string>}
 */
const browseIdToVideoIdMap = new Map();

/**
 * @typedef {object} Segment
 * @property {number} primaryVideoStartTimeMilliseconds
 * @property {number} counterpartVideoStartTimeMilliseconds
 * @property {number} durationMilliseconds
 */
/** @typedef {object} SegmentMap
 * @property {Segment[]} segment
 */

/**
 *
 * @type {Map<string, {hasLyrics: boolean, lyrics: string, sourceText: string}>}
 */
const videoIdToLyricsMap = new Map();
/**
 *
 * @type {Map<string, {counterpartVideoId: string, segmentMap: SegmentMap | null}>}
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
          if (counterpartVideoIdMap.get(videoId)) {
            let counterpart = counterpartVideoIdMap.get(videoId).counterpartVideoId;
            if (videoIdToLyricsMap.has(counterpart)) {
              clearInterval(checkInterval);
              resolve(videoIdToLyricsMap.get(counterpart));
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

  getMatchingSong: function (videoId, maxCheckCount = 250) {
    if (counterpartVideoIdMap.has(videoId)) {
      return Promise.resolve(counterpartVideoIdMap.get(videoId));
    } else {
      let checkCount = 0;
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (counterpartVideoIdMap.has(videoId)) {
            let counterpart = counterpartVideoIdMap.get(videoId);
            clearInterval(checkInterval);
            resolve(counterpart);
          }
          if (checkCount > maxCheckCount) {
            clearInterval(checkInterval);
            BetterLyrics.Utils.log("Failed to find Segment Map for video");
            resolve(null);
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
        let playlistPanelRendererContents =
          responseJson.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
            ?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content
            ?.playlistPanelRenderer?.contents;
        if (!playlistPanelRendererContents) {
          playlistPanelRendererContents =
            responseJson.onResponseReceivedEndpoints?.[0]?.queueUpdateCommand?.inlineContents?.playlistPanelRenderer
              ?.contents;
        }

        if (playlistPanelRendererContents) {
          for (let playlistPanelRendererContent of playlistPanelRendererContents) {
            let counterpartId =
              playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]?.counterpartRenderer
                ?.playlistPanelVideoRenderer?.videoId;
            let primaryId =
              playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer?.primaryRenderer
                ?.playlistPanelVideoRenderer?.videoId;

            /**
             * @type {SegmentMap}
             */
            let segmentMap =
              playlistPanelRendererContent?.playlistPanelVideoWrapperRenderer?.counterpart?.[0]?.segmentMap;

            if (counterpartId && primaryId) {
              let reversedSegmentMap = null;

              if (segmentMap && segmentMap.segment) {
                for (let segment of segmentMap.segment) {
                  segment.counterpartVideoStartTimeMilliseconds = Number(segment.counterpartVideoStartTimeMilliseconds);
                  segment.primaryVideoStartTimeMilliseconds = Number(segment.primaryVideoStartTimeMilliseconds);
                  segment.durationMilliseconds = Number(segment.durationMilliseconds);
                }

                /**
                 * @type {SegmentMap}
                 */
                reversedSegmentMap = { segment: [], reversed: true };
                for (let segment of segmentMap.segment) {
                  reversedSegmentMap.segment.push({
                    primaryVideoStartTimeMilliseconds: segment.counterpartVideoStartTimeMilliseconds,
                    counterpartVideoStartTimeMilliseconds: segment.primaryVideoStartTimeMilliseconds,
                    durationMilliseconds: segment.durationMilliseconds,
                  });
                }
              }

              counterpartVideoIdMap.set(primaryId, { counterpartVideoId: counterpartId, segmentMap });
              counterpartVideoIdMap.set(counterpartId, {
                counterpartVideoId: primaryId,
                segmentMap: reversedSegmentMap,
              });
            } else {
              let primaryId = playlistPanelRendererContent?.playlistPanelVideoRenderer?.videoId;
              if (primaryId) {
                counterpartVideoIdMap.set(primaryId, { counterpartVideoId: null, segmentMap: null });
              }
            }
          }
        }

        let videoId = requestJson.videoId;
        let playlistId = requestJson.playlistId;

        if (!videoId) {
          videoId = responseJson.currentVideoEndpoint?.watchEndpoint?.videoId;
        }
        if (!playlistId) {
          playlistId = responseJson.currentVideoEndpoint?.watchEndpoint?.playlistId;
        }

        if (!videoId) {
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
      } else if (url.includes("https://music.youtube.com/youtubei/v1/browse")) {
        let browseId = requestJson.browseId;
        let videoId = browseIdToVideoIdMap.get(browseId);

        if (browseId !== undefined && videoId === undefined && firstRequestMissedVideoId !== null) {
          // it is possible that we missed the first request, so lets just try it with this id
          videoId = firstRequestMissedVideoId;
        }

        if (videoId !== undefined) {
          let lyrics =
            responseJson.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.description
              ?.runs?.[0]?.text;
          let sourceText =
            responseJson.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer?.footer?.runs?.[0]
              ?.text;
          if (lyrics && sourceText) {
            videoIdToLyricsMap.set(videoId, { hasLyrics: true, lyrics, sourceText });
            if (videoId === firstRequestMissedVideoId) {
              browseIdToVideoIdMap.set(browseId, videoId);
              firstRequestMissedVideoId = null;
            }
          } else {
            videoIdToLyricsMap.set(videoId, { hasLyrics: false, lyrics: null, sourceText: null });
          }
        }
      }
    });
  },
};
