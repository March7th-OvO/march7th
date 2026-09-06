import AssetSlot from "../AssetSlot";
import Layer from "./Layer";
export default function FarBackground() {
  return <Layer name="far"><div className="scrolly-grid" />
    <AssetSlot id="opening-bg" /><AssetSlot id="panorama-bg" /><AssetSlot id="halo-bg" /><AssetSlot id="memory-bg" />
  </Layer>;
}
