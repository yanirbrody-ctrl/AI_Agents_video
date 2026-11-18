# The Fourier Transform: Explainer Script

**Goal:** After 60 seconds, the viewer understands that any complicated wave can be broken down into simple sine waves.
**Format:** 1280x720, 30 fps, ~60 s total. Voice: Kokoro `af_heart`, speed 1.0.
**Style:** Dark background, one bright "complex" wave color (warm orange) and distinct cool colors for sine components. Minimal text, one idea per scene.

## Scene Plan (target timing)

| # | Title | Idea | Target |
|---|-------|------|--------|
| 1 | The Tangled Wave | Hook: real-world signals look messy | 0:00 - 0:10 |
| 2 | One Simple Sine | Define the building block: a sine wave has frequency and amplitude | 0:10 - 0:22 |
| 3 | Adding Sines | Stacking a few sines builds a complex wave | 0:22 - 0:36 |
| 4 | Running It Backwards | The Fourier Transform: complex wave in, its sines out | 0:36 - 0:50 |
| 5 | The Spectrum | Frequency view (bars) and takeaway | 0:50 - 1:00 |

*(Scenes 1-3 are drafted. Scenes 4-5 are placeholders until approved.)*

---

## Scene 1: The Tangled Wave (0:00 - ~0:10)

**Purpose:** Hook the viewer with a relatable problem: signals in the real world are messy, but hide something simple.

### Visual Direction
- **0.0 s:** Black-to-dark-navy background fades in. Title text "The Fourier Transform" fades in at top center, small and subtle, and stays.
- **0.5 s:** A single long, jagged, irregular orange waveform draws itself left to right across the middle of the screen (it should look like a messy audio recording, not a clean curve).
- **2.0 s - 6.0 s:** Three small captions pop in beneath the wave, one at a time, in sync with the narration: "a voice", "a guitar chord", "a heartbeat". Each gets a tiny icon (microphone, guitar, heart-rate pulse).
- **6.0 s - 8.5 s:** The wave keeps gently scrolling. A soft glow pulses along it as if something is hidden inside.
- **8.5 s - 10.0 s:** The wave dims slightly and a question mark-style text fades in under it: "What is it made of?" Hold into Scene 2.

### Narration
> Every sound around you, a voice, a guitar chord, even a heartbeat, is a messy, tangled wave. But hidden inside it is something beautifully simple.

**Audio file:** `public/audio/scene1.wav` (generated, 9.07 s, 24 kHz, Kokoro `af_heart`). Scene should run ~10 s so the final "What is it made of?" beat holds ~1 s after the voice ends.

---

## Scene 2: One Simple Sine (0:10 - ~0:22)

**Purpose:** Introduce the building block of the whole video: the sine wave, and the two numbers that fully describe it.

### Visual Direction
- **0.0 s:** Cross-fade from Scene 1. The messy orange wave shrinks and fades out; the dark background stays. The title "The Fourier Transform" remains at top.
- **0.5 s - 3.5 s:** A single clean cyan sine wave draws itself across the center and keeps scrolling smoothly. Label "sine wave" fades in below it as the narration says it.
- **3.5 s - 5.0 s:** The wave continues past both screen edges, with faint dotted extensions and a small "∞" mark, to show it repeats forever.
- **5.0 s - 8.5 s:** On "how fast it wiggles, its frequency": the wave speeds up, then slows down, and one full cycle is highlighted with a bracket. Label "frequency" appears under the bracket.
- **8.5 s - 12.0 s:** On "how tall it rises, its amplitude": a vertical double-arrow measures the peak height, and the wave grows taller, then shorter. Label "amplitude" appears beside the arrow.
- **12.0 s - 12.5 s:** Both labels stay. The wave settles to a medium size and speed. Hold into Scene 3.

### Narration
> Let's start with the simplest wave there is: the sine wave. Smooth, and repeating forever. Just two things describe it: how fast it wiggles, its frequency, and how tall it rises, its amplitude.

**Audio file:** `public/audio/scene2.wav` (generated, 12.16 s, 24 kHz, Kokoro `af_heart`). Scene should run ~12.5 s.

---

## Scene 3: Adding Sines (0:22 - ~0:36)

**Purpose:** Show that stacking a few simple sines builds a complex wave, so the viewer sees the messy wave from Scene 1 is just a sum.

### Visual Direction
- **0.0 s:** Continues from Scene 2. The single cyan sine (with its labels faded out) slides up to the upper third of the screen. Title stays at top.
- **1.0 s - 3.0 s:** A second sine, a faster, smaller violet wave, draws itself in the middle band. A faint "+" sign sits between the two waves.
- **3.0 s - 5.0 s:** A third sine, a slow, tall green wave, draws itself in the lower band, with a second "+" sign. All three keep scrolling in sync.
- **5.0 s - 9.0 s:** On "add them together": the three waves slide and merge down into one bottom-center orange wave, point by point (vertical dotted guide lines show the heights adding up at a few moments). It becomes visibly lumpy and irregular.
- **9.0 s - 11.5 s:** The orange wave fills the center and the three sines fade to ghost outlines behind it. Label "3 sines = 1 complex wave" fades in below.
- **11.5 s - 13.5 s:** The orange wave morphs smoothly into the jagged shape from Scene 1 (a few more faint sines briefly overlap), a visual echo of the hook. Hold into Scene 4.

### Narration
> Now, take a few of them, each with its own frequency and height, and simply add them together. The result is a lumpy, complicated wave, just like the tangled one we started with.

**Audio file:** `public/audio/scene3.wav` (generated, 10.94 s, 24 kHz, Kokoro `af_heart`). Scene should run ~13.5 s so the morph-back beat holds ~2.5 s after the voice ends.

---
