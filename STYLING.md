# Better Lyrics CSS Documentation for Beginners

## Table of Contents

- [Better Lyrics CSS Documentation for Beginners](#better-lyrics-css-documentation-for-beginners)
	- [Table of Contents](#table-of-contents)
	- [1. Introduction to CSS and Better Lyrics](#1-introduction-to-css-and-better-lyrics)
	- [2. Understanding the CSS Structure](#2-understanding-the-css-structure)
	- [3. Custom Properties (CSS Variables)](#3-custom-properties-css-variables)
		- [Colors](#colors)
		- [Typography](#typography)
		- [Animations](#animations)
		- [Layout](#layout)
		- [Effects](#effects)
		- [Lyric Transition Properties](#lyric-transition-properties)
		- [Gradient Stops](#gradient-stops)
		- [Dynamic Properties](#dynamic-properties)
	- [4. Styling the Main Lyrics Container](#4-styling-the-main-lyrics-container)
	- [5. Styling Individual Lyric Lines](#5-styling-individual-lyric-lines)
		- [Base Structure](#base-structure)
		- [Base Styling for Each Lyric](#base-styling-for-each-lyric)
		- [Activating a Lyric](#activating-a-lyric)
		- [Styling Each Word](#styling-each-word)
		- [Applying the Wobble Animation](#applying-the-wobble-animation)
		- [Implementing the Swipe (Karaoke) Transition](#implementing-the-swipe-karaoke-transition)
			- [Defining Custom Properties](#defining-custom-properties)
			- [The `::after` Pseudo-element](#the-after-pseudo-element)
			- [Pre-animation States](#pre-animation-states)
			- [Final State: Lyric Selection](#final-state-lyric-selection)
	- [6. Creating Animation Effects](#6-creating-animation-effects)
	- [7. Modifying YouTube Music's Layout](#7-modifying-youtube-musics-layout)
		- [Background and Transparency Effects](#background-and-transparency-effects)
		- [Player Bar Styling](#player-bar-styling)
		- [Side Panel Adjustments](#side-panel-adjustments)
	- [8. Handling Loading and Errors](#8-handling-loading-and-errors)
		- [Loading Spinner](#loading-spinner)
		- [Error Messages](#error-messages)
		- [No Lyrics Button](#no-lyrics-button)
	- [9. Making the Design Responsive](#9-making-the-design-responsive)
		- [Large Screens (615px and above)](#large-screens-615px-and-above)
		- [Medium Screens (up to 936px)](#medium-screens-up-to-936px)
		- [Small Screens (up to 615px)](#small-screens-up-to-615px)
	- [10. Implementing Fullscreen Mode](#10-implementing-fullscreen-mode)
	- [11. Supporting Right-to-Left (RTL) Languages](#11-supporting-right-to-left-rtl-languages)
	- [12. Adding a Watermark](#12-adding-a-watermark)
	- [13. Displaying Song Information](#13-displaying-song-information)
	- [14. Footer and Social Elements](#14-footer-and-social-elements)
	- [15. ThemeSong Compatibility](#15-themesong-compatibility)
	- [16. Translated and Romanized Lyrics](#16-translated-and-romanized-lyrics)
	- [17. Autoscroll Resume Button](#17-autoscroll-resume-button)
	- [18. Best Practices for Modifying CSS](#18-best-practices-for-modifying-css)
	- [19. Importing/Exporting Styles](#19-importingexporting-styles)
	- [20. Additional Resources](#20-additional-resources)

## 1. Introduction to CSS and Better Lyrics

CSS (Cascading Style Sheets) is a styling language used to describe the presentation of a document written in HTML or XML. It allows you to control the layout, colors, fonts, and other visual aspects of web pages.

The Better Lyrics CSS files are designed to enhance the lyrics viewing experience on YouTube Music. They modify the appearance of the lyrics display, add animations, and adjust the layout to create a more immersive and user-friendly experience.

The extension lets you modify the CSS in real-time, so you can see the changes immediately.

If you're new to CSS, don't worry! This guide will walk you through the main components of the Better Lyrics CSS and explain how they work.

## 2. Understanding the CSS Structure

The Better Lyrics styling system consists of three main CSS files, each serving a specific purpose:

1. **blyrics.css** - Core lyrics styling, animations, and visual effects
2. **ytmusic.css** - YouTube Music interface modifications and layout adjustments
3. **themesong.css** - Compatibility styles for the ThemeSong browser extension

Each file is organized into logical sections:

1. Global variables (custom properties)
2. Main container styles
3. Individual lyric line styles
4. Animation definitions
5. YouTube Music layout modifications
6. Responsive design rules
7. Special styles for fullscreen mode

Each section uses CSS selectors to target specific HTML elements and apply styles to them.

## 3. Custom Properties (CSS Variables)

At the beginning of `blyrics.css`, you'll see a `:root` selector with custom properties that define the visual theme and behavior of Better Lyrics:

```css
:root {
  --blyrics-ui-text-color: var(--blyrics-text-color, color(display-p3 1 1 1 / 1));
  --blyrics-glow-color: var(--blyrics-highlight-color, color(display-p3 1 1 1 / 0.5));
  --blyrics-font-family: Satoshi, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
  /* ... more variables ... */
}
```

These custom properties allow for easy customization of colors, sizes, and other properties throughout the stylesheet.

### Colors

| Variable                         | Default Value                                                                                                            | Description                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `--blyrics-ui-text-color`        | `color(display-p3 1 1 1 / 1)` (white)                                                                                    | Color of non-lyric UI text           |
| `--blyrics-glow-color`           | `color(display-p3 1 1 1 / 0.5)` (semi-transparent white)                                                                 | Color of glow effect                 |
| `--blyrics-error-color`          | `color(display-p3 0.992 0.882 0.882)` (slightly red off-white)                                                           | Color used in error conditions       |
| `--blyrics-lyric-active-color`   | `color(display-p3 1 1 1 / var(--blyrics-active-opacity, 1))`                                                             | Color of active lyrics               |
| `--blyrics-lyric-inactive-color` | `color(from var(--blyrics-text-color, color(display-p3 1 1 1)) display-p3 r g b / var(--blyrics-inactive-opacity, 0.3))` | Color of inactive lyrics             |
| `--blyrics-footer-bg-color`      | `hsla(0, 0%, 100%, 0.1)`                                                                                                 | Background color for footer elements |
| `--blyrics-footer-border-color`  | `hsla(0, 0%, 100%, 0.1)`                                                                                                 | Border color for footer elements     |
| `--blyrics-footer-text-color`    | `#aaa`                                                                                                                   | Text color in footer                 |
| `--blyrics-footer-link-color`    | `#fff`                                                                                                                   | Link color in footer                 |
| `--blyrics-discord-hover-color`  | `#5865f2` (Discord Blurple)                                                                                              | Hover color for Discord button       |

### Typography

| Variable                          | Default Value                                                                                                                                                        | Description                                                             |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| `--blyrics-font-family`           | `Satoshi, var(--noto-sans-universal), Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif` | Font family for lyrics                                                  |
| `--blyrics-font-size`             | `3rem`                                                                                                                                                               | Font size for lyrics                                                    |
| `--blyrics-font-weight`           | `700`                                                                                                                                                                | Font weight for lyrics                                                  |
| `--blyrics-line-height`           | `1.333`                                                                                                                                                              | Line height for lyrics                                                  |
| `--blyrics-translated-font-size`  | `2rem`                                                                                                                                                               | Font size of translated/romanized lyrics                                |
| `--blyrics-translated-font-weight` | `600`                                                                                                                                                                | Font weight of translated/romanized lyrics                              |
| `--blyrics-translated-font-family` | Inherits `--blyrics-font-family`                                                                                                                                     | Font family of translated/romanized lyrics                              |
| `--blyrics-translated-color`      | `color(display-p3 1 1 1 / var(--blyrics-translated-opacity, 0.6))`                                                                                                   | Color of translated/romanized lyrics                                    |
| `--blyrics-footer-font-family`    | `Roboto, Noto Naskh Arabic UI, Arial, sans-serif`                                                                                                                    | Font family of footer                                                   |
| `--blyrics-footer-font-size`      | `14px`                                                                                                                                                               | Font size of footer                                                     |
| `--blyrics-footer-font-weight`    | `400`                                                                                                                                                                | Font weight of footer                                                   |
| `--noto-sans-universal)`          | Omitted                                                                                                                                                              | A family of NotoSans fonts covering a large majority of langauges used.¹ |

¹You don't want to override this. You should use this in your own font families as a fallback.

### Animations

| Variable                                      | Default Value | Description                                                                                     |
|-----------------------------------------------|---------------|-------------------------------------------------------------------------------------------------|
| `--blyrics-scale-transition-duration`         | `0.166s`      | Transition duration of scale effect                                                             |
| `--blyrics-lyric-highlight-fade-in-duration`  | `0.33s`       | Controls duration of fade in transition                                                         |
| `--blyrics-lyric-highlight-fade-out-duration` | `0.5s`        | Controls duration of fade out transition                                                        |
| `--blyrics-wobble-duration`                   | `1s`          | Controls duration of wobble animation                                                           |
| `--blyrics-timing-offset`                     | `0.115s`      | Offsets lyrics highlighting for synced lyrics (positive values = lyrics highlighted earlier)    |
| `--blyrics-richsync-timing-offset`            | `0.020s`      | Offsets highlighting for richsynced lyrics (positive values = lyrics highlighted earlier)       |
| `--blyrics-scroll-timing-offset`              | `0.5s`        | Offsets the scroll time (positive values = scroll earlier). Applied after other timing offsets. |

### Layout

| Variable                  | Default Value | Description            |
| ------------------------- | ------------- | ---------------------- |
| `--blyrics-padding`       | `2rem`        | Standard padding       |
| `--blyrics-margin`        | `2rem`        | Standard margin        |
| `--blyrics-border-radius` | `1000rem`     | Standard border radius |

### Effects

| Variable                        | Default Value | Description                                                       |
| ------------------------------- | ------------- | ----------------------------------------------------------------- |
| `--blyrics-blur-amount`         | `30px`        | Amount of blur applied to elements for visual effects             |
| `--blyrics-scale`               | `0.95`        | Scale factor applied to inactive elements                         |
| `--blyrics-active-scale`        | `1`           | Scale factor applied to active elements                           |
| `--blyrics-error-opacity`       | `0.33`        | Opacity value used for error messages                             |
| `--blyrics-background-blur`     | `100px`       | Amount of blur applied to background elements for depth           |
| `--blyrics-background-saturate` | `2`           | Saturation multiplier for background elements to enhance vibrancy |

### Lyric Transition Properties

| Variable                                 | Default Value | Description                                     |
| ---------------------------------------- | ------------- | ----------------------------------------------- |
| `--blyrics-lyric-scroll-duration`        | `0.3s`        | Duration for scrolling lyric transitions        |
| `--blyrics-lyric-scroll-timing-function` | `ease`        | Timing function for scrolling lyric transitions |

### Gradient Stops

```css
--blyrics-gradient-stops:
  transparent 0%, rgba(0, 0, 0, 0.013) 8.1%,
  rgba(0, 0, 0, 0.049) 15.5%, rgba(0, 0, 0, 0.104) 22.5%,
  rgba(0, 0, 0, 0.175) 29%, rgba(0, 0, 0, 0.259) 35.3%,
  rgba(0, 0, 0, 0.352) 41.2%, rgba(0, 0, 0, 0.45) 47.1%,
  rgba(0, 0, 0, 0.55) 52.9%, rgba(0, 0, 0, 0.648) 58.8%,
  rgba(0, 0, 0, 0.741) 64.7%, rgba(0, 0, 0, 0.825) 71%,
  rgba(0, 0, 0, 0.896) 77.5%, rgba(0, 0, 0, 0.951) 84.5%,
  rgba(0, 0, 0, 0.987) 91.9%, #000 100%;
```

This variable defines a sophisticated gradient used for creating smooth visual transitions in fullscreen mode.

### Dynamic Properties

`--blyrics-duration` is a special custom property that is set dynamically by the extension's main script. It represents the duration of the current lyric line and is used to ensure that animations are synchronized with the music playback.

To learn more about CSS custom properties, check out the [MDN Web Docs on Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties).

## 4. Styling the Main Lyrics Container

The main container for the lyrics is styled using the `.blyrics-container` class:

```css
.blyrics-container {
  font-family: var(--blyrics-font-family);
  font-size: var(--blyrics-font-size);
  font-weight: var(--blyrics-font-weight);
  isolation: isolate;
  line-height: var(--blyrics-line-height);
  position: relative !important;
  z-index: 1;
  transition: top var(--blyrics-lyric-scroll-duration) var(--blyrics-lyric-scroll-timing-function) 0s;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
```

This sets the overall appearance of the lyrics container, including typography, positioning, and scroll behavior. The `isolation: isolate` property creates a new stacking context to prevent z-index issues with other page elements.

## 5. Styling Individual Lyric Lines

Animating lyrics is a multi-step process involving various classes and properties that work together to ensure smooth, timed transitions even if the browser stutters. When a div or span has an active or animating class, it doesn't necessarily mean it's currently "active" or animating—these classes are applied early, and the code later inserts specific animation/transition delays to trigger effects at the correct time.

### Base Structure

Each lyric is wrapped in a `<div>`, and every word within that lyric is enclosed in a `<span>` inside the div.

### Base Styling for Each Lyric

```css
.blyrics-container > div {
  cursor: pointer;
  padding-bottom: var(--blyrics-padding) !important;
  transform-origin: left center;
  word-break: break-word;
  transform: scale(var(--blyrics-scale));
  transition-property: --dummy, --dummy, transform;
  transition-duration: 0s, 0s, var(--blyrics-scale-transition-duration);
  transition-timing-function: linear, linear, ease;
}
```

- **Inactive Scale**: The element is scaled by `--blyrics-scale` for inactive lyrics
- **Transition Setup**: Properties are defined individually to allow later insertion of transition delays
- **Transform Origin**: Set to `left center` for proper scaling animation

### Activating a Lyric

When a lyric becomes active, the container div gets the `.blyrics--animating` class:

```css
.blyrics-container > div.blyrics--animating {
  transform: scale(var(--blyrics-active-scale));
}
```

This changes the scale to `--blyrics-active-scale`, triggering the transition defined above.

### Styling Each Word

Every word (span) in the lyric has base styles:

```css
.blyrics-container > div > span {
  color: var(--blyrics-lyric-inactive-color);
  display: inline-block;
  white-space: pre;
  transform: translateY(0px);
}
```

- **Color**: Set to inactive color initially
- **Display**: `inline-block` preserves spacing and layout
- **Transform**: `translateY(0px)` prevents layout issues

### Applying the Wobble Animation

When a word is animating, it receives the `.blyrics--animating` class:

```css
.blyrics-container > div > span.blyrics--animating {
  animation: blyrics-wobble var(--blyrics-wobble-duration) forwards ease;
}
```

Each word gets a unique `animation-delay` to control timing.

### Implementing the Swipe (Karaoke) Transition

#### Defining Custom Properties

Two custom properties control the swipe transition:

```css
@property --lyric-transition-amount-start {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}

@property --lyric-transition-amount-end {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
```

#### The `::after` Pseudo-element

The swipe effect uses each word's `::after` pseudo-element:

```css
.blyrics-container > div > span::after {
  position: absolute;
  content: attr(data-content);
  top: -2rem;
  left: -2rem;
  white-space: pre;
  padding: 2rem;
  color: var(--blyrics-lyric-active-color);
  box-sizing: content-box;
  mask-image: linear-gradient(
    90deg,
    #ffffffff calc(100% * var(--lyric-transition-amount-start) - 4rem * var(--lyric-transition-amount-start) + 2rem),
    #ffffff00 calc(100% * var(--lyric-transition-amount-end) - 4rem * var(--lyric-transition-amount-end) + 2rem + 1px)
  );
  mask-mode: alpha;
  width: 100%;
  opacity: 0;
  --lyric-transition-amount-start: -0.2;
  --lyric-transition-amount-end: -0.1;
  transition: --lyric-transition-amount-start 1s linear 1000s, --lyric-transition-amount-end 1s linear 1000s, opacity 0.5s ease;
}
```

This creates an overlay with the active color that's masked to create the swipe effect.

#### Pre-animation States

Before the swipe effect, there's a reset state:

```css
.blyrics-container > div > span.blyrics--pre-animating:not(.blyrics--animating)::after {
  transition: none;
  --lyric-transition-amount-start: -0.2;
  --lyric-transition-amount-end: -0.1;
  opacity: 0;
}

.blyrics-container > div > span.blyrics--pre-animating:not(.blyrics--animating):not(.blyrics-zero-dur-animate)::after {
  opacity: 1;
}
```

The `.blyrics-zero-dur-animate` class handles cases where there's no swipe animation duration.

#### Final State: Lyric Selection

When a lyric is selected:

```css
.blyrics-container > div > span.blyrics--animating::after {
  opacity: 1;
  animation: blyrics-glow max(calc(var(--blyrics-duration) * 1.2), 1.2s) forwards ease;
  animation-delay: inherit;
  --lyric-transition-amount-start: 1.4;
  --lyric-transition-amount-end: 1.5;
  transition-property: --lyric-transition-amount-start, --lyric-transition-amount-end, opacity;
  transition-duration: calc(var(--blyrics-duration) * 1.6), calc(var(--blyrics-duration) * 1.6), var(--blyrics-lyric-highlight-fade-in-duration);
  transition-timing-function: linear, linear, ease;
  transition-delay: inherit;
}
```

This creates the final swipe and glow effects synchronized with the music.

## 6. Creating Animation Effects

The CSS defines several keyframe animations:

```css
@keyframes blyrics-wobble {
  0% {
    transform: scale(1);
  }
  12.5% {
    transform: translateX(0.05em);
    animation-timing-function: ease-in-out;
  }
  75% {
    transform: translateX(0);
  }
  100% {
    transform: scale(1);
    animation-timing-function: ease-out;
  }
}

@keyframes blyrics-glow {
  0% {
    text-shadow: 0 0 1.5rem var(--blyrics-glow-color);
  }
  to {
    text-shadow: 0 0 0 var(--blyrics-glow-color);
  }
}

@keyframes blyrics-spin {
  0% {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(1turn);
  }
}

@keyframes blyrics-pulse {
  0% {
    opacity: 0.33;
  }
  50% {
    opacity: 0.5;
  }
  to {
    opacity: 0.33;
  }
}
```

These animations create:
- **blyrics-wobble**: Subtle movement for active lyrics
- **blyrics-glow**: Glowing effect that fades out
- **blyrics-spin**: Rotating animation for the loading spinner
- **blyrics-pulse**: Pulsing opacity for loading text

## 7. Modifying YouTube Music's Layout

The `ytmusic.css` file contains extensive modifications to YouTube Music's interface to create a more immersive lyrics experience.

### Background and Transparency Effects

```css
ytmusic-player-page:before {
  background: var(--blyrics-background-img);
  background-position: 50% !important;
  background-repeat: no-repeat;
  background-size: cover;
  bottom: 0;
  content: "";
  filter: saturate(var(--blyrics-background-saturate)) brightness(25%) blur(var(--blyrics-background-blur));
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform: scale(1.2);
  z-index: -100;
}
```

This creates a blurred, saturated background image from the album artwork.

### Player Bar Styling

```css
ytmusic-player-bar,
#player-bar-background {
  backdrop-filter: blur(var(--blyrics-blur-amount));
}
```

Applies a blur effect to the player bar for a modern glass-like appearance.

### Side Panel Adjustments

```css
#side-panel {
  min-width: 50%;
}
```

Ensures the lyrics panel has adequate space for comfortable reading.

## 8. Handling Loading and Errors

### Loading Spinner

```css
#blyrics-loader {
  align-items: center;
  display: flex !important;
  gap: 1rem;
  height: 100%;
  justify-content: center;
  opacity: 1;
  position: relative;
  transition: height 0.2s, opacity 0.2s;
}

#blyrics-loader:before {
  animation: blyrics-spin 1s linear infinite;
  background: url(https://better-lyrics.boidu.dev/icon-512.png);
  background-position: 50%;
  background-size: cover;
  content: "";
  display: block;
  height: 3rem;
  margin-top: 3rem;
  width: 3rem;
}

#blyrics-loader:after {
  animation: blyrics-pulse 1.5s infinite;
  color: var(--blyrics-ui-text-color);
  content: "Better Lyrics is searching for lyrics...";
  font-family: var(--blyrics-font-family);
  font-size: 2rem;
  font-weight: 700;
  isolation: isolate;
  line-height: 1;
  opacity: 0.33;
  white-space: pre;
  z-index: 1;
}
```

Creates an animated loading state with the Better Lyrics icon and descriptive text.

### Error Messages

```css
.blyrics--error {
  align-self: flex-start !important;
  color: var(--blyrics-error-color);
  cursor: default;
  font-family: var(--blyrics-font-family);
  font-size: var(--blyrics-font-size);
  font-weight: var(--blyrics-font-weight);
  line-height: 1;
  margin-block: var(--blyrics-margin) !important;
  opacity: var(--blyrics-error-opacity);
  padding-bottom: var(--blyrics-padding) !important;
  padding-top: var(--blyrics-padding) !important;
  word-break: break-word;
}
```

Styles error messages with reduced opacity and a distinct color.

### No Lyrics Button

```css
.blyrics-add-lyrics-button {
  background-color: var(--blyrics-footer-bg-color);
  border: 1px solid var(--blyrics-footer-border-color);
  border-radius: var(--blyrics-border-radius);
  color: var(--blyrics-ui-text-color);
  cursor: pointer;
  font-family: var(--blyrics-font-family);
  font-size: 1.5rem;
  font-weight: 600;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
}

.blyrics-add-lyrics-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
```

Provides an interactive button for when lyrics are not available.

## 9. Making the Design Responsive

The CSS uses media queries to adapt the layout for different screen sizes.

### Large Screens (615px and above)

```css
@media (min-width: 615px) {
  ytmusic-player-page:not([video-mode]):not([player-fullscreened]):not([blyrics-dfs]):not([player-ui-state="MINIPLAYER"]) #player.ytmusic-player-page {
    left: 50%;
    max-width: 400px !important;
    transform: translateX(-50%);
  }
}
```

Centers the player with a maximum width for optimal viewing.

### Medium Screens (up to 936px)

```css
@media (max-width: 936px) {
  ytmusic-player-page:not([is-video-truncation-fix-enabled])[player-fullscreened]:not([blyrics-dfs]) #player.ytmusic-player-page {
    top: 0;
    height: 30rem;
    width: 30rem;
    left: 50%;
    transform: translateX(-50%);
  }
}
```

Adjusts player size and positioning for medium screens.

### Small Screens (up to 615px)

```css
@media (max-width: 615px) {
  .blyrics-container > div {
    margin-inline: 4rem !important;
  }
  
  .blyrics-container:before {
    background: linear-gradient(to right, #030303 4rem, rgba(3, 3, 3, 0.5), #030303 96%), var(--blyrics-background-img) !important;
    background-position: 50% !important;
    background-size: cover !important;
    border-radius: 1rem;
    bottom: 0;
    filter: blur(80px) saturate(2);
    top: 0;
  }
}
```

Adds special background effects and adjusts margins for mobile devices.

## 10. Implementing Fullscreen Mode

The CSS includes comprehensive styles for fullscreen mode:

```css
ytmusic-player-page:not([is-video-truncation-fix-enabled])[player-fullscreened]:not([blyrics-dfs]) #player.ytmusic-player-page {
  height: 40rem;
  width: 40rem;
  top: calc(50% - var(--ytmusic-nav-bar-height));
  left: 20%;
  transform: translate(-50%, -50%);
  mask-image: none !important;
  box-shadow:
    rgba(0, 0, 0, 0.2) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
```

This complex selector targets fullscreen mode specifically and:
- Positions the player optimally
- Adds dramatic shadow effects
- Removes any mask images
- Centers content appropriately

The `[blyrics-dfs]` attribute allows users to disable fullscreen styling if preferred.

## 11. Supporting Right-to-Left (RTL) Languages

```css
#layout[blyrics-rtl-enabled] .blyrics-container > div {
  transform-origin: right center;
}

#layout[blyrics-rtl-enabled] .blyrics-container {
  direction: rtl;
}
```

These rules ensure proper display for RTL languages like Arabic or Hebrew by:
- Changing the text direction to right-to-left
- Adjusting the transform origin for proper scaling animations

## 12. Adding a Watermark

```css
#blyrics-watermark {
  display: none;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  margin-bottom: 0 !important;
  justify-content: center;
  user-select: none;
}

#blyrics-watermark > .blyrics-watermark__container {
  display: flex;
  align-items: center;
  border-radius: var(--blyrics-border-radius);
  padding: 0.25rem;
  padding-right: 0.75rem;
  background-color: rgba(0, 0, 0, 0);
  border: 1px solid rgba(0, 0, 0, 0.02);
  backdrop-filter: brightness(0.66) blur(var(--blyrics-blur-amount));
}
```

The watermark is initially hidden but can be displayed for branding or attribution purposes. It includes a subtle backdrop filter effect.

## 13. Displaying Song Information

```css
#blyrics-song-info > p#blyrics-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

#blyrics-song-info > p#blyrics-artist {
  font-size: 1.5rem;
  margin: 0;
  opacity: 0.5;
  margin-top: 0.25rem;
}
```

These styles create a clean display for song title and artist information, with the artist name appearing more subdued.

## 14. Footer and Social Elements

```css
.blyrics-footer__container {
  align-items: center;
  background-color: var(--blyrics-footer-bg-color);
  border: 1px solid var(--blyrics-footer-border-color);
  border-radius: var(--blyrics-border-radius);
  color: var(--blyrics-footer-text-color);
  cursor: default;
  display: flex;
  font-family: var(--blyrics-footer-font-family);
  font-size: var(--blyrics-footer-font-size);
  font-weight: var(--blyrics-footer-font-weight);
  line-height: var(--ytmusic-body-line-height);
  padding: 0.5rem 1.25rem;
  position: relative;
  white-space: pre;
  width: fit-content;
  z-index: 2;
}

.blyrics-footer__discord {
  background-color: var(--blyrics-footer-bg-color);
  border: 1px solid var(--blyrics-footer-border-color);
  padding: 0.5rem;
  border-radius: var(--blyrics-border-radius);
  display: grid;
  place-items: center;
  transition: background-color 0.2s;
}

.blyrics-footer__discord:hover {
  background-color: var(--blyrics-discord-hover-color);
}
```

Creates styled footer elements including a Discord button with hover effects.

## 15. ThemeSong Compatibility

The `themesong.css` file ensures compatibility with the ThemeSong browser extension:

```css
@supports (selector(:root:has(#ThemeSong-MainContainer))) {
  :root:has(#ThemeSong-MainContainer) {
    #player-page {
      top: 0 !important;
      padding-block: 64px;
    }
    
    [style*="--blyrics-background-img"] {
      --blyrics-background-img: unset !important;
    }
  }
}
```

This CSS feature query detects when ThemeSong is active and adjusts the layout accordingly, including disabling the background image feature to prevent conflicts.

## 16. Translated and Romanized Lyrics

```css
.blyrics--translated,
.blyrics--romanized {
  display: block;
  font-size: var(--blyrics-translated-font-size);
  font-weight: var(--blyrics-translated-font-weight);
  font-family: var(--blyrics-translated-font-family);
  color: var(--blyrics-translated-color);
  white-space: normal;
  line-height: 1.1;
  margin-top: 8px;
}

.blyrics--romanized {
  width: fit-content;
  padding-block: 1rem;
  font-size: calc(var(--blyrics-translated-font-size) / 1.25);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
```

Provides distinct styling for translated lyrics and romanized text, with romanized text getting a subtle background container.

## 17. Autoscroll Resume Button

```css
.autoscroll-resume-button {
  font-family: var(--blyrics-font-family);
  position: absolute;
  display: block;
  font-size: 1.75rem;
  font-weight: 600;
  white-space: normal;
  line-height: 1.1;
  margin-top: 8px;
  width: fit-content;
  padding-block: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: rgba(255, 255, 255, 1);
  left: 50%;
  transform: translate(-50%, 2em);
  backdrop-filter: blur(5px);
  will-change: backdrop-filter;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.15s linear 0.05s, transform 0.2s cubic-bezier(0.5, 1, 0.89, 1), text-shadow 0.25s ease;
}

.autoscroll-resume-button[autoscroll-hidden="true"] {
  transition: opacity 0.1s linear, transform 0.15s ease-in;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -3em);
}
```

Creates an elegant button that appears when autoscroll is paused, with smooth show/hide transitions.

## 18. Best Practices for Modifying CSS

When modifying this CSS:

1. **Start small and test often** - It's easier to fix one small change than many big ones
2. **Use comments** to remind yourself why you made each change
3. **Be careful with structural elements** - You might accidentally break the layout
4. **Follow naming conventions** - Use `blyrics-` prefix for new class names
5. **Understand complex selectors** - Make sure you don't deviate from the original intent
6. **Experiment freely** - Better Lyrics allows extensive customization
7. **Ask for help** - Join the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF) if stuck
8. **Test responsive behavior** - Check your changes on different screen sizes
9. **Consider performance** - Avoid overly complex animations that might cause lag
10. **Have fun** - CSS is about creativity and expression!

## 19. Importing/Exporting Styles

The Better Lyrics extension allows you to import and export custom CSS styles for sharing and backup purposes.

**To export your custom CSS:**
1. Open the Better Lyrics extension
2. Go to the "Edit CSS" section
3. Click "Export to file" button
4. Save the CSS file to your computer

**To import custom CSS:**
1. Open the Better Lyrics extension
2. Go to the "Edit CSS" section
3. Click "Import from file" button
4. Select the CSS file to import
5. The styles will be applied immediately

Share your custom themes with the [Better Lyrics community on Discord](https://discord.gg/UsHE3d5fWF) and get featured in the extension!

## 20. Additional Resources

To learn more about CSS and web development:

- [MDN Web Docs on CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS-Tricks](https://css-tricks.com/)
- [W3Schools CSS Tutorial](https://www.w3schools.com/css/)
- [FreeCodeCamp's Responsive Web Design Certification](https://www.freecodecamp.org/learn/responsive-web-design/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

The best way to learn CSS is through experimentation and practice. Join the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF) for help, inspiration, and to share your creations!