BetterLyrics.Utils = {
  log: function (...message) {
    BetterLyrics.Storage.getStorage({ isLogsEnabled: true }, items => {
      if (items.isLogsEnabled) {
        console.log(...message);
      }
    });
  },

  setUpLog: function () {
    BetterLyrics.Storage.getStorage({ isLogsEnabled: true }, items => {
      if (items.isLogsEnabled) {
        BetterLyrics.Utils.log = console.log.bind(window.console);
      } else {
        BetterLyrics.Utils.log = function () {};
      }
    });
  },

  timeToInt: function (time) {
    time = time.split(":");
    time = parseFloat(time[0]) * 60 + parseFloat(time[1]);
    return time;
  },

  unEntity: function (str) {
    return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  },

  generateAlbumArt: function (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  },

  applyCustomCSS: function (css) {
    let styleTag = document.getElementById("blyrics-custom-style");
    if (styleTag) {
      styleTag.textContent = css;
    } else {
      styleTag = document.createElement("style");
      styleTag.id = "blyrics-custom-style";
      styleTag.textContent = css;
      document.head.appendChild(styleTag);
    }
  },
};
