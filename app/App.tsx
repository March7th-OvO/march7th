import FormsScrollFade from "./forms-scroll-fade";
import HeroPhotoEnhancer from "./hero-photo-enhancer";
import Home from "./Home";
import SpacePhotoWall from "./components/SpacePhotoWall";

type AppProps = {
  pathname?: string;
};

/** 保留原站首页，并将 3D「时光回廊」作为独立子页面提供。 */
export default function App({ pathname = "/" }: AppProps) {
  if (pathname === "/photo-wall") {
    return <SpacePhotoWall />;
  }

  return (
    <>
      <Home />
      <FormsScrollFade />
      <HeroPhotoEnhancer />
    </>
  );
}
