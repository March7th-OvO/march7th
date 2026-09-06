import { useScrollyConfig } from "./ScrollyConfigContext";
import Layer from "./layers/Layer";
import Station from "./Station";
export default function MissionRail() {
  const { stations } = useScrollyConfig();
  return <Layer name="rail">
    <div className="scrolly-rail-line" aria-hidden="true" />
    <div aria-label="Mission Rail">{stations.map(station => <Station key={station.id} station={station} />)}</div>
  </Layer>;
}
