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
        document.dispatchEvent(
          new CustomEvent("blyrics-send-player-time", {
            detail: { currentTime: currentTime, videoId: video_id, song: title, artist: author, duration: duration, audioTrackData: audioTrackData },
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
