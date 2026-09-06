import type { CSSProperties } from "react";

type AssetPlaceholderProps = {
  name: string;
  width: number;
  height: number;
  className?: string;
};

/** 素材替换边界：动画挂在父级 wrapper，后续可直接把本组件替换为 img/picture。 */
export default function AssetPlaceholder({ name, width, height, className = "" }: AssetPlaceholderProps) {
  return (
    <div
      className={`scrolly-asset-placeholder ${className}`.trim()}
      style={{ "--asset-width": `${width}px`, "--asset-height": `${height}px` } as CSSProperties}
      aria-label={`${name} 素材占位`}
    >
      <span>{name}</span>
      <small>{width} × {height}</small>
    </div>
  );
}
