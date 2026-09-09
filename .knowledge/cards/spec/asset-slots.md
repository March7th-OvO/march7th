---
id: march7th.asset-slots
type: spec
keywords: [slot, src, 素材, 图片, CDN, fallback, 占位, BASE_URL]
scope: [scrollytelling-assets]
sources:
  - app/components/scrollytelling/AssetSlot.tsx
  - app/config/scrollyAssets.ts
  - app/config/scrollyConfig.ts
  - app/config/scrollyLayout.ts
---

# 素材替换保留插槽与 motion wrapper

已有插槽通过 properties 的 src 替换素材，外层保留几何、id，内层保留动画 class。

## Invariants

- `slot.*.src` 键必填但值允许为空；空时显示 children 或占位符，非空图片优先于 children，标题和收尾文字也会被替换。
- 相对路径拼 BASE_URL；`/` 开头和完整 HTTP(S) URL 保持原样。parser 拒绝协议相对 URL、data/javascript、反斜杠和非法完整 URL。
- 格式合法不保证资源存在；img 没有加载失败自动回退占位符。
- 新增 slot 要扩展 SLOT_LAYERS/消费者，未知 properties 键不能动态生成结构。

[素材流程](../../../docs/repo-wiki/workflows/scrolly-content.md)
