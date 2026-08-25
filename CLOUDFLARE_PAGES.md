# Cloudflare Pages 构建说明

此源码包已包含 Cloudflare Pages Advanced Mode 构建脚本。将源码上传到 GitHub 或 GitLab，再于 Cloudflare Pages 连接该仓库即可。

## 构建设置

- Framework preset：`None`
- Build command：`npm run build:pages`
- Build output directory：`dist/pages`
- Root directory：`/`
- Node.js：`22.13.0` 或更高版本

## 运行时设置

在 Pages 项目的 **Settings → Functions → Compatibility flags** 中，为 Production 与 Preview 环境添加：

```text
nodejs_compat
```

建议将 Compatibility date 设置为：

```text
2026-05-15
```

构建脚本会将 Vinext 的服务端入口整理为 `dist/pages/_worker.js`，同时复制网页静态资源。Cloudflare Pages 会以 Advanced Mode 运行该入口。
