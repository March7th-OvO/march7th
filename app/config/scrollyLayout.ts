/** 固定图层与插槽职责；几何数据来自 public/config/scrollytelling.properties。 */
export const LAYER_KEYS = ["far", "background", "typography", "hero", "rail", "foreground", "extreme"] as const;
export type LayerName = (typeof LAYER_KEYS)[number];
export const SLOT_LAYERS = {
  "opening-bg": "far", "panorama-bg": "far", "halo-bg": "far", "memory-bg": "far",
  "background-a": "background", "background-b": "background", "background-c": "background",
  "portrait-01": "hero", "portrait-02": "hero", "portrait-03": "hero", "portrait-04": "hero",
  "panorama-character": "hero", "halo-hero": "hero", "memory-character": "hero", "final-character": "hero",
  "title-opening": "typography", "title-laterano": "typography", "title-will": "typography", "eternity-title": "typography",
  "foreground-object": "foreground", "foreground-disc-a": "foreground", "foreground-disc-b": "foreground",
  "extreme-bar-a": "extreme", "extreme-bar-b": "extreme",
} as const satisfies Record<string, LayerName>;
export type SlotId = keyof typeof SLOT_LAYERS;
export type AssetSlot = { name: string; x: number; y: number; width: number; height: number };
export function worldDistance(layout: { worldWidth: number; referenceWidth: number }) {
  return layout.worldWidth - layout.referenceWidth;
}
export function layerWidth(layout: { referenceWidth: number; worldWidth: number }, factor: number) {
  return layout.referenceWidth + worldDistance(layout) * factor;
}
