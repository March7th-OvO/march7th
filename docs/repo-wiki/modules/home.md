# 首页与渐进增强

## Purpose / Responsibilities

首页组织主视觉、角色档案、横向旅途、三种形态剪影与页脚。`Home` 维护导航展开和档案卡选中状态，加载语录；`App` 在首页分支追加 `FormsScrollFade` 和 `HeroPhotoEnhancer`。

## Main Components / Dependencies

- `Home.tsx`：页面结构、`quotes.properties` 的专用解析器，配置加载完成后动态导入 typed.js；图片经 CDN Image Resizing 生成不同尺寸。
- `HeroPhotoEnhancer`：查找 Home 的 `.visual-frame` 增加鼠标/键盘入口，Portal 弹层支持翻面、指针旋转和 Escape 关闭，并恢复 body overflow。
- `FormsScrollFade`：查找 `.forms-section` / `.forms-grid` / `.form-card`，独立 GSAP context 控制渐显。
- Home 组合 `ScrollytellingPage`；子页面相册不挂载这些首页增强组件。

## Boundaries / Invariants

增强组件通过 DOM selector 耦合首页结构，调整上述 class 时须一起检查增强组件和 CSS。语录及 typed 参数来自公开配置，不能另设重复数组。减少动态效果下语录展示首句、剪影 effect 跳过动画；语录失败显示提示并记录 console 错误。effect 卸载须中止异步加载并销毁已创建实例。

本模块不负责 Worker 路由、数据库、Scrollytelling 帧循环。现有内容仍有硬编码；新增可运营参数遵循根 AGENTS.md，而不是假定已存在通用 CMS。

## Related Workflows / Relevant Source

[公开配置流程](../workflows/runtime-config.md) · [构建与 hydration](../workflows/build-and-routing.md)

[Home](../../../app/Home.tsx) · [App](../../../app/App.tsx) · [语录配置](../../../public/config/quotes.properties) · [剪影增强](../../../app/forms-scroll-fade.tsx) · [主视觉增强](../../../app/hero-photo-enhancer.tsx) · [首页样式](../../../app/index.css) · [弹层样式](../../../app/hero-photo.css)
