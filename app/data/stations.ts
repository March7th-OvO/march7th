/** 节点标识属于固定结构；位置、文案和类型由公开配置提供。 */
export const STATION_IDS = ["SR-ST-1", "SR-TR-1", "SR-1", "SR-2", "SR-3", "SR-4", "SR-5", "SR-6", "SR-7", "SR-8", "SR-ST-2"] as const;
export type StationData = {
  id: (typeof STATION_IDS)[number];
  type: "start" | "transfer" | "mission" | "end";
  worldX: number;
  label: string;
};
