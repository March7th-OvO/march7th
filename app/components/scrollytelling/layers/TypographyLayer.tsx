import AssetSlot from "../AssetSlot";
import { useScrollyConfig } from "../ScrollyConfigContext";
import Layer from "./Layer";
export default function TypographyLayer() {
  const { slots } = useScrollyConfig();
  const eternity = slots["eternity-title"].name.split(/\s+/).map((word, index) => <span key={index}>{word}<br /></span>);
  return <Layer name="typography">
    <AssetSlot id="title-opening"><p className="micro-label">{slots["title-opening"].name}</p></AssetSlot>
    <AssetSlot id="title-laterano"><h3 className="hero-title">{slots["title-laterano"].name}</h3></AssetSlot>
    <AssetSlot id="title-will" className="will-motion"><p className="decorative-title">{slots["title-will"].name}</p></AssetSlot>
    <AssetSlot id="eternity-title">
      <p className="hero-title">{eternity}</p>
      <p className="hero-title outline-title" aria-hidden="true">{eternity}</p>
    </AssetSlot>
  </Layer>;
}
