import AssetSlot from "../AssetSlot";
export default function OpeningScene() {
  return <div data-scene="WORLD_A_CARDS">
    {(["portrait-01", "portrait-02", "portrait-03", "portrait-04"] as const).map(id =>
      <AssetSlot key={id} id={id} className="portrait-card" />)}
  </div>;
}
