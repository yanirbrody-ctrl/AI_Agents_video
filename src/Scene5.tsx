import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const CYAN = "#4fd1ff";
const VIOLET = "#a78bfa";
const GREEN = "#5ee08a";
const ORANGE = "#ff9f43";
const TEXT = "#e8eefc";
const MUTED = "#7f8fb8";
const BG = "#070c1f";

const W = 1280;
const CX = 640;
const X_L = 100;
const X_R = 1180;
const STEP = 4;
const V = 154;
const T0 = 14; // Scene 4 ran 14 s, so the sines keep their phase

// Chart geometry (before it slides to centre)
const AX_X = 650;
const BASE_Y = 540;
const AX_END = 1180;
const AX_TOP = 270;
const HS = 4.2; // px of bar height per px of sine amplitude

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = Easing.inOut(Easing.cubic);
const rng = (t: number, a: number, b: number, e: (n: number) => number = ease) =>
  interpolate(t, [a, b], [0, 1], {...clamp, easing: e});
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type Sine = {key: string; color: string; lambda: number; amp: number; y0: number; y1: number; barX: number; barStart: number; tag: string};
// y0 = band at the start (same as Scene 4), y1 = band in the left third; bars run slow -> medium -> fast
const SINES: Sine[] = [
  {key: "green", color: GREEN, lambda: 520, amp: 52, y0: 460, y1: 235, barX: 790, barStart: 4.0, tag: "slow"},
  {key: "cyan", color: CYAN, lambda: 280, amp: 42, y0: 200, y1: 345, barX: 920, barStart: 4.9, tag: "medium"},
  {key: "violet", color: VIOLET, lambda: 150, amp: 26, y0: 330, y1: 455, barX: 1050, barStart: 5.8, tag: "fast"},
];
const BAR_W = 76;
const MAXH = 52 * HS;

// Bar heights as a fraction of the tallest sine's bar, per sine, for the real data and the three "icon" patterns
const PAT = {
  orig: SINES.map((s) => (s.amp * HS) / MAXH),
  mic: [0.3, 0.95, 0.55],
  gtr: [0.85, 0.4, 0.9],
  heart: [0.45, 0.15, 0.7],
};
const PT = [6.9, 7.25, 7.62, 7.92, 8.3, 8.62, 9.0, 9.5];
const PV = [PAT.orig, PAT.mic, PAT.mic, PAT.gtr, PAT.gtr, PAT.heart, PAT.heart, PAT.orig];
const patternFrac = (i: number, t: number) =>
  interpolate(t, PT, PV.map((p) => p[i]), {...clamp, easing: Easing.inOut(Easing.quad)});

const barHeight = (i: number, t: number) => {
  const grow = rng(t, SINES[i].barStart, SINES[i].barStart + 0.9, Easing.out(Easing.cubic));
  return MAXH * patternFrac(i, t) * grow;
};

const Mic = () => (
  <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x={9} y={2.5} width={6} height={11} rx={3} />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
  </svg>
);
const Guitar = () => (
  <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 9.5 21 3M18.5 2.5l3 3" />
    <path d="M11.2 8.8c-1.4-.9-3.3-.4-4.1 1-.4.7-.4 1.4-1.2 1.9-2 1.2-3.4 3.4-2.4 5.6 1 2.3 3.6 3.6 5.9 2.6 1.9-.8 2.6-2.4 3.6-3.1.8-.6 1.6-.4 2.2-1.2 1-1.5.4-3.4-1-4.3z" />
    <circle cx={9.5} cy={14.5} r={1.1} />
  </svg>
);
const Heart = () => (
  <svg width={72} height={72} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5C5 15.5 2.5 12 2.5 8.7A4.7 4.7 0 0 1 7.2 4c2 0 3.6 1 4.8 2.7C13.2 5 14.8 4 16.8 4a4.7 4.7 0 0 1 4.7 4.7c0 1.4-.4 2.6-1.3 3.8" />
    <path d="M2.5 12.5h5l1.7-3 3 6 2-3.5h6.3" stroke="#ffd29a" />
  </svg>
);

const ICONS = [
  {a: 7.0, b: 7.66, node: <Mic />},
  {a: 7.67, b: 8.33, node: <Guitar />},
  {a: 8.34, b: 9.0, node: <Heart />},
];

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const ts = t + T0; // sine clock

  const slide = rng(t, 0.5, 4.0);
  const sineFade = 1 - rng(t, 8.8, 9.8);
  const intro = 1 - rng(t, 0, 0.5, Easing.linear); // Scene 4's tags and label fade out
  const sx = lerp(1, (450 - 60) / (X_R - X_L), slide);
  const ampK = lerp(1, 0.8, slide);
  const xmap = (x: number) => lerp(X_L, 60, slide) + (x - X_L) * sx;

  const sineY = (s: Sine, x: number) => lerp(s.y0, s.y1, slide) - s.amp * ampK * Math.sin(((Math.PI * 2) / s.lambda) * (x - CX - V * ts));
  const sinePath = (s: Sine) => {
    let d = "";
    for (let x = X_L; x <= X_R + 0.01; x += STEP) d += `${d ? "L" : "M"}${xmap(x).toFixed(1)} ${sineY(s, x).toFixed(1)} `;
    return d;
  };

  // chart
  const dx = -275 * rng(t, 9.0, 11.0);
  const axisDraw = rng(t, 1.6, 3.4);
  const axisLabel = rng(t, 3.0, 3.8, Easing.out(Easing.quad));
  const linesFade = 1 - rng(t, 8.6, 9.4);

  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0}}>
      <defs>
        <filter id="blur5" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
      </defs>

      {/* Scene 4's leftovers fading out during the first half second */}
      <g opacity={intro}>
        {[{tag: "mid-speed, mid-height", c: CYAN, y: 186}, {tag: "fast, small", c: VIOLET, y: 290}, {tag: "slow, tall", c: GREEN, y: 394}].map((g) => (
          <text key={g.tag} x={X_R} y={g.y} textAnchor="end" fill={g.c} fontSize={26} fontStyle="italic" fontFamily="Georgia, serif">
            {g.tag}
          </text>
        ))}
        <text x={CX} y={638} textAnchor="middle" fontSize={46} fontStyle="italic" fontFamily="Georgia, serif" fill={TEXT}>
          <tspan fill={ORANGE}>any wave</tspan> <tspan fill={MUTED}>=</tspan> <tspan fill={CYAN}>a sum of sines</tspan>
        </text>
      </g>

      {/* the three sines, sliding to the left third */}
      <g opacity={sineFade}>
        {SINES.map((s) => {
          const d = sinePath(s);
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={9} opacity={0.22} filter="url(#blur5)" />
              <path d={d} fill="none" stroke={s.color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </g>

      {/* chart (slides to centre at the end) */}
      <g transform={`translate(${dx} 0)`}>
        {/* axes */}
        <line x1={AX_X} y1={BASE_Y} x2={lerp(AX_X, AX_END, axisDraw)} y2={BASE_Y} stroke={MUTED} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={AX_X} y1={BASE_Y} x2={AX_X} y2={lerp(BASE_Y, AX_TOP, axisDraw)} stroke={MUTED} strokeWidth={2.5} strokeLinecap="round" />
        <g opacity={axisLabel}>
          <text x={(AX_X + AX_END) / 2} y={BASE_Y + 78} textAnchor="middle" fill={TEXT} fontSize={30} fontStyle="italic" fontFamily="Georgia, serif">
            frequency
          </text>
          <text transform={`translate(${AX_X - 28} ${(BASE_Y + AX_TOP) / 2 + 8}) rotate(-90)`} textAnchor="middle" fill={TEXT} fontSize={30} fontStyle="italic" fontFamily="Georgia, serif">
            height
          </text>
        </g>

        {/* dotted links from each sine to its bar, bars, and frequency words */}
        {SINES.map((s, i) => {
          const h = barHeight(i, t);
          const top = BASE_Y - h;
          const lineDraw = rng(t, s.barStart - 0.1, s.barStart + 0.5, Easing.out(Easing.quad));
          const x1 = 458; // right end of the shrunken sine (it does not move with the chart)
          const y1 = s.y1;
          // the chart group is translated by dx, so draw links in screen space by undoing it
          return (
            <g key={s.key}>
              <g transform={`translate(${-dx} 0)`} opacity={linesFade}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={lerp(x1, s.barX - BAR_W / 2 + 6, lineDraw)}
                  y2={lerp(y1, Math.min(top, BASE_Y - 4), lineDraw)}
                  stroke={s.color}
                  strokeWidth={2.2}
                  strokeDasharray="2 9"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              </g>
              {h > 0.5 && (
                <>
                  <rect x={s.barX - BAR_W / 2} y={top} width={BAR_W} height={h} rx={6} fill={s.color} opacity={0.25} filter="url(#blur5)" />
                  <rect x={s.barX - BAR_W / 2} y={top} width={BAR_W} height={h} rx={6} fill={s.color} />
                </>
              )}
              <text
                x={s.barX}
                y={BASE_Y + 30}
                textAnchor="middle"
                fill={MUTED}
                fontSize={22}
                fontStyle="italic"
                fontFamily="Georgia, serif"
                opacity={rng(t, s.barStart, s.barStart + 0.6, Easing.linear)}
              >
                {s.tag}
              </text>
            </g>
          );
        })}
      </g>

      {/* quick-cut icons from Scene 1, each flashing its own bar pattern */}
      {ICONS.map((ic, i) => {
        const o = interpolate(t, [ic.a, ic.a + 0.08, ic.b - 0.08, ic.b], [0, 1, 1, 0], clamp) * sineFade;
        if (o <= 0) return null;
        const s = interpolate(t, [ic.a, ic.a + 0.12], [0.8, 1], {...clamp, easing: Easing.out(Easing.back(2))});
        return (
          <g key={i} opacity={o} transform={`translate(${(AX_X + AX_END) / 2 - 36} 160) scale(${s})`} style={{transformOrigin: "36px 36px"}}>
            <foreignObject x={0} y={0} width={72} height={72}>
              {ic.node}
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const k = rng(t, 9.0, 11.0);
  return (
    <div
      style={{
        position: "absolute",
        top: 44 + 22 * k,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Georgia, serif",
        fontSize: 28,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: k > 0 ? `rgb(${Math.round(lerp(127, 232, k))},${Math.round(lerp(143, 238, k))},${Math.round(lerp(184, 252, k))})` : MUTED,
        transform: `scale(${1 + 0.45 * k})`,
        textShadow: `0 0 ${30 * k}px rgba(79, 209, 255, ${0.55 * k}), 0 0 ${60 * k}px rgba(255, 159, 67, ${0.25 * k})`,
      }}
    >
      The Fourier Transform
    </div>
  );
};

const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = rng(frame / fps, 11.0, 11.7, Easing.out(Easing.quad));
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 42,
        color: TEXT,
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
      }}
    >
      <span style={{color: ORANGE}}>Any wave</span> <span style={{color: MUTED}}>=</span> a sum of simple{" "}
      <span style={{color: CYAN}}>sines</span>.
    </div>
  );
};

const FadeToBlack: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = rng(frame / fps, 11.35, 12.0, Easing.linear);
  return <AbsoluteFill style={{backgroundColor: "#000", opacity: o}} />;
};

export const SCENE5_SECONDS = 12;

export const Scene5: React.FC = () => (
  <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, #101b3a 0%, #050916 100%)"}}>
    <Title />
    <Stage />
    <Tagline />
    <FadeToBlack />
    <Audio src={staticFile("audio/scene5.wav")} />
  </AbsoluteFill>
);
