import AssetSlot from "../AssetSlot";
import Layer from "./Layer";
export default function BackgroundLayer() {
  return <Layer name="background"><AssetSlot id="background-a" /><AssetSlot id="background-b" /><AssetSlot id="background-c" /></Layer>;
}
