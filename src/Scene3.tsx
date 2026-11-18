import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {tangledAt} from "./tangledWave";

const CYAN = "#4fd1ff";
const VIOLET = "#a78bfa";
const GREEN = "#5ee08a";
const ORANGE = "#ff9f43";
const ORANGE_HOT = "#ffd29a";
const TEXT = "#e8eefc";
const MUTED = "#7f8fb8";

const W = 1280;
const CX = 640;
const X_L = 100;
const X_R = 1180;
const STEP = 4;
const V = 154; // px/s every sine travels at, so they scroll in sync (matches Scene 2's pace)

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = Easing.inOut(Easing.cubic);
const rng = (t: number, a: number, b: number, e: (n: number) => number = ease) =>
  interpolate(t, [a, b], [0, 1], {...clamp, easing: e});

type Sine = {id: "a" | "b" | "c"; color: string; lambda: number; amp: number; band: number};
const A: Sine = {id: "a", color: CYAN, lambda: 280, amp: 42, band: 160}; // slow-ish, carried over from Scene 2
const B: Sine = {id: "b", color: VIOLET, lambda: 150, amp: 26, band: 275}; // faster, smaller
const C: Sine = {id: "c", color: GREEN, lambda: 520, amp: 52, band: 390}; // slow, tall

const SUM_Y_BOTTOM = 580;
const CENTER_Y = 360;
const WAVE_AMP_S1 = 110 * 0.78; // Scene 1's jagged amplitude
const S1_CENTER = 330;
const S1_SCROLL = 665;

const val = (s: Sine, x: number, t: number, ampOverride?: number) => {
  const k = (Math.PI * 2) / s.lambda;
  return (ampOverride ?? s.amp) * Math.sin(k * (x - CX - V * t));
};

// Per-frame timeline state shared by every layer
const useTimeline = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const slide = rng(t, 0, 1.0); // A slides up from the Scene 2 position
  const converge = rng(t, 8.0, 9.2); // bands and orange move to the centre
  const aAmp = 110 + (A.amp - 110) * slide;
  const aY = 340 + (A.band - 340) * slide + (CENTER_Y - A.band) * converge;
  const bY = B.band + (CENTER_Y - B.band) * converge;
  const cY = C.band + (CENTER_Y - C.band) * converge;
  const sumY = SUM_Y_BOTTOM + (CENTER_Y - SUM_Y_BOTTOM) * converge;
  const sumScale = 1 + 0.35 * converge;
  const w = rng(t, 11.5, 13.2); // morph to the jagged Scene 1 wave
  return {t, aAmp, aY, bY, cY, sumY, sumScale, w, converge};
};

const sumRaw = (x: number, t: number, aAmp: number) => val(A, x, t, aAmp) + val(B, x, t) + val(C, x, t);

const path = (x0: number, x1: number, y: (x: number) => number) => {
  let d = "";
  for (let x = x0; x <= x1 + 0.01; x += STEP) d += `${d ? "L" : "M"}${x} ${y(x).toFixed(1)} `;
  return d;
};

const Glow: React.FC<{d: string; color: string; width: number; clip?: string; opacity?: number; glow?: boolean}> = ({
  d,
  color,
  width,
  clip,
  opacity = 1,
  glow = true,
}) => (
  <g clipPath={clip} opacity={opacity}>
    {glow && <path d={d} fill="none" stroke={color} strokeWidth={width + 5} opacity={0.22} filter="url(#blur3)" />}
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Waves: React.FC = () => {
  const {t, aAmp, aY, bY, cY, sumY, sumScale, w, converge} = useTimeline();

  const revealB = interpolate(t, [1.0, 3.0], [X_L, X_R], {...clamp, easing: ease});
  const revealC = interpolate(t, [3.0, 5.0], [X_L, X_R], {...clamp, easing: ease});
  const revealS = interpolate(t, [5.2, 8.0], [X_L, X_R], clamp); // linear so guide timing is predictable
  const done = revealS >= X_R;

  // component fade: full while building, ghosts once merged
  const ghost = 1 - 0.8 * rng(t, 8.2, 9.6);
  const ghostOut = ghost * (1 - rng(t, 11.5, 13.0));
  const compOpacity = ghostOut;

  const yA = (x: number) => aY - val(A, x, t, aAmp);
  const yB = (x: number) => bY - val(B, x, t);
  const yC = (x: number) => cY - val(C, x, t);

  const jag = (x: number) => tangledAt(x + S1_SCROLL + (t - 11.5) * 20) * WAVE_AMP_S1;
  const morphCenter = sumY + (S1_CENTER - sumY) * w;
  const yS = (x: number) => morphCenter - ((1 - w) * sumScale * sumRaw(x, t, A.amp) + w * jag(x));
  // the sum always uses the final Scene 3 amplitudes; A has settled by the time it draws

  // faint extra sines that briefly overlap during the morph (11.5 - 13.0 s)
  const extraO = interpolate(t, [11.5, 12.2, 13.0], [0, 0.5, 0], clamp);
  const extras = [
    {lambda: 90, amp: 20, c: CYAN, dy: -18},
    {lambda: 60, amp: 14, c: VIOLET, dy: 12},
    {lambda: 38, amp: 10, c: GREEN, dy: 30},
  ];

  const plusO1 = rng(t, 1.8, 2.6) * (1 - rng(t, 5.2, 6.0));
  const plusO2 = rng(t, 3.6, 4.4) * (1 - rng(t, 5.2, 6.0));

  // vertical dotted guides: appear as the orange head passes, hold ~1 s, fade
  const guides = [330, 640, 950].map((gx) => {
    const pass = 5.2 + ((gx - X_L) / (X_R - X_L)) * 2.8;
    return {gx, o: rng(t, pass, pass + 0.25, Easing.linear) * (1 - rng(t, pass + 0.9, pass + 1.3, Easing.linear))};
  });

  const sumGlow = rng(t, 8.4, 9.4);

  return (
    <svg width={W} height={720} style={{position: "absolute", inset: 0}}>
      <defs>
        <filter id="blur3" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation={8} />
        </filter>
        <clipPath id="rb"><rect x={0} y={0} width={revealB} height={720} /></clipPath>
        <clipPath id="rc"><rect x={0} y={0} width={revealC} height={720} /></clipPath>
        <clipPath id="rs"><rect x={0} y={0} width={revealS} height={720} /></clipPath>
        <clipPath id="ra"><rect x={X_L} y={0} width={X_R - X_L} height={720} /></clipPath>
      </defs>

      {/* component sines */}
      <Glow d={path(X_L, X_R, yA)} color={A.color} width={4} opacity={compOpacity} glow={converge < 0.5} />
      <Glow d={path(X_L, X_R, yB)} color={B.color} width={4} clip="url(#rb)" opacity={compOpacity} glow={converge < 0.5} />
      <Glow d={path(X_L, X_R, yC)} color={C.color} width={4} clip="url(#rc)" opacity={compOpacity} glow={converge < 0.5} />

      {/* extras that echo the hook while morphing */}
      {extras.map((e, i) => (
        <path
          key={i}
          d={path(X_L, X_R, (x) => CENTER_Y + e.dy - e.amp * Math.sin(((Math.PI * 2) / e.lambda) * (x - CX - V * t * (1 + i * 0.3))))}
          fill="none"
          stroke={e.c}
          strokeWidth={2}
          opacity={extraO}
        />
      ))}

      {/* plus signs */}
      <text x={CX} y={(A.band + B.band) / 2 + 14} textAnchor="middle" fill={MUTED} fontSize={44} fontFamily="Georgia, serif" opacity={plusO1 * 0.7}>+</text>
      <text x={CX} y={(B.band + C.band) / 2 + 14} textAnchor="middle" fill={MUTED} fontSize={44} fontFamily="Georgia, serif" opacity={plusO2 * 0.7}>+</text>

      {/* the sum (orange) */}
      {t >= 5.2 && (
        <>
          <Glow d={path(X_L, X_R, yS)} color={ORANGE} width={4.5} clip={done ? undefined : "url(#rs)"} />
          <path d={path(X_L, X_R, yS)} fill="none" stroke={ORANGE_HOT} strokeWidth={8} opacity={0.35 * (1 - sumGlow) * (done ? 1 : 0)} filter="url(#blur3)" />
          {!done && <circle cx={revealS} cy={yS(revealS)} r={7} fill={ORANGE_HOT} />}
        </>
      )}

      {/* guide lines that show the three heights adding up */}
      {guides.map((g) => {
        if (g.o <= 0.01) return null;
        const ya = yA(g.gx), yb = yB(g.gx), yc = yC(g.gx), ys = yS(g.gx);
        const top = Math.min(ya, ys), bottom = Math.max(ya, ys);
        return (
          <g key={g.gx} opacity={g.o}>
            <line x1={g.gx} y1={top - 8} x2={g.gx} y2={bottom + 8} stroke={TEXT} strokeWidth={1.8} strokeDasharray="3 7" strokeLinecap="round" opacity={0.7} />
            <circle cx={g.gx} cy={ya} r={6} fill={A.color} />
            <circle cx={g.gx} cy={yb} r={6} fill={B.color} />
            <circle cx={g.gx} cy={yc} r={6} fill={C.color} />
            <circle cx={g.gx} cy={ys} r={8} fill={ORANGE_HOT} />
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

const Label: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const o = rng(t, 9.3, 10.1, Easing.out(Easing.quad)) * (1 - rng(t, 11.6, 12.2, Easing.linear));
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
        fontSize: 44,
        color: TEXT,
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
      }}
    >
      <span style={{color: CYAN}}>3 sines</span> <span style={{color: MUTED}}>=</span>{" "}
      <span style={{color: ORANGE}}>1 complex wave</span>
    </div>
  );
};

export const SCENE3_SECONDS = 13.5;

export const Scene3: React.FC = () => (
  <AbsoluteFill style={{background: "radial-gradient(ellipse at 50% 45%, #101b3a 0%, #050916 100%)"}}>
    <Title />
    <Waves />
    <Label />
    <Audio src={staticFile("audio/scene3.wav")} />
  </AbsoluteFill>
);
