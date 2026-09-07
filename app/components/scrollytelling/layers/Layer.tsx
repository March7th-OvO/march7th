import type { ReactNode } from "react";
import { layerWidth, type LayerName } from "../../../config/scrollyLayout";
import { useScrollyConfig } from "../ScrollyConfigContext";
export default function Layer({ name, children, className = "" }: { name: LayerName; children: ReactNode; className?: string }) {
  const { layout, parallax } = useScrollyConfig();
  return <div className={`scrolly-layer scrolly-layer-${name} ${className}`.trim()} data-parallax={name}
    style={{ width: layerWidth(layout, parallax[name]) }}>{children}</div>;
}
