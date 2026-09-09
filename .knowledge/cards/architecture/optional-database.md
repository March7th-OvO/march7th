---
id: march7th.optional-database
type: architecture
keywords: [D1, DB, notes, API, 数据库, migration, drizzle, 绑定]
scope: [delivery, database]
sources:
  - db/index.ts
  - db/schema.ts
  - drizzle/meta/_journal.json
  - .openai/hosting.json
  - wrangler.jsonc
  - worker/index.ts
  - examples/d1/app/api/notes/route.ts
---

# D1 与 notes 只是未接入的脚手架

当前站点没有实际数据库业务：schema 为空、migration journal 无 entries、hosting d1/r2 为 null、Wrangler 无 DB 绑定。

## Agent Warning

- `examples/d1/.../route.ts` 不会因文件路径自动成为 API；Worker 只处理域名规范化与 ASSETS，没有注册 notes。
- getDb 使用 `cloudflare:workers` 环境，缺失 DB 时抛错；不能放进浏览器调用链。
- 启用数据库需要真实绑定、schema、迁移和请求入口，不能只复制示例或运行 db:generate 就宣称 API 可用。

[交付边界](../../../docs/repo-wiki/modules/delivery.md)
