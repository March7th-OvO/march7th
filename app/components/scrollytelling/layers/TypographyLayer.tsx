import AssetSlot from "../AssetSlot";
import { useScrollyConfig } from "../ScrollyConfigContext";
import Layer from "./Layer";

const CHAPTER_TITLE_IDS = ["title-prologue", "title-act-1", "title-act-2", "title-act-3", "title-act-4", "title-act-5"] as const;

export default function TypographyLayer() {
  const { slots } = useScrollyConfig();
  return <Layer name="typography">
    {CHAPTER_TITLE_IDS.map(id => <AssetSlot key={id} id={id} className="chapter-title-motion">
      <h3 className="chapter-title">{slots[id].name}</h3>
    </AssetSlot>)}
  </Layer>;
}
