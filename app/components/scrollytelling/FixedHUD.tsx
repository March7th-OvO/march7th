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
    <div className="scrolly-hud-nav" aria-label="导航占位"><span>返回</span><span>首页</span></div>
    <div className="scrolly-hud-shop"><strong>校园商店</strong><span>界面占位</span></div>
    {showDebug && <div className="scrolly-debug" aria-label="Scrollytelling 调试信息">
      <span>滚动进度 <b ref={progressRef}>0.000</b></span>
      <span>时间轴时间 <b ref={timeRef}>0.00</b></span>
      <span>当前场景 <b ref={sceneRef}>WORLD_A</b></span>
    </div>}
  </div>;
}
