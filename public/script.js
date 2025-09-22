/**
 * @fileoverview YouTube Music player integration script for BetterLyrics.
 * Handles real-time player state monitoring and event dispatching.
 */

/**
 * Interval ID for the lyrics tick timer.
 * @type {number|null|undefined}
 */
let tickLyricsInterval;

// Get all player methods (paste in broswer console)
// for(i in document.getElementById("movie_player")) {
//     if (typeof document.getElementById("movie_player")[i] === 'function' && i.includes("get")) {
//             console.log(i + ": " + JSON.stringify(document.getElementById("movie_player")[i](), null, 2));
//     } else {
//         console.log(i);
//     }
// }
/**
 * Starts the lyrics tick interval to monitor YouTube Music player state.
 * Dispatches custom events with player information every 20ms for real-time sync.
 * Automatically stops the previous interval if one exists.
 */
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
        const contentRect = player.getVideoContentRect();
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
              contentRect,
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

/**
 * Stops the lyrics tick interval and clears the timer.
 * Called when the page is unloaded or when an error occurs.
 */
const stopLyricsTick = () => {
  if (tickLyricsInterval) {
    clearInterval(tickLyricsInterval);
    tickLyricsInterval = null;
  }
};

window.addEventListener("unload", stopLyricsTick);

startLyricsTick();
