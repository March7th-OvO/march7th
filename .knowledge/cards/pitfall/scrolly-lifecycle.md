---
id: march7th.scrolly-lifecycle
type: pitfall
keywords: [cleanup, StrictMode, pin, spacer, 配置错误, reduced-motion, matchMedia]
scope: [scrollytelling]
sources:
  - app/components/scrollytelling/ScrollytellingPage.tsx
  - app/hooks/useScrollytelling.ts
  - app/styles/scrollytelling.css
  - tests/scrollytelling.browser.mjs
---

# 错误与重建必须先让 GSAP 归还 DOM

Page 保留稳定 Stage DOM，运行时配置错误通过 enabled=false 触发 useGSAP 清理，CSS 隐藏 Stage 并显示错误文本。不能用条件 JSX 先删除被 pin spacer 接管的节点。

## Invariants

- useGSAP 有 section scope、`[config, enabled]` 依赖和 `revertOnUpdate`；matchMedia.revert 只撤销本实例。
- 清理包括 observer、load/refreshInit/scrollEnd 监听、refresh RAF、样式与异步 fonts.ready disposed 防护。
- reduced-motion 动态切换撤销 pin/动画并使用静态内容流。不得全局 kill 所有 ScrollTrigger，避免破坏首页剪影。
- 静态流不等于完整可读：章节标题保留大字号/不换行，Stage 隐藏溢出；新长文案有裁切风险。现有脚本只检查首张 portrait 可见，须另验目标标题和素材的实际可读性。

[配置生命周期](../../../docs/repo-wiki/workflows/runtime-config.md)
