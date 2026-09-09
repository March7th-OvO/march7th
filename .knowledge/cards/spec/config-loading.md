---
id: march7th.config-loading
type: spec
keywords: [配置, properties, quotes, typed, snapshot, hydration, 未知键]
scope: [home, scrollytelling]
sources:
  - app/Home.tsx
  - app/config/scrollyConfig.ts
  - app/components/scrollytelling/ScrollytellingPage.tsx
  - public/config/quotes.properties
  - public/config/scrollytelling.properties
  - AGENTS.md
---

# 两类公开配置的加载契约

Scrollytelling 用 `?raw` 快照进行初始渲染，effect 再 fetch 同名配置并复用 parser；语录仅在 Home effect 加载和解析，再初始化 typed.js。它们不是同一 parser。

## Invariants

- 可变配置修改同步注释、类型、解析、非法值处理；必填缺失错误含键名。公开文件不可存密钥。
- Scrolly 拒绝重复键；语录后值覆盖同名键。不要把两者当完整 Java properties 格式。
- 未知键不会自动生效，例如文件中的 `color.nightSurface` 没有 parser 消费者；增加配置必须追到消费端。
- 初始快照非法会阻断模块加载/构建；runtime 失败才显示页面错误。语录 reduced-motion 初始展示首句。

[加载与验证流程](../../../docs/repo-wiki/workflows/runtime-config.md)
