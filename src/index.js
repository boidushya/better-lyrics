const createLyrics = () => {
  const song = document.getElementsByClassName("title ytmusic-player-bar")[0]
    .innerHTML;
  let artist;
  try {
    artist = document.getElementsByClassName(
      "subtitle style-scope ytmusic-player-bar"
    )[0].children[0].children[0].innerHTML;
  } catch (err) {
    artist = document.getElementsByClassName(
      "subtitle style-scope ytmusic-player-bar"
    )[0].children[0].innerHTML;
  }
  console.log("[BLyrics] Fetching Lyrics for: ", song, artist);

  const url = `https://lyrics-api.boidu.dev/getLyrics?s=${song}&a=${artist}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const lyrics = data.lyrics;
      clearInterval(window.lyricsCheckInterval);
      injectLyrics(lyrics);
    });
};

const timeToInt = (time) => {
  time = time.split(":");
  time = parseFloat(time[0]) * 60 + parseFloat(time[1]);
  return time;
};

const injectLyrics = (lyrics) => {
  // Inject Lyrics into DOM

  const lyricsWrapper = document.getElementsByClassName(
    "description style-scope ytmusic-description-shelf-renderer"
  )[1];

  try {
    const footer = (document.getElementsByClassName(
      "footer style-scope ytmusic-description-shelf-renderer"
    )[0].innerHTML = `Source: <a href="https://boidu.dev" class="footer-link" target="_blank">boidu.dev</a>`);
    footer.removeAttribute("is-empty");
  } catch (err) {
    console.log(
      "[BLyrics] Footer isn't hidden/not visible yet, safe to ignore."
    );
  }

  const albumArt = document.querySelector("#song-image>#thumbnail>#img").src;

  try {
    lyricsWrapper.innerHTML = "";
    const lyricsContainer = document.createElement("div");
    lyricsContainer.className = "lyrics";
    lyricsWrapper.appendChild(lyricsContainer);

    lyricsWrapper.style = `--background-img: url('${albumArt}')`;

    lyricsWrapper.removeAttribute("is-empty");
  } catch (err) {
    console.log("[BLyrics] Lyrics wrapper not visible, safe to ignore.");
  }

  lyrics.forEach((item) => {
    let line = document.createElement("div");
    line.dataset.time = item.startTimeMs / 1000;
    line.setAttribute("data-scrolled", false);

    line.setAttribute(
      "onClick",
      `const player = document.getElementById("movie_player"); player.seekTo(${
        item.startTimeMs / 1000
      }, true);player.playVideo();`
    );

    line.innerHTML = item.words;

    document.getElementsByClassName("lyrics")[0].appendChild(line);
  });

  window.lyricsCheckInterval = setInterval(function () {
    try {
      let currentTime =
        timeToInt(
          document
            .getElementsByClassName(
              "time-info style-scope ytmusic-player-bar"
            )[0]
            .innerHTML.replaceAll(" ", "")
            .replaceAll("\n", "")
            .split("/")[0]
        ) + 0.75;
      const lyrics = [...document.getElementsByClassName("lyrics")[0].children];

      lyrics.every((elem, index) => {
        const time = parseFloat(elem.getAttribute("data-time"));
        if (currentTime >= time && index + 1 === lyrics.length) {
          elem.setAttribute("class", "current");
          const current = document.getElementsByClassName("current");
          current[0].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          return true;
        } else if (
          currentTime > time &&
          currentTime < parseFloat(lyrics[index + 1].getAttribute("data-time"))
        ) {
          const current = document.getElementsByClassName("current")[0];

          elem.setAttribute("class", "current");
          if (
            current !== undefined &&
            current.getAttribute("data-scrolled") !== "true"
          ) {
            current.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
            current.setAttribute("data-scrolled", true);

            // if (current.previousElementSibling !== null) {
            //   current.previousElementSibling.setAttribute("class", "");
            //   current.previousElementSibling.setAttribute(
            //     "data-scrolled",
            //     false
            //   );
            // }
          }
          return true;
        } else {
          elem.setAttribute("data-scrolled", false);
          elem.setAttribute("class", "");
          return true;
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, 50);
};

const modify = () => {
  const fontLink = document.createElement("link");
  fontLink.href = "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);
  // Detect Song Changes
  let song = {
    title: "",
    artist: "",
  };
  let targetNode = document.getElementsByClassName(
    "title ytmusic-player-bar"
  )[0];
  let config = {
    attributes: true,
    childList: true,
  };

  let timeOutForReloader;

  let callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type == "attributes") {
        // SONG TITLE UPDATED
        if (
          song.title !== targetNode.innerHTML &&
          !targetNode.innerHTML.startsWith("<!--") &&
          targetNode.innerHTML !== ""
        ) {
          console.log("[Blyrics] Song switched", targetNode.innerHTML);
          song.title = targetNode.innerHTML;
          setTimeout(() => createLyrics(), 1000);
        }
      }
    }
  };

  let observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // Fetch Lyrics once the lyrics tab is clicked
  function lyricReloader() {
    const tabs = document.getElementsByClassName(
      "tab-content style-scope tp-yt-paper-tab"
    );

    const [tab1, tab2, tab3] = tabs;

    if (tab1 !== undefined && tab2 !== undefined && tab3 !== undefined) {
      tab2.addEventListener("click", function () {
        console.log("[Blyrics] Lyrics Tab Clicked");
        setTimeout(() => createLyrics(), 1000);
      });
    } else {
      setTimeout(() => lyricReloader(), 1000);
    }
  }
  lyricReloader();
};

try {
  if (document.readyState !== "loading") {
    modify();
  } else {
    document.addEventListener("DOMContentLoaded", modify);
  }
} catch (err) {
  console.log("[BLyrics] Error: ", err);
}
