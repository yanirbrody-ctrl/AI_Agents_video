import {Composition} from "remotion";
import {TestClip} from "./TestClip";
import {UnitCircleScene} from "./UnitCircleScene";
import {Scene1, SCENE1_SECONDS} from "./Scene1";
import {Scene2, SCENE2_SECONDS} from "./Scene2";
import {Scene3, SCENE3_SECONDS} from "./Scene3";
const FPS = 30;
const DURATION_SECONDS = 5;
export const Root = () => (
  <>
    <Composition id="Scene1" component={Scene1} durationInFrames={FPS * SCENE1_SECONDS} fps={FPS} width={1280} height={720} />
    <Composition id="Scene2" component={Scene2} durationInFrames={Math.round(FPS * SCENE2_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="Scene3" component={Scene3} durationInFrames={Math.round(FPS * SCENE3_SECONDS)} fps={FPS} width={1280} height={720} />
    <Composition id="UnitCircle" component={UnitCircleScene} durationInFrames={FPS * 8} fps={FPS} width={1280} height={720} />
    <Composition id="TestClip" component={TestClip} durationInFrames={FPS * DURATION_SECONDS} fps={FPS} width={1280} height={720} />
  </>
);
