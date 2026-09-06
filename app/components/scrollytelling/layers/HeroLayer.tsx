import OpeningScene from "../scenes/OpeningScene";
import PanoramaScene from "../scenes/PanoramaScene";
import HaloScene from "../scenes/HaloScene";
import MemoryScene from "../scenes/MemoryScene";
import Layer from "./Layer";
export default function HeroLayer() {
  return <Layer name="hero"><OpeningScene /><PanoramaScene /><HaloScene /><MemoryScene /></Layer>;
}
