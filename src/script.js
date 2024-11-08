// Initialize the time update interval and stop it when the page is unloaded

let tickLyricsInterval;

const startLyricsTick = () => {
  stopLyricsTick();

  tickLyricsInterval = setInterval(function () {
    const player = document.getElementById("movie_player");
    if (player) {
      try {
        const currentTime = player.getCurrentTime();
        const { video_id, title, author } = player.getVideoData();
        document.dispatchEvent(
          new CustomEvent("blyrics-send-player-time", {
            detail: { currentTime: currentTime, videoId: video_id, song: title, artist: author },
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
