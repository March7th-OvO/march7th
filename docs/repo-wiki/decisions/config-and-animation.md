# 配置驱动与动画所有权

## 依据与状态

这是对已有 [AGENTS.md](../../../AGENTS.md)、[World 注释](../../../app/components/scrollytelling/World.tsx)、[AssetSlot 注释](../../../app/components/scrollytelling/AssetSlot.tsx)和 [Hook 注释](../../../app/hooks/useScrollytelling.ts)的归纳，不是新架构提案，也不推断未记录的历史评审过程。

## 问题与选择

素材运营、几何调优和动效节奏经常变化，根工程规则选择公开 properties 保存可变值，代码保留结构键与类型。构建快照和浏览器配置复用同一 Scrollytelling parser，使首次 hydration 一致并让后续刷新读取公开内容。

横向世界需要可逆滚动和统一视差。现有实现选择一个局部 Master Timeline、绝对图层位移和独立 motion wrapper：减少跨 Scene 状态同步，避免父子位移重复相乘，替换素材时保留动画绑定。

## 被排除的替代方式与后果

- 不在 Scene 重复硬编码配置值，否则运营修改出现多处来源；结构常量无需为了配置化而动态生成。
- 不给每个场景建立独立 ScrollTrigger 或根据 scene 状态卸载 JSX，否则可逆动画和清理需要额外协调。
- 不将 World 与子层同时横移，否则视差计算重复；不通过 React state 驱动逐帧进度。

这些约束只覆盖对应模块。它们不禁止首页剪影独立动画，也不要求相册改用 GSAP。现有硬编码参数在未来相关任务中按配置驱动规则处理，初始化知识体系不迁移业务实现。

## 相关知识

[架构](../architecture.md) · [配置流程](../workflows/runtime-config.md) · [场景修改流程](../workflows/scrolly-content.md)
