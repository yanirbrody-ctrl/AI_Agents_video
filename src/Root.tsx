import {Composition, Series} from "remotion";
import {TestClip} from "./TestClip";
import {UnitCircleScene} from "./UnitCircleScene";
import {Scene1, SCENE1_SECONDS} from "./Scene1";
import {Scene2, SCENE2_SECONDS} from "./Scene2";
import {Scene3, SCENE3_SECONDS} from "./Scene3";
import {Scene4, SCENE4_SECONDS} from "./Scene4";
import {Scene5, SCENE5_SECONDS} from "./Scene5";
const FPS = 30;
const DURATION_SECONDS = 5;
const frames = (seconds: number) => Math.round(FPS * seconds);
// Scenes 1-5 played back to back.
const FullVideo = () => (
  <Series>
    <Series.Sequence durationInFrames={frames(SCENE1_SECONDS)}><Scene1 /></Series.Sequence>
    <Series.Sequence durationInFrames={frames(SCENE2_SECONDS)}><Scene2 /></Series.Sequence>
    <Series.Sequence durationInFrames={frames(SCENE3_SECONDS)}><Scene3 /></Series.Sequence>
    <Series.Sequence durationInFrames={frames(SCENE4_SECONDS)}><Scene4 /></Series.Sequence>
    <Series.Sequence durationInFrames={frames(SCENE5_SECONDS)}><Scene5 /></Series.Sequence>
  </Series>
);
const FULL_FRAMES = frames(SCENE1_SECONDS) + frames(SCENE2_SECONDS) + frames(SCENE3_SECONDS) + frames(SCENE4_SECONDS) + frames(SCENE5_SECONDS);
export const Root = () => (
  <>
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_FRAMES} fps={FPS} width={1280} height={720} />
    <Composition id="Scene1" component={Scene1} durationInFrames={FPS * SCENE1_SECONDS} fps={FPS} width={1280} height={720} />
    <Composition id="Scene2" component={Scene2} durationInFrames={Math.round(FPS * SCENE2_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="Scene3" component={Scene3} durationInFrames={Math.round(FPS * SCENE3_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="Scene4" component={Scene4} durationInFrames={Math.round(FPS * SCENE4_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="Scene5" component={Scene5} durationInFrames={Math.round(FPS * SCENE5_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="UnitCircle" component={UnitCircleScene} durationInFrames={FPS * 8} fps={FPS} width={1280} height={720} />
    <Composition id="TestClip" component={TestClip} durationInFrames={FPS * DURATION_SECONDS} fps={FPS} width={1280} height={720} />
  </>
);
