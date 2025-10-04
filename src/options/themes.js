export default [
  {
    name: "Spotlight",
    author: "BetterLyrics",
    link: "https://twitter.com/boidushya",
    css: `:root {
  --blyrics-lyric-active-color: color(display-p3 1 1 1 /1);
  --blyrics-lyric-inactive-color: color(display-p3 1 1 1 /0.2);
}

.blyrics-container:not(.blyrics-user-scrolling) > .blyrics--line:has(~ .blyrics--active):not(.blyrics--active) {
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
  font-family: 'Bricolage Grotesque', var(--noto-sans-universal), sans-serif;
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
  font-family: 'Bricolage Grotesque', var(--noto-sans-universal), sans-serif;
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
    css: `:root {
  --blyrics-lyric-active-color: white;
  --blyrics-lyric-inactive-color: rgb(255 255 255 / 40%);
  --blyrics-font-family: "Verdana", var(--noto-sans-universal), thick;
  --blyrics-font-size: 7rem;
  --blyrics-font-weight: 700;
  --blyrics-line-height: 1.5;
}

.blyrics-container {
  background: transparent 0%, rgba(0, 0, 0, 0.013) 5%,
    rgba(255, 235, 205, 0.5) 15%, rgba(0, 0, 0, 0.987) 85%, #000 100%;
  padding: 10px;
  border-radius: 10px;
  overflow: oblique;
  position: relative;
  z-index: 1;
}

.blyrics-container > div > span {
  display: inline-block;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.blyrics-container > div {
  opacity: 0.2;
  filter: blur(6px);
  /* transition for when we're unhighlighting */
  transition: opacity 0.7s ease-out, 
    filter 0.7s ease-out,
    transform 1.66s ease-out;
}

.blyrics-container > div.blyrics--animating:not(:empty):not(.blyrics--translated):not(.blyrics--romanized) {
  opacity: 1;
  filter: blur(0px);
  transition: opacity 0.7s ease calc(var(--blyrics-anim-delay) - 0.3s), 
    filter 0.7s ease calc(var(--blyrics-anim-delay) - 0.3s),
    transform 1.666s ease calc(var(--blyrics-anim-delay) - 0.3s);
}

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

/* Disable blur and opacity effects when manually scrolling */
.blyrics-user-scrolling >  div:not(.blyrics--animating) {
  opacity: 1 !important;
  filter: blur(0px) !important; 
  transition: opacity 0.4s ease, filter 0.4s ease, transform 0.5s ease calc(var(--blyrics-anim-delay, 0s) - 0.1s);
}

.blyrics-container:not(:has(.blyrics--active)) > div {
  opacity: 1;
  filter: none;
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
  --blyrics-font-family: "SF Pro", var(--noto-sans-universal), system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
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
  {
    name: "Minimal",
    author: "Semicolonhope",
    link: "",
    css: `/* 2025-10-04T13-07-00 v1.3.0 */
/* changed bg, font, albm-art shdw, no animations */
/* cuztomized the portrait-mode lyrics tab thing */

:root {
   /* FONT BABY! */
   --blyrics-font-family: system-ui, sans-serif, var(--noto-sans-universal);
   --blyrics-footer-font-family: var(--blyrics-font-family);

   /* someone said oklach is modern so here ya go */
   --blyrics-lyric-inactive-color: oklch(1 0 0 / 0.3) !important;
   --blyrics-lyric-active-color: oklch(1 0 0 / 1) !important;
   --blyrics-error-color: oklch(from rgb(99.2% 88.2% 88.2%) l c h);
   --blyrics-ui-text-color: var(--blyrics-lyric-active-color);
   --blyrics-translated-color: oklch(1 0 0 / 0.6);

   /* blur and saturatiom changes */
   --blyrics-background-blur: 50px;
   --blyrics-background-saturate: 1.3;

   /* Remove unnecessary delays */
   --blyrics-anim-delay: 0s !important;
   --blyrics-swipe-delay: 0s !important;

   /* no thank you */
   --blyrics-gradient-stops: none !important;

   /* Smooth scroll timing */
   --blyrics-lyric-scroll-duration: 0.5s !important;
   --blyrics-lyric-scroll-timing-function: cubic-bezier(
      0.645,
      0.045,
      0.355,
      1
   ) !important;
}

/* bye bye animations and swipy */
.blyrics-container > div > span::after {
   display: none !important;
   content: none !important;
   animation: none !important;
}

.blyrics-container > div > span.blyrics--animating {
   animation: none !important;
}

/* fade in instead of whatever the hell was that */
/* transition to reomve low opacity letter joint artifacts */
.blyrics-container > div {
   transform: none !important;
   transition: opacity 0.5s ease !important;
   opacity: 0.3;
}

/* active vs inactive color changes. */
/* transition to reomve low opacity letter joint artifacts */
.blyrics-container > div > span {
   color: var(--blyrics-lyric-active-color) !important;
   transition: color 0.5s ease !important;
}

/* you can't rely on previous color setting opacity */
.blyrics-container > div.blyrics--active {
   opacity: 1;
}

/* Inactive state translated/roman color, and color fade-in */
/* don't treat letters, treat em as whole */
.blyrics--translated,
.blyrics--romanized {
   opacity: 0.6 !important;
   color: oklch(1 0 0 / var(--blyrics-translated-opacity)) !important;
   transition: opacity 0.5s ease !important;
}

/* active translation / romanization */
.blyrics-container > div.blyrics--active .blyrics--translated,
.blyrics-container > div.blyrics--active .blyrics--romanized {
   opacity: 0.6 !important;
   transition: opacity 0.5s ease !important;
}

/* black blur from background go away */
ytmusic-player-page:before {
   position: fixed !important;
   top: -18% !important;
   left: -5% !important;
   width: 100vw !important;
   height: 100vh !important;
   filter: saturate(var(--blyrics-background-saturate)) brightness(0.3)
      blur(var(--blyrics-background-blur));
}

/* album shadow, SIMMER DOWN */
#player.ytmusic-player-page {
   box-shadow: oklch(0.18 0 0 / 0.1) 0 4px 12px !important;
   border-radius: 8px !important;
}

ytmusic-player-page[player-fullscreened] .song-media-controls.ytmusic-player {
   background-image: none !important;
}

@media (max-width: 615px) {
   ytmusic-player-page:before {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      filter: saturate(var(--blyrics-background-saturate)) brightness(0.7)
         blur(var(--blyrics-background-blur));
   }

   [page-type="MUSIC_PAGE_TYPE_TRACK_LYRICS"],
   .blyrics-container:before,
   .blyrics-container,
   .blyrics-container:after {
      background: none !important;
      filter: none !important;
   }

   #tab-renderer::before {
      content: "";
      position: fixed;
      z-index: -100;
      background: var(--blyrics-background-img) !important;
      background-position: center !important;
      top: 0;
      top: 0;
      left: -6%;
      /*  background-attachment: fixed !important; */
      width: 110% !important;
      height: 100% !important;
      background-repeat: no-repeat !important;
      background-size: cover !important;
      filter: saturate(var(--blyrics-background-saturate)) brightness(0.3)
         blur(var(--blyrics-background-blur)) !important;
   }
}`,
  },
  {
    name: "Luxurious Glass",
    author: "SKMJi",
    link: "",
    css: `/* ============================================== */
/* Global Theme Custom Properties */
/* ============================================== */
:root {
  /* -- [ Layout & Spacing ] -- */
  --blyrics-padding: 3rem;
  --yt-cover-size: 650px;
  --side-panel-width: 55%;
  --main-lyrics-align: center; /* center left right */
  --translated-romanized-margin: 0 auto; /* (center= 0 auto), (left= 0 auto 0 0 ), (right= 0 0 0 auto )*/
  --underline-horizontal-position: 50%; /* center= 50% , left= 25% , right= 75%*/


  /* -- [ Typography ] -- */
  --blyrics-font-size: 6.5rem;
  --blyrics-font-weight: 500;
  --blyrics-translated-font-size: 2.5rem;
  --blyrics-translated-font-weight: 450;

  /* -- [ Glassmorphism & Effects ] -- */
  --blyrics-bg-color: rgba(0, 0, 0, 0.25);
  --blyrics-border-radius: 18px;
  --blyrics-box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 255, 255, 0.12) inset;
  --blyrics-blur-amount: 20px;
  --blyrics-background-filter: blur(70px) saturate(3) brightness(70%);
}

/* ============================================== */
/* YouTube Music Interface Styling */
/* ============================================== */

/* Player Bar & Navigation Bar - Glass Effect */
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #player-bar-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #mini-guide-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #nav-bar-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #guide-wrapper {
  backdrop-filter: blur(var(--blyrics-blur-amount)) !important;
  border: none !important;
  border-radius: 0px !important;
}

/* Remove default player bar styles */
ytmusic-player-bar,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] ytmusic-player-bar {
  backdrop-filter: transparent !important;
  background-color: transparent !important;
  border: transparent !important;
  border-radius: 0px !important;
}

/* Side Panel & Menus - Glass Effect */
#side-panel {
  backdrop-filter: blur(var(--blyrics-blur-amount)) !important;
  background-color: var(--blyrics-bg-color) !important;
  border: none !important;
  border-radius: var(--blyrics-border-radius) !important;
  box-shadow: var(--blyrics-box-shadow) !important;
  min-width: var(--side-panel-width) !important;
}
tp-yt-paper-listbox, .ytmusicMultiPageMenuRendererHost {
  backdrop-filter: blur(var(--blyrics-blur-amount)) !important;
  background-color: var(--blyrics-bg-color) !important;
  border-radius: var(--blyrics-border-radius) !important;
}
ytmusic-search-box[is-bauhaus-sidenav-enabled] #suggestion-list.ytmusic-search-box, ytmusic-search-box[is-bauhaus-sidenav-enabled][opened] .search-box.ytmusic-search-box {
  --ytmusic-search-background: transparent !important;
  background: rgb(33 33 33 / 95%) !important;
  box-shadow: var(--blyrics-box-shadow);
}
ytmusic-search-suggestion {
  color: rgb(255 255 255 / 90%);
}

/* Stylized Album Cover */
ytmusic-player-page:not([video-mode]):not([player-fullscreened]):not([blyrics-dfs]):not([player-ui-state="MINIPLAYER"]) #player.ytmusic-player-page, ytmusic-player[player-ui-state=FULLSCREEN], ytmusic-player, ytmusic-player[player-ui-state=FULLSCREEN] {
  max-width: var(--yt-cover-size) !important;
  overflow: hidden;
  border-radius: var(--blyrics-border-radius) !important;
  box-shadow: var(--blyrics-box-shadow) !important;
}

/* Background Effect & Animations */
ytmusic-player-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: var(--blyrics-background-filter);
  transform: scale(1.3);
  animation: slowRotate 15s linear infinite, scalePulse 8s ease-in-out infinite;
  animation-composition: add;
  will-change: transform;
}

/* Animated Background Effect - Keyframes */
@keyframes slowRotate {
  from { transform: scale(1.7) rotate(0deg); }
  to { transform: scale(1.7) rotate(360deg); }
}
@keyframes scalePulse {
  0% { transform: scale(1.2); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.2); }
}

/* ============================================== */
/* Lyrics Display and Interaction */
/* ============================================== */

/* Main Lyrics Container */
.blyrics-container {
  text-align: var(--main-lyrics-align);
  overflow: hidden;
  padding: var(--blyrics-padding);
  padding-bottom: 0;
}

/* Fix Translated & Romanized Lyrics Position */
.blyrics--romanized, .blyrics-container > div > span.blyrics--translated {
  margin: var(--translated-romanized-margin) !important;
}
.blyrics--translated {
  margin-top: 30px !important;
}

/* Underline effect for active lyrics */
.blyrics-container > div::after {
  content: '';
  position: absolute;
  left: var(--underline-horizontal-position);
  bottom: 10px;
  height: 2px;
  width: 50%;
  transform: translateX(-50%) scaleX(0);
  transform-origin: var(--main-lyrics-align);
  background: linear-gradient(
    90deg,
    transparent,
    hsla(0, 0%, 100%, 0.2),
    hsla(0, 0%, 100%, 0.4),
    hsla(0, 0%, 100%, 0.2),
    transparent
  );
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.05), 0 0 10px rgba(255, 255, 255, 0.02);
  transition: transform 0.5s cubic-bezier(0.86, 0, 0.07, 1);
}
.blyrics-container > div.blyrics--active::after {
  transform: translateX(-50%) scaleX(1);
  backdrop-filter: blur(2px);
}

/* Hover effect for lyrics */
.blyrics-container > div {
  transform-origin: var(--main-lyrics-align);
  opacity: 1 !important;
  filter: blur(0px) !important;
  transform: scale(1.007);
  transition: all 0.3s ease;
}

/* Footer Edit */
.blyrics-footer, .blyrics-no-lyrics-button-container {
  justify-content: var(--main-lyrics-align) !important;
}`,
  },
];
