# Cloudflare Workers 构建说明

此项目使用 vinext 与 Cloudflare Vite 插件部署到 Cloudflare Workers。连接 Git 仓库后，请在 Worker 的 **Settings → Build → Build configuration** 中使用以下设置：

- Production branch：`main`
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- Root directory：`/`
- Node.js：`22.13.0` 或更高版本

`npm run build` 会生成 `dist/server/wrangler.json`，并创建 `.wrangler/deploy/config.json` 指向该部署配置。之后执行 `npx wrangler deploy` 时，Wrangler 会自动使用构建后的 Worker 入口与客户端静态资源。

根目录的 `wrangler.jsonc` 是 Vite 构建的输入配置。不要添加 `pages_build_output_dir`，否则 Wrangler 会把项目识别为 Cloudflare Pages，导致 Workers 自动部署命令无法找到入口。
