import source from "../../public/config/scrollytelling.properties?raw";
import { LAYER_KEYS, SLOT_LAYERS, layerWidth, type AssetSlot, type SlotId } from "./scrollyLayout";
import { MILESTONE_KEYS, type Milestones } from "./scrollyTimeline";
import { STATION_IDS, type StationData } from "../data/stations";

export function parseScrollyConfig(source: string) {
  const values = new Map<string, string>();
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const split = line.indexOf("=");
    if (split < 1) throw new Error(`Scrollytelling 配置行缺少 =：${line}`);
    const key = line.slice(0, split).trim();
    if (values.has(key)) throw new Error(`Scrollytelling 配置键重复：${key}`);
    values.set(key, line.slice(split + 1).trim());
  }
  const text = (key: string) => {
    const value = values.get(key);
    if (!value) throw new Error(`Scrollytelling 配置缺少必填项：${key}`);
    return value;
  };
  const assetSource = (key: string) => {
    const value = values.get(key);
    if (value === undefined) throw new Error(`Scrollytelling 配置缺少必填项：${key}`);
    const hasControlCharacter = [...value].some(character => character.charCodeAt(0) < 32);
    if (/^(?:\/\/|data:|javascript:)/i.test(value) || value.includes("\\") || hasControlCharacter)
      throw new Error(`Scrollytelling 配置 ${key} 必须为空、相对路径、站内绝对路径或完整 HTTP(S) URL`);
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))
      throw new Error(`Scrollytelling 配置 ${key} 仅支持 HTTP(S) 完整 URL`);
    if (/^https?:\/\//i.test(value)) {
      try {
        if (!new URL(value).hostname) throw new Error("missing hostname");
      } catch {
        throw new Error(`Scrollytelling 配置 ${key} 必须是有效的 HTTP(S) URL`);
      }
    }
    return value;
  };
  const number = (key: string, min: number, max: number) => {
    const value = Number(text(key));
    if (!Number.isFinite(value) || value < min || value > max)
      throw new Error(`Scrollytelling 配置 ${key} 必须是 ${min}–${max} 范围内的有限数字`);
    return value;
  };
  const boolean = (key: string) => {
    const value = text(key);
    if (value !== "true" && value !== "false") throw new Error(`Scrollytelling 配置 ${key} 必须为 true 或 false`);
    return value === "true";
  };
  const color = (key: string) => {
    const value = text(key);
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Scrollytelling 配置 ${key} 必须为六位十六进制颜色`);
    return value;
  };
  const layout = {
    referenceWidth: number("layout.referenceWidth", 320, 4000),
    referenceHeight: number("layout.referenceHeight", 240, 2400),
    worldWidth: number("layout.worldWidth", 4000, 50000),
    scrollDistance: number("layout.scrollDistance", 1000, 100000),
    safeArea: number("layout.safeArea", 0, 100),
    railY: number("layout.railY", 0, 1), walkerY: number("layout.walkerY", 0, 1),
    walkerStartX: number("layout.walkerStartX", 0, 1), walkerEndX: number("layout.walkerEndX", 0, 1),
  };
  if (layout.worldWidth <= layout.referenceWidth) throw new Error("layout.worldWidth 必须大于 layout.referenceWidth");
  const parallax = Object.fromEntries(LAYER_KEYS.map(key => [key, number(`parallax.${key}`, 0.01, 3)])) as Record<(typeof LAYER_KEYS)[number], number>;
  if (!(parallax.far < parallax.background && parallax.background < parallax.hero && parallax.hero < parallax.rail && parallax.rail < parallax.foreground && parallax.foreground < parallax.extreme))
    throw new Error("parallax.far/background/hero/rail/foreground/extreme 必须逐层递增");
  const duration = number("timeline.duration", 1, 120);
  const milestones = Object.fromEntries(MILESTONE_KEYS.map(key => [key, number(`timeline.${key}`, 0, duration)])) as Milestones;
  MILESTONE_KEYS.forEach((key, index) => {
    if (index && milestones[key] <= milestones[MILESTONE_KEYS[index - 1]]) throw new Error(`timeline.${key} 必须晚于前一个 milestone`);
  });
  if (milestones.START !== 0) throw new Error("timeline.START 必须为 0");
  if (milestones.END !== duration) throw new Error("timeline.END 必须等于 timeline.duration");
  const motion = {
    transitionFadeRatio: number("motion.transitionFadeRatio", 0.1, 0.5),
    irisOpacity: number("motion.irisOpacity", 0, 0.3),
    cyanOpacity: number("motion.cyanOpacity", 0, 0.3),
    irisApertureStartRatio: number("motion.irisApertureStartRatio", 0, 0.9),
    flashEnabled: boolean("motion.flashEnabled"),
    flashOpacity: number("motion.flashOpacity", 0, 0.15),
    flashStrokeRatio: number("motion.flashStrokeRatio", 0.01, 0.1),
    cardScaleY: number("motion.cardScaleY", 0, 1), cardY: number("motion.cardY", -500, 500),
    cardStagger: number("motion.cardStagger", 0.01, 2),
    chapterTitleY: number("motion.chapterTitleY", -500, -1),
    chapterTitleDuration: number("motion.chapterTitleDuration", 0.1, 5),
    chapterTitleViewportX: number("motion.chapterTitleViewportX", 0, 1),
    journeyRevealDuration: number("motion.journeyRevealDuration", 0.1, 5),
    journeyRevealViewportX: number("motion.journeyRevealViewportX", 0, 1),
    panoramaY: number("motion.panoramaY", -500, 500), haloScale: number("motion.haloScale", 0, 1),
    irisCoverRatio: number("motion.irisCoverRatio", 0.1, 0.9),
    irisX: number("motion.irisX", 0, 1), irisY: number("motion.irisY", 0, 1),
    irisRadius: number("motion.irisRadius", 1, 2),
    cyanRadius: number("motion.cyanRadius", 0.5, 3),
    cyanX: number("motion.cyanX", -1, 2), cyanY: number("motion.cyanY", -1, 2),
    revealStartRatio: number("motion.revealStartRatio", 0, 0.9),
    revealRadius: number("motion.revealRadius", 71, 150),
    flashPeakRatio: number("motion.flashPeakRatio", 0.1, 0.9),
    flashRadius: number("motion.flashRadius", 0.1, 2),
  };
  if (motion.irisApertureStartRatio >= motion.irisCoverRatio)
    throw new Error("motion.irisApertureStartRatio 必须早于 motion.irisCoverRatio，保留重叠揭示");
  if (milestones.CARDS_EXPAND + motion.cardStagger * 3 > milestones.PANORAMA_START)
    throw new Error("motion.cardStagger 使卡片动画超出 timeline.PANORAMA_START");
  const slots = Object.fromEntries(Object.entries(SLOT_LAYERS).map(([id, layer]) => {
    const prefix = `slot.${id}`;
    const slot: AssetSlot = {
      name: text(`${prefix}.name`), src: assetSource(`${prefix}.src`),
      x: number(`${prefix}.x`, 0, layerWidth(layout, parallax[layer])),
      y: number(`${prefix}.y`, -layout.referenceHeight, layout.referenceHeight),
      width: number(`${prefix}.width`, 1, layout.worldWidth),
      height: number(`${prefix}.height`, 1, layout.referenceHeight * 3),
    };
    return [id, slot];
  })) as Record<SlotId, AssetSlot>;
  let previousX = -1;
  const stations: StationData[] = STATION_IDS.map(id => {
    const prefix = `station.${id}`;
    const type = text(`${prefix}.type`);
    if (!["start", "transfer", "mission", "end"].includes(type)) throw new Error(`${prefix}.type 无效`);
    const worldX = number(`${prefix}.x`, 0, layout.worldWidth);
    if (worldX <= previousX) throw new Error(`${prefix}.x 必须大于前一节点位置`);
    previousX = worldX;
    return {
      id,
      displayId: text(`${prefix}.displayId`),
      type: type as StationData["type"],
      worldX,
      label: text(`${prefix}.label`),
    };
  });
  return {
    layout, parallax, duration, milestones, motion, slots, stations,
    debug: boolean("debug.enabled"),
    // 色板使用视觉职责命名，避免场景实现继续依赖历史颜色名称。
    colors: {
      lightBackground: color("color.lightBackground"),
      softSurface: color("color.softSurface"),
      primaryPink: color("color.primaryPink"),
      iceHighlight: color("color.iceHighlight"),
      vividAccent: color("color.vividAccent"),
      night: color("color.night"),
      secondaryBlue: color("color.secondaryBlue"),
      decorativePurple: color("color.decorativePurple"),
    },
  };
}
export type ScrollyConfig = ReturnType<typeof parseScrollyConfig>;
/** 构建快照用于 SSR/hydration；客户端挂载后读取同名运行时配置。 */
export const initialScrollyConfig = parseScrollyConfig(source);
