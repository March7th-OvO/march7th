import type { ReactNode } from "react";
import { resolveScrollyAssetSrc } from "../../config/scrollyAssets";
import type { SlotId } from "../../config/scrollyLayout";
import AssetPlaceholder from "./AssetPlaceholder";
import { useScrollyConfig } from "./ScrollyConfigContext";

/** 几何位置属于插槽，GSAP 只操作内层 motion wrapper；替换图片不影响时间轴。 */
export default function AssetSlot({ id, className = "", children }: { id: SlotId; className?: string; children?: ReactNode }) {
  const slot = useScrollyConfig().slots[id];
  // 配置素材优先于组件内的文字/占位 fallback，使所有插槽都能只改配置完成素材替换。
  const content = slot.src
    ? <img src={resolveScrollyAssetSrc(slot.src)} alt={slot.name} draggable={false} />
    : children ?? <AssetPlaceholder name={slot.name} width={slot.width} height={slot.height} />;
  return <div className={`scrolly-slot ${id}`} data-asset-slot={id}
    style={{ left: slot.x, top: slot.y, width: slot.width, height: slot.height }}>
    <div className={`scrolly-slot-motion ${className}`}>
      {content}
    </div>
  </div>;
}
