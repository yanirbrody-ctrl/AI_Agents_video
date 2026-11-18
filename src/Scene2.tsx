import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const CYAN = "#4fd1ff";
const MINT = "#5eead4"; // frequency
const VIOLET = "#a78bfa"; // amplitude
const ORANGE = "#ff9f43";
const TEXT = "#e8eefc";
const MUTED = "#7f8fb8";
const NAVY = "#0a1230";

const W = 1280;
const CX = 640;
const CY = 340;
const X_L = 130; // solid sine spans X_L..X_R
const X_R = 1150;
const STEP = 4;

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = Easing.inOut(Easing.cubic);

// Piecewise-eased parameter keyframes: [time(s), value]
const track = (t: number, keys: [number, number][]) => {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return interpolate(t, [t0, t1], [v0, v1], {...clamp, easing: ease});
  }
  return keys[keys.length - 1][1];
};

// Wavelength (px per cycle): smaller = higher frequency. Fast -> slow -> settle.
const lambdaAt = (t: number) =>
  track(t, [[0, 280], [5.0, 280], [6.3, 150], [7.4, 420], [8.5, 280]]);
// Amplitude (px)
const ampAt = (t: number) =>
  track(t, [[0, 110], [8.5, 110], [9.8, 175], [11.0, 55], [12.0, 110]]);
// Angular speed in cycles/sec is proportional to frequency (1/lambda). Scroll speed in px/s is constant 90 * (280/lambda)... use cycles/s.
const cyclesPerSec = (t: number) => 0.55 * (280 / lambdaAt(t));

// Integrate speed so phase stays continuous when frequency changes (no jumps)
const phaseAt = (frame: number, fps: number) => {
  let p = 0;
  for (let f = 0; f < frame; f++) p += cyclesPerSec(f / fps) / fps;
  return p * Math.PI * 2;
};

const sinePath = (x0: number, x1: number, lambda: number, amp: number, phase: number) => {
  const k = (Math.PI * 2) / lambda;
  let d = "";
  for (let x = x0; x <= x1 + 0.01; x += STEP) {
    const y = CY - amp * Math.sin(k * (x - CX) - phase);
    d += `${d ? "L" : "M"}${x} ${y.toFixed(1)} `;
  }
  return d;
};

// ---- Scene 1 hand-off: messy orange wave shrinks and fades in the first 0.5 s ----
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};
const noise = (u: number) => {
  const i = Math.floor(u);
  const f = u - i;
  return hash(i) * (1 - f) + hash(i + 1) * f;
};
const OldWave: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const k = interpolate(t, [0, 0.5], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  if (k <= 0) return null;
  let d = "";
  for (let x = -STEP; x <= W + STEP; x += STEP) {
    const v = Math.sin(x * 0.011) * 0.5 + Math.sin(x * 0.027 + 1.3) * 0.35 + noise(x / 11) * 0.55 + noise(x / 5 + 100) * 0.35;
    d += `${d ? "L" : "M"}${x} ${(CY - v * 70 * k).toFixed(1)} `;
  }
  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0, opacity: k * 0.5}}>
      <path d={d} fill="none" stroke={ORANGE} strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  );
};

const Wave: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const lambda = lambdaAt(t);
  const amp = ampAt(t);
  const phase = phaseAt(frame, fps);

  const reveal = interpolate(t, [0.5, 3.5], [X_L, X_R], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ext = interpolate(t, [3.5, 5.0], [0, 1], {...clamp, easing: ease});

  const solid = sinePath(X_L, X_R, lambda, amp, phase);
  const left = sinePath(0, X_L, lambda, amp, phase);
  const right = sinePath(X_R, W, lambda, amp, phase);

  // one-cycle highlight (5.0 s onward), centred on the screen
  const hl = interpolate(t, [5.0, 5.6], [0, 1], {...clamp, easing: ease});
  const bx0 = CX - lambda / 2;
  const bx1 = CX + lambda / 2;
  const by = CY + 215;

  // amplitude measure (8.5 s onward)
  const am = interpolate(t, [8.5, 9.2], [0, 1], {...clamp, easing: ease});
  const AX = 900;

  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0}}>
      <defs>
        <clipPath id="reveal2">
          <rect x={0} y={0} width={reveal} height={720} />
        </clipPath>
        <clipPath id="cycle">
          <rect x={bx0} y={0} width={lambda} height={720} />
        </clipPath>
        <filter id="blur2" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation={8} />
        </filter>
      </defs>

      {/* baseline */}
      <line x1={0} y1={CY} x2={W} y2={CY} stroke="#1f2b4d" strokeWidth={1.5} />

      {/* dotted extensions + infinity marks */}
      <g opacity={ext}>
        <path d={left} fill="none" stroke={CYAN} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" opacity={0.7} />
        <path d={right} fill="none" stroke={CYAN} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" opacity={0.7} />
        <text x={46} y={CY + 8} fill={MUTED} fontSize={40} textAnchor="middle" fontFamily="Georgia, serif">∞</text>
        <text x={W - 46} y={CY + 8} fill={MUTED} fontSize={40} textAnchor="middle" fontFamily="Georgia, serif">∞</text>
      </g>

      {/* main sine */}
      <g clipPath="url(#reveal2)">
        <path d={solid} fill="none" stroke={CYAN} strokeWidth={9} opacity={0.25} filter="url(#blur2)" />
        <path d={solid} fill="none" stroke={CYAN} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {reveal < X_R && (
        <circle cx={reveal} cy={CY - amp * Math.sin(((Math.PI * 2) / lambda) * (reveal - CX) - phase)} r={7} fill="#d6f4ff" />
      )}

      {/* highlighted cycle + bracket + label */}
      <g opacity={hl}>
        <g clipPath="url(#cycle)">
          <path d={solid} fill="none" stroke={MINT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d={`M${bx0} ${by - 14} V${by} H${bx1} V${by - 14}`} fill="none" stroke={MINT} strokeWidth={3} strokeLinejoin="round" />
        <line x1={bx0} y1={CY + 8} x2={bx0} y2={by - 18} stroke={MINT} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
        <line x1={bx1} y1={CY + 8} x2={bx1} y2={by - 18} stroke={MINT} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
        <text x={CX} y={by + 44} fill={MINT} fontSize={38} textAnchor="middle" fontStyle="italic" fontFamily="Georgia, serif">
          frequency
        </text>
      </g>

      {/* amplitude measure */}
      <g opacity={am}>
        <line x1={AX - 150} y1={CY - amp} x2={AX + 40} y2={CY - amp} stroke={VIOLET} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.7} />
        <line x1={AX} y1={CY - amp + 10} x2={AX} y2={CY - 10} stroke={VIOLET} strokeWidth={3} />
        <path d={`M${AX - 8} ${CY - amp + 18} L${AX} ${CY - amp} L${AX + 8} ${CY - amp + 18}`} fill="none" stroke={VIOLET} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <path d={`M${AX - 8} ${CY - 18} L${AX} ${CY} L${AX + 8} ${CY - 18}`} fill="none" stroke={VIOLET} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <text
          x={AX + 22}
          y={CY - amp / 2 + 12}
          fill={VIOLET}
          fontSize={38}
          fontStyle="italic"
          fontFamily="Georgia, serif"
          stroke={NAVY}
          strokeWidth={8}
          paintOrder="stroke"
        >
          amplitude
        </text>
      </g>
    </svg>
  );
};

const Title: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 44,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: "Georgia, serif",
      fontSize: 28,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: MUTED,
    }}
  >
    The Fourier Transform
  </div>
);

// "sine wave" label under the wave, appears as the narration names it
const SineLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // fades in as narration names it, hands its spot over to "frequency" at 5 s
  const o =
    interpolate(frame, [2.6 * fps, 3.4 * fps], [0, 1], {...clamp}) *
    interpolate(frame, [4.8 * fps, 5.3 * fps], [1, 0], {...clamp});
  return (
    <div
      style={{
        position: "absolute",
        top: CY + 215 + 10,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 40,
        color: CYAN,
        opacity: o,
        transform: `translateY(${(1 - o) * 8}px)`,
      }}
    >
      sine wave
    </div>
  );
};

export const SCENE2_SECONDS = 12.5;

export const Scene2: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #101b3a 0%, #050916 100%)`}}>
    <Title />
    <OldWave />
    <Wave />
    <SineLabel />
    <Audio src={staticFile("audio/scene2.wav")} />
  </AbsoluteFill>
);
