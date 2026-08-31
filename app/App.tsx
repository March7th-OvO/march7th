import FormsScrollFade from "./forms-scroll-fade";
import HeroPhotoEnhancer from "./hero-photo-enhancer";
import Home from "./Home";

/** 组合页面主体和两个仅负责渐进增强的交互组件。 */
export default function App() {
  return (
    <>
      <Home />
      <FormsScrollFade />
      <HeroPhotoEnhancer />
    </>
  );
}
