// Initialize the time update interval and stop it when the page is unloaded

let tickLyricsInterval;

// Get all player methods (paste in broswer console)
// for(i in document.getElementById("movie_player")) {
//     if (typeof document.getElementById("movie_player")[i] === 'function' && i.includes("get")) {
//             console.log(i + ": " + JSON.stringify(document.getElementById("movie_player")[i](), null, 2));
//     } else {
//         console.log(i);
//     }
// }
const startLyricsTick = () => {
  stopLyricsTick();

  tickLyricsInterval = setInterval(function () {
    const player = document.getElementById("movie_player");
    if (player) {
      try {
        const currentTime = player.getCurrentTime();
        const { video_id, title, author } = player.getVideoData();
        const audioTrackData = player.getAudioTrack();
        const duration = player.getDuration();
        const { isPlaying, isBuffering } = player.getPlayerStateObject();
        document.dispatchEvent(
          new CustomEvent("blyrics-send-player-time", {
            detail: {
              currentTime: currentTime,
              videoId: video_id,
              song: title,
              artist: author,
              duration: duration,
              audioTrackData: audioTrackData,
              browserTime: Date.now(),
              playing: isPlaying && !isBuffering,
            },
          })
        );
      } catch (e) {
        console.log(e);
        stopLyricsTick();
      }
    }
  }, 20);
};

const stopLyricsTick = () => {
  if (tickLyricsInterval) {
    clearInterval(tickLyricsInterval);
    tickLyricsInterval = null;
  }
};

window.addEventListener("unload", stopLyricsTick);

startLyricsTick();

const originalFetch = window.fetch;
window.fetch = async function (request, init) {
  if (
    request.url.includes("https://music.youtube.com/youtubei/v1/browse") ||
    request.url.includes("https://music.youtube.com/youtubei/v1/next")
  ) {
    let clonedRequest = request.clone();
    const response = await originalFetch(request, init);
    const clonedResponse = response.clone();

    Promise.all([clonedRequest.json(), clonedResponse.json()]).then(awaited => {
      const event = new CustomEvent("blyrics-send-response", {
        detail: {
          url: clonedResponse.url,
          requestJson: awaited[0],
          responseJson: awaited[1],
          status: clonedResponse.status,
          timestamp: Date.now(),
        },
      });
      document.dispatchEvent(event);
    });
    return response;
  } else {
    return originalFetch(request, init);
  }
};
