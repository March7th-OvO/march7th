# React + GSAP 横向卷轴动态场景实现提示词

请为我实现一个 **React 动态场景页面**，视觉和交互效果参考“2D 横向卷轴式游戏地图 / 动态平面设计页面”。

重点还原以下动效特征：

## 一、技术要求

- 使用 **React**
- 样式可用 **CSS Modules** 或普通 CSS
- 动画优先使用 **GSAP + ScrollTrigger**
- 小型元素动效可用 **CSS keyframes**
- 不要使用 Three.js
- 不要引入复杂后端
- 页面要能直接运行
- 代码结构清晰，组件拆分合理

## 二、核心视觉与交互效果

### 1. 整体结构

请实现一个 **横向卷轴式场景页面**，具有以下特征：

- 用户鼠标滚轮向下滚动时
- 页面内容表现为一个**超宽的横向世界**从右向左移动
- 视觉上像“角色在向右前进”

请实现：

- 一个固定视口容器 `scene-wrapper`
- 一个超宽世界层 `world`
- 页面滚动时，`world` 水平平移
- 使用 `ScrollTrigger` 将场景区域 **pin 住**
- 用纵向滚动驱动横向位移

> 请不要实现成简单的 `overflow-x: scroll` 横向滚动容器，而要实现成 **纵向滚动驱动的沉浸式横向场景动画**。

### 2. 多层视差效果

整个世界至少拆成 4 层：

- `background-far`：最远背景，移动最慢
- `background-mid`：中景背景，中等速度
- `route-layer`：路线、节点、主要内容层
- `foreground-near`：前景装饰，移动最快

要求：

- 各层随着滚动产生不同水平位移速度
- 形成明显的 **Parallax 视差感**
- 远景移动慢，近景移动快

建议视差速度比例：

- far：0.3
- mid：0.6
- route：1.0
- near：1.3

### 3. 固定角色 + 行走错觉

页面中放置一个 **白色剪影风格的小角色**，位于屏幕左下偏中位置，要求：

- 角色在视觉上基本固定，不跟随世界整体移动
- 通过背景向左移动，营造“角色在向右前进”的感觉
- 角色有轻微上下起伏或步行动画
- 可以使用 CSS sprite / 简单 keyframes / 微小位移模拟走路感
- 角色位置建议固定在：
  - `left: 14% ~ 20%`
  - `bottom: 16% ~ 22%`

### 4. 路线与节点系统

场景中央偏下有一条贯穿横向世界的“路线”，类似关卡地图。

请实现：

- 一条白色或浅色的主路线
- 路线上分布多个节点，例如：
  - SR-1
  - SR-2
  - SR-3
  - SR-4
  - SR-5
- 节点之间通过线段连接
- 节点进入视口时有淡入、上浮、缩放动画
- 当前节点可高亮
- 鼠标 hover 节点时有轻微放大、发光、标签浮现效果

每个节点可以包含：

- 标题
- 简短副标题
- 一个圆点或圆角卡片
- 进入视口时的 reveal 动画

> 节点之间请通过一条连续路线连接，角色视觉上沿着路线前进，节点依次被激活，像章节地图或探索地图。

### 5. 装饰图形与动态平面设计元素

请在场景中加入大量装饰元素，使页面更像“动态平面设计 / 游戏地图 UI”。

可以包括：

- 巨型几何圆形
- 大号英文排版文字
- 抽象块状图形
- 家具 / 器物剪影
- 细线条
- 半透明图层
- 悬浮小纸片 / 小碎片 / 小粒子
- 轻微旋转的装饰物

要求：

- 这些装饰元素分布在不同景深层中
- 一部分静态，一部分持续轻微循环动画
- 使用 `transform: translate / rotate / scale`
- 不要做得过度花哨，要有设计感

### 6. 漂浮与循环小动效

请给页面加入一些“页面即使不滚动也在动”的细节，例如：

- 小纸片上下漂浮
- 圆形元素缓慢旋转
- 装饰图形轻微呼吸感缩放
- 粒子轻微飘动
- 角色轻微上下浮动

请用 CSS keyframes 实现多个 reusable 动画类，例如：

- `floatSlow`
- `floatFast`
- `rotateSlow`
- `pulseSoft`
- `drift`

### 7. 页面风格

整体风格参考：

- 2D 动态平面设计
- 蓝色 / 靛蓝 / 冷紫色主色调
- 高对比黑色剪影元素
- 白色路线和白色小角色
- 大面积留白与大字号排版结合
- 有点“游戏地图 UI + 艺术化展陈页面”的感觉

建议主色：

- 背景主色：`#4d6bff`、`#5c73ff`、`#4458d9`
- 深色装饰：`#12131a`
- 白色元素：`#ffffff`
- 点缀色：`#a98bff` 或 `#d4c1ff`

## 三、页面结构建议

请将代码拆分为以下组件：

- `HorizontalScenePage`
- `SceneWrapper`
- `World`
- `ParallaxLayer`
- `Player`
- `RoutePath`
- `RouteNode`
- `FloatingDecor`
- `SceneTitle`（可选）

并保持组件职责清晰。

## 四、动画实现要求

### ScrollTrigger 横向滚动

请实现：

- 页面进入该区域后固定视口
- 纵向滚动映射为横向位移
- 横向位移距离根据 `worldWidth - viewportWidth` 计算
- 动画使用 `scrub: true`

### Reveal 动画

节点和部分装饰元素进入视口时：

- opacity 从 0 到 1
- y 从 40 到 0
- scale 从 0.95 到 1
- ease 使用平滑曲线

### 循环动画

漂浮元素使用 CSS keyframes 持续运动，不依赖滚动。

## 五、响应式要求

请做基础响应式适配：

- 桌面端优先
- 平板和窄屏下缩小世界高度与角色尺寸
- 节点和大标题不要溢出严重
- 小屏时可以适当减少装饰物数量

## 六、页面结构参考

```html
<section class="scene-wrapper">
  <div class="scene-sticky">
    <div class="world">
      <div class="background-far"></div>
      <div class="background-mid"></div>

      <div class="route-layer">
        <div class="route-line"></div>
        <div class="route-nodes"></div>
      </div>

      <div class="foreground-near"></div>
    </div>

    <div class="player"></div>
    <div class="fixed-ui"></div>
  </div>
</section>
```

## 七、关键实现逻辑

### 1. `scene-wrapper` 提供滚动距离

例如：

```css
.scene-wrapper {
  position: relative;
  height: 5000px;
}
```

### 2. 固定视口

```css
.scene-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}
```

### 3. `world` 是超宽舞台

```css
.world {
  position: absolute;
  inset: 0;
  width: 4000px;
  height: 100%;
}
```

### 4. GSAP 控制世界横移

```js
gsap.to(worldRef.current, {
  x: () => -(worldWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: wrapperRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
});
```

### 5. 不同图层使用不同视差系数

例如：

```js
gsap.to(".background-far", {
  x: -500,
  ease: "none",
  scrollTrigger: {
    trigger: wrapperRef.current,
    scrub: true,
  },
});

gsap.to(".background-mid", {
  x: -1000,
  ease: "none",
  scrollTrigger: {
    trigger: wrapperRef.current,
    scrub: true,
  },
});

gsap.to(".foreground-near", {
  x: -1800,
  ease: "none",
  scrollTrigger: {
    trigger: wrapperRef.current,
    scrub: true,
  },
});
```

## 八、视觉细化要求

请将视觉效果进一步向以下方向靠拢：

- 页面整体更像“游戏章节地图”
- 场景中加入一些大尺寸排版文字作为背景设计元素
- 部分黑色几何剪影故意超出屏幕边界
- 节点不是均匀机械排列，而是略有节奏变化
- 页面中加入一些抽象家具 / 物件剪影，增强舞台感
- 让装饰元素有轻微随机漂浮，不要完全整齐
- 角色为简洁白色剪影，尽量不要写实
- 整体偏艺术化、轻剧情感，而不是后台管理风格

## 九、工程实现要求

请帮我在 React 项目中实现一个“横向卷轴式动态场景页面”。

功能目标：

- 鼠标滚轮驱动横向场景移动
- 场景区域固定，滚动过程中页面不直接向下翻
- 多层视差：远景 / 中景 / 内容层 / 前景
- 固定角色，营造角色前进感
- 多个路线节点随滚动逐步出现
- 装饰元素有循环漂浮动画

技术限制：

- React + GSAP + ScrollTrigger
- 只用 2D DOM/CSS 实现
- 不要 Three.js
- 不要 Canvas
- 保持结构清晰、易维护

代码要求：

- 封装成一个独立页面组件
- 使用 `useEffect` / `useLayoutEffect` 初始化 GSAP
- 组件卸载时记得清理动画
- 节点数据使用数组配置渲染
- 装饰元素尽量数据驱动
- 给出清晰的 className 和必要注释

建议输出文件：

- `HorizontalScenePage.jsx` 或 `HorizontalScenePage.tsx`
- `HorizontalScenePage.css`
- 如有必要可拆：
  - `RouteNode.jsx/tsx`
  - `Player.jsx/tsx`
  - `data.js/ts`

## 十、最终输出要求

请直接输出：

1. 完整 React 组件代码
2. 对应 CSS 代码
3. GSAP ScrollTrigger 初始化代码
4. 必要的占位数据
5. 代码可直接运行
6. 如需图片素材，请先用纯 CSS / SVG / 占位块实现，不依赖真实素材文件

请尽量还原以下感觉：

- 不是普通网页滚动，而像一个横向探索地图
- 角色像在走路
- 世界是一个很长的舞台
- 不同层次具有空间感
- 画面中有持续的小动效
- 有设计感和叙事感

如果一次输出过长，请按以下顺序分批输出：

1. 页面结构与 React 组件
2. CSS 样式
3. GSAP 动画逻辑
4. 优化建议
