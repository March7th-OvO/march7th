---
id: march7th.routing-hydration
type: pitfall
keywords: [路由, photo-wall, hydration, SSR, 404, Worker, SEO]
scope: [delivery, app-entry]
sources:
  - app/main.tsx
  - app/App.tsx
  - scripts/prerender.mjs
  - wrangler.jsonc
  - tests/rendered-html.test.mjs
---

# App 分支不等于生产路由可达

仅首页在构建时预渲染；main 对 `/` 且已有内容的 root 做 hydration，其余情况清空 root 后 createRoot。App 仅显式识别 `/photo-wall`，其他路径走 Home。

## Agent Warning

- Wrangler 实际使用 `404-page`，测试也锁定这一契约。没有相册 HTML 产物或显式 Worker 路由，不能从 dev 正常推断生产深链接正常。
- 普通相册链接会触发新文档请求。若修复可达性，须一起验证直接访问、刷新、未知路径 404 与首页 hydration。
- Worker 不执行 React 请求时 SSR；浏览器专用逻辑放 effect，保持 App 服务端可导入。

[完整流程](../../../docs/repo-wiki/workflows/build-and-routing.md)
