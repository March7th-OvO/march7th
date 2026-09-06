import AssetSlot from "../AssetSlot";
import Layer from "./Layer";
export default function ForegroundLayer() {
  return <Layer name="foreground"><AssetSlot id="foreground-object" /><AssetSlot id="foreground-disc-a" /><AssetSlot id="foreground-disc-b" /></Layer>;
}
