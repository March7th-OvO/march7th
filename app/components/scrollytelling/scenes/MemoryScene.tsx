import AssetSlot from "../AssetSlot";
/** 角色一直属于连续 World，圆形揭示后继续随 Hero 图层移动，不替换或卸载场景。 */
export default function MemoryScene() {
  return <div data-scene="MEMORY_HERO">
    <AssetSlot id="memory-character" className="memory-reveal" /><AssetSlot id="final-character" />
  </div>;
}
