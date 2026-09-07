import type { CSSProperties, RefObject } from "react";
import FixedHUD from "./FixedHUD";
import Walker from "./Walker";
import World from "./World";
import { useScrollyConfig } from "./ScrollyConfigContext";
import CyanFlash from "./transitions/CyanFlash";
import CyanTransition from "./transitions/CyanTransition";
import GreenIris from "./transitions/GreenIris";

type StageProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  designRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLElement | null>;
  timeRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLElement | null>;
};
export default function Stage({ stageRef, designRef, ...debugRefs }: StageProps) {
  const { layout, colors } = useScrollyConfig();
  const style = {
    "--reference-width": `${layout.referenceWidth}px`, "--reference-height": `${layout.referenceHeight}px`,
    "--world-width": `${layout.worldWidth}px`, "--safe-area": `${layout.safeArea}px`,
    "--rail-y": `${layout.railY * 100}%`, "--walker-y": `${layout.walkerY * 100}%`,
    "--walker-x": `${layout.walkerStartX * 100}%`,
    "--scrolly-light-bg": colors.lightBackground,
    "--scrolly-soft-surface": colors.softSurface,
    "--scrolly-primary-pink": colors.primaryPink,
    "--scrolly-ice-highlight": colors.iceHighlight,
    "--scrolly-vivid-accent": colors.vividAccent,
    "--scrolly-night": colors.night,
    "--scrolly-secondary-blue": colors.secondaryBlue,
    "--scrolly-decorative-purple": colors.decorativePurple,
  } as CSSProperties;
  return <div className="scrolly-stage" ref={stageRef} style={style}>
    <div className="scrolly-design-surface" ref={designRef}>
      <World />
      <Walker />
      <div className="scrolly-ambient-placeholder" aria-hidden="true">氛围元素占位</div>
    </div>
    {/* World contain 保持构图；Transition cover 覆盖整个 viewport，HUD 位于两者上方。 */}
    <div className="scrolly-transition-layer"><div className="scrolly-transition-surface">
      <GreenIris /><CyanTransition /><CyanFlash />
    </div></div>
    <div className="scrolly-hud-surface">
      <FixedHUD {...debugRefs} />
    </div>
  </div>;
}
