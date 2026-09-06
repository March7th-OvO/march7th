import type { ReactNode } from "react";
import { layerWidth, type LayerName } from "../../../config/scrollyLayout";
import { useScrollyConfig } from "../ScrollyConfigContext";
export default function Layer({ name, children }: { name: LayerName; children: ReactNode }) {
  const { layout, parallax } = useScrollyConfig();
  return <div className={`scrolly-layer scrolly-layer-${name}`} data-parallax={name}
    style={{ width: layerWidth(layout, parallax[name]) }}>{children}</div>;
}
