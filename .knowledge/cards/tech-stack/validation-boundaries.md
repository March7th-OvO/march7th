---
id: march7th.validation-boundaries
type: tech-stack
keywords: [测试, npm test, Playwright, browser, preview, Vite, Worker]
scope: [validation, delivery]
sources:
  - package.json
  - vite.config.ts
  - tests/rendered-html.test.mjs
  - tests/scrollytelling-config.test.mjs
  - tests/scrollytelling.browser.mjs
---

# 产物测试、浏览器回归和 Worker 验证分开

`npm test` 先完整 build，再运行 `tests/*.test.mjs`；不会运行 `.browser.mjs`。配置/几何与 HTML 产物通过不表示交互或生产请求已验证。

## Agent Warning

- 浏览器脚本需要 Vite dev 服务（读取 Vite 转换模块），以及已有 Playwright/浏览器；Playwright 不是当前 package 依赖。
- `PLAYWRIGHT_MODULE_PATH` 指向可 require 的安装，`SCROLLY_TEST_URL`/`SCROLLY_BROWSER` 可改地址/channel；默认 localhost:5173 和 msedge。
- dev 不启用 Cloudflare 插件，build/preview 才启用。静态 HTTP 预览不能验证 Worker 重定向、绑定或真实 404。
- 旧技术说明中的通过记录属于历史结果，不代表当前任务已执行。相册和语录没有专门自动交互覆盖。

[验证说明](../../../docs/SCROLLYTELLING.md)
