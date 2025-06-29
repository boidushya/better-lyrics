export default [
  {
    name: "Spotlight",
    author: "BetterLyrics",
    link: "https://twitter.com/boidushya",
    css: `:root {
  --blyrics-lyric-active-color: color(display-p3 1 1 1 /1);
  --blyrics-lyric-inactive-color: color(display-p3 1 1 1 /0.2);
}

.blyrics-container:not(.blyrics-user-scrolling) > .blyrics--line:has(~ .blyrics--active) {
  opacity: 0.5;
  filter: blur(2.5px);
  transition: filter 0.5s 0.35s, opacity 0.5s 0.35s, transform 0.166s var(--blyrics-anim-delay, 0s) !important;
}

.blyrics-container > div.blyrics--active {
  opacity: 1;
  filter: blur(0px);
}

.blyrics-container > div {
  transition: filter 0.5s 0s, opacity 0.5s 0s, transform 0.166s var(--blyrics-anim-delay, 0s) !important;
}
		`,
  },
  {
    name: "Pastel",
    author: "BetterLyrics",
    link: "https://twitter.com/boidushya",
    css: `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');

:root {
  --dark-mellow-bg-color: #1a1a1a;
  --dark-mellow-text-color: #e0e0e0;
  --dark-mellow-highlight-color: #d4a5a5;
  --dark-mellow-shadow-color: rgba(0, 0, 0, 0.3);
  --dark-mellow-border-color: #d4a5a52a;
  --dark-mellow-secondary-bg: #2c2c2c;
}

.blyrics-container {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 400;
  color: var(--dark-mellow-text-color);
  padding: 2rem;
  border-radius: 1rem;
}

.blyrics-container > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.7;
}

.blyrics-container > div.blyrics--active {
  transform: scale(1.05);
  opacity: 1;
}

.blyrics-container > div.blyrics--active > span:not(:empty):not(.blyrics--translated):not(.blyrics--romanized) {
  animation: dark-mellow-highlight var(--blyrics-duration) ease-in-out infinite;
}

/* Translation and Romanization styles */
.blyrics--translated,
.blyrics--romanized {
  color: var(--dark-mellow-text-color);
  opacity: 0.7;
}

.blyrics--romanized {
  background-color: rgba(212, 165, 165, 0.05);
  border: 1px solid var(--dark-mellow-border-color);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
}

@keyframes dark-mellow-highlight {
  0%, 100% {
    color: var(--dark-mellow-text-color);
    text-shadow: none;
  }
  50% {
    color: var(--dark-mellow-highlight-color);
    text-shadow: 0 0 10px var(--dark-mellow-highlight-color);
  }
}

.blyrics-footer__container {
  background-color: var(--dark-mellow-secondary-bg);
  color: var(--dark-mellow-text-color);
  border: 1px solid var(--dark-mellow-border-color);
  padding: 0.75rem 1.5rem;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
}

.blyrics-footer__container:hover {
  transform: translateY(-2px);
  background-color: var(--dark-mellow-highlight-color);
  color: var(--dark-mellow-bg-color);
}

.blyrics-footer__container > a {
  color: var(--dark-mellow-highlight-color);
}

.blyrics-footer__container:hover > a {
  color: var(--dark-mellow-bg-color);
}

ytmusic-player-page:before {
  background: linear-gradient(
    to right,
    rgba(26, 26, 26, 0.75),
    rgba(26, 26, 26, 0.75)
  ),
  var(--blyrics-background-img);
  filter: blur(50px) saturate(0.8);
}

#tab-renderer[page-type="MUSIC_PAGE_TYPE_TRACK_LYRICS"] {
  scrollbar-color: var(--dark-mellow-highlight-color) transparent;
}

.blyrics--error {
  color: #ff9999;
  font-weight: 500;
  opacity: 0.8;
}

#blyrics-watermark > .blyrics-watermark__container {
  background-color: var(--dark-mellow-secondary-bg);
  backdrop-filter: blur(5px);
}

#blyrics-watermark > .blyrics-watermark__container > p {
  color: var(--dark-mellow-text-color);
}

#blyrics-song-info > p#blyrics-title {
  color: var(--dark-mellow-highlight-color);
  font-weight: 600;
}

#blyrics-song-info > p#blyrics-artist {
  color: var(--dark-mellow-text-color);
  font-weight: 400;
  opacity: 0.8;
}

@media (max-width: 615px) {
  .blyrics-container:before {
    background: linear-gradient(
      to right,
      var(--dark-mellow-bg-color) 4rem,
      rgba(26, 26, 26, 0.8),
      var(--dark-mellow-bg-color) 96%
    ),
    var(--blyrics-background-img) !important;
    filter: blur(40px) saturate(0.8);
  }

  .blyrics-container:after {
    background: radial-gradient(
      circle at center,
      rgba(26, 26, 26, 0.2),
      rgba(26, 26, 26, 0.6)
    ) !important;
  }
}`,
  },
  {
    name: "Harmony Glow",
    author: "NAMELESS",
    link: "",
    css: `.blyrics-container {
  font-family: "Roboto Mono", monospace;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.5;
  background: transparent 0%, rgba(0, 0, 0, 0.013) 5%,
    rgba(255, 235, 205, 0.5) 15%, rgba(0, 0, 0, 0.987) 85%, #000 100%;
  padding: 20px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.blyrics-container > div > span {
  display: inline-block;
  opacity: 0.7;
  transition: opacity 0.3s;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

/* Fix for translated and romanized text */
.blyrics-container > div > span.blyrics--translated,
.blyrics-container > div > span.blyrics--romanized {
  display: block;
  margin-top: 10px;
  font-size: 1.8rem;

}

.blyrics-container > div > span.blyrics--romanized {
  font-size: 1.5rem;
  font-style: italic;
}

.blyrics-container > div.blyrics--active > span:not(:empty):not(.blyrics--translated):not(.blyrics--romanized) {
  opacity: 1;
  animation: jump-and-color 2s ease-in-out;
}

@keyframes jump-and-color {
  0% {
    transform: translateY(0);
    color: #8e44ad;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
  50% {
    transform: translateY(-20px);
    color: #e75480;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
  100% {
    transform: translateY(0);
    color: #e79c3c;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
}

@media (max-width: 615px) {
  .blyrics-container {
    font-size: 2rem;
  }

  .blyrics-container > div > span.blyrics--translated {
    font-size: 1.5rem;
  }

  .blyrics-container > div > span.blyrics--romanized {
    font-size: 1.3rem;
  }
}

.blyrics-container:has(.blyrics--active) > div:not(.blyrics--active):not(.blyrics--active ~ div) {
  opacity: 0.33;
  filter: blur(2.5px);
}

.blyrics-container > div.blyrics--active {
  opacity: 1;
  filter: blur(0px);
}

.blyrics-container > div.blyrics--active ~ div {
  opacity: 0.66;
  filter: blur(0px);
}

.blyrics-container > div {
  transition: filter calc(var(--blyrics-duration) / 2),
    opacity calc(var(--blyrics-duration) / 2), transform 0.166s;
}`,
  },
  {
    name: "Even Better Lyrics",
    author: "Noah",
    link: "",
    css: `:root {
  --yt-album-size: 500px;
  --blyrics-hover-scale: 1.02;
  /* Existing root variables... */
}

ytmusic-player-page:not([video-mode]):not([player-fullscreened]):not([blyrics-dfs]):not([player-ui-state="MINIPLAYER"]) #player.ytmusic-player-page {
  max-width: var(--yt-album-size) !important;
  overflow: hidden;
}

.blyrics-container {
  overflow: hidden;
  padding: 10px;
}

.blyrics-container:has(.blyrics--active):not(.blyrics-user-scrolling) > div:not(.blyrics--active):not(.blyrics--active ~ div) {
  opacity: 0.33;
  filter: blur(2.5px);
  transition: filter 0.5s 0.35s, opacity 0.5s 0.35s, transform 0.166s var(--blyrics-anim-delay, 0s) !important;
}

.blyrics-container > div.blyrics--active {
  opacity: 1;
  filter: blur(0px);
}

.blyrics-container > div.blyrics--active ~ div {
  opacity: 0.66;
  filter: blur(0px);
}

.blyrics-container > div {
  transition: filter 0.5s 0s, opacity 0.5s 0s, transform 0.166s var(--blyrics-anim-delay, 0s) !important;
  padding: 5px 0;
  transform-origin: left center;
}

/* Refined hover effect for lyrics */
.blyrics-user-scrolling > div:hover {
  opacity: 1 !important;
  transform: scale(var(--blyrics-hover-scale));
  transition: all 0.3s ease;
}
`,
  },
  {
    name: "Big Blurry Slow Lyrics for TV",
    author: "zobiron",
    link: "",
    css: `.blyrics-container {
  font-family: "Verdana", thick;
  font-size: 7rem;
  font-weight: 700;
  line-height: 1.5;
  background: transparent 0%, rgba(0, 0, 0, 0.013) 5%,
    rgba(255, 235, 205, 0.5) 15%, rgba(0, 0, 0, 0.987) 85%, #000 100%;
  padding: 10px;
  border-radius: 10px;
  overflow: oblique;
  position: relative;
  z-index: 1;
}

.blyrics-container > div > span {
  display: out-block;
  opacity: 0.2;
  transition: opacity 0.7s;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

/* Fix for translated and romanized text */
.blyrics-container > div > span.blyrics--translated,
.blyrics-container > div > span.blyrics--romanized {
  display: block;
  margin-top: 10px;
  font-size: 1.8rem;

}

.blyrics-container > div > span.blyrics--romanized {
  font-size: 1.5rem;
  font-style: italic;
}

.blyrics-container > div.blyrics--active > span:not(:empty):not(.blyrics--translated):not(.blyrics--romanized) {
  opacity: 1;
  animation: jump-and-color 5s sine-out;
}

@keyframes jump-and-color {
  0% {
    transform: translateY(0);
    color: #8e44ad;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
  50% {
    transform: translateY(-60px);
    color: #e75480;
    filter: blur(2px);
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
  100% {
    transform: translateY(0);
    color: #e79c3c;
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
  }
}

@media (max-width: 615px) {
  .blyrics-container {
    font-size: 2rem;
  }

  .blyrics-container > div > span.blyrics--translated {
    font-size: 1.5rem;
  }

  .blyrics-container > div > span.blyrics--romanized {
    font-size: 1.3rem;
  }
}

.blyrics-container:has(.blyrics--active) > div:not(.blyrics--active):not(.blyrics--active ~ div) {
  opacity: 0.33;
  filter: blur(6px);
  transition: filter calc(var(--blyrics-duration) / 3) 0.4s,
    opacity calc(var(--blyrics-duration) / 2) 0.4s, transform 1.166s var(--blyrics-anim-delay, 0s) !important;
}

.blyrics-user-scrolling >  div:not(.blyrics--active) {
  opacity: 1 !important;
  filter: blur(0px) !important; 

}

.blyrics-container > div.blyrics--active {
  opacity: 1;
  filter: blur(0px);
}

.blyrics-container > div.blyrics--active ~ div {
  opacity: 0.33;
  filter: blur(4px);
}

.blyrics-container > div {
  transition: filter calc(var(--blyrics-duration) / 3) 0s,
    opacity calc(var(--blyrics-duration) / 2) 0s, transform 1.166s var(--blyrics-anim-delay, 0s) !important;
}`,
  },
  {
    name: "Even Better Lyrics Plus",
    author: "Noah & BetterLyrics",
    link: "",
    css: `
:root {
  --yt-album-size: 600px;
  --blyrics-hover-scale: 1.02;
  --blyrics-background-color: rgba(0,0,0,0.25);
  --blyrics-font-family: "SF Pro", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --blyrics-font-weight: 600;
}

ytmusic-player-page:not([video-mode]):not([player-fullscreened]):not([blyrics-dfs]):not([player-ui-state="MINIPLAYER"]) #player.ytmusic-player-page {
  max-width: var(--yt-album-size) !important;
  overflow: hidden;
}

.blyrics-container {
  overflow: hidden;
  padding: 10px;
}

.blyrics-container:has(.blyrics--active):not(.blyrics-user-scrolling) > div:not(.blyrics--active):not(.blyrics--active ~ div) {
  opacity: 0.33;
  filter: blur(2.5px);
}

.blyrics-container > div.blyrics--active {
  opacity: 1;
  filter: blur(0px);
}

.blyrics-container > div.blyrics--active ~ div {
  opacity: 0.66;
  filter: blur(0px);
}

.blyrics-container > div {
  transition: filter calc(var(--blyrics-duration) / 3) 0.4s,
    opacity calc(var(--blyrics-duration) / 2) 0.4s, transform 0.166s var(--blyrics-anim-delay, 0s) !important;
  padding: 5px 0;
  transform-origin: left center;
}

/* Refined hover effect for lyrics */
.blyrics-container > div:hover {
  opacity: 1 !important;
  filter: blur(0px) !important;
  transform: scale(var(--blyrics-hover-scale));
  transition: all 0.3s ease;
}

@keyframes scalePulse {
  0% { transform: scale(1.2); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.2); }
}

@keyframes slowRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

ytmusic-player-page:before {
  background: var(--blyrics-background-img);
  background-position: 50% !important;
  background-repeat: no-repeat;
  background-size: cover;
  bottom: 0;
  content: "";
  filter: blur(var(--blyrics-background-blur)) saturate(var(--blyrics-background-saturate));
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform: scale(1.2);
  transform-origin: center center;
  z-index: -100;
  opacity: 0.5;

animation:
    scalePulse 8s ease-in-out infinite,
    slowRotate 30s linear infinite;
  animation-composition: add;
  will-change: transform;
}
`,
  },
];
