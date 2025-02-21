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

### Colors:

| Variable                         | Default Value                                                  | Description                                     | Deprecated                                                                                              |
|----------------------------------|----------------------------------------------------------------|-------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `--blyrics-text-color`           | ``                                                             | Main color of text used thoughout Better Lyrics | Use `--blyrics-ui-text-color`, `--blyrics-lyric-active-color`, `--blyrics-lyric-inactive-color` instead |
| `--blyrics-ui-text-color`        | `color(display-p3 1 1 1 / 1)` (white)                          | Color of non-lyric UI text                      |                                                                                                         |
| `--blyrics-active-opacity`       | ``                                                             | Controls opacity of active lyrics               | Use `--blyrics-lyric-active-color` instead                                                              |
| `--blyrics-lyric-active-color`   | `color(display-p3 1 1 1 / 1)` (white)                          | Color of active lyrics                          |                                                                                                         |
| `--blyrics-inactive-opacity`     | ``                                                             | Controls opacity of inactive lyrics             |                                                                                                         |
| `--blyrics-lyric-inactive-color` | `color(display-p3 1 1 1 / 0.3)` (semi-transparent white)       | Color of inactive lyrics                        | Use `--blyrics-lyric-inactive-color` instead                                                            |
| `--blyrics-highlight-color`      | ``                                                             | Color of glow effect                            | Use `--blyrics-glow-color` instead                                                                      |
| `--blyrics-glow-color`           | `color(display-p3 1 1 1 / 0.5)`  (semi-transparent white)      | Color of glow effect                            |                                                                                                         |
| `--blyrics-error-color`          | `color(display-p3 0.992 0.882 0.882)` (slightly red off-white) | Color used in error conditions                  |                                                                                                         |
| `--blyrics-footer-bg-color`      | `hsla(0, 0%, 100%, 0.1)`                                       |                                                 |                                                                                                         |
| `--blyrics-footer-border-color`  | `hsla(0, 0%, 100%, 0.1);`                                      |                                                 |                                                                                                         |
| `--blyrics-footer-text-color`    | `#aaa`                                                         |                                                 |                                                                                                         |
| `--blyrics-footer-link-color`    | `#fff`                                                         |                                                 |                                                                                                         |
| `--blyrics-discord-hover-color`  | `#5865f2` (Burple)                                             |                                                 |                                                                                                         |

### Typography

| Variable                           | Default Value                                           | Description                                | Deprecated                               |
|------------------------------------|---------------------------------------------------------|--------------------------------------------|------------------------------------------|
| `--blyrics-font-family`            | *                                                       | Font family to use in lyrics               |                                          |
| `--blyrics-font-size`              | `3rem`                                                  | Font size to use for lyrics                |                                          |
| `--blyrics-font-weight`            | `700`                                                   | Font weight to use for lyrics              |                                          |
| `--blyrics-line-height`            | `1.333`                                                 | Line height to use for lyrics              |                                          |
|                                    |                                                         |                                            |                                          |
| `--blyrics-translated-font-size`   | `2rem`                                                  | Font size of translated/romanized lyrics   |                                          |
| `--blyrics-translated-font-weight` | `600`                                                   | Font weight of translated/romanized lyrics |                                          |
| `--blyrics-translated-font-family` | Inherits `--blyrics-font-family`                        | Font family of translated/romanized lyrics |                                          |
| `--blyrics-translated-opacity`     | ``                                                      | Opacity of translated/romanized lyrics     | Use `--blyrics-translated-color` instead |
| `--blyrics-translated-color`       | `color(display-p3 1 1 1 /0.6)` (semi-transparent white) | Color of translated/romanized lyrics       |                                          |
|                                    |                                                         |                                            |                                          |
| `--blyrics-footer-font-family:`    | `Roboto, Noto Naskh Arabic UI, Arial, sans-serif`       | Font family of footer                      |                                          |
| `--blyrics-footer-font-size`       | `14px`                                                  | Font size of footer                        |                                          |
| `--blyrics-footer-font-weight`     | `400`                                                   | Font weight of footer                      |                                          |

\* `Satoshi, Avenir, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;`

### Animations

| Variable                                      | Default Value | Description                                 | Deprecated                                                                                                |
|-----------------------------------------------|---------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| `--blyrics-transition-duration`               | ``            | Transition duration of scale effect         | Use `--blyrics-scale-transition-duration`  instead                                                        |
| `--blyrics-scale-transition-duration`         | `0.166s`      | Transition duration of scale effect         |                                                                                                           |
| `--blyrics-opacity-transition`                | ``            | Controls duration of fade in/out transition | Use `--blyrics-lyric-highlight-fade-in-duration` / `--blyrics-lyric-highlight-fade-out-duration`  instead |
| `--blyrics-lyric-highlight-fade-in-duration`  | `0.33s`       | Controls duration of fade in transition     |                                                                                                           |
| `--blyrics-lyric-highlight-fade-out-duration` | `0.5s`        | Controls duration of fade out transition    |                                                                                                           |
| `--blyrics-wobble-duration`                   | `1s`          | Controls duration of wobble animation       |                                                                                                           |

### Layout

These aren't really used anywhere relevant

| Variable                  | Default Value | Description | Deprecated |
|---------------------------|---------------|-------------|------------|
| `--blyrics-padding`       | `2rem`        |             |            |
| `--blyrics-margin`        | `2rem`        |             |            |
| `--blyrics-border-radius` | `1000rem`     |             |            |

### Lyric Transition

| Variable                                     | Default Value | Description                                      | Deprecated                                                |
|----------------------------------------------|---------------|--------------------------------------------------|-----------------------------------------------------------|
| `--blyrics-lyric-scroll-duration`            |               | Duration for scrolling lyric transitions.        | Use `--blyrics-lyric-transition-duration` instead.        |
| `--blyrics-lyric-transition-duration`        | `0.3s`        | Duration for scrolling lyric transitions.        |                                                           |
| `--blyrics-lyric-scroll-timing-function`     |               | Timing function for scrolling lyric transitions. | Use `--blyrics-lyric-transition-timing-function` instead. |
| `--blyrics-lyric-transition-timing-function` | `ease`        | Timing function for scrolling lyric transitions. |                                                           |

### Effects

| Variable                        | Default Value | Description                                                        |
|---------------------------------|---------------|--------------------------------------------------------------------|
| `--blyrics-blur-amount`         | `30px`        | Amount of blur applied to elements for visual effects.             |
| `--blyrics-scale`               | `0.95`        | Scale factor applied to inactive elements.                         |
| `--blyrics-active-scale`        | `1`           | Scale factor applied to active elements.                           |
| `--blyrics-error-opacity`       | `0.33`        | Opacity value used for error messages.                             |
| `--blyrics-background-blur`     | `100px`       | Amount of blur applied to background elements for depth.           |
| `--blyrics-background-saturate` | `2`           | Saturation multiplier for background elements to enhance vibrancy. |

### `--blyrics-gradient-stops`

```css
{
    --blyrics-gradient-stops:
		transparent 0%, rgba(0, 0, 0, 0.013) 8.1%,
		rgba(0, 0, 0, 0.049) 15.5%, rgba(0, 0, 0, 0.104) 22.5%,
		rgba(0, 0, 0, 0.175) 29%, rgba(0, 0, 0, 0.259) 35.3%,
		rgba(0, 0, 0, 0.352) 41.2%, rgba(0, 0, 0, 0.45) 47.1%,
		rgba(0, 0, 0, 0.55) 52.9%, rgba(0, 0, 0, 0.648) 58.8%,
		rgba(0, 0, 0, 0.741) 64.7%, rgba(0, 0, 0, 0.825) 71%,
		rgba(0, 0, 0, 0.896) 77.5%, rgba(0, 0, 0, 0.951) 84.5%,
		rgba(0, 0, 0, 0.987) 91.9%, #000 100%  ;
}
```

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

Below is a revised version of your documentation. I’ve reorganized the content for clarity and incorporated the detail
about the `.blyrics-zero-dur-animate` class. All the original details are preserved:

---

## 5. Styling Individual Lyric Lines

Animating lyrics is a multi-step process. Various classes and properties work together to ensure smooth, timed
transitions—even if the browser stutters. Remember that when a div or span has an active or animating class, it doesn’t
necessarily mean it’s currently “active” or animating. Instead, these classes are applied early, and the code later
inserts specific animation/transition delays to trigger the effects at the correct time.

---

### Base Structure

- **Container & Word Structure:**
  Each lyric is wrapped in a `<div>`, and every word within that lyric is enclosed in a `<span>` inside the div.

---

### Base Styling for Each Lyric

The following CSS sets up the basic appearance and transition parameters for each lyric container:

```css
.blyrics-container > div {
  transform: scale(var(--blyrics-scale));
    transition-property: --dummy, --dummy, transform;
    transition-duration: 0s, 0s, var(--blyrics-scale-transition-duration);
    transition-timing-function: linear, linear, ease;

}
```

- **Inactive Scale:**
  The element is scaled by the value of `--blyrics-scale` (for inactive lyrics).

- **Transition Setup:**
  The transition properties are defined individually (instead of using the shorthand) to allow later insertion of
  a `transition-delay`.
  The first two properties are reserved for the lyric swipe animation and shouldn't be used for other effects.

---

### Activating a Lyric

When a lyric becomes active, the container div gets the `.blyrics--animating` class:

```css
.blyrics-container > div.blyrics--animating {
	transform: scale(var(--blyrics-active-scale));
}
```

- **Active Scale:**
  This rule changes the scale to `--blyrics-active-scale`, triggering the transition defined above.

---

### Styling Each Word

Every word (span) in the lyric has the following base styles:

```css
.blyrics-container > div > span {
	color: var(--blyrics-lyric-inactive-color);
	display: inline-block;
	white-space: pre;
	transform: translateY(0px);
}
```

- **Color & Display:**
  The word’s color is set to `--blyrics-lyric-inactive-color` (its color is later changed during animation),
  and `inline-block` ensures the spacing and layout are preserved.

- **Transform:**
  The `translateY(0px)` is necessary—even though it appears redundant—because removing it causes layout issues.

---

### Applying the Wobble Animation

When a word is animating in, it receives the `.blyrics--animating` class, triggering the wobble animation:

```css
.blyrics-container > div > span.blyrics--animating {
	animation: blyrics-wobble var(--blyrics-wobble-duration) forwards ease;
}
```

- **Animation Details:**
  Each word is animated with `blyrics-wobble`, and a unique `animation-delay` is applied by the code to control the
  timing of the animation.

---

### Implementing the Swipe (Karaoke) Transition

#### Defining Custom Properties

Two custom properties control the swipe transition’s start and end points (which affect the softness of the swipe edge):

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

---

#### The `::after` Pseudo-element

The swipe effect is created using each word’s `::after` pseudo-element. This element is positioned to perfectly overlap
its parent and uses a mask image for the swipe effect:

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
			white calc(100% * var(--lyric-transition-amount-start) - 4rem * var(--lyric-transition-amount-start) + 2rem),
			black calc(100% * var(--lyric-transition-amount-end) - 4rem * var(--lyric-transition-amount-end) + 2rem + 1px)
	);
	mask-mode: luminance;
	width: 100%;

	opacity: 0;
	--lyric-transition-amount-start: -0.2;
	--lyric-transition-amount-end: -0.1;
    transition: --lyric-transition-amount-start 1s linear 1000s, --lyric-transition-amount-end 1s linear 1000s, opacity 0.5s ease;
}
```

- **Content & Positioning:**
  The pseudo-element copies the text via `content: attr(data-content)` and is positioned (offset by -2rem) so that it
  completely overlaps its parent (accounting for padding).

- **Active Color & Mask:**
  The swipe effect uses `--blyrics-lyric-active-color` and a linear gradient mask. The gradient’s stops are calculated
  using the custom properties, which are transitioned to create the swipe effect.

- **Opacity & Transition Delays:**
  The opacity is set to 0 whenever the lyric isn't active.

  The long transition delays (1000s) on the custom properties effectively “pause”
  the swipe transition while the lyric fades out.
  The starting values of these properties (set to negative numbers) help
  correct minor visual inconsistencies.
  The code accounts for these negative values by starting these transition slightly early to prevent timing issues.

---

#### Pre-animation States and the Role of `.blyrics-zero-dur-animate`

Before the final swipe effect is applied, there is a brief pre-animation state to reset the pseudo-element. Two rules
handle this:

1. **Reset State:**
   This rule is applied to spans in their pre-animating state:
   ```css
   .blyrics-container > div > span.blyrics--pre-animating:not(.blyrics--animating)::after {
     /* Reset background position for the karaoke transition to play correctly */
     transition: none;
     --lyric-transition-amount-start: -0.2;
     --lyric-transition-amount-end: -0.1;
     opacity: 0;
   }
   ```
   This state is needed to reset transitions that may be partially complete (i.e., if it was paused earlier)

2. **Opacity Override (Conditional):**
   This rule forces the pseudo-element’s opacity to 1, but only if the `.blyrics-zero-dur-animate` class is **not**
   present:
   ```css
   .blyrics-container > div > span.blyrics--pre-animating:not(.blyrics--animating):not(.blyrics-zero-dur-animate)::after {
     opacity: 1;
   }
   ```
	- **Note on `.blyrics-zero-dur-animate`:**
	  The `.blyrics-zero-dur-animate` class is applied when there is no swipe animation (i.e., its duration is 0s).
      In such cases, we want a fade-in effect for the opacity instead of an instant highlight of the entire word.
      By omitting the override (opacity set to 1) when `.blyrics-zero-dur-animate` is present, we allow the opacity to
	  transition smoothly.

---

#### Final State: Lyric Selection

When a lyric is finally selected, the pseudo-element is animated to reveal the swipe effect:

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

- **Opacity & Glow Animation:**
  The pseudo-element’s opacity is set to 1. A glow animation (`blyrics-glow`) is triggered with its duration calculated
  as the maximum of `calc(var(--blyrics-duration) * 1.2)` and `1.2s`, and the `animation-delay` is inherited.

- **Swipe Transition:**
  The custom properties are transitioned to their final values (1.4 and 1.5), which produces the swipe effect. **The
  order and timing of the transitions (the custom properties first, then the opacity) are critical so that the swipe effect
  and fade-in occur at the intended times. The delay applied to the two custom properties is slightly shorter to account for the animation starting from -20%.**
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

Once you've created a custom style that you like, you can share it with others by exporting it to a file and sharing that file.
Feel free to share your own theme with the [Better Lyrics community on Discord](https://discord.gg/UsHE3d5fWF) and get a chance to be featured in the extension!

## 16. Additional Resources

To learn more about CSS and web development, check out these resources:

- [MDN Web Docs on CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS-Tricks](https://css-tricks.com/)
- [W3Schools CSS Tutorial](https://www.w3schools.com/css/)
- [FreeCodeCamp's Responsive Web Design Certification](https://www.freecodecamp.org/learn/responsive-web-design/)

Remember, the best way to learn CSS is by experimenting and practicing. If you're stuck or have questions, feel free to reach out to the [Better Lyrics Discord community](https://discord.gg/UsHE3d5fWF) for help and guidance!
