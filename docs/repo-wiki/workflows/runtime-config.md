# 公开配置加载与异常恢复

## Trigger / Flow

页面挂载触发公开配置读取。配置在浏览器可见，不允许存放密钥；更新公开文件后需刷新页面，当前不是持续轮询或远程 CMS。

| 阶段 | Scrollytelling | 首页语录 |
| --- | --- | --- |
| 初始渲染 | `?raw` 导入 → parse → 构建快照 → Context/Stage | 空目标 span，effect 尚未运行 |
| 挂载后 | BASE_URL 下 fetch，`cache: no-cache` → 同一 parser → setConfig | BASE_URL 下 fetch → Home 专用 parser → typed.js 动态导入 |
| 校验失败 | 错误文本 → enabled=false → useGSAP revert；稳定 DOM 保留，CSS 隐藏 Stage | console 错误和“语录暂时读取失败。” |
| 减少动态效果 | matchMedia 动态切换，撤销 pin/动画，CSS 静态内容流 | 初始化时检查，显示配置首句 |
| 卸载 | abort 请求、revert context、移除监听/observer/RAF | abort 请求、disposed 防护、destroy Typed |

## State / Data Transformation

Scrollytelling 的配置变化触发 React 更新与动画重建，逐帧状态仍写 ref/DOM。初始配置非法会在模块导入/构建阶段抛错；客户端 fetch 错误才进入页面错误 UI，不能混为同一种失败。

两个 parser 语义不同：Scrollytelling 拒绝重复键和无 `=` 的有效行；语录 parser 跳过无效行、空值并让后值覆盖同名键。它们不是完整 Java properties 解析器，不能假定支持转义或续行。

## Important Invariants / Validation

新增配置需同步注释、类型、解析与错误处理。必填错误包含键名；Scrollytelling 的 `slot.*.src` 可以为空但键不能缺失。未知键目前不会被通用拒绝，写入文件不等于已有消费者；例如 `color.nightSurface` 存在于文件但未进入 parser 的 colors 返回值。

配置改动验证开发读取、生产复制一致和非法配置；`npm test` 已覆盖 Scrollytelling 这部分。语录没有专门 parser 单测，需针对所改路径补适当验证，不能声称已由 Scrollytelling 测试覆盖。

## Related Modules / Relevant Source

[首页](../modules/home.md) · [横向叙事](../modules/scrollytelling.md)

[语录消费者](../../../app/Home.tsx) · [语录文件](../../../public/config/quotes.properties) · [Scrolly parser](../../../app/config/scrollyConfig.ts) · [Scrolly 文件](../../../public/config/scrollytelling.properties) · [Page](../../../app/components/scrollytelling/ScrollytellingPage.tsx) · [清理](../../../app/hooks/useScrollytelling.ts) · [测试](../../../tests/scrollytelling-config.test.mjs)
