# 横向 Scrollytelling 动画架构原型

首页入口仍为 `#memories`。本次移除了旧的 `horizontal-scene/`、`journey.properties`
和旧配置测试，用 React + GSAP + ScrollTrigger + @gsap/react + CSS + SVG 重建。
首页其余区域和独立相册页面保持原有功能。所有新场景素材均为标注名称的占位元素。

## 文件与职责

```text
app/components/scrollytelling/
  ScrollytellingPage.tsx     公开配置加载、错误显示、ref 和动画入口
  ScrollyConfigContext.ts    向组件传递同一份类型化配置
  Stage.tsx                 viewport pin、统一缩放、各画面根节点
  World.tsx                 连续世界的图层组成
  FixedHUD.tsx              固定 HUD 和可关闭的 Debug HUD
  Walker.tsx                独立 Walker，占位 silhouette 和 walking/idle 状态
  AssetSlot.tsx             世界几何坐标 + 独立 motion wrapper
  AssetPlaceholder.tsx      name/width/height/className 占位边界
  MissionRail.tsx           连续 Rail 与数据 map
  Station.tsx               白色矩形、黑字、cyan 六边形节点
  layers/
    Layer.tsx               图层宽度与标识
    FarBackground.tsx
    BackgroundLayer.tsx
    TypographyLayer.tsx
    HeroLayer.tsx
    ForegroundLayer.tsx
    ExtremeForegroundLayer.tsx
  scenes/
    OpeningScene.tsx         四张 portrait card
    PanoramaScene.tsx        panorama 角色
    HaloScene.tsx            halo 角色
    MemoryScene.tsx          circular reveal 与最终角色插槽
  transitions/
    GreenIris.tsx            SVG 覆盖圆和透明 aperture mask
    CyanTransition.tsx       穿过画面的巨大圆面
    CyanFlash.tsx            默认关闭的低对比度细弧光 overlay
app/hooks/useScrollytelling.ts
app/config/scrollyAssets.ts
app/config/scrollyConfig.ts
app/config/scrollyLayout.ts
app/config/scrollyTimeline.ts
app/data/stations.ts
app/styles/scrollytelling.css
public/config/scrollytelling.properties
tests/scrollytelling-config.test.mjs
tests/scrollytelling.browser.mjs
```

上述文件为新架构文件；修改的原有文件为 `app/Home.tsx` 与 `README.md`，
新增本文档。初始工作区内已有的 `analysis.md` 和原型提示词文档不属于实现变更。

## 主时间轴与坐标

唯一 Master Timeline 位于 `app/hooks/useScrollytelling.ts`。
`gsap.registerPlugin(ScrollTrigger, useGSAP)` 在这里集中注册。
ScrollTrigger pin 的是 Stage；Stage 本身不参与横移。
World 是共享世界坐标容器，内部每层独立做线性绝对位移：

```text
WORLD_DISTANCE = layout.worldWidth - layout.referenceWidth = 11200 - 1280 = 9920
layerX = -WORLD_DISTANCE × parallax[layer] × progress
timelineTime = timeline.duration × progress
```

远景 0.35、背景 0.60、文字与 Hero 0.80、Rail 1.00、前景 1.25、极近前景 1.45。
HUD 完全独立，倍率为 0。World 父节点不额外平移，避免重复计算。
层宽按 `referenceWidth + WORLD_DISTANCE × factor` 计算，不在 CSS 重复维护。

统一设计坐标为 1280×576。World 和 HUD 使用 contain 缩放，保留构图比例和 safe area；
Transition 单独使用 cover 缩放，确保其他宽高比下也能覆盖整个 viewport。
图层 z-index 集中在 CSS 顶部；World 不创建额外 stacking context，
Walker 能位于 Rail 上方、Foreground 下方。

Milestone 值在公开配置的 `timeline.*`；键名、类型和纯场景状态计算在
`app/config/scrollyTimeline.ts`。默认时间依次是：

```text
0 START / 0.95 CARDS_START / 1.55 CARDS_EXPAND / 4.60 PANORAMA_START
7 PANORAMA_MAIN / 11.55 HALO_ENTER / 13.45 THE_WILL_ENTER
13.65 GREEN_IRIS_START / 15.05 GREEN_IRIS_END
15.65 CYAN_TRANSITION_START / 17.40 MEMORY_SCENE_READY
19.40 CYAN_FLASH_START / 20.80 CYAN_FLASH_END / 23.38 END
```

23.38 为时间坐标，无自动播放。Scenes 始终挂载；状态名称只用于调试和后续开发。
局部效果全部属于同一条时间轴，反向滚动不用维护另一套状态。
进度写入 ref 与 Debug 文本，不逐帧更新 React state。
序幕至第五幕的背景大字分别位于对应节点之后；入场时间由标题横向位置自动换算，
随 Master Timeline 从上向下出现，反向滚动时按原路径向上退场。
收尾文案使用独立的最高世界前景层，最终落点为设计坐标 `(390, 380)`；
它随 Master Timeline 从中心向两侧揭示，反向滚动时收回中心。

## 调整滚动与素材

调整整个滚动长度：修改 `layout.scrollDistance`，单位 CSS px，刷新页面。
调整世界移动距离：修改 `layout.worldWidth`；参考宽度通常保持不变。
素材位置需考虑该层的视差倍率：

```text
slot.x ≈ WORLD_DISTANCE × layerFactor × (目标时间 / timeline.duration) + 画面内目标 x
```

8 个 Station（包含序幕前的“六相冰”和第五幕后“未完待续”节点）的固定标识与类型在 `app/data/stations.ts`，
实际数据在 `station.<id>.type/x/displayId/label`，由解析器转换后 map 渲染。
`displayId` 是页面展示的简体中文编号；`SR-*` 仅作为稳定的内部配置键与节点标识。
节点不含点击或路由行为。

所有图片类占位元素使用 `AssetPlaceholder`。`AssetSlot` 外层读取
`slot.<id>.name/src/x/y/width/height`，内层 motion wrapper 挂动画。
正式素材只需在 `public/config/scrollytelling.properties` 填写对应 `src`：

```properties
slot.panorama-character.src=assets/scrollytelling/panorama-character.webp
```

相对路径会自动拼接部署时的 Vite `BASE_URL`；也支持 `/` 开头的站内绝对路径和
完整 HTTP(S) CDN URL。`src` 留空时继续显示占位符，因此素材尚未齐备时仍可调试布局。
素材替换不改 Scene/Layer 的 JSX、插槽 id 或动画 class，也不影响 GSAP 时间轴。

Green Iris 使用单一 SVG mask：覆盖圆和透明孔重叠展开，避免整屏填满后突然挖孔。
区间由原先 0.3 延长至 1.4 个时间轴秒，颜色使用紫色装饰色，峰值透明度 0.14。
圆心、覆盖与揭示时长占比、半径和透明度由 `motion.iris*` 控制；
`irisApertureStartRatio` 必须小于 `irisCoverRatio`，保留提前揭示。
Cyan Transition 在 `transitions/CyanTransition.tsx`，圆心与半径为 `motion.cyan*`；
MemoryScene 的角色 wrapper 使用 `clip-path: circle()` 揭示。
Cyan 圆面以恒定速度通过画面，峰值透明度 0.16，使用高饱和强调色
`color.vividAccent`；角色从转场开始就揭示，底层构图始终透过色层可见。
两种色层使用 `motion.transitionFadeRatio` 控制柔和入场和退场。

Scrollytelling 的主题色完整维护在公开配置的 `color.*`：浅色背景、柔和卡片、核心粉色、
冰晶高光、高饱和强调、夜空/深色文字、次级蓝色和紫色装饰共八项。CSS 只引用由 Stage
注入的语义变量，半透明网格、阴影和覆盖层通过这些基色派生，不另存重复色值。

Cyan Flash 默认通过 `motion.flashEnabled=false` 关闭。
手动开启时，它是 1.4 个时间轴秒的细弧光：峰值透明度 0.08，
线宽为半径的 0.035，使用 sine 缓慢显隐，不切换场景。
这些时长是滚动时间轴坐标，实际可见时长仍由滚动速度决定。
减少动态效果偏好下继续禁用全部转场。

## 配置与生命周期验证

公开配置用于 SSR 快照、客户端运行时加载、生产静态复制。解析器校验必填项、有限数字、
范围、颜色、布尔值、milestone 次序、节点顺序和视差次序；错误包含对应键名。
参数读取失败时显示错误并停止动画，保留稳定 DOM 让 GSAP 正确恢复 pin spacer。

`useGSAP` 使用 section scope、配置依赖和 `revertOnUpdate`。
GSAP matchMedia 清理本实例的时间轴和 ScrollTrigger；组件同时注销 observer、
load/refreshInit/scrollEnd 监听、取消 refresh RAF，并防止 fonts.ready 在卸载后刷新。
ResizeObserver 与 ScrollTrigger refresh 更新尺寸，不创建另一条时间轴。

```bash
npm run typecheck
npm run lint
npm test
```

浏览器回归需要本地 Playwright（可用 `PLAYWRIGHT_MODULE_PATH` 指向已有安装）和 Edge：

```bash
npm run dev
node tests/scrollytelling.browser.mjs
```

可通过 `SCROLLY_TEST_URL` 修改开发服务地址，通过 `SCROLLY_BROWSER` 选择浏览器 channel。
脚本验证正反向 20 个时间点（含 13.83、16.93、19.56）、转场透明度上限、
默认关闭的 Flash 及手动开启后的弧光强度、视差、React 提交次数不变、停止滚动后的 idle、
三个桌面尺寸与移动端不溢出、结束解除 pin、减少动态效果切换、运行时非法配置清理。
截图与机器可读结果输出至被 Git 忽略的 `outputs/scrollytelling/`。

本次验证结果：TypeScript、ESLint、7 项构建/配置测试和浏览器回归均通过。
滚动采样期间 React 提交次数固定为 2（初次挂载与运行时配置加载）；1920×1080 生产静态
预览无 hydration 错误、无 Debug HUD，只有一个 Scrollytelling pin spacer。
浏览器替换运行时配置后，滚动长度变为 12000px 且节点文案更新成功。

本机 `npm start` 的 Miniflare/Workers runtime 启动失败，因此 Workers 本地预览未验证；
通过静态 HTTP 服务验证了 `dist/client` 的生产前端产物。本次没有部署。
构建仍有既有 FormsScrollFade 动态导入与新版静态 GSAP 导入合并的提示，不影响构建完成。

## 当前简化范围

这是动画架构原型。背景、人物、halo、前景、Walker 均为明确标注的占位素材；
HUD 无导航功能，Station 无任务逻辑。未制作正式字体、人物 sprite、花瓣、音频、
WebGL、逐像素视频复刻或完整移动端排版。移动端沿用等比缩放，减少动态效果模式改为静态内容流。
