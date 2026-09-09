# Cloudflare Workers 构建说明

此项目使用 React、Vite 与 Cloudflare Vite 插件部署到 Cloudflare Workers。连接 Git 仓库后，请在 Worker 的 **Settings → Build → Build configuration** 中使用以下设置：

- Production branch：`main`
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- Root directory：`/`
- Node.js：`22.13.0` 或更高版本

`npm run build` 会生成客户端静态资源 `dist/client` 和 Worker 部署配置 `dist/march7th/wrangler.json`。Cloudflare Vite 插件会创建 `.wrangler/deploy/config.json`，之后执行 `npx wrangler deploy` 即可部署生成的 Worker 和静态资源。

根目录的 `wrangler.jsonc` 是构建输入配置，其中 `not_found_handling` 使用 `404-page`，由 `public/404.html` 提供未找到页面；`tests/rendered-html.test.mjs` 验证生成配置保持这一设置。不要添加 `pages_build_output_dir`，否则 Wrangler 会把项目识别为 Cloudflare Pages。

当前仅预渲染首页。`App.tsx` 虽然包含 `/photo-wall` 客户端分支，但仓库没有对应 HTML 产物或 Worker 路由；开发环境的 HTML 回退不能证明生产子路径可达。具体请求链、这一交付缺口及后续验证要求见 [构建与路由流程](docs/repo-wiki/workflows/build-and-routing.md)。
