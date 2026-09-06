import BackgroundLayer from "./layers/BackgroundLayer";
import ExtremeForegroundLayer from "./layers/ExtremeForegroundLayer";
import FarBackground from "./layers/FarBackground";
import ForegroundLayer from "./layers/ForegroundLayer";
import HeroLayer from "./layers/HeroLayer";
import TypographyLayer from "./layers/TypographyLayer";
import MissionRail from "./MissionRail";

/** World 只定义连续坐标；各层直接计算绝对位移，避免父子 transform 重复乘视差。 */
export default function World() {
  return <div className="scrolly-world" aria-label="连续横向动画世界">
    <FarBackground /><BackgroundLayer /><TypographyLayer /><HeroLayer />
    <MissionRail /><ForegroundLayer /><ExtremeForegroundLayer />
  </div>;
}
