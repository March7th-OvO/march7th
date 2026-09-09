# 构建、请求与 hydration

## Trigger / Flow

1. `npm run build` 执行 Vite，输出客户端静态资源和 Worker 部署配置，public 配置与资源复制到客户端产物。
2. `scripts/prerender.mjs` 使用 Vite SSR module loader 导入默认 App，`renderToString` 将首页注入 `dist/client/index.html`。只有首页生成正文。
3. 部署后的请求在进入 Worker 时，先检查已知正式域名规范化，再委托 ASSETS。回退方式由 `wrangler.jsonc` 控制。
4. 已加载应用 HTML 的浏览器执行 `main.tsx`，移除 pathname 尾斜杠；`/` 且 root 有内容时 hydrate，否则先清空已有内容再 createRoot。
5. App 对 `/photo-wall` 渲染相册，其余 pathname 渲染 Home。这里是初次挂载分支，没有通用客户端导航状态机。

## Important Invariants

服务端渲染与客户端首次首页渲染必须一致。不要在 render 阶段读取 window、随机化内容或先加载另一份运行时配置。`FixedHUD` 区分 SSR/DEV，默认生产不输出 Debug HUD。

## Failure / Edge Cases

当前 Worker 配置为 `404-page`，public 中没有 photo-wall HTML，预渲染脚本也不输出相册页面，首页相册链接是普通 `<a href="/photo-wall">`。据仓库配置推断，默认生产资产处理不会为此路径返回应用首页，存在子路径可达性缺口；本初始化不修改路由，线上实际状态仍须请求验证。

开发 Vite 的 HTML 回退可能让相册看起来正常，不能作为生产证据。未来修复时应同时考虑相册直接访问、刷新、未知路径真实 404、SEO 和现有 404 测试，不可仅据旧部署文档切换为全站 SPA 回退。

## Related Modules / Relevant Source

[交付](../modules/delivery.md) · [首页](../modules/home.md) · [相册](../modules/photo-wall.md)

[build 脚本](../../../package.json) · [预渲染](../../../scripts/prerender.mjs) · [main](../../../app/main.tsx) · [App](../../../app/App.tsx) · [Worker](../../../worker/index.ts) · [配置](../../../wrangler.jsonc) · [产物测试](../../../tests/rendered-html.test.mjs)
