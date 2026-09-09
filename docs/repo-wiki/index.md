# March 7th Repo Wiki

这是三月七非官方纪念站的项目知识入口。当前产品包括角色首页、`#memories` 横向叙事和 `/photo-wall` 时光回廊；主体是 React 静态前端，Worker 提供资源与正式域名规范化。

源码、测试、配置和实际运行行为是最终事实来源。本 Wiki 负责解释和导航，[Knowledge Cards](../../.knowledge/index.md) 提供同一知识的任务约束视图；修改前须核对当前实现。

## 架构与模块

- [架构总览](architecture.md)：运行层次、依赖方向和外部资源。
- [首页与渐进增强](modules/home.md)：页面组合、语录、主视觉弹层与剪影。
- [横向叙事](modules/scrollytelling.md)：连续世界、插槽、配置和动画所有权。
- [时光回廊](modules/photo-wall.md)：照片数据、3D 环形轨道与大图交互。
- [构建与交付](modules/delivery.md)：预渲染、Worker、SEO 和可选数据库边界。

## 跨模块流程

- [构建、请求与 hydration](workflows/build-and-routing.md)
- [公开配置加载与异常恢复](workflows/runtime-config.md)
- [调整场景、素材与节点](workflows/scrolly-content.md)
- [相册拖拽与打开大图](workflows/photo-interaction.md)

## 决策与现有资料

- [配置驱动与动画所有权](decisions/config-and-animation.md)：来自现有工程规则与代码注释的决策依据。
- [Scrollytelling 技术说明](../SCROLLYTELLING.md)：复用已有实现细节与手动浏览器验证方法。
- [Workers 构建说明](../../CLOUDFLARE_WORKERS.md)、[开发命令](../../README.md)、[工程规则](../../AGENTS.md)。

## 覆盖边界

没有把每个 CSS 类、占位场景和 helper 单独知识化；它们可从局部源码理解。D1 只有未接入的示例和空 schema，不存在需要描述的真实数据库业务。历史 `analysis.md`、原型提示词及 `RepoWiki.md` 是背景/任务材料，不作为运行契约。

后续优先从真实问题补充：生产子路径可达性、移动端构图与无障碍交互、远程图片失败处理、语录解析验证；启用 D1 时再记录实际 API、绑定与迁移流程。
