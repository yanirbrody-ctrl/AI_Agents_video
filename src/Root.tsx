import {Composition} from "remotion";
import {TestClip} from "./TestClip";
import {UnitCircleScene} from "./UnitCircleScene";
import {Scene1, SCENE1_SECONDS} from "./Scene1";
const FPS = 30;
const DURATION_SECONDS = 5;
export const Root = () => (
  <>
    <Composition id="Scene1" component={Scene1} durationInFrames={FPS * SCENE1_SECONDS} fps={FPS} width={1280} height={720} />
    <Composition id="UnitCircle" component={UnitCircleScene} durationInFrames={FPS * 8} fps={FPS} width={1280} height={720} />
    <Composition id="TestClip" component={TestClip} durationInFrames={FPS * DURATION_SECONDS} fps={FPS} width={1280} height={720} />
  </>
);
