---
id: march7th.journey-display
type: domain
keywords: [station, 节点, 章节, displayId, 文案, SR, JourneyLayer, 收尾]
scope: [scrollytelling-content]
sources:
  - app/data/stations.ts
  - public/config/scrollytelling.properties
  - app/components/scrollytelling/layers/TypographyLayer.tsx
  - app/components/scrollytelling/layers/JourneyLayer.tsx
  - app/components/scrollytelling/layers/HeroLayer.tsx
  - app/hooks/useScrollytelling.ts
  - tests/scrollytelling-config.test.mjs
---

# 旅途节点是展示数据，不是任务系统

八个 `SR-*` 是固定内部 ID，`displayId` 是页面编号，`label` 是文案；Station 没有点击/路由。HUD 的商店和导航也是占位。

## Invariants

- 六个标题 slot.name 与中间六个 station.label 对应，配置需一起改，测试验证相等。
- 新增节点需调整固定 ID、相关标题映射和测试；只加 properties 不会生成节点。
- Station 与主角 slot 没有显式映射，需结合 HeroLayer/Scene、位置与时间核实业务指代，不能按章节序号猜素材。
- `motion.chapterTitle*` 全部章节共用；单章改 slot.x 会同时改变位置与入场时间，位置不变的局部延后需新增受校验参数。
- 测试还约束节点间距、跨层遇见顺序和收尾落点。改 x 时先按倍率比较，不能只看原始坐标。
- 收尾 name 中的 `March7th` 子串会被单独使用签名字体，改文案可能改变这一展示。

[修改流程](../../../docs/repo-wiki/workflows/scrolly-content.md)
