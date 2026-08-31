# March 7th · 三月七

献给《崩坏：星穹铁道》角色三月七的非官方纪念站。项目使用 React 19、Vite、TypeScript、Tailwind CSS 和 GSAP 构建，并通过 Cloudflare Workers 托管。

## 本地开发

需要 Node.js 22.13.0 或更高版本。

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run lint       # ESLint 检查
npm run typecheck  # TypeScript 类型检查
npm run build      # 生产构建
npm test           # 构建并验证 HTML 产物
npm start          # 本地预览生产构建
```

## 项目结构

- `index.html`：Vite HTML 入口和站点元数据
- `app/main.tsx`：React 客户端入口
- `app/App.tsx`：应用根组件
- `app/Home.tsx`：纪念站主页面
- `worker/index.ts`：Cloudflare Workers 静态资源入口
- `wrangler.jsonc`：Workers 与 SPA 回退配置

部署细节见 [CLOUDFLARE_WORKERS.md](./CLOUDFLARE_WORKERS.md)。
