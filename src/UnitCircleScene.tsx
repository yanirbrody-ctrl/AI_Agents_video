import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing} from "remotion";

const BG = "#0b1020";
const GRID = "#1c2540";
const AXIS = "#5b6a99";
const SIN = "#ff6b8b";
const COS = "#4fd1c5";
const POINT = "#ffd166";

// Layout (px, 1280x720 canvas)
const CX = 330; // circle centre
const CY = 380;
const R = 170;
const WAVE_X0 = 640; // where the sine wave starts
const WAVE_LEN = 560; // px for one full 2π
const TURN_FRAMES = 150; // frames per full rotation

export const UnitCircleScene = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: "clamp"});
  const draw = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Start rotating after the intro; theta in radians, capped at 2π so the wave is exactly one period.
  const theta = interpolate(frame, [30, 30 + TURN_FRAMES], [0, 2 * Math.PI], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const px = CX + R * Math.cos(theta);
  const py = CY - R * Math.sin(theta);
  const waveX = WAVE_X0 + (theta / (2 * Math.PI)) * WAVE_LEN;

  // Sine trace polyline up to current theta
  const steps = 160;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * theta;
    pts.push(`${WAVE_X0 + (t / (2 * Math.PI)) * WAVE_LEN},${CY - R * Math.sin(t)}`);
  }

  // Arc showing the angle
  const arcR = 38;
  const arcEnd = `${CX + arcR * Math.cos(theta)},${CY - arcR * Math.sin(theta)}`;
  const arc = `M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 ${theta > Math.PI ? 1 : 0} 0 ${arcEnd}`;

  const deg = Math.round((theta * 180) / Math.PI);
  const sinV = Math.sin(theta).toFixed(3);
  const cosV = Math.cos(theta).toFixed(3);

  return (
    <AbsoluteFill style={{backgroundColor: BG, fontFamily: "Georgia, 'Times New Roman', serif"}}>
      <svg width={1280} height={720} style={{opacity: fadeIn}}>
        {/* grid */}
        {Array.from({length: 33}).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={720} stroke={GRID} strokeWidth={1} />
        ))}
        {Array.from({length: 19}).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={1280} y2={i * 40} stroke={GRID} strokeWidth={1} />
        ))}

        {/* axes */}
        <line x1={CX - R - 40} y1={CY} x2={WAVE_X0 + WAVE_LEN + 30} y2={CY} stroke={AXIS} strokeWidth={2} />
        <line x1={CX} y1={CY - R - 40} x2={CX} y2={CY + R + 40} stroke={AXIS} strokeWidth={2} />

        {/* unit circle */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={AXIS}
          strokeWidth={2.5}
          strokeDasharray={2 * Math.PI * R}
          strokeDashoffset={2 * Math.PI * R * (1 - draw)}
        />

        {/* wave tick labels */}
        {[0.5, 1, 1.5, 2].map((k) => (
          <g key={k}>
            <line x1={WAVE_X0 + (k / 2) * WAVE_LEN} y1={CY - 6} x2={WAVE_X0 + (k / 2) * WAVE_LEN} y2={CY + 6} stroke={AXIS} strokeWidth={2} />
            <text x={WAVE_X0 + (k / 2) * WAVE_LEN} y={CY + 28} fill={AXIS} fontSize={20} textAnchor="middle" fontStyle="italic">
              {k === 1 ? "π" : k === 2 ? "2π" : `${k}π`.replace("0.5π", "π/2").replace("1.5π", "3π/2")}
            </text>
          </g>
        ))}

        {/* connector from point to wave */}
        <line x1={px} y1={py} x2={waveX} y2={py} stroke={POINT} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />

        {/* sine trace */}
        <polyline points={pts.join(" ")} fill="none" stroke={SIN} strokeWidth={4} strokeLinejoin="round" />

        {/* angle arc */}
        <path d={arc} fill="none" stroke={POINT} strokeWidth={2.5} />

        {/* radius, cos and sin projections */}
        <line x1={CX} y1={CY} x2={px} y2={py} stroke={POINT} strokeWidth={3} />
        <line x1={CX} y1={CY} x2={px} y2={CY} stroke={COS} strokeWidth={4} />
        <line x1={px} y1={CY} x2={px} y2={py} stroke={SIN} strokeWidth={4} />

        {/* moving points */}
        <circle cx={px} cy={py} r={9} fill={POINT} />
        <circle cx={waveX} cy={py} r={7} fill={SIN} />
        <circle cx={CX} cy={CY} r={4} fill={AXIS} />

        {/* title */}
        <text x={640} y={80} fill="#eef2ff" fontSize={46} textAnchor="middle">
          The Unit Circle <tspan fill={AXIS}>→</tspan> <tspan fill={SIN}>sin θ</tspan>
        </text>
        <text x={640} y={116} fill={AXIS} fontSize={22} textAnchor="middle" fontStyle="italic">
          height of the point traces the sine wave
        </text>

        {/* live readout */}
        <g transform="translate(90 600)">
          <text fill="#eef2ff" fontSize={30}>
            θ = {deg}°
          </text>
          <text y={42} fill={COS} fontSize={30}>
            cos θ = {cosV}
          </text>
          <text x={260} y={42} fill={SIN} fontSize={30}>
            sin θ = {sinV}
          </text>
        </g>
        <text x={1190} y={640} fill={AXIS} fontSize={24} textAnchor="end" fontStyle="italic">
          sin²θ + cos²θ = 1
        </text>
      </svg>
      <div style={{position: "absolute", right: 20, bottom: 12, color: AXIS, fontSize: 14, fontFamily: "monospace"}}>
        frame {frame}/{durationInFrames}
      </div>
    </AbsoluteFill>
  );
};
