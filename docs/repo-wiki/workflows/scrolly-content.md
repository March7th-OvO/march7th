# 调整场景、素材与节点

## Trigger / Flow

运营替换素材、改旅途文案或调整出现节奏时，先定位目标 slot、station 或 milestone，不直接在 Scene 中增加另一套参数。

1. 通过 `SLOT_LAYERS` / `STATION_IDS` 确认固定结构；现有插槽填 `slot.<id>.src`，位置、尺寸、名字继续在 properties 中维护。
2. parser 校验配置并形成 Context；AssetSlot 外层应用几何，内层提供稳定动画 class。
3. src 非空时优先显示图片，覆盖 children 文字 fallback；为空时使用 children 或 AssetPlaceholder。相对路径拼 BASE_URL，站内绝对路径与 HTTP(S) URL 保持原样。
4. Hook 将纵向滚动映射到唯一时间轴，各层横移；章节标题与收尾文案根据所在层位置反推入场时间。
5. 验证配置与产物，交互变化再运行手动浏览器回归，检查正反向滚动、不同屏幕比例、减少动态效果和错误清理。

## State / Data Transformation

`D = worldWidth - referenceWidth`；`layerX = -D × parallax[layer] × progress`；图层宽度为 `referenceWidth + D × factor`。不同层上内容的遇见顺序要比较 `x / factor`，不能直接比较原始 x。

## Important Invariants

- 章节标题名对应中间六个站点 label，但配置是两份键：修改章节文案时同步 `station.*.label` 与 `slot.title-*.name`，测试验证它们相等。
- 新增节点不能只加 properties：当前八个内部 ID 固定在代码，六个标题也有固定映射，测试还约束位置顺序、间距及收尾落点。
- Station 与人物 slot 没有显式关联字段。“某章对应主角”需要沿 HeroLayer/Scene 并结合坐标和时间核实，不能仅按章节编号推断素材 ID。
- `motion.chapterTitle*` 是六章共享参数。单章延后可通过改该 slot.x 实现，但也会改变画面位置；若要求位置不变，应增加受校验的局部参数并接入现有时间轴，不能直接改全局参数影响其他章节。
- 改现有素材不需要更改 slot id、motion class 或新增 ScrollTrigger。新结构确有必要时才同步类型映射、消费者和测试。
- `JourneyLayer` 有独立 z-index，但使用 foreground 的倍率；收尾文案中 `March7th` 子串会被拆成签名字体。
- 时间轴数值是滚动坐标，不是墙钟播放秒数；默认关闭 flash，转场透明度上限由 parser 限制。

## Failure / Edge Cases

路径解析只验证格式，不保证图片存在；当前 img 没有失败后自动退回占位符的 onError。未知配置项不会自动生成新 slot 或 station。

减少动态效果下，现有浏览器脚本检查首张 portrait 可见及动画清理，没有验证目标章节长标题完整可读。CSS 中章节标题仍是大字号且不换行，Stage 隐藏溢出；较长新文案存在裁切风险，须在实际视口验证，不能把 visibility=visible 当作可读性通过。

## Related Modules / Relevant Source

[横向叙事](../modules/scrollytelling.md) · [技术细节与浏览器命令](../../SCROLLYTELLING.md)

[配置](../../../public/config/scrollytelling.properties) · [布局](../../../app/config/scrollyLayout.ts) · [AssetSlot](../../../app/components/scrollytelling/AssetSlot.tsx) · [路径解析](../../../app/config/scrollyAssets.ts) · [标题](../../../app/components/scrollytelling/layers/TypographyLayer.tsx) · [人物场景入口](../../../app/components/scrollytelling/layers/HeroLayer.tsx) · [收尾](../../../app/components/scrollytelling/layers/JourneyLayer.tsx) · [Hook](../../../app/hooks/useScrollytelling.ts) · [CSS](../../../app/styles/scrollytelling.css) · [约束测试](../../../tests/scrollytelling-config.test.mjs) · [浏览器测试](../../../tests/scrollytelling.browser.mjs)
