import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

// Palette (SCRIPT.md: warm orange for the complex wave, cool colors reserved for sine components later)
const ORANGE = "#ff9f43";
const ORANGE_HOT = "#ffd29a";
const TEXT = "#e8eefc";
const MUTED = "#7f8fb8";

const W = 1280;
const WAVE_Y = 330;
const WAVE_AMP = 110;
const STEP = 4; // px between jagged vertices

// Deterministic pseudo-random in [-1, 1] for an integer index
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};
// Value noise: linear between random vertices -> sharp, irregular, but continuous when scrolling
const noise = (u: number) => {
  const i = Math.floor(u);
  const f = u - i;
  return hash(i) * (1 - f) + hash(i + 1) * f;
};

// A messy "audio recording": a few slow swells + mid-frequency chatter + sharp spikes
const waveAt = (x: number) => {
  const swell = Math.sin(x * 0.011) * 0.5 + Math.sin(x * 0.027 + 1.3) * 0.35 + Math.sin(x * 0.0043 + 4) * 0.4;
  const chatter = noise(x / 11) * 0.55 + noise(x / 5 + 100) * 0.35;
  const envelope = 0.55 + 0.45 * Math.sin(x * 0.006 + 0.8) ** 2 + 0.25 * Math.abs(noise(x / 90 + 40));
  return (swell + chatter) * envelope;
};

const buildPath = (scroll: number) => {
  let d = "";
  for (let px = -STEP; px <= W + STEP; px += STEP) {
    const y = WAVE_Y - waveAt(px + scroll) * WAVE_AMP * 0.78;
    d += `${d ? "L" : "M"}${px} ${y.toFixed(1)} `;
  }
  return d;
};

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // draws left -> right from 0.5s over 2s
  const reveal = interpolate(t, [0.5, 2.5], [0, W], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // gentle scroll begins as soon as it is drawn; keeps going to the end
  const scroll = Math.max(0, t - 0.5) * 70;
  // dims at 8.5-10s
  const dim = interpolate(t, [8.5, 9.5], [1, 0.5], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  // soft pulse 6.0-8.5s: a bright band travels along the wave while overall glow breathes
  const pulseWin = interpolate(t, [6, 6.6, 8.0, 8.5], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const breathe = 0.5 + 0.5 * Math.sin((t - 6) * Math.PI * 1.6);
  const glowOpacity = pulseWin * (0.35 + 0.65 * breathe);
  const bandX = interpolate(t, [6, 8.5], [-150, W + 150], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const d = buildPath(scroll);

  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0, opacity: dim}}>
      <defs>
        <clipPath id="reveal">
          <rect x={0} y={0} width={reveal} height={720} />
        </clipPath>
        <filter id="blur" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation={9} />
        </filter>
        <linearGradient id="band" gradientUnits="userSpaceOnUse" x1={bandX - 160} x2={bandX + 160} y1={0} y2={0}>
          <stop offset="0" stopColor={ORANGE_HOT} stopOpacity={0} />
          <stop offset="0.5" stopColor={ORANGE_HOT} stopOpacity={1} />
          <stop offset="1" stopColor={ORANGE_HOT} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* faint baseline */}
      <line x1={0} y1={WAVE_Y} x2={W} y2={WAVE_Y} stroke="#1f2b4d" strokeWidth={1.5} />
      <g clipPath="url(#reveal)">
        {/* ambient glow (always faint) */}
        <path d={d} fill="none" stroke={ORANGE} strokeWidth={8} opacity={0.22} filter="url(#blur)" strokeLinejoin="round" />
        {/* the wave */}
        <path d={d} fill="none" stroke={ORANGE} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* pulse: breathing glow + travelling highlight */}
        <path d={d} fill="none" stroke={ORANGE_HOT} strokeWidth={10} opacity={glowOpacity * 0.5} filter="url(#blur)" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="url(#band)" strokeWidth={5} opacity={pulseWin} strokeLinejoin="round" strokeLinecap="round" />
      </g>
      {/* drawing head */}
      {reveal > 0 && reveal < W && (
        <circle cx={reveal} cy={WAVE_Y - waveAt(reveal + scroll) * WAVE_AMP * 0.78} r={7} fill={ORANGE_HOT} />
      )}
    </svg>
  );
};

const Mic = () => (
  <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x={9} y={2.5} width={6} height={11} rx={3} />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
  </svg>
);
const Guitar = () => (
  <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 9.5 21 3M18.5 2.5l3 3" />
    <path d="M11.2 8.8c-1.4-.9-3.3-.4-4.1 1-.4.7-.4 1.4-1.2 1.9-2 1.2-3.4 3.4-2.4 5.6 1 2.3 3.6 3.6 5.9 2.6 1.9-.8 2.6-2.4 3.6-3.1.8-.6 1.6-.4 2.2-1.2 1-1.5.4-3.4-1-4.3z" />
    <circle cx={9.5} cy={14.5} r={1.1} />
  </svg>
);
const Heart = () => (
  <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5C5 15.5 2.5 12 2.5 8.7A4.7 4.7 0 0 1 7.2 4c2 0 3.6 1 4.8 2.7C13.2 5 14.8 4 16.8 4a4.7 4.7 0 0 1 4.7 4.7c0 1.4-.4 2.6-1.3 3.8" />
    <path d="M2.5 12.5h5l1.7-3 3 6 2-3.5h6.3" stroke={ORANGE_HOT} />
  </svg>
);

const Caption: React.FC<{label: string; at: number; x: number; icon: React.ReactNode}> = ({label, at, x, icon}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at * fps, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div
      style={{
        position: "absolute",
        left: x - 130,
        width: 260,
        top: 465,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity: interpolate(s, [0, 0.6], [0, 1], {extrapolateRight: "clamp"}),
        transform: `translateY(${(1 - s) * 24}px) scale(${0.85 + 0.15 * s})`,
      }}
    >
      {icon}
      <span style={{fontFamily: "Georgia, serif", fontSize: 32, color: TEXT, fontStyle: "italic"}}>{label}</span>
    </div>
  );
};

const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = interpolate(frame, [8.5 * fps, 9.4 * fps], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 610,
        textAlign: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
        fontFamily: "Georgia, serif",
        fontSize: 54,
        color: TEXT,
      }}
    >
      What is it made of<span style={{color: ORANGE}}>?</span>
    </div>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = interpolate(frame, [0, 1 * fps], [0, 1], {extrapolateRight: "clamp"});
  return (
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
        opacity: o,
      }}
    >
      The Fourier Transform
    </div>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // black -> dark navy over the first second
  const k = interpolate(frame, [0, 1 * fps], [0, 1], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, rgb(${Math.round(16 * k)},${Math.round(27 * k)},${Math.round(58 * k)}) 0%, rgb(${Math.round(5 * k)},${Math.round(9 * k)},${Math.round(22 * k)}) 100%)`,
      }}
    />
  );
};

export const SCENE1_SECONDS = 10;

export const Scene1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: "#000"}}>
    <Background />
    <Title />
    <Waveform />
    <Caption at={2.0} x={W * 0.2} label="a voice" icon={<Mic />} />
    <Caption at={3.4} x={W * 0.5} label="a guitar chord" icon={<Guitar />} />
    <Caption at={4.8} x={W * 0.8} label="a heartbeat" icon={<Heart />} />
    <Question />
    <Audio src={staticFile("audio/scene1.wav")} />
  </AbsoluteFill>
);
