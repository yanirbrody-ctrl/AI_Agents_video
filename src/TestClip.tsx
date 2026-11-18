import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from "remotion";
export const TestClip = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{backgroundColor: "#0b1d3a", justifyContent: "center", alignItems: "center"}}>
      <h1 style={{color: "white", fontSize: 120, fontFamily: "sans-serif", opacity}}>Test Clip</h1>
      <Audio src={staticFile("test-audio.wav")} />
    </AbsoluteFill>
  );
};
