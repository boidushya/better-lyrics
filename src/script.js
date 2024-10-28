const getSongInfo = () => {
  const player = document.getElementById("movie_player");

  const { title, author } = player.getVideoData();
  return {
    song: title,
    artist: author,
  };
};

document.addEventListener("blyrics-get-song-info", function () {
  const data = getSongInfo();
  const event = new CustomEvent("blyrics-send-song-info", { detail: data });
  document.dispatchEvent(event);
});


// Initialize the time update interval and stop it when the page is unloaded

let timeUpdateInterval;

const startTimeUpdate = () => {
  stopTimeUpdate();

  timeUpdateInterval = setInterval(function () {
    const player = document.getElementById("movie_player");
    if (player) {
      try {
        const currentTime = player.getCurrentTime();
        document.dispatchEvent(
          new CustomEvent("blyrics-send-player-time", {
            detail: { currentTime: currentTime },
          })
        );
      } catch (_) {
        stopTimeUpdate();
      }
    } else {
      stopTimeUpdate();
    }
  }, 20);
}

const stopTimeUpdate = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
}

window.addEventListener("unload", stopTimeUpdate);

startTimeUpdate();
