/** 23.38 只作为时间坐标，不自动播放；milestone 值在公开配置中维护。 */
export const MILESTONE_KEYS = [
  "START", "CARDS_START", "CARDS_EXPAND", "PANORAMA_START", "PANORAMA_MAIN",
  "HALO_ENTER", "THE_WILL_ENTER", "GREEN_IRIS_START", "GREEN_IRIS_END",
  "CYAN_TRANSITION_START", "MEMORY_SCENE_READY", "CYAN_FLASH_START", "CYAN_FLASH_END", "END",
] as const;
export type Milestone = (typeof MILESTONE_KEYS)[number];
export type Milestones = Record<Milestone, number>;
export const SCENE_STATES = [
  ["START", "WORLD_A"], ["CARDS_START", "WORLD_A_CARDS"], ["PANORAMA_START", "PANORAMA_A"],
  ["HALO_ENTER", "HALO_HERO_ENTER"], ["GREEN_IRIS_START", "GREEN_IRIS"],
  ["GREEN_IRIS_END", "HALO_HERO_HOLD"], ["CYAN_TRANSITION_START", "CYAN_TRANSITION"],
  ["MEMORY_SCENE_READY", "MEMORY_HERO"], ["CYAN_FLASH_START", "CYAN_FLASH"],
  ["CYAN_FLASH_END", "MEMORY_HERO_FINAL"],
] as const;
export function getSceneState(time: number, milestones: Milestones) {
  let name: (typeof SCENE_STATES)[number][1] = "WORLD_A";
  for (const [key, scene] of SCENE_STATES) {
    if (time < milestones[key]) break;
    name = scene;
  }
  return name;
}
