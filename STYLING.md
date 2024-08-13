# Better Lyrics CSS Documentation for Beginners

## Table of Contents

- [Better Lyrics CSS Documentation for Beginners](#better-lyrics-css-documentation-for-beginners)
	- [Table of Contents](#table-of-contents)
	- [1. Introduction to CSS and Better Lyrics](#1-introduction-to-css-and-better-lyrics)
	- [2. Understanding the CSS Structure](#2-understanding-the-css-structure)
	- [3. Custom Properties (CSS Variables)](#3-custom-properties-css-variables)
	- [4. Styling the Main Lyrics Container](#4-styling-the-main-lyrics-container)
	- [5. Styling Individual Lyrics Lines](#5-styling-individual-lyrics-lines)
	- [6. Creating Animation Effects](#6-creating-animation-effects)
	- [7. Modifying YouTube Music's Layout](#7-modifying-youtube-musics-layout)
	- [8. Handling Loading and Errors](#8-handling-loading-and-errors)
	- [9. Making the Design Responsive](#9-making-the-design-responsive)
	- [10. Implementing Fullscreen Mode](#10-implementing-fullscreen-mode)
	- [11. Supporting Right-to-Left (RTL) Languages](#11-supporting-right-to-left-rtl-languages)
	- [12. Adding a Watermark](#12-adding-a-watermark)
	- [13. Displaying Song Information](#13-displaying-song-information)
	- [14. Best Practices for Modifying This CSS](#14-best-practices-for-modifying-this-css)
	- [15. Additional Resources](#15-additional-resources)

## 1. Introduction to CSS and Better Lyrics

CSS (Cascading Style Sheets) is a styling language used to describe the presentation of a document written in HTML or XML. It allows you to control the layout, colors, fonts, and other visual aspects of web pages.

The Better Lyrics CSS file is designed to enhance the lyrics viewing experience on YouTube Music. It modifies the appearance of the lyrics display, adds animations, and adjusts the layout to create a more immersive and user-friendly experience.

If you're new to CSS, don't worry! This guide will walk you through the main components of the Better Lyrics CSS and explain how they work.

## 2. Understanding the CSS Structure

The [CSS file](https://github.com/boidushya/better-lyrics/blob/feat/css/src/index.css) is organized into several sections, each controlling different aspects of the lyrics display. Here's a brief overview of what you'll find:

1. Global variables (custom properties)
2. Main container styles
3. Individual lyrics line styles
4. Animation definitions
5. YouTube Music layout modifications
6. Responsive design rules
7. Special styles for fullscreen mode

Each section uses CSS selectors to target specific HTML elements and apply styles to them. For example, `.blyrics-container` targets an element with the class "blyrics-container".

## 3. Custom Properties (CSS Variables)

At the beginning of the file, you'll see a `:root` selector with a custom property:

```css
:root {
  --blyrics-gradient-stops: transparent 0%, rgba(0, 0, 0, 0.013) 8.1%,
    /* ... more gradient stops ... */
    rgba(0, 0, 0, 0.987) 91.9%, #000 100%;
}
```

This defines a CSS custom property (also known as a CSS variable) called `--blyrics-gradient-stops`. It's used to create a consistent gradient effect throughout the design. Custom properties allow you to define reusable values that can be used in multiple places in your CSS.

To learn more about CSS custom properties, check out the [MDN Web Docs on Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties).

## 4. Styling the Main Lyrics Container

The main container for the lyrics is styled using the `.blyrics-container` class:

```css
.blyrics-container {
  font-family: Satoshi, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI,
    Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
  font-size: 3rem;
  font-weight: 700;
  isolation: isolate;
  line-height: 1.333;
  position: relative !important;
  z-index: 1;
}
```

Let's break down what each property does:

- `font-family`: Sets the typeface for the text. It provides a list of fonts, using the first available one on the user's system.
- `font-size`: Sets the size of the text to 3rem (relative to the root element's font size).
- `font-weight`: Sets the thickness of the text (700 is bold).
- `isolation`: Creates a new stacking context, which can help with layering elements.
- `line-height`: Sets the height of each line of text (1.333 times the font size).
- `position: relative`: Allows positioning of child elements relative to this container.
- `z-index: 1`: Sets the stacking order of the container.

The font is set to a custom font called "Satoshi" which is injected by the extension. If the font is not available, the browser will fall back to the other fonts listed. Due to limitations of browser extensions, the font must be injected by the extension and cannot be imported directly in the CSS via `@import url()`. If you want to use a different font, you can replace "Satoshi" with a web-safe font or a default system font. In future versions, Better Lyrics may provide more flexibility in font selection.

To learn more about these properties, visit the [MDN Web Docs on CSS](https://developer.mozilla.org/en-US/docs/Web/CSS).

## 5. Styling Individual Lyrics Lines

Each line of lyrics is wrapped in a `<div>` inside the main container. These lines are styled as follows:

```css
.blyrics-container > div {
  cursor: pointer;
  padding-bottom: 2rem !important;
  transform-origin: left center;
  word-break: break-word;
  transform: scale(0.95);
  transition: transform 0.166s;
}
```

This styling does several things:

- Makes the cursor change to a pointer when hovering over a line
- Adds padding below each line
- Sets the origin point for transformations
- Allows long words to break and wrap
- Slightly reduces the size of each line (to 95% of its original size)
- Adds a smooth transition effect when the size changes

The currently active line (the one being sung) has additional styling:

```css
.blyrics-container > div.blyrics--active {
  transform: scale(1);
}

.blyrics-container > div.blyrics--active > span:not(:empty):not(.blyrics--translated) {
  cursor: default;
  opacity: 1;
  animation: blyrics-glow var(--blyrics-duration) forwards, blyrics-wobble calc(var(--blyrics-duration) / 2) forwards;
}
```

The `--blyrics-duration` custom property is used to control the duration of the animations. It is defined in the extension's main javascript file and should not be modified here since it's critical for the animations to "sync" or give the illusion of syncing with the music. However, if you want to experiment with different durations, you can adjust/replace this property.

When a line is active:

The `blyrics--active` class is added to the active line, and it scales the line back to its original size. It also changes the cursor to default and applies the `blyrics-glow` and `blyrics-wobble` animations to the text.

All these in conjunction make the active line full-sized and applies animations to make it stand out.

## 6. Creating Animation Effects

The CSS defines two main animations: `blyrics-wobble` and `blyrics-glow`. These are created using the `@keyframes` rule:

```css
@keyframes blyrics-wobble {
  from { transform: translateY(0px); }
  33.33% { transform: translateY(1.75px); }
  66.66% { transform: translateY(-1.75px); }
  to { transform: translateY(0px); }
}

@keyframes blyrics-glow {
  0% { text-shadow: 0 0 1.5rem rgba(255, 255, 255, 0.5); }
  to { text-shadow: 0 0 0 rgba(255, 255, 255, 0.5); }
}
```

The `blyrics-wobble` animation creates a subtle up-and-down movement, while `blyrics-glow` adds and then removes a text shadow for a glowing effect.

To learn more about CSS animations, check out the [MDN Web Docs on CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations).

## 7. Modifying YouTube Music's Layout

The CSS includes several rules that modify the existing YouTube Music interface to better accommodate the lyrics display. For example:

```css
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #mini-guide-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #nav-bar-background,
#layout[player-ui-state="PLAYER_PAGE_OPEN"] #guide-wrapper {
  background-color: transparent !important;
  border-color: transparent !important;
}
```

This rule makes certain elements transparent when the player page is open, allowing the lyrics to be more prominent.
Since the Custom CSS you write is injected into the page, you can override pretty much any style on the page.

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

The CSS includes styles for a loading spinner and error messages:

```css
#blyrics-loader {
  /* ... loader styles ... */
}

#blyrics-loader:before {
  animation: blyrics-spin 1s linear infinite;
  /* ... more styles ... */
}

.blyrics--error {
  /* ... error message styles ... */
}
```

These styles ensure that users get visual feedback while lyrics are loading or if an error occurs.

## 9. Making the Design Responsive

The CSS uses media queries to adjust the layout for different screen sizes:

```css
@media (min-width: 615px) {
  /* ... styles for larger screens ... */
}

@media (max-width: 936px) {
  /* ... styles for medium screens ... */
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

The CSS includes support for right-to-left (RTL) languages:

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

The CSS includes styles for a watermark, though it's initially hidden:

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
#blyrics-song-info {
  display: none;
  z-index: 2;
  max-width: 40rem;
}

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

These styles allow for the display of song information alongside the lyrics in fullscreen mode and is initially hidden.

## 14. Best Practices for Modifying This CSS

When modifying or building upon this CSS:

1. Use in-built CSS editor in the extension to make changes and see them in real-time. Alternatively, you can use browser developer tools to experiment with styles before applying them to the extension.
2. Make small changes and test frequently to understand the impact of each modification.
3. Use CSS comments to explain your changes and why you made them.
4. Be cautious when changing structural elements or removing existing styles, as it may affect the overall layout.
5. When adding new styles, try to follow the existing naming conventions and structure. This will make it easier to maintain and understand the code.

## 15. Additional Resources

To learn more about CSS and web development, check out these resources:

- [MDN Web Docs on CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS-Tricks](https://css-tricks.com/)
- [W3Schools CSS Tutorial](https://www.w3schools.com/css/)
- [FreeCodeCamp's Responsive Web Design Certification](https://www.freecodecamp.org/learn/responsive-web-design/)

Remember, the best way to learn CSS is by experimenting and practicing. Don't be afraid to make changes and see what happens!
If you're stuck or have questions, feel free to reach out to the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF) for help and guidance.

Happy coding! 🎶🎨
