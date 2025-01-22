let saveTimeout;
let editor;
let currentThemeName = null;
let isUserTyping = false;
const SAVE_DEBOUNCE_DELAY = 1000;
const VALID_CHANGE_ORIGINS = ["undo", "redo", "cut", "paste", "drag", "+delete", "+input"];

const THEMES = [
	{
		name: "Spotlight",
		author: "BetterLyrics",
		link: "https://twitter.com/boidushya",
		css: `.blyrics-container:has(.blyrics--active) > div:not(.blyrics--active):not(.blyrics--active ~ div) {
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
  transition: filter calc(var(--blyrics-duration) / 2), opacity calc(var(--blyrics-duration) / 2), transform 0.166s;
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
}@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap');

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
  transition: filter calc(var(--blyrics-duration) / 2), opacity calc(var(--blyrics-duration) / 2), transform 0.166s;
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
  transition: filter calc(var(--blyrics-duration) / 3),
    opacity calc(var(--blyrics-duration) / 2), transform 1.166s;
}`
	},
	{
		name: "Even Better Lyrics Plus",
		author: "Noah & BetterLyrics",
		link: "",
		css: `
:root {
  --yt-album-size: 600px;
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
  transition: filter calc(var(--blyrics-duration) / 2), opacity calc(var(--blyrics-duration) / 2), transform 0.166s;
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
  background: linear-gradient(to right, var(--blyrics-background-color), var(--blyrics-background-color)),
    var(--blyrics-background-img);
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

animation:
    scalePulse 8s ease-in-out infinite,
    slowRotate 30s linear infinite;
  animation-composition: add;
  will-change: transform;
}
`
	}
];

const invalidKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Enter", "Tab"];

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const showAlert = message => {
	const status = document.getElementById("status-css");
	status.innerText = message;
	status.classList.add("active");

	setTimeout(() => {
		status.classList.remove("active");
		setTimeout(() => {
			status.innerText = "";
		}, 200);
	}, 2000);
};

const openEditCSS = () => {
	const editCSS = document.getElementById("css");
	const options = document.getElementById("options");

	editCSS.style.display = "block";
	options.style.display = "none";
};

document.getElementById("edit-css-btn").addEventListener("click", openEditCSS);

const openOptions = () => {
	const editCSS = document.getElementById("css");
	const options = document.getElementById("options");

	editCSS.style.display = "none";
	options.style.display = "block";
};

document.getElementById("back-btn").addEventListener("click", openOptions);

document.addEventListener("DOMContentLoaded", function () {
	const syncIndicator = document.getElementById("sync-indicator");

	// Initialize CodeMirror
	editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		lineWrapping: true,
		smartIndent: true,
		lineNumbers: true,
		foldGutter: true,
		autoCloseTags: true,
		matchBrackets: true,
		autoCloseBrackets: true,
		autoRefresh: true,
		mode: "css",
		theme: "seti",
		extraKeys: {
			"Ctrl-Space": "autocomplete",
		},
	});

	editor.refresh();

	editor.setSize(null, 300);

	function saveToStorage(isTheme = false) {
		const css = editor.getValue();
		const themeSelector = document.getElementById("theme-selector");

		if (!isTheme && isUserTyping) {
			// Only remove theme selection if it's not a theme save and the user is typing
			browserAPI.storage.sync.remove("themeName");
			themeSelector.value = "";
			currentThemeName = null;
		}

		browserAPI.storage.sync
			.set({ customCSS: css })
			.then(() => {
				syncIndicator.innerText = "Saved!";
				syncIndicator.classList.add("success");
				setTimeout(() => {
					syncIndicator.style.display = "none";
					syncIndicator.innerText = "Saving...";
					syncIndicator.classList.remove("success");
				}, 1000);

				// Send message to all tabs to update CSS
				try {
					browserAPI.runtime.sendMessage({ action: "updateCSS", css: css }).catch(error => {
						console.log("[BetterLyrics] (Safe to ignore) Error sending message:", error);
					});
				} catch (err) {
					console.log(err);
				}
			})
			.catch(() => {
				syncIndicator.innerText = "Something went wrong!";
				syncIndicator.classList.add("error");
				setTimeout(() => {
					syncIndicator.style.display = "none";
					syncIndicator.innerText = "Saving...";
					syncIndicator.classList.remove("error");
				}, 1000);
			});

		isUserTyping = false;
	}

	function debounceSave() {
		syncIndicator.style.display = "block";
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(saveToStorage, SAVE_DEBOUNCE_DELAY);
	}

	editor.on("change", function (_, changeObj) {
		console.log("cm", changeObj);
		if (VALID_CHANGE_ORIGINS.includes(changeObj.origin)) {
			isUserTyping = true;
			if (currentThemeName !== null) {
				const themeSelector = document.getElementById("theme-selector");
				themeSelector.value = "";
				currentThemeName = null;
				browserAPI.storage.sync.remove("themeName");
			}
		}
		debounceSave();
	});

	// Load saved content
	browserAPI.storage.sync.get("customCSS", function (data) {
		if (data.customCSS) {
			editor.setValue(data.customCSS);
		}
	});

	editor.on("keydown", function (cm, event) {
		const isInvalidKey = invalidKeys.includes(event.key);
		if (!cm.state.completionActive && !isInvalidKey) {
			cm.showHint({ completeSingle: false });
		}
	});

	// Load themes

	const themeSelector = document.getElementById("theme-selector");
	THEMES.forEach((theme, index) => {
		const option = document.createElement("option");
		option.value = index;
		option.textContent = `${theme.name} by ${theme.author}`;
		themeSelector.appendChild(option);
	});

	browserAPI.storage.sync.get(["themeName", "customCSS"], function (data) {
		if (data.themeName) {
			const themeIndex = THEMES.findIndex(theme => theme.name === data.themeName);
			if (themeIndex !== -1) {
				themeSelector.value = themeIndex;
				currentThemeName = data.themeName;
			}
		}
		if (data.customCSS) {
			editor.setValue(data.customCSS);
		}
	});

	// Handle theme selection
	themeSelector.addEventListener("change", function () {
		const selectedTheme = THEMES[this.value];
		if (this.value === "") {
			editor.setValue("");
			saveToStorage();
			browserAPI.storage.sync.remove("themeName");
			currentThemeName = null;
			showAlert("Cleared theme");
			return;
		}

		if (selectedTheme) {
			let themeContent = `/* ${selectedTheme.name}, a theme for BetterLyrics by ${selectedTheme.author} ${selectedTheme.link && `(${selectedTheme.link})`} */

${selectedTheme.css}
`;
			editor.setValue(themeContent);

			browserAPI.storage.sync.set({ themeName: selectedTheme.name });
			currentThemeName = selectedTheme.name;
			isUserTyping = false;
			saveToStorage(true);
			showAlert(`Applied theme: ${selectedTheme.name}`);
		}
	});
});

// Themes

const generateDefaultFilename = () => {
	const date = new Date();
	const timestamp = date.toISOString().replace(/[:.]/g, "-").slice(0, -5);
	return `blyrics-theme-${timestamp}.css`;
};

const saveCSSToFile = (css, defaultFilename) => {
	browserAPI.permissions.contains({ permissions: ["downloads"] }, hasPermission => {
		if (hasPermission) {
			downloadFile(css, defaultFilename);
		} else {
			browserAPI.permissions.request({ permissions: ["downloads"] }, granted => {
				if (granted) {
					downloadFile(css, defaultFilename);
				} else {
					fallbackSaveMethod(css, defaultFilename);
				}
			});
		}
	});
};

const downloadFile = (css, defaultFilename) => {
	const blob = new Blob([css], { type: "text/css" });
	const url = URL.createObjectURL(blob);

	if (browserAPI.downloads) {
		browserAPI.downloads
			.download({
				url: url,
				filename: defaultFilename,
				saveAs: true,
			})
			.then(() => {
				showAlert("CSS file save dialog opened. Choose where to save your file.");
				URL.revokeObjectURL(url);
			})
			.catch(error => {
				console.log(error);
				showAlert("Error saving file. Please try again.");
				URL.revokeObjectURL(url);
			});
	} else {
		fallbackSaveMethod(css, defaultFilename);
	}
};

const fallbackSaveMethod = (css, defaultFilename) => {
	const blob = new Blob([css], { type: "text/css" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = defaultFilename;

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	setTimeout(() => URL.revokeObjectURL(url), 100);

	showAlert("CSS file download initiated. Check your downloads folder.");
};

const loadCSSFromFile = file => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = event => {
			resolve(event.target.result);
		};
		reader.onerror = error => {
			reject(error);
		};
		reader.readAsText(file);
	});
};

document.getElementById("file-import-btn").addEventListener("click", () => {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".css";
	input.onchange = event => {
		const file = event.target.files[0];
		loadCSSFromFile(file)
			.then(css => {
				editor.setValue(css);
				showAlert(`CSS file "${file.name}" imported!`);
			})
			.catch(() => {
				showAlert("Error reading CSS file! Please try again.");
			});
	};
	input.click();
});

document.getElementById("file-export-btn").addEventListener("click", () => {
	const css = editor.getValue();
	if (!css) {
		showAlert("No styles to export!");
		return;
	}
	const defaultFilename = generateDefaultFilename();
	saveCSSToFile(css, defaultFilename);
});
