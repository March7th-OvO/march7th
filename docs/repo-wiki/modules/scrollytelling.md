# 横向叙事

## Purpose / Responsibilities

把纵向滚动映射为连续横向世界，展示三月七的旅途节点、人物素材和转场。现有[技术说明](../../SCROLLYTELLING.md)保留几何公式、具体效果和浏览器脚本用法，这里解释所有权及修改边界。

## Main Components / Dependencies

- `ScrollytellingPage` 管理构建快照、运行时配置请求、错误状态和 refs；Context 将同一配置交给整个组件树。
- `Stage` 提供 pin 根节点、设计面、转场面和 HUD 面，将配置转换为 CSS 变量。
- `World` 组合图层。七种视差键不等于七个 DOM 图层：`JourneyLayer` 是额外的高层级容器，复用 `foreground` 位移倍率。
- `AssetSlot` 固定几何和素材边界；`useScrollytelling` 拥有局部 motion wrapper、Master Timeline、ScrollTrigger 和尺寸刷新生命周期。
- `SLOT_LAYERS`、`STATION_IDS`、`MILESTONE_KEYS` 是代码中的结构约束；具体数值和展示内容属于 properties。

## Boundaries / Invariants

Stage 被 pin 但不横移；World 父节点不叠加位移，各层直接按自身倍率计算。Scenes 始终挂载，场景状态仅用于调试，不能据此条件卸载内容破坏反向滚动。

逐帧进度写 ref/DOM，不通过 React setState。减少动态效果会撤销动画并由 CSS 展示普通内容流；配置错误保留 DOM 供 GSAP 清理，但通过 CSS 隐藏 Stage。清理仅作用于本 section 实例。

Station 是固定内部 ID 对应的展示节点，`displayId` 才是页面编号。HUD 中“返回/首页/校园商店”是占位内容，不代表已实现导航或商店。

## Related Workflows / Relevant Source

[配置加载与清理](../workflows/runtime-config.md) · [场景内容修改](../workflows/scrolly-content.md)

[Page](../../../app/components/scrollytelling/ScrollytellingPage.tsx) · [Stage](../../../app/components/scrollytelling/Stage.tsx) · [World](../../../app/components/scrollytelling/World.tsx) · [Hook](../../../app/hooks/useScrollytelling.ts) · [解析器](../../../app/config/scrollyConfig.ts) · [布局类型](../../../app/config/scrollyLayout.ts) · [节点类型](../../../app/data/stations.ts) · [CSS](../../../app/styles/scrollytelling.css)
