# 时光回廊

## Purpose / Responsibilities

`/photo-wall` 展示独立全屏照片环。`SpacePhotoWall` 负责页面 title 和根元素 class 的设置/恢复；内部 Carousel3D、PhotoCard 和 PhotoLightbox 分别负责轨道、卡片和大图。

## Dependencies / Important Concepts

实现依赖 React、Pointer Events、ResizeObserver、requestAnimationFrame 与 CSS 3D，不依赖 GSAP 或 Three.js。照片文件名来自组件内数组，缩略图和大图都使用 `assets.march7th.moe/image/PhotoWall` 的图片缩放 URL；大图仅在打开弹层时渲染。

轨道中心坐标做倾斜，卡片自身只 rotateY。位置 wrapper 和视觉 button 分开，悬停视觉突出不会暂停自动旋转。固定种子产生星点，避免每次渲染变化。

## Boundaries / Invariants

- 照片数组、`CARD_COUNT`、角度步长以及页面数量文案需要一致；当前都围绕 15 张实现，不能只追加数组后认为全部布局会自动适配。
- angle、拖拽、惯性、暂停标识存在 ref 中；React state 只负责选中大图等离散交互。
- 拖拽、大图打开、减少动态效果会影响自动旋转；减少动态效果不禁止用户手动拖拽。
- 相册与首页弹层是不同实现，不可假定共享焦点或 body 滚动处理。
- 页面能否被生产 URL 请求到属于交付模块；App 存在分支不等于 Worker 已提供对应 HTML。

## Related Workflows / Relevant Source

[相册交互](../workflows/photo-interaction.md) · [构建与路由](../workflows/build-and-routing.md)

[SpacePhotoWall](../../../app/components/SpacePhotoWall.tsx) · [CSS](../../../app/space-photo-wall.css) · [App](../../../app/App.tsx) · [main](../../../app/main.tsx)
