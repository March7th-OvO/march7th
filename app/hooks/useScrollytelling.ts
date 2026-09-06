import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import type { ScrollyConfig } from "../config/scrollyConfig";
import { LAYER_KEYS, worldDistance } from "../config/scrollyLayout";
import { getSceneState } from "../config/scrollyTimeline";

gsap.registerPlugin(ScrollTrigger, useGSAP);
type ScrollyRefs = {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  designRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLElement | null>;
  timeRef: RefObject<HTMLElement | null>;
  sceneRef: RefObject<HTMLElement | null>;
  animationProgressRef: RefObject<number>;
};

export function useScrollytelling(refs: ScrollyRefs, config: ScrollyConfig, enabled: boolean) {
  useGSAP(() => {
    const section = refs.sectionRef.current, stage = refs.stageRef.current, surface = refs.designRef.current;
    if (!enabled || !section || !stage || !surface) return;
    const { layout, parallax, duration, milestones: t, motion: m } = config;
    let disposed = false;
    let refreshFrame = 0;
    const updateScale = () => {
      const containScale = Math.min(stage.clientWidth / layout.referenceWidth, stage.clientHeight / layout.referenceHeight);
      const scale = stage.clientHeight > stage.clientWidth ? stage.clientWidth / layout.referenceHeight : containScale;
      stage.style.setProperty("--stage-scale", String(scale));
      stage.style.setProperty("--transition-scale", String(Math.max(stage.clientWidth / layout.referenceWidth, stage.clientHeight / layout.referenceHeight)));
    };
    const refresh = () => {
      if (disposed) return;
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { updateScale(); ScrollTrigger.refresh(); });
    };
    updateScale();
    const observer = new ResizeObserver(refresh);
    observer.observe(stage);
    window.addEventListener("load", refresh);
    ScrollTrigger.addEventListener("refreshInit", updateScale);
    void document.fonts.ready.then(refresh);

    // matchMedia 同时处理系统偏好动态切换与 StrictMode 重挂载。
    const media = gsap.matchMedia(section);
    media.add({ reduce: "(prefers-reduced-motion: reduce)", animate: "(prefers-reduced-motion: no-preference)" }, context => {
      if (context.conditions?.reduce) {
        section.dataset.reducedMotion = "true";
        return () => { delete section.dataset.reducedMotion; };
      }
      const walker = surface.querySelector<HTMLElement>(".scrolly-walker");
      const idle = () => { if (walker) walker.dataset.walkerState = "idle"; };
      const updateDebug = () => {
        const progress = master.progress(), time = master.time();
        refs.animationProgressRef.current = progress;
        section.dataset.scene = getSceneState(time, t);
        if (refs.progressRef.current) refs.progressRef.current.textContent = progress.toFixed(3);
        if (refs.timeRef.current) refs.timeRef.current.textContent = time.toFixed(2);
        if (refs.sceneRef.current) refs.sceneRef.current.textContent = getSceneState(time, t);
      };
      // 唯一 Master Timeline：camera 使用线性时间，无自动播放、无局部 ScrollTrigger。
      const master = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: updateDebug });
      Object.entries(t).forEach(([name, time]) => master.addLabel(name, time));
      LAYER_KEYS.forEach(layer => {
        master.fromTo(`[data-parallax="${layer}"]`, { x: 0 },
          { x: -worldDistance(layout) * parallax[layer], duration }, 0);
      });
      master.fromTo(".scrolly-walker", { x: 0 }, {
        x: layout.referenceWidth * (layout.walkerEndX - layout.walkerStartX), duration,
      }, 0);

      // 所有局部动效挂在素材 motion wrapper，插槽坐标与未来图片保持独立。
      master.fromTo(".portrait-card", { autoAlpha: 0, scaleY: m.cardScaleY, y: m.cardY }, {
        autoAlpha: 1, scaleY: 1, y: 0, duration: t.CARDS_EXPAND - t.CARDS_START, stagger: m.cardStagger, ease: "power2.out",
      }, t.CARDS_START);
      master.fromTo(".panorama-motion", { autoAlpha: 0, y: m.panoramaY }, {
        autoAlpha: 1, y: 0, duration: t.PANORAMA_MAIN - t.PANORAMA_START, ease: "power2.out",
      }, t.PANORAMA_START);
      master.fromTo(".halo-motion", { autoAlpha: 0, scale: m.haloScale }, {
        autoAlpha: 1, scale: 1, duration: t.THE_WILL_ENTER - t.HALO_ENTER, ease: "power2.out",
      }, t.HALO_ENTER);
      master.fromTo(".will-motion", { autoAlpha: 0, y: m.willY }, {
        autoAlpha: 1, y: 0, duration: t.GREEN_IRIS_START - t.THE_WILL_ENTER,
      }, t.THE_WILL_ENTER);

      // 低透明度色层缓慢显隐；即使快速跨越时间点，也不会跳到不透明的整屏亮色。
      const softenOverlay = (selector: string, start: number, end: number, opacity: number) => {
        const fadeDuration = (end - start) * m.transitionFadeRatio;
        master.fromTo(selector, { opacity: 0 }, {
          opacity, duration: fadeDuration, ease: "sine.inOut",
        }, start);
        master.to(selector, { opacity: 0, duration: fadeDuration, ease: "sine.inOut" }, end - fadeDuration);
      };

      // 覆盖圆和透明孔重叠展开；提前保留中央主体，取消填满后急速挖孔的闪光节奏。
      const irisDuration = t.GREEN_IRIS_END - t.GREEN_IRIS_START;
      const irisRadius = Math.hypot(layout.referenceWidth, layout.referenceHeight) * m.irisRadius;
      softenOverlay(".green-iris", t.GREEN_IRIS_START, t.GREEN_IRIS_END, m.irisOpacity);
      master.fromTo(".green-iris-cover", { attr: { r: 0 } }, {
        attr: { r: irisRadius }, duration: irisDuration * m.irisCoverRatio, ease: "sine.inOut",
      }, t.GREEN_IRIS_START);
      master.fromTo(".green-iris-aperture", { attr: { r: 0 } }, {
        attr: { r: irisRadius }, duration: irisDuration * (1 - m.irisApertureStartRatio), ease: "sine.inOut",
      }, t.GREEN_IRIS_START + irisDuration * m.irisApertureStartRatio);

      // 半透明圆面持续穿过，不在画面中央停顿；底层 World 和角色始终保有可见焦点。
      const cyanDuration = t.MEMORY_SCENE_READY - t.CYAN_TRANSITION_START;
      const cyanRadius = layout.referenceWidth * m.cyanRadius;
      const cyanCenter = layout.referenceWidth * m.cyanX;
      softenOverlay(".cyan-transition", t.CYAN_TRANSITION_START, t.MEMORY_SCENE_READY, m.cyanOpacity);
      master.fromTo(".cyan-surface", { x: layout.referenceWidth + cyanRadius - cyanCenter }, {
        x: -cyanRadius - cyanCenter, duration: cyanDuration, ease: "none",
      }, t.CYAN_TRANSITION_START);
      master.fromTo(".memory-reveal", { clipPath: "circle(0% at 50% 50%)" }, {
        clipPath: `circle(${m.revealRadius}% at 50% 50%)`,
        duration: cyanDuration * (1 - m.revealStartRatio), ease: "power2.out",
      }, t.CYAN_TRANSITION_START + cyanDuration * m.revealStartRatio);

      // 默认关闭装饰闪光；显式启用时也只显示薄、暗、缓慢显隐的弧光。
      const flashDuration = t.CYAN_FLASH_END - t.CYAN_FLASH_START;
      master.fromTo(".cyan-flash", { opacity: 0 }, {
        opacity: m.flashEnabled ? m.flashOpacity : 0, duration: flashDuration * m.flashPeakRatio, ease: "sine.inOut",
      }, t.CYAN_FLASH_START);
      master.to(".cyan-flash", {
        opacity: 0, duration: flashDuration * (1 - m.flashPeakRatio), ease: "sine.inOut",
      }, t.CYAN_FLASH_START + flashDuration * m.flashPeakRatio);

      ScrollTrigger.create({
        id: "scrollytelling-master", trigger: section, pin: stage, pinSpacing: true,
        start: "top top", end: () => `+=${layout.scrollDistance}`,
        animation: master, scrub: true, anticipatePin: 1,
        onUpdate: self => {
          if (walker) walker.dataset.walkerState = self.isActive && self.getVelocity() !== 0 ? "walking" : "idle";
        },
        onLeave: idle, onLeaveBack: idle,
      });
      ScrollTrigger.addEventListener("scrollEnd", idle);
      section.dataset.enhanced = "true";
      updateDebug();
      refresh();
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", idle);
        delete section.dataset.enhanced;
        delete section.dataset.scene;
        idle();
      };
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      window.removeEventListener("load", refresh);
      ScrollTrigger.removeEventListener("refreshInit", updateScale);
      media.revert(); // 撤销本实例 timeline、pin spacer、ScrollTrigger 和内联动画样式。
      stage.style.removeProperty("--stage-scale");
      stage.style.removeProperty("--transition-scale");
    };
  }, { scope: refs.sectionRef, dependencies: [config, enabled], revertOnUpdate: true });
}
