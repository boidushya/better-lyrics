<p align="center">
	<img src="./images/icons/icon-512.png" height="128">
    <h1 align="center">Better Lyrics</h1>
</p>

<p align="center">
	<a aria-label="License" href="https://www.gnu.org/licenses/gpl-3.0.en.html"><img src="https://img.shields.io/badge/license-GPL_v3-blue.svg" alt=""/></a>
	<img src="https://img.shields.io/badge/version-1.1.7-blue.svg" alt=""/>
	<img src="https://img.shields.io/badge/status-active-brightgreen.svg" alt=""/>
	<a aria-label="Volkswagen CI" href="https://github.com/boidushya/better-lyrics"><img src="https://auchenberg.github.io/volkswagen/volkswargen_ci.svg?v=1" alt=""/></a>
</p>

![Banner](https://i.ibb.co/QFHpVfy/Screenshot-2024-06-04-at-22-33-35.png)

## Description

Better Lyrics for Youtube Music upgrades your Youtube Music experience
by providing beautiful time synced lyrics for the currently playing
song.

## Download

<p float="left">
<a href="https://chromewebstore.google.com/detail/better-lyrics/effdbpeggelllpfkjppbokhmmiinhlmg" target="_blank"><img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/HRs9MPufa1J1h5glNhut.png" alt="Chrome Web Store" height="60"/></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/better-lyrics/" target="_blank"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="Firefox Add-ons" height="60"/></a>
</p>

## Features

🎵 Beautiful time-synced lyrics on Youtube Music\
📦 No external dependencies or API key\
⏩ Seek to a specific part of the song by clicking on the lyrics\
🌏 Supports multiple languages\
🪶 Lightweight and easy to use

## Manual Installation

### Chrome

1. Clone this repository or download the ZIP file from the [releases](https://github.com/boidushya/better-lyrics/releases) page.
2. Open Google Chrome and go to `chrome://extensions`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the folder where you cloned/downloaded this repository.
5. The Better Lyrics extension should now be installed and ready to use!

### Firefox

1. Clone this repository or download the ZIP file from the [releases](https://github.com/boidushya/better-lyrics/releases) page.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Copy the contents of `manifest.firefox.json` and paste it in `manifest.json`.
4. Click on "Load Temporary Add-on" and select the `manifest.json` file inside the cloned/downloaded folder.
5. The Better Lyrics extension should now be installed and ready to use!

## Usage

1. Open [YouTube Music](https://music.youtube.com) and start playing a song.
2. Click on the lyrics tab to view the time-synced lyrics. (This might take a few seconds to load)
3. Click on a specific line to seek to that part of the song.

> [!TIP]
> Logs are enabled by default. To disable logs, right-click the extension icon and select "Options" or go to `chrome://extensions` and click on "Details" > "Extension options" under the Better Lyrics extension.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the [GNU GPLv3 License](LICENSE).
