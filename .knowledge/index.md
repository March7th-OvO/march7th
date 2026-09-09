# Agent Knowledge Index

这里保存短、密、可检索的长期项目知识，不保存任务进度。复杂任务先按关键词搜索，只读相关的 1～3 张 Card，然后沿 `sources` 检查真实实现。源码、测试、配置和运行行为始终高于 Wiki/Card。

```bash
rg -n -i 'hydration|404|路由' .knowledge/cards
rg -n -i 'slot|station|视差|文案' .knowledge/cards
rg -n -i '配置|cleanup|reduced' .knowledge/cards
```

| 任务线索 | 优先卡片 | 长篇说明 |
| --- | --- | --- |
| 部署、路径、SEO、hydration | [路由与预渲染](cards/pitfall/routing-and-hydration.md) | [构建与路由](../docs/repo-wiki/workflows/build-and-routing.md) |
| properties、语录、构建快照 | [两类配置](cards/spec/config-loading.md) | [配置流程](../docs/repo-wiki/workflows/runtime-config.md) |
| 视差、图层、时间轴、移动端 | [几何所有权](cards/architecture/scrolly-geometry.md) | [横向叙事](../docs/repo-wiki/modules/scrollytelling.md) |
| StrictMode、错误清理、减少动态效果 | [动画生命周期](cards/pitfall/scrolly-lifecycle.md) | [配置流程](../docs/repo-wiki/workflows/runtime-config.md) |
| station、章节、编号、收尾文案 | [旅途展示语义](cards/domain/journey-display.md) | [场景修改](../docs/repo-wiki/workflows/scrolly-content.md) |
| 图片、slot、CDN、占位 | [素材边界](cards/spec/asset-slots.md) | [场景修改](../docs/repo-wiki/workflows/scrolly-content.md) |
| 相册、RAF、拖拽、lightbox | [相册交互](cards/workflow/photo-interaction.md) | [相册流程](../docs/repo-wiki/workflows/photo-interaction.md) |
| D1、DB、notes、API、迁移 | [数据库未接入](cards/architecture/optional-database.md) | [构建交付](../docs/repo-wiki/modules/delivery.md) |
| 测试、Playwright、preview | [验证边界](cards/tech-stack/validation-boundaries.md) | [现有技术说明](../docs/SCROLLYTELLING.md) |

新增 Card 的门槛：缺少它会导致重复探索或错误判断。保持稳定 id、单一主题、keywords、scope 和仓库根相对 sources；修改持久事实时同步受影响的 Wiki 与 Card，优先修订已有条目。完整维护规则见 [AGENTS.md](../AGENTS.md)。
