import type { CSSProperties } from "react";
import { useScrollyConfig } from "./ScrollyConfigContext";
import Layer from "./layers/Layer";
import Station from "./Station";
export default function MissionRail() {
  const { stations } = useScrollyConfig();
  const finalChapter = stations.at(-2), end = stations.at(-1);
  const railStyle = {
    "--rail-solid-end": `${finalChapter?.worldX ?? 0}px`,
    "--rail-tail-start": `${finalChapter?.worldX ?? 0}px`,
    "--rail-tail-width": `${Math.max(0, (end?.worldX ?? 0) - (finalChapter?.worldX ?? 0))}px`,
  } as CSSProperties;
  return <Layer name="rail">
    <div style={railStyle}>
      <div className="scrolly-rail-line" aria-hidden="true" />
      <div className="scrolly-rail-tail" aria-hidden="true" />
      <div aria-label="任务轨道">{stations.map(station => <Station key={station.id} station={station} />)}</div>
    </div>
  </Layer>;
}
