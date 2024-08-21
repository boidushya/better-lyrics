# Better Lyrics CSS Documentation for Beginners

## Table of Contents

- [Better Lyrics CSS Documentation for Beginners](#better-lyrics-css-documentation-for-beginners)
	- [Table of Contents](#table-of-contents)
	- [1. Introduction to CSS and Better Lyrics](#1-introduction-to-css-and-better-lyrics)
	- [2. Understanding the CSS Structure](#2-understanding-the-css-structure)
	- [3. Custom Properties (CSS Variables)](#3-custom-properties-css-variables)
	- [4. Styling the Main Lyrics Container](#4-styling-the-main-lyrics-container)
	- [5. Styling Individual Lyric Lines](#5-styling-individual-lyric-lines)
	- [6. Creating Animation Effects](#6-creating-animation-effects)
	- [7. Modifying YouTube Music's Layout](#7-modifying-youtube-musics-layout)
	- [8. Handling Loading and Errors](#8-handling-loading-and-errors)
	- [9. Making the Design Responsive](#9-making-the-design-responsive)
	- [10. Implementing Fullscreen Mode](#10-implementing-fullscreen-mode)
	- [11. Supporting Right-to-Left (RTL) Languages](#11-supporting-right-to-left-rtl-languages)
	- [12. Adding a Watermark](#12-adding-a-watermark)
	- [13. Displaying Song Information](#13-displaying-song-information)
	- [14. Best Practices for Modifying CSS](#14-best-practices-for-modifying-css)
	- [15. Importing/Exporting Styles](#15-importingexporting-styles)
	- [16. Additional Resources](#16-additional-resources)

## 1. Introduction to CSS and Better Lyrics

CSS (Cascading Style Sheets) is a styling language used to describe the presentation of a document written in HTML or XML. It allows you to control the layout, colors, fonts, and other visual aspects of web pages.

The Better Lyrics CSS file is designed to enhance the lyrics viewing experience on YouTube Music. It modifies the appearance of the lyrics display, adds animations, and adjusts the layout to create a more immersive and user-friendly experience.

The extension let's you modify the CSS in real-time, so you can see the changes immediately.

If you're new to CSS, don't worry! This guide will walk you through the main components of the Better Lyrics CSS and explain how they work.

## 2. Understanding the CSS Structure

[The CSS file](https://github.com/boidushya/better-lyrics/blob/master/src/index.css) is organized into several sections, each controlling different aspects of the lyrics display. Here's a brief overview:

1. Global variables (custom properties)
2. Main container styles
3. Individual lyric line styles
4. Animation definitions
5. YouTube Music layout modifications
6. Responsive design rules
7. Special styles for fullscreen mode

Each section uses CSS selectors to target specific HTML elements and apply styles to them.

## 3. Custom Properties (CSS Variables)

At the beginning of the file, you'll see a `:root` selector with custom properties:

```css
:root {
  --blyrics-text-color: #fff;
  --blyrics-background-color: rgba(0, 0, 0, 0.75);
  --blyrics-highlight-color: rgba(255, 255, 255, 0.5);
  /* ... more variables ... */
}
```

These define CSS custom properties (also known as CSS variables) used throughout the stylesheet. They allow for easy customization of colors, sizes, and other properties.

| Variable                           | Default Value                                                                                                                            | Description                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `--blyrics-text-color`             | `#fff`                                                                                                                                   | Main text color for lyrics                    |
| `--blyrics-background-color`       | `rgba(0, 0, 0, 0.75)`                                                                                                                    | Background color for the lyrics container     |
| `--blyrics-highlight-color`        | `rgba(255, 255, 255, 0.5)`                                                                                                               | Color used for highlighting active lyrics     |
| `--blyrics-error-color`            | `#fee2e2`                                                                                                                                | Color used for error messages                 |
| `--blyrics-footer-bg-color`        | `hsla(0, 0%, 100%, 0.1)`                                                                                                                 | Background color for the footer               |
| `--blyrics-footer-border-color`    | `hsla(0, 0%, 100%, 0.1)`                                                                                                                 | Border color for the footer                   |
| `--blyrics-footer-text-color`      | `#aaa`                                                                                                                                   | Text color for the footer                     |
| `--blyrics-footer-link-color`      | `#fff`                                                                                                                                   | Color for links in the footer                 |
| `--blyrics-discord-hover-color`    | `#5865F2`                                                                                                                                | Hover color for the Discord button            |
| `--blyrics-font-family`            | `Satoshi, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif` | Main font family for lyrics                   |
| `--blyrics-font-size`              | `3rem`                                                                                                                                   | Font size for lyrics                          |
| `--blyrics-font-weight`            | `700`                                                                                                                                    | Font weight for lyrics                        |
| `--blyrics-line-height`            | `1.333`                                                                                                                                  | Line height for lyrics                        |
| `--blyrics-translated-font-size`   | `2rem`                                                                                                                                   | Font size for translated lyrics               |
| `--blyrics-translated-font-weight` | `600`                                                                                                                                    | Font weight for translated lyrics             |
| `--blyrics-footer-font-family`     | `Roboto, Noto Naskh Arabic UI, Arial, sans-serif`                                                                                        | Font family for the footer                    |
| `--blyrics-footer-font-size`       | `14px`                                                                                                                                   | Font size for the footer                      |
| `--blyrics-footer-font-weight`     | `400`                                                                                                                                    | Font weight for the footer                    |
| `--blyrics-transition-duration`    | `0.166s`                                                                                                                                 | Duration for general transitions              |
| `--blyrics-opacity-transition`     | `0.33s`                                                                                                                                  | Duration for opacity transitions              |
| `--blyrics-glow-duration`          | `var(--blyrics-duration, 2s)`                                                                                                            | Duration for the glow animation               |
| `--blyrics-wobble-duration`        | `calc(var(--blyrics-duration, 2s) / 2)`                                                                                                  | Duration for the wobble animation             |
| `--blyrics-padding`                | `2rem`                                                                                                                                   | Padding for lyrics container                  |
| `--blyrics-margin`                 | `2rem`                                                                                                                                   | Margin for lyrics container                   |
| `--blyrics-border-radius`          | `1000rem`                                                                                                                                | Border radius for rounded elements            |
| `--blyrics-blur-amount`            | `30px`                                                                                                                                   | Amount of blur for various effects            |
| `--blyrics-scale`                  | `0.95`                                                                                                                                   | Scale factor for inactive lyrics              |
| `--blyrics-active-scale`           | `1`                                                                                                                                      | Scale factor for active lyrics                |
| `--blyrics-inactive-opacity`       | `0.33`                                                                                                                                   | Opacity for inactive lyrics                   |
| `--blyrics-active-opacity`         | `1`                                                                                                                                      | Opacity for active lyrics                     |
| `--blyrics-translated-opacity`     | `0.6`                                                                                                                                    | Opacity for translated lyrics                 |
| `--blyrics-error-opacity`          | `0.33`                                                                                                                                   | Opacity for error messages                    |
| `--blyrics-background-blur`        | `100px`                                                                                                                                  | Blur amount for background elements           |
| `--blyrics-background-saturate`    | `2`                                                                                                                                      | Saturation level for background elements      |
| `--blyrics-gradient-stops`         | Complex gradient (see [file](https://github.com/boidushya/better-lyrics/blob/master/src/index.css))                                      | Gradient stops for various background effects |

`--blyrics-duration` is a special custom property that is set dynamically by the extension's main script. It's used to ensure that animations are in sync with the music playback. Learn more about this [here](#5-styling-individual-lyric-lines).

To learn more about CSS custom properties, check out the [MDN Web Docs on Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties).

## 4. Styling the Main Lyrics Container

The main container for the lyrics is styled using the `.blyrics-container` class:

```css
.blyrics-container {
  font-family: var(--blyrics-font-family);
  font-size: var(--blyrics-font-size);
  font-weight: var(--blyrics-font-weight);
  line-height: var(--blyrics-line-height);
  position: relative !important;
  z-index: 1;
}
```

This sets the overall appearance of the lyrics container. You can modify these properties to change the font, size, or positioning of the lyrics.

## 5. Styling Individual Lyric Lines

Each line of lyrics is a `<div>` inside the main container, with individual words wrapped in `<span>` elements:

```css
.blyrics-container > div {
  cursor: pointer;
  padding-bottom: var(--blyrics-padding) !important;
  transform: scale(var(--blyrics-scale));
  transition: transform var(--blyrics-transition-duration);
}

.blyrics-container > div > span {
  opacity: var(--blyrics-inactive-opacity);
  transition: opacity var(--blyrics-opacity-transition);
}
```

The active line has additional styles:

```css
.blyrics-container > div.blyrics--active {
  transform: scale(var(--blyrics-active-scale));
}

.blyrics-container > div.blyrics--active > span:not(:empty):not(.blyrics--translated) {
  opacity: var(--blyrics-active-opacity);
  animation: blyrics-glow var(--blyrics-glow-duration) forwards,
             blyrics-wobble var(--blyrics-wobble-duration) forwards;
}
```

This makes the active line full-sized and fully opaque, and applies animations to make it stand out. The animations are applied to each word (span) individually, creating a dynamic effect as the lyrics are sung.

Understanding this structure (lines as divs, words as spans) is crucial if you want to modify the lyrics display. For example, if you wanted to create a karaoke-style effect where words light up one by one, you would focus on styling the individual spans within the active line.

The `--blyrics-duration` custom property is used to control the duration of the animations. It is defined in the extension's main javascript file and should not be modified here since it's critical for the animations to "sync" or give the illusion of syncing with the music. However, if you want to experiment with different durations, you can adjust/replace this property.

## 6. Creating Animation Effects

The CSS defines two main animations: `blyrics-wobble` and `blyrics-glow`:

```css
@keyframes blyrics-wobble {
  from { transform: translateY(0px); }
  33.33% { transform: translateY(1.75px); }
  66.66% { transform: translateY(-1.75px); }
  to { transform: translateY(0px); }
}

@keyframes blyrics-glow {
  0% { text-shadow: 0 0 1.5rem var(--blyrics-highlight-color); }
  to { text-shadow: 0 0 0 var(--blyrics-highlight-color); }
}
```

These animations create subtle movement and glowing effects for the active lyrics.

To learn more about CSS animations, check out the [MDN Web Docs on CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations).

## 7. Modifying YouTube Music's Layout

The CSS includes rules that modify the existing YouTube Music interface:

```css
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #mini-guide-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #nav-bar-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #guide-wrapper {
  background-color: transparent !important;
  border-color: transparent !important;
}
```

This rule makes certain elements transparent when the player page is open, allowing the lyrics to be more prominent. Since the Custom CSS you write is injected into the page, you can override pretty much any style relevant to YouTube Music.

The CSS also adds a custom background to the player page:

```css
ytmusic-player-page:before {
  background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.75),
      rgba(0, 0, 0, 0.75)
    ),
    var(--blyrics-background-img);
  /* ... more properties ... */
}
```

This creates a gradient overlay on top of a background image for a more immersive experience and better readability of the lyrics.

## 8. Handling Loading and Errors

Styles for loading spinners and error messages are included:

```css
#blyrics-loader {
  /* ... loader styles ... */
}

.blyrics--error {
  /* ... error message styles ... */
}
```

These ensure users receive visual feedback during loading or if an error occurs.

## 9. Making the Design Responsive

Media queries are used to adjust the layout for different screen sizes:

```css
@media (min-width: 615px) {
  /* ... styles for larger screens ... */
}

@media (max-width: 615px) {
  /* ... styles for smaller screens ... */
}
```

Media queries allow you to apply different styles based on the device's screen size, ensuring that the lyrics display looks good on all devices.

To learn more about responsive design with CSS, check out the [MDN Web Docs on Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design).

## 10. Implementing Fullscreen Mode


The CSS includes special styles for when the player is in fullscreen mode:

```css
ytmusic-player-page:not([is-video-truncation-fix-enabled])[player-fullscreened]:not([blyrics-dfs]) #player.ytmusic-player-page {
  height: 40rem;
  width: 40rem;
  top: calc(50% - var(--ytmusic-nav-bar-height));
  left: 20%;
  transform: translate(-50%, -50%);
  /* ... more styles ... */
}
```

The CSS includes special styles for when the player is in fullscreen mode. This might look overwhelming at first, but let's break down the selector:

```css
ytmusic-player-page:not([is-video-truncation-fix-enabled])[player-fullscreened]:not([blyrics-dfs]) #player.ytmusic-player-page {
  /* styles for fullscreen mode */
}
```

Let's dissect this complex selector:

1. `ytmusic-player-page`: This targets the main element that represents the player page in YouTube Music.

2. `:not([is-video-truncation-fix-enabled])`: This pseudo-class excludes player pages that have a specific video truncation fix enabled. This refers to a YouTube Music feature that adjusts video display in certain conditions.

3. `[player-fullscreened]`: This attribute selector targets the player when it's in fullscreen mode. It's applied by YouTube Music when the user activates fullscreen viewing.

4. `:not([blyrics-dfs])`: This pseudo-class excludes players that have the `blyrics-dfs` attribute. The `blyrics-dfs` attribute is applied if the user has selected a setting to disable fullscreen mode in Better Lyrics. This allows users to opt out of the custom fullscreen styling if they prefer.

5. `#player.ytmusic-player-page`: This targets an element with the ID `player` and the class `ytmusic-player-page`. This is likely the specific container for the player content within the page.

By combining all these selectors, the CSS rule becomes very specific. It will only apply to the player when:

- It's on the main player page
- The video truncation fix is not enabled
- The player is in fullscreen mode
- The user hasn't disabled Better Lyrics fullscreen styling
- It's targeting the main player container

This level of specificity ensures that the custom fullscreen styles are only applied in the exact intended scenario, preventing unintended styling in other situations.

When you're modifying or building upon these styles, pay attention to these selectors. If your changes aren't being applied, check if all these conditions are met. You might need to adjust the selectors if you want your styles to apply in different scenarios.

These styles adjust the layout and positioning of elements when in fullscreen mode to provide an optimal viewing experience.

## 11. Supporting Right-to-Left (RTL) Languages

The CSS includes support for right-to-left languages:

```css
#layout[blyrics-rtl-enabled] .blyrics-container {
  direction: rtl;
}

#layout[blyrics-rtl-enabled] .blyrics-container > div {
  transform-origin: right center;
}
```

These rules change the text direction and adjust the transform origin for RTL languages, ensuring proper display for languages such as Arabic or Hebrew. The backend script will add the `blyrics-rtl-enabled` attribute to the layout when the user selects an RTL language.

## 12. Adding a Watermark

Styles for a watermark are included, though it's initially hidden:

```css
#blyrics-watermark {
  display: none;
  /* ... more styles ... */
}
```

This can be used to add branding or attribution to the lyrics display.

## 13. Displaying Song Information

Styles for displaying song information (title and artist) are included:

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

These styles allow for the display of song information alongside the lyrics.

## 14. Best Practices for Modifying CSS

When modifying this CSS:

1. Start small and test often. It's easier to fix one small change than a hundred big ones!
1. Use comments to remind yourself why you made each change.
1. Be careful when changing structural elements - you might accidentally move the whole stage!
1. Try to stick to the existing naming style (like using `blyrics-` at the start of new class names).
1. When modifying complex selectors, make sure you don't deviate too far from the original intent.
1. Better Lyrics let's you modify pretty much everything, so don't be afraid to experiment!
1. If you're stuck or need help, feel free to ask in the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF).
1. Most importantly, have fun! CSS is all about creativity and expression.

## 15. Importing/Exporting Styles

<img width="597" alt="image" src="https://github.com/user-attachments/assets/4bd6aa35-f54a-46b0-8412-3c3973b96c2c">

The Better Lyrics extension allows you to import and export custom CSS styles. This feature is useful for sharing your custom styles with others or backing up your settings.

To export your custom CSS:

1. Open the Better Lyrics extension.
2. Go to the "Edit CSS" section.
3. Click on the "Export to file" button.
   1. This will open a file save dialog where you can save the CSS to a file on your computer.
   2. You can import this file back into the extension later.

To import custom CSS:

1. Open the Better Lyrics extension.
2. Go to the "Edit CSS" section.
3. Click on the "Import from file" button.
   1. This will open a file selection dialog where you can choose the CSS file to import.
   2. The extension will apply the imported styles immediately.

Right now, the extension only supports importing and exporting CSS styles. In future versions, I might add a theme system or other features to make it easier to share and manage custom styles.
In the meantime, feel free to share your custom styles with the [Better Lyrics community on Discord](https://discord.gg/UsHE3d5fWF)!

## 16. Additional Resources

To learn more about CSS and web development, check out these resources:

- [MDN Web Docs on CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS-Tricks](https://css-tricks.com/)
- [W3Schools CSS Tutorial](https://www.w3schools.com/css/)
- [FreeCodeCamp's Responsive Web Design Certification](https://www.freecodecamp.org/learn/responsive-web-design/)

Remember, the best way to learn CSS is by experimenting and practicing. If you're stuck or have questions, feel free to reach out to the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF) for help and guidance!
