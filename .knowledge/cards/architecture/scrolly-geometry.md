---
id: march7th.scrolly-geometry
type: architecture
keywords: [视差, parallax, World, Stage, JourneyLayer, 时间轴, 移动端, scale]
scope: [scrollytelling]
sources:
  - app/hooks/useScrollytelling.ts
  - app/config/scrollyLayout.ts
  - app/components/scrollytelling/World.tsx
  - app/components/scrollytelling/layers/JourneyLayer.tsx
  - app/styles/scrollytelling.css
---

# 连续世界的几何与动画所有权

Stage 只 pin/缩放，World 不横移；每层位移为 `-(worldWidth-referenceWidth) × factor × progress`。不同层的出现顺序比较 `x / factor`。

## Invariants

- 唯一 Master Timeline 仅约束 `#memories`；FormsScrollFade 仍有独立动画。进度写 ref/DOM，不能逐帧 setState。
- Scenes 始终挂载，scene 状态仅调试。局部效果绑定 motion wrapper，不改插槽外层几何。
- 七种视差键不代表七个层节点：JourneyLayer 单独置顶但复用 foreground 倍率。
- 横屏设计面 contain，竖屏按高度缩放可能裁左右；转场面始终 cover。World 不增加阻隔 Walker 层级的 stacking context。

[模块说明](../../../docs/repo-wiki/modules/scrollytelling.md)
