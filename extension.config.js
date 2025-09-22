module.exports = {
  dev: {
    browser: 'chrome',
    polyfill: true,
  },
  browser: {
    chrome: {
      preferences: {theme: "dark"},
      browserFlags: ["--starting-url", "music.youtube.com"],
    },
    firefox: {
      preferences: {darkMode: true},
    },
  },
  output: {
    publicPath: 'chrome-extension://effdbpeggelllpfkjppbokhmmiinhlmg/'
  }
};