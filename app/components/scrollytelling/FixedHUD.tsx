import type { RefObject } from "react";
import { useScrollyConfig } from "./ScrollyConfigContext";
type FixedHUDProps = {
  progressRef: RefObject<HTMLElement | null>;
  timeRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLElement | null>;
};
export default function FixedHUD({ progressRef, timeRef, sceneRef }: FixedHUDProps) {
  const { debug } = useScrollyConfig();
  // SSR 预渲染也不输出开发 HUD，保证生产 hydration 一致。
  const showDebug = (!import.meta.env.SSR && import.meta.env.DEV) || debug;
  return <div className="scrolly-hud">
    <div className="scrolly-hud-nav" aria-label="导航占位"><span>BACK</span><span>HOME</span></div>
    <div className="scrolly-hud-shop"><strong>CAMPUS SHOP</strong><span>HUD PLACEHOLDER</span></div>
    {showDebug && <div className="scrolly-debug" aria-label="Scrollytelling 调试信息">
      <span>SCROLL PROGRESS <b ref={progressRef}>0.000</b></span>
      <span>TIMELINE TIME <b ref={timeRef}>0.00</b></span>
      <span>CURRENT SCENE <b ref={sceneRef}>WORLD_A</b></span>
    </div>}
  </div>;
}
