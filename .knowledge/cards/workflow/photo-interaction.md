---
id: march7th.photo-interaction
type: workflow
keywords: [相册, photo-wall, RAF, 拖拽, lightbox, 焦点, 照片数量]
scope: [photo-wall]
sources:
  - app/components/SpacePhotoWall.tsx
  - app/space-photo-wall.css
---

# 相册的帧循环与交互状态

轨道用 RAF/ref 写 CSS 3D，React state 管理大图选中状态；它不属于 GSAP 世界。

## Invariants

- 拖拽结束短暂抑制 click，防止误开大图；大图打开暂停自动旋转，关闭后恢复并还原触发按钮焦点。
- 悬停只改变视觉；reduced-motion 停自动旋转与入场展开，仍可手动拖拽。
- 卡片自身只 rotateY，倾斜作用于轨道中心坐标；位置层与视觉层不要合并。
- 增删照片同步数组、CARD_COUNT、步长依赖和数量文案；当前不是完全由数组长度驱动。
- 卸载清理 RAF、observer、媒体查询；页面外层恢复 title/root class。

[完整交互流程](../../../docs/repo-wiki/workflows/photo-interaction.md)
