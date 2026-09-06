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

## 横向旅途场景

首页 `#memories` 使用 `app/components/horizontal-scene/HorizontalScenePage.tsx`。
纵向页面滚动通过 GSAP ScrollTrigger 固定场景，并按世界宽度减视口宽度驱动横移。
远景、中景、章节和前景独立移动；章节导航可直接跳转，末尾自动回到正常页面滚动。

内容和视觉调优统一修改 `public/config/journey.properties`：

- `stage.<序号>.*`：沿用原站全部七个章节，`position` 控制章节间距。
- `scene.*`：标题、提示、配色、装饰数量与角色横向位置。
- `motion.*`：视差倍率、节点显影、漂浮与步行节奏。

文件注释注明取值范围；配置解析器会报告缺失或非法键。构建时导入同一份文件进行
预渲染，浏览器再读取公开配置以支持内容更新。读取或解析失败时保留构建快照。
减少动态模式、低高度视口（600px 及以下）、极窄视口（小于 360px）及动画加载失败时，
页面以普通章节列表展示全部内容。组件卸载、断点切换时清理动画、定时器与监听。

`npm test` 包含预渲染回归、配置构建复制一致性及异常值校验。
