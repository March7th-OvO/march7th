# 构建与交付

## Purpose / Responsibilities

Vite 构建客户端和 Worker；随后预渲染脚本将首页正文写入 `dist/client/index.html`。Worker 规范已知正式域名并将请求交给 ASSETS。站点 title、canonical、社交元数据和 JSON-LD 在根 `index.html`，robots、sitemap、404 页面来自 public。

## Main Components / Dependencies

- `vite.config.ts`：dev 使用原生 Vite，build/preview 才引入 Cloudflare 插件；不能用 dev 验证 Worker 行为。
- `scripts/prerender.mjs`：用临时 Vite 服务加载 TSX，渲染默认 App（首页），必须找到空 `#root` 标记。重复执行前应重新 build。
- `build/sites-vite-plugin.ts`：仅构建时复制 `.openai/hosting.json` 和 drizzle 元数据到 `dist/.openai`，不是运行时 API。
- `wrangler.jsonc` 是输入，插件生成部署配置；具体部署步骤复用 [Workers 说明](../../../CLOUDFLARE_WORKERS.md)。

## Boundaries / Invariants

当前 `not_found_handling` 是 `404-page`，与测试要求一致；不能将其文档化成 SPA fallback。规范域名的 301 仅针对代码中已知域名，保留路径和查询参数，不应重定向本地/预览域名。

数据库是可选脚手架：`.openai/hosting.json` 的 d1/r2 为 null，Wrangler 没有 D1 绑定，`db/schema.ts` 为空，migration journal 没有 entries。`getDb` 依赖 Worker 环境且缺少 DB 时显式抛错；不能导入客户端。`examples/d1/.../route.ts` 没有被 Worker 注册为路由，目录名不产生 API。

## Validation Boundary

`npm test` 会先完整 build，再运行 `tests/*.test.mjs`，覆盖首页产物/SEO/404/重定向与 Scrollytelling 配置及几何。它不运行 `scrollytelling.browser.mjs`。手动浏览器脚本需要外部已有 Playwright、可用浏览器和 Vite dev 服务；具体命令见现有技术说明。静态产物预览不能替代 Workers runtime 验证。

## Related Workflows / Relevant Source

[构建、请求、hydration](../workflows/build-and-routing.md)

[package](../../../package.json) · [Vite](../../../vite.config.ts) · [预渲染](../../../scripts/prerender.mjs) · [Worker](../../../worker/index.ts) · [Wrangler](../../../wrangler.jsonc) · [HTML 测试](../../../tests/rendered-html.test.mjs) · [D1 工厂](../../../db/index.ts) · [Schema](../../../db/schema.ts) · [Hosting](../../../.openai/hosting.json)
