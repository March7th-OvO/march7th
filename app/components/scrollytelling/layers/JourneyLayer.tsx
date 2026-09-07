import AssetSlot from "../AssetSlot";
import { useScrollyConfig } from "../ScrollyConfigContext";
import Layer from "./Layer";

/** 收尾文案独占最高世界层级，但沿用 foreground 的位移倍率。 */
export default function JourneyLayer() {
  const { slots } = useScrollyConfig();
  const journeyCopy = slots["journey-card"].name;
  const signature = "March7th";
  const signatureIndex = journeyCopy.indexOf(signature);
  return <Layer name="foreground" className="scrolly-layer-journey">
    <AssetSlot id="journey-card" className="journey-message-motion"><p className="journey-message" aria-label={journeyCopy}>
      {signatureIndex < 0 ? journeyCopy : <>
        <span>{journeyCopy.slice(0, signatureIndex)}</span>
        <span className="journey-signature">{signature}</span>
        <span>{journeyCopy.slice(signatureIndex + signature.length)}</span>
      </>}
    </p></AssetSlot>
  </Layer>;
}
