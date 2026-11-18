import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {tangledAt} from "./tangledWave";

const CYAN = "#4fd1ff";
const VIOLET = "#a78bfa";
const GREEN = "#5ee08a";
const ORANGE = "#ff9f43";
const ORANGE_HOT = "#ffd29a";
const TEXT = "#e8eefc";
const MUTED = "#7f8fb8";
const PANEL = "#0c1636";

const W = 1280;
const CX = 640;
const CY = 330; // same centre line as the end of Scene 3
const X_L = 100;
const X_R = 1180;
const STEP = 4;
const V = 154;
const WAVE_AMP = 110 * 0.78;

// "machine" box: centre-right, sitting over the wave
const BOX = {x: 560, y: 215, w: 300, h: 230};
const BOX_R = BOX.x + BOX.w;
const FAN = 170; // px over which the stream splits into separate sines

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = Easing.inOut(Easing.cubic);
const rng = (t: number, a: number, b: number, e: (n: number) => number = ease) =>
  interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
const smooth = (u: number) => {
  const c = Math.min(1, Math.max(0, u));
  return c * c * (3 - 2 * c);
};

type Sine = {color: string; lambda: number; amp: number; band: number; tag: string; start: number};
// same three sines as Scene 3, so the viewer recognises them
const SINES: Sine[] = [
  {color: CYAN, lambda: 280, amp: 42, band: 200, tag: "mid-speed, mid-height", start: 8.0},
  {color: VIOLET, lambda: 150, amp: 26, band: 330, tag: "fast, small", start: 9.3},
  {color: GREEN, lambda: 520, amp: 52, band: 460, tag: "slow, tall", start: 10.6},
];

// Scroll offset of the orange wave. Continues Scene 3's drift (20 px/s, from 705), then reverses
// so the wave flows rightwards into the box. Integrated per frame so velocity changes never jump.
const offsetAt = (frame: number, fps: number) => {
  let off = 705;
  for (let f = 0; f < frame; f++) {
    const t = f / fps;
    const v = 20 + (-150 - 20) * rng(t, 5.5, 6.6);
    off += v / fps;
  }
  return off;
};

const pathFrom = (x0: number, x1: number, y: (x: number) => number) => {
  let d = "";
  for (let x = x0; x <= x1 + 0.01; x += STEP) d += `${d ? "L" : "M"}${x.toFixed(1)} ${y(x).toFixed(1)} `;
  return d;
};

const Glow: React.FC<{d: string; color: string; width: number; opacity?: number}> = ({d, color, width, opacity = 1}) => (
  <g opacity={opacity}>
    <path d={d} fill="none" stroke={color} strokeWidth={width + 5} opacity={0.22} filter="url(#blur4)" />
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Star: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <path
    d={`M${x} ${y - 14 * s} Q${x} ${y} ${x + 14 * s} ${y} Q${x} ${y} ${x} ${y + 14 * s} Q${x} ${y} ${x - 14 * s} ${y} Q${x} ${y} ${x} ${y - 14 * s}Z`}
    fill="#fff4dc"
    opacity={o}
  />
);

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // ---- orange wave ----
  const off = offsetAt(frame, fps);
  const p = rng(t, 5.5, 7.2); // how much has been squeezed toward the box
  const orangeOut = 1 - rng(t, 12.0, 13.2);
  const env = (x: number) => {
    const sq = smooth((BOX.x - x) / 300); // 1 far from the box, 0 at its left edge
    return 1 - p * (1 - sq);
  };
  const yO = (x: number) => CY - tangledAt(x + off) * WAVE_AMP * env(x);
  const leftD = pathFrom(X_L, BOX.x, yO);
  const rightD = pathFrom(BOX_R, X_R, yO);

  // ---- box ----
  const slide = rng(t, 0.5, 1.5, Easing.out(Easing.cubic));
  const boxFade = 1 - rng(t, 12.0, 13.2);
  const boxO = slide * boxFade;
  const dx = (1 - slide) * 620;
  const working = rng(t, 5.5, 6.2) * (1 - rng(t, 9.0, 12.0, Easing.linear));
  const pulse = 0.55 + 0.45 * Math.sin(t * 5);
  const glow = 0.35 + 0.35 * rng(t, 0.8, 1.6) + 0.3 * working * pulse;
  const plusO = 1 - rng(t, 3.2, 4.2);
  const forkO = rng(t, 3.6, 4.6);

  // sparkles around the box edges (0.9 - 2.4 s)
  const stars = [
    {x: BOX.x, y: BOX.y, a: 1.0},
    {x: BOX_R, y: BOX.y + 40, a: 1.2},
    {x: BOX.x + 90, y: BOX.y + BOX.h, a: 1.4},
    {x: BOX_R - 60, y: BOX.y, a: 1.6},
    {x: BOX.x, y: BOX.y + 150, a: 1.8},
    {x: BOX_R, y: BOX.y + BOX.h - 20, a: 2.0},
  ].map((s) => {
    const k = interpolate(t, [s.a, s.a + 0.25, s.a + 0.6], [0, 1, 0], clamp);
    return {...s, k};
  });

  // ---- curved arrow (2.5 - 5.5 s), loops from the right back to the left ----
  const arrowDraw = rng(t, 2.5, 5.5, Easing.inOut(Easing.quad));
  const arrowO = rng(t, 2.5, 3.0, Easing.linear) * (1 - rng(t, 7.8, 8.8));
  const headO = rng(t, 5.0, 5.5, Easing.linear);

  // ---- three sines fan out of the box ----
  const bx = BOX_R + (X_L - FAN - BOX_R) * rng(t, 12.0, 13.2);
  const sineY = (s: Sine, x: number) => {
    const d = smooth((x - bx) / FAN);
    const k = (Math.PI * 2) / s.lambda;
    return CY + (s.band - CY) * d - s.amp * d * Math.sin(k * (x - CX - V * t));
  };

  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0}}>
      <defs>
        <filter id="blur4" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation={8} />
        </filter>
        <filter id="blurBox" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <linearGradient id="boxEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ORANGE} />
          <stop offset="1" stopColor={CYAN} />
        </linearGradient>
        {SINES.map((s, i) => (
          <clipPath id={`rev${i}`} key={i}>
            <rect x={0} y={0} width={interpolate(t, [s.start, s.start + 1.3], [BOX_R, X_R + 2], {...clamp, easing: ease})} height={720} />
          </clipPath>
        ))}
      </defs>

      {/* baseline */}
      <line x1={0} y1={CY} x2={W} y2={CY} stroke="#1f2b4d" strokeWidth={1.5} opacity={0.6} />

      {/* orange input wave: left of the box (squeezes to a thin stream), right of the box (consumed) */}
      <Glow d={leftD} color={ORANGE} width={4.5} opacity={orangeOut} />
      <Glow d={rightD} color={ORANGE} width={4.5} opacity={(1 - p) * orangeOut} />

      {/* output sines */}
      {t >= 8.0 &&
        SINES.map((s, i) => {
          const x0 = Math.max(X_L, bx);
          return (
            <g key={i} clipPath={`url(#rev${i})`}>
              <Glow d={pathFrom(x0, X_R, (x) => sineY(s, x))} color={s.color} width={4} />
            </g>
          );
        })}

      {/* arrow (reverse of the Scene 3 merge) */}
      <g opacity={arrowO}>
        <path
          d="M1150 505 C1150 715 130 715 130 505"
          fill="none"
          stroke={TEXT}
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - arrowDraw}
          opacity={0.8}
        />
        <path d="M108 528 L130 498 L152 528" fill="none" stroke={TEXT} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8 * headO} />
      </g>

      {/* the machine */}
      <g opacity={boxO} transform={`translate(${dx} 0)`}>
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={22} fill="url(#boxEdge)" opacity={glow} filter="url(#blurBox)" />
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={22} fill={PANEL} stroke="url(#boxEdge)" strokeWidth={3.5} />
        {/* + icon, then split icon */}
        <g transform={`translate(${BOX.x + BOX.w / 2} ${BOX.y + 58})`}>
          <g opacity={plusO}>
            <path d="M-14 0H14M0 -14V14" stroke={ORANGE} strokeWidth={5} strokeLinecap="round" />
          </g>
          <g opacity={forkO}>
            <path d="M0 -22V-2M0 -2L-24 22M0 -2V22M0 -2L24 22" fill="none" stroke={TEXT} strokeWidth={4} strokeLinecap="round" />
            <circle cx={-24} cy={24} r={5} fill={CYAN} />
            <circle cx={0} cy={24} r={5} fill={VIOLET} />
            <circle cx={24} cy={24} r={5} fill={GREEN} />
          </g>
        </g>
        <text x={BOX.x + BOX.w / 2} y={BOX.y + 135} textAnchor="middle" fill={TEXT} fontSize={38} fontFamily="Georgia, serif">Fourier</text>
        <text x={BOX.x + BOX.w / 2} y={BOX.y + 182} textAnchor="middle" fill={TEXT} fontSize={38} fontFamily="Georgia, serif">Transform</text>
        {stars.map((s, i) => (
          <Star key={i} x={s.x} y={s.y} s={0.6 + 0.8 * s.k} o={s.k} />
        ))}
      </g>

      {/* tags */}
      {SINES.map((s, i) => {
        const o = rng(t, s.start + 0.5, s.start + 1.2, Easing.out(Easing.quad));
        return (
          <g key={i} opacity={o} transform={`translate(0 ${(1 - o) * 8})`}>
            <text
              x={X_R}
              y={s.band - s.amp - 14}
              textAnchor="end"
              fill={s.color}
              fontSize={26}
              fontStyle="italic"
              fontFamily="Georgia, serif"
              stroke="#070c1f"
              strokeWidth={6}
              paintOrder="stroke"
            >
              {s.tag}
            </text>
          </g>
        );
      })}
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

const FinalLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = rng(frame / fps, 12.3, 13.1, Easing.out(Easing.quad));
  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 46,
        color: TEXT,
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
      }}
    >
      <span style={{color: ORANGE}}>any wave</span> <span style={{color: MUTED}}>=</span>{" "}
      <span style={{color: CYAN}}>a sum of sines</span>
    </div>
  );
};

export const SCENE4_SECONDS = 14;

export const Scene4: React.FC = () => (
  <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, #101b3a 0%, #050916 100%)"}}>
    <Title />
    <Stage />
    <FinalLabel />
    <Audio src={staticFile("audio/scene4.wav")} />
  </AbsoluteFill>
);
