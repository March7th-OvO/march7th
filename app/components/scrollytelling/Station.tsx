import type { CSSProperties } from "react";
import type { StationData } from "../../data/stations";

export default function Station({ station }: { station: StationData }) {
  return (
    <div className="scrolly-station" data-station-type={station.type} style={{ left: station.worldX } as CSSProperties}>
      <span className="scrolly-station-hex" aria-hidden="true" />
      <span className="scrolly-station-id">{station.id}</span>
      <strong>{station.label}</strong>
    </div>
  );
}
