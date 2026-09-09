# 相册拖拽与打开大图

## Trigger / Flow

进入相册后，ResizeObserver 测量轨道，RAF 按时间差更新角度并写入卡片位置和视觉 CSS 属性。悬停只改变视觉，不改变基础转速。

1. 主指针按下时捕获 pointer，清除旧惯性，记录起点和时间。
2. 指针移动更新 angle ref 和惯性；超过移动阈值标记为拖拽。
3. 结束拖拽释放捕获，短暂抑制 click，防止浏览器合成点击误开大图；正常情况下基础转速叠加衰减惯性继续运行。
4. 合法点击保存触发按钮，暂停轨道自动角度更新，写入 selectedPhoto 并加载高清图。
5. 弹层将焦点放到关闭按钮，拦截 Tab，支持 Escape 和背景点击关闭；关闭后下一帧将焦点还给触发按钮。

## Important Invariants / Edge Cases

RAF 与位置 refs 独立于 React 选中状态；每帧 setState 会改变当前更新模型。减少动态效果跳过展开与自动旋转，手动拖拽仍可用。卸载取消 RAF、断开 ResizeObserver 并移除媒体查询监听；外层恢复 title 与根 class。

当前没有相册专门自动交互测试；相关修改须验证拖拽不误点击、大图前后暂停/恢复、键盘焦点、减少动态效果和页面退出清理。此流程以应用已加载为前提，不证明 `/photo-wall` 的生产请求可达。

## Related Modules / Relevant Source

[时光回廊](../modules/photo-wall.md) · [请求与挂载](build-and-routing.md)

[Carousel3D / PhotoLightbox](../../../app/components/SpacePhotoWall.tsx) · [视觉交互](../../../app/space-photo-wall.css) · [页面选择](../../../app/App.tsx)
