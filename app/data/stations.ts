/** SR 是 Star Rail（星穹铁道）的缩写；节点位置、文案和类型由公开配置提供。 */
export const STATION_IDS = ["SR-PRE-1", "SR-ST-1", "SR-1", "SR-2", "SR-3", "SR-4", "SR-ST-2", "SR-END-1"] as const;
export type StationData = {
  id: (typeof STATION_IDS)[number];
  displayId: string;
  type: "start" | "transfer" | "mission" | "end";
  worldX: number;
  label: string;
};
