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

## 横向 Scrollytelling 原型

首页 `#memories` 已替换为 DOM + CSS + SVG 占位原型。ScrollTrigger 固定 Stage，
一条 0–23.38 时间轴驱动 11200px 连续世界的七个视差图层与全部转场。
向上滚动可逆向还原，结束后恢复普通页面滚动。

调整内容和参数统一编辑 `public/config/scrollytelling.properties`：

- `layout.worldWidth` 与 `layout.referenceWidth` 的差值为世界移动距离。
- `layout.scrollDistance` 是完整滚动长度，默认 9800 CSS px。
- `timeline.*` 控制 milestone；`motion.*` 控制局部动效。
- `parallax.*` 控制图层倍率；`slot.<id>.*` 控制素材名字、坐标和尺寸。
- `station.<id>.*` 控制节点类型、文案和位置；`color.*` 控制主要配色。
- `debug.enabled` 默认 false；开发环境自动显示 Debug HUD。

配置使用同一份构建快照进行预渲染，再在浏览器中重新读取。非法配置会显示包含键名的错误，
停止并清理当前动画。系统减少动态效果模式下，内容以普通文档流展示。

组件职责、素材替换方式、验证命令与简化范围见 [Scrollytelling 技术说明](./docs/SCROLLYTELLING.md)。
