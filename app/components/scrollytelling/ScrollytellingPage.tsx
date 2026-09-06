import { useEffect, useRef, useState } from "react";
import { initialScrollyConfig, parseScrollyConfig } from "../../config/scrollyConfig";
import { useScrollytelling } from "../../hooks/useScrollytelling";
import { ScrollyConfigContext } from "./ScrollyConfigContext";
import Stage from "./Stage";
import "../../styles/scrollytelling.css";

export default function ScrollytellingPage() {
  const [config, setConfig] = useState(initialScrollyConfig);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const timeRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const animationProgressRef = useRef(0);

  // 仅配置加载触发 React 更新；逐帧进度交给 GSAP/ref。
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${import.meta.env.BASE_URL}config/scrollytelling.properties`, {
      signal: controller.signal, cache: "no-cache",
    }).then(async response => {
      if (!response.ok) throw new Error(`config/scrollytelling.properties 读取失败：${response.status}`);
      const next = parseScrollyConfig(await response.text());
      if (!controller.signal.aborted) setConfig(next);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : String(cause));
    });
    return () => controller.abort();
  }, []);

  useScrollytelling({ sectionRef, stageRef, designRef, progressRef, timeRef, sceneRef, animationProgressRef }, config, !error);
  return <ScrollyConfigContext value={config}>
    <section className="scrollytelling" id="memories" ref={sectionRef} data-config-error={Boolean(error)} aria-label="横向 Scrollytelling 动画原型">
      {/* 保持 DOM 结构稳定，让 useGSAP 先恢复被 pin spacer 包裹的 Stage，避免 React 删除被重置父节点的元素。 */}
      <p className="scrolly-error" role="alert" hidden={!error}>{error}</p>
      <Stage stageRef={stageRef} designRef={designRef} progressRef={progressRef} timeRef={timeRef} sceneRef={sceneRef} />
    </section>
  </ScrollyConfigContext>;
}
