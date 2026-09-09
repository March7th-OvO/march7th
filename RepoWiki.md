你现在需要为当前代码仓库建立一套 Repository Knowledge System，使任何 Agent 在进入仓库后，都能够快速理解项目、定位相关源码、掌握关键约束，并在后续开发中持续维护这些知识。

目标是建立一套长期存在于 Git Repository 中、同时服务人类开发者与 Agent 的项目知识体系。

不要引入 RAG、Embedding、向量数据库、MCP、知识服务器、自动生成脚本或复杂检索基础设施。

只使用：

* Markdown
* Git
* 当前仓库已有源码、测试、配置与文档
* Agent 自身的仓库分析能力

---

# 1. 核心目标

这套体系只需要解决四个问题：

1. Agent 从哪里知道项目规则？
2. Agent 从哪里快速理解项目？
3. Agent 从哪里获得关键业务知识与隐含约束？
4. 修改代码以后，相关项目知识如何同步维护？

对应职责必须保持严格分离：

```text
AGENTS.md
    ↓
告诉 Agent 应该如何在仓库中工作

docs/repo-wiki/
    ↓
Human-oriented Knowledge View
面向人类的完整项目认知、架构说明和导航

.knowledge/cards/
    ↓
Agent-oriented Knowledge View
面向 Agent 的高密度、可快速检索知识单元

Source Code / Tests / Config
    ↓
最终事实来源
```

不得混淆这些职责。

---

# 2. 核心设计原则

必须遵守以下原则。

## 2.1 Source of Truth

源码、测试、配置、Schema、API Contract 和实际运行行为始终是最终事实来源。

Repo Wiki 和 Knowledge Card 都只是用于：

* 导航
* 理解
* 减少重复探索
* 保存难以从局部代码快速推断的知识

如果文档与当前代码发生冲突：

1. 检查源码、测试和配置；
2. 确认真正实现；
3. 以当前 Repository 状态为准；
4. 同时修正文档。

不要为了让代码符合过时文档而修改正确实现。

---

## 2.2 Single Knowledge Source, Multiple Views

不要人为维护两套互相独立的事实。

目标不是：

```text
Human Documentation

和

AI Documentation
```

分别描述两套项目事实。

正确模型是：

```text
Repository Knowledge
        │
        ├── Human View → Repo Wiki
        │
        └── Agent View → Knowledge Cards
```

它们表达方式不同，但必须描述同一个项目。

---

## 2.3 Human View 与 Agent View 的区别

Repo Wiki 回答：

> “请把这个项目或功能给我讲明白。”

Knowledge Card 回答：

> “Agent 在执行相关任务时必须知道什么？”

Repo Wiki 可以包含：

* 背景
* 架构
* 前因后果
* 模块职责
* 模块关系
* 业务流程
* 示例
* 设计原因
* Source Navigation

Knowledge Card 应优先包含：

* Fact
* Constraint
* Invariant
* Boundary
* Decision
* Relationship
* Warning
* Known Pitfall
* Relevant Source

Knowledge Card 必须短、密、自包含。

不要把 Repo Wiki 内容简单复制成 Card。

---

# 3. 初始化前先分析仓库

在创建任何文件之前，先阅读并分析当前 Repository。

至少检查：

* README
* 已存在的 AGENTS.md 或其他 Agent Rules
* package.json / pom.xml / build.gradle / pyproject.toml 等构建入口
* 主源码目录
* 测试目录
* 配置文件
* API / Schema / Migration
* 主要模块
* 核心业务入口
* 当前文档
* Git 状态

识别：

1. 项目的主要目的；
2. 当前技术栈；
3. 高层架构；
4. 2～5 个最核心模块；
5. 3～5 个最重要的跨模块 Workflow；
6. 明显存在的业务不变量；
7. 不容易从单个文件理解的架构边界；
8. 容易让新的 Agent 误判的实现；
9. 已经存在的重要架构决策；
10. 当前已有文档哪些可以复用。

不要仅通过目录名猜测架构。

重要结论必须通过实际源码、配置或测试验证。

---

# 4. 不要破坏已有知识体系

如果仓库已经存在：

* AGENTS.md
* docs/
* architecture docs
* ADR
* project rules
* development guide
* knowledge documents

不得直接覆盖或删除。

先分析现有内容。

能够复用的内容应尽量复用。

如果根目录已经存在 AGENTS.md：

* 保留已有有效规则；
* 在现有结构上补充 Repository Knowledge Protocol；
* 消除明显重复；
* 不得无理由重写用户已有工程规则。

如果仓库已经有类似 Wiki：

优先接入现有文档，而不是机械创建重复文档。

---

# 5. 初始化目标目录

原则上建立以下结构：

```text
repository/
│
├── AGENTS.md
│
├── README.md
│
├── docs/
│   └── repo-wiki/
│       ├── index.md
│       ├── architecture.md
│       ├── modules/
│       ├── workflows/
│       └── decisions/
│
├── .knowledge/
│   ├── index.md
│   └── cards/
│       ├── architecture/
│       ├── domain/
│       ├── workflow/
│       ├── spec/
│       ├── decision/
│       ├── pitfall/
│       └── tech-stack/
│
└── source...
```

但不要为了符合目录树而创建大量空目录或无意义文件。

只创建当前确实存在高价值知识的部分。

---

# 6. 创建或完善根 AGENTS.md

AGENTS.md 是整个 Repository Knowledge System 的入口。

它不是项目百科全书。

不要在其中堆积：

* 完整目录树
* 所有模块说明
* 所有 API
* 所有类
* 大量业务知识
* 可以通过源码直接得到的信息

AGENTS.md 应主要承担：

```text
Rules
+
Context Loading Protocol
+
Knowledge Router
+
Maintenance Protocol
```

至少应包含以下内容。

---

## Repository Knowledge

声明：

Human-oriented repository documentation：

```text
docs/repo-wiki/
```

Agent-oriented persistent knowledge：

```text
.knowledge/
.knowledge/cards/
```

并明确：

源码、测试、配置和实际运行行为是最终事实来源。

---

## Context Loading Protocol

对于简单、局部、低风险修改：

可以直接检查相关源码。

对于非平凡任务，Agent 应遵循：

```text
Task
 ↓
AGENTS.md
 ↓
识别 Domain / Module / Workflow
 ↓
必要时读取 docs/repo-wiki/index.md
 ↓
搜索 .knowledge/cards/
 ↓
只读取相关 Knowledge Cards
 ↓
根据 Card / Wiki 定位相关 Source
 ↓
验证当前实现
 ↓
实施修改
```

要求：

* 不要因为接到任务就盲目扫描整个仓库；
* 不要读取所有 Knowledge Cards；
* 根据任务关键词按需加载；
* 最终必须检查真实源码。

---

## Development Principles

保留项目现有规则，并至少覆盖以下通用原则：

* 优先最小且有针对性的修改；
* 避免无关重构；
* 优先复用已有抽象；
* 尊重现有模块边界；
* 不因为实现方便而放宽业务约束；
* 不无理由增加依赖；
* 不删除已有行为来简化任务；
* 修改前先确认现有实现。

---

## Knowledge Maintenance

要求所有 Agent 在完成非平凡修改后判断：

本次变化是否改变了：

* architecture
* module responsibility
* module boundary
* public API contract
* data model
* important workflow
* business invariant
* technical constraint
* cross-module dependency
* architecture decision
* known pitfall

如果改变：

必须同步更新相应 Repo Wiki / Knowledge Card。

如果只是：

* 简单 helper
* 明显代码行为
* 临时调试
* 单文件即可轻易理解的实现细节
* 短期任务状态

则不要写入长期知识。

优先修改已有知识，而不是创建重复 Card。

---

# 7. 创建 Human View：Repo Wiki

建立：

```text
docs/repo-wiki/
```

初始化不要一下生成几十篇文章。

初始目标只需要：

```text
index.md
architecture.md
2～5 个核心模块
3～5 个核心 Workflow
少量真正重要的 Decision
```

---

# 8. Repo Wiki index.md

`docs/repo-wiki/index.md` 是 Human Navigation Entry。

主要职责：

* 简短说明项目；
* 说明 Source of Truth；
* 提供 Architecture 导航；
* 提供 Module 导航；
* 提供 Workflow 导航；
* 提供 Decision 导航。

不要在 index.md 中复制所有正文。

它应该是 Wiki Homepage，而不是巨型项目说明。

---

# 9. architecture.md

Architecture 文档不得退化成目录树。

不要只记录：

```text
src/
components/
services/
utils/
```

应优先记录：

* 系统定位
* 高层组件
* 主要模块
* 模块职责
* 模块边界
* 依赖方向
* 数据流
* 外部系统
* 关键技术约束
* 不允许被破坏的架构原则

重点回答：

```text
Responsibility
Boundary
Relationship
Constraint
```

而不是：

```text
File List
Class List
Function List
```

---

# 10. Module Wiki

模块文档必须按照“职责”组织，而不是机械按照文件夹组织。

推荐结构：

```md
# Module Name

## Purpose

这个模块为什么存在。

## Responsibilities

负责什么。

## Out of Scope

明确不负责什么。

## Main Components

核心实现入口。

## Dependencies

依赖谁，以及谁依赖它。

## Important Concepts

理解该模块需要掌握的重要概念。

## Boundaries / Invariants

不能被破坏的边界和规则。

## Related Workflows

相关跨模块业务流程。

## Relevant Source

与此知识直接相关的源码路径。
```

Relevant Source 很重要。

Repo Wiki 不只是知识说明，还必须能够将开发者和 Agent 导向真正相关源码。

---

# 11. Workflow Wiki

对于跨多个模块的行为，不要强行放入某一个 Module Wiki。

应该建立 Workflow 文档。

例如可能存在：

```text
UI
 ↓
Hook
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
External System
```

Workflow 文档推荐包含：

```md
# Workflow Name

## Trigger

什么行为触发该流程。

## Flow

完整调用或数据流。

## State / Data Transformation

过程中有哪些关键状态或数据变化。

## Important Invariants

这个流程必须保持哪些业务规则。

## Failure / Edge Cases

存在明显复杂性的情况下记录重要异常路径。

## Related Modules

涉及哪些模块。

## Relevant Source

关键源码入口。
```

Workflow 文档的价值是避免未来新的 Agent 需要每次重新阅读多个文件才能拼出完整调用链。

---

# 12. Decision Wiki

只有真正长期影响设计的决策才进入：

```text
docs/repo-wiki/decisions/
```

重点记录：

* 为什么做这个决策；
* 当时解决什么问题；
* 为什么没有选择明显的替代方案；
* 这个决策现在约束哪些实现。

不要为普通实现选择制造 ADR。

---

# 13. 建立 Agent View：Knowledge Cards

创建：

```text
.knowledge/index.md
.knowledge/cards/
```

`.knowledge/index.md` 应向 Agent 说明：

* 这里保存的是高密度长期项目知识；
* 执行复杂任务前优先搜索；
* 只读取与当前任务相关的 Card；
* Source Code 始终是最终事实来源。

---

# 14. Card 分类

初期使用以下类别即可：

```text
architecture/
domain/
workflow/
spec/
decision/
pitfall/
tech-stack/
```

含义：

## architecture

回答：

* 系统如何分层？
* 模块边界在哪里？
* 谁拥有某项职责？

## domain

回答：

* 业务概念是什么意思？
* 什么业务不变量不能被破坏？

## workflow

回答：

* 某个重要行为跨哪些模块？
* 修改这一流程可能影响哪些位置？

## spec

回答：

* 当前 Repository 有哪些必须遵守的工程约定？
* 有哪些 API、数据或实现约束？

## decision

回答：

* 为什么选择当前方案？
* 哪些后续实现受该决策限制？

## pitfall

回答：

* 哪些地方非常容易被新的 Agent 理解错误？
* 哪些看起来合理的实现实际上是错误的？

## tech-stack

回答：

* 技术栈有哪些不明显但重要的限制？
* 版本、运行环境或框架约束会影响什么？

---

# 15. Knowledge Card 创建标准

不要为每一个模块、类或函数创建 Card。

创建 Card 前必须判断：

> 如果没有这条知识，下一次新的 Agent 是否很可能犯错、走弯路，或者必须阅读大量代码才能重新推断出来？

只有答案明显为“是”的知识才值得长期沉淀。

高价值内容通常包括：

* 隐含业务规则
* Architecture Boundary
* Business Invariant
* Domain Semantic
* 非显然数据关系
* 跨模块依赖
* 历史架构决策
* 易错技术语义
* 已知坑点
* 容易产生错误实现的假设

低价值内容通常包括：

* 某方法有多少行代码
* DTO 有几个字段
* 一个简单函数做什么
* 可以从单文件直接看到的逻辑
* 文件目录清单
* 标准库行为
* 临时开发状态

不要沉淀这些低价值知识。

---

# 16. Knowledge Card 格式

所有 Card 推荐采用：

```md
---
id: <stable.unique.id>
type: <architecture|domain|workflow|spec|decision|pitfall|tech-stack>

keywords:
  - keyword-1
  - keyword-2

scope:
  - logical-module-or-domain

sources:
  - path/to/source
  - path/to/test
---

# Human-readable Card Title

用非常简短的话说明事实。

## Invariants

- 必须成立的条件
- 不允许破坏的规则

## Relationships

必要时记录模块、数据或流程关系。

## Agent Warning

仅当确有价值时记录：

- 不要做什么
- 哪种看似合理的理解实际上错误
```

根据实际知识删减不需要的 section。

不要为了模板完整而制造空内容。

---

# 17. Card 的写作标准

Knowledge Card 必须：

* 短
* 密
* 可独立理解
* 能通过关键词搜索
* 描述一个清晰主题
* 指向 Relevant Source
* 对未来任务有持续价值

避免：

* 大段背景叙事
* 重复 Repo Wiki
* 重复源码
* 大量实现细节
* 一个 Card 混入多个无关主题

理想状态：

```text
Agent 搜索
 ↓
找到 1～3 张相关 Card
 ↓
阅读几十行
 ↓
立即获得任务所需约束
 ↓
进入真实源码
```

---

# 18. 初次初始化规模

非常重要：

不要试图在第一次初始化时把整个 Repository 完全知识化。

初始化的合理范围大致是：

```text
1 个 Architecture Overview

2～5 个核心 Module Wiki

3～5 个核心 Workflow Wiki

5～15 张高价值 Knowledge Card

少量真正重要的 Decision / Pitfall
```

优先覆盖：

```text
核心架构
+
高频开发模块
+
关键业务流程
+
已知易错点
```

而不是追求文件数量。

---

# 19. 禁止“为了完整而文档化”

如果某个知识：

* 很明显；
* 很容易从源码得到；
* 很少影响任务判断；
* 不会导致 Agent 误判；
* 没有长期价值；

则不要记录。

Repository Knowledge System 的目标不是覆盖所有代码。

目标是降低未来 Agent 的：

```text
Repeated Exploration Cost
+
Reasoning Error Rate
+
Context Consumption
```

---

# 20. 初始化过程

请按照以下顺序执行。

## Phase A — Repository Analysis

先完整理解高层结构。

不要立即创建文档。

输出内部分析结果：

* Project Purpose
* Tech Stack
* Architecture
* Core Modules
* Core Workflows
* Important Constraints
* Candidate Cards

验证后再进入下一阶段。

## Phase B — AGENTS.md

创建或完善根 AGENTS.md。

建立 Repository Knowledge Protocol。

## Phase C — Human Repo Wiki

创建：

* index
* architecture
* 必要的核心 modules
* 必要的 core workflows
* 必要的 decisions

## Phase D — Knowledge Cards

从真正高价值知识中提炼 5～15 张 Card。

不要机械从每篇 Wiki 生成一张 Card。

## Phase E — Cross Validation

完成后检查：

* Repo Wiki 是否与当前源码一致；
* Card 是否与当前源码一致；
* Wiki 与 Card 是否描述同一事实；
* 是否存在重复或矛盾；
* Relevant Source 是否有效；
* 是否记录了明显低价值内容；
* AGENTS.md 是否能让新 Agent 正确找到这些知识。

---

# 21. 后续开发闭环

必须在 AGENTS.md 中建立以下长期工作流：

```text
User Task
   ↓
Agent
   ↓
AGENTS.md
   ↓
Relevant Wiki / Knowledge Cards
   ↓
Relevant Source
   ↓
Verify Current Implementation
   ↓
Implement
   ↓
Tests / Validation
   ↓
Knowledge Impact Check
   ↓
Update Wiki / Card if necessary
```

知识维护属于任务完成条件的一部分。

但只有持久项目知识发生变化时才更新。

---

# 22. Bad Case Driven Knowledge Growth

初始化结束后，不应继续无目的扩充知识库。

后续主要通过真实开发过程增长：

```text
Agent 犯错
或
Agent 探索成本明显过高
        ↓
分析为什么
        ↓
确认是否缺少长期项目知识
        ↓
沉淀 Wiki / Card
        ↓
以后新的 Agent 直接复用
```

优先沉淀那些：

> 没有它，下一次 Agent 大概率还会犯同样错误的知识。

这比追求 Wiki 页数更重要。

---

# 23. 完成标准

不要用“创建了多少 Markdown 文件”判断初始化是否成功。

真正的验收方法是：

调用一个不了解上下文的 SubAgent 模拟一个全新的 Agent Session。

只给这个 Agent 一个真实、非平凡功能需求。

观察它是否可以：

```text
AGENTS.md
   ↓
快速找到正确知识
   ↓
理解模块与业务约束
   ↓
定位相关 Source
   ↓
避免扫描整个 Repository
   ↓
正确进入实现
```

如果仍然必须大量探索才能发现某个重要事实：

检查这个事实是否值得成为新的 Knowledge Card 或 Repo Wiki 内容。

---

# 24. 本次任务限制

本次只初始化 Repository Knowledge System。

除非为了理解项目确有必要，否则：

* 不修改业务实现；
* 不进行架构重构；
* 不新增业务功能；
* 不改变 API；
* 不修改数据库；
* 不升级依赖；
* 不进行与知识初始化无关的格式化。

如果分析过程中发现代码问题，只记录，不顺手修改。

---

# 25. 最终交付

完成后向我报告：

1. 创建或修改了哪些知识文件；
2. 当前 Repo Wiki 覆盖了哪些核心模块；
3. 当前 Repo Wiki 覆盖了哪些 Workflow；
4. 创建了哪些 Knowledge Cards，以及各自为什么值得长期保存；
5. 哪些领域暂时没有知识化，以及为什么；
6. 是否发现现有文档与源码不一致；
7. 如何验证下一次新的 Agent 能够使用这套知识体系；
8. 后续最值得通过真实 Bad Case 补充的知识领域。

不要只报告“初始化完成”。

我要能够据此判断这套 Repository Knowledge System 是否真正具有长期维护价值。