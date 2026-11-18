// The messy "audio recording" wave from Scene 1, shared so later scenes can echo it exactly.
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};
const noise = (u: number) => {
  const i = Math.floor(u);
  const f = u - i;
  return hash(i) * (1 - f) + hash(i + 1) * f;
};

/** Normalised jagged wave value (roughly -1.4..1.4) at horizontal position x. */
export const tangledAt = (x: number) => {
  const swell = Math.sin(x * 0.011) * 0.5 + Math.sin(x * 0.027 + 1.3) * 0.35 + Math.sin(x * 0.0043 + 4) * 0.4;
  const chatter = noise(x / 11) * 0.55 + noise(x / 5 + 100) * 0.35;
  const envelope = 0.55 + 0.45 * Math.sin(x * 0.006 + 0.8) ** 2 + 0.25 * Math.abs(noise(x / 90 + 40));
  return (swell + chatter) * envelope;
};
