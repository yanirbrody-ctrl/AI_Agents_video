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

*(Only Scene 1 is drafted so far. Scenes 2-5 are placeholders until approved.)*

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
