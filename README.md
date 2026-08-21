# LLM-WIKI-RY

RY 的混合型个人知识库：用正式文章沉淀可长期阅读的知识，用研究笔记保留结论背后的证据与边界，并通过内容 Harness 阻止发布产物重新污染仓库。

本仓库采用 Agent 维护模式：原始来源保持只读，Wiki 保存派生知识，`AGENTS.md`、`CONTEXT.md` 与 Harness 共同约束摄取、查询、检查和索引。

## 内容导航

### 正式内容

- [LLM Wiki 入门与建设思考](content/基础知识/大语言模型知识库入门.md) — LLM Wiki 的核心结构、维护闭环与落地原则。
- [LLM Wiki：把知识从一次性检索变成持续复利的系统](content/基础知识/LLM%20Wiki：把知识从一次性检索变成持续复利的系统.md) — 在 Raw Sources、派生 Wiki 与 Schema 之间建立可持续维护的知识复利系统。
- [业务知识的完整生命周期](content/知识建模/业务知识生命周期.md) — 从原始证据到检索、评测和修复的知识生产流程。
- [从收藏到复利：把 LLM Wiki 做成 Agent 的长期上下文](content/知识建模/从收藏到复利：把%20LLM%20Wiki%20做成%20Agent%20的长期上下文.md) — 把收藏、会话和项目资产编译成可召回、可教学、可治理的长期上下文。
- [让 Context 流动起来：从个人知识底座到团队数字分身](content/智能体工作流/让%20Context%20流动起来：从个人知识底座到团队数字分身.md) — 用 Context 供应链连接个人知识积累、任务执行与团队协作。
- [从 LLM 到 Agentic Workflow](content/智能体工作流/从%20LLM%20到%20Agentic%20Workflow.md) — 从模型增强到工作流、评估和多 Agent 的演进地图。
- [从 Vibe Coding 到 Agentic Engineering](content/智能体工作流/从%20Vibe%20Coding%20到%20Agentic%20Engineering：把%20AI%20编程升级为可验证、可复利的软件工厂.md) — 可验证 AI 编程系统的上下文、Harness 与工程闭环。
- [Dynamic Workflow、Harness 与 Protocol Glue](content/智能体工作流/Dynamic%20Workflow、Harness%20与%20Protocol%20Glue：把%20Agent%20从“会做事”变成“可运行系统”.md) — 三种运行层的边界、协作方式和最小实现。
- [让 AI 安全进入生产环境：从 Spec、Zero Trust 到 Evaluation 的工程闭环](content/智能体工作流/让%20AI%20安全进入生产环境：从%20Spec、Zero%20Trust%20到%20Evaluation%20的工程闭环.md) — 规格、最小信任与评估如何构成生产门禁。
- [从 Loop 到 Graph：把智能体组织成可控、可恢复的执行系统](content/智能体工作流/从%20Loop%20到%20Graph：把智能体组织成可控、可恢复的执行系统.md) — 智能体执行拓扑、恢复机制与决策门。
- [把 AI 成本花在刀刃上：Model Routing 的任务分工、交付链与升级机制](content/智能体工作流/把%20AI%20成本花在刀刃上：Model%20Routing%20的任务分工、交付链与升级机制.md) — 按任务风险和成本选择模型的路由框架。
- [从 MCP、A2A 到 Agent Skills：AI Agent 生产化的连接、协作与评估体系](content/智能体工作流/从%20MCP、A2A%20到%20Agent%20Skills：AI%20Agent%20生产化的连接、协作与评估体系.md) — 工具连接、Agent 协作、技能封装和评估门禁。
- [CLAUDE.md 工程化指南：用最小规则预算构建可持续的 AI 编程上下文](content/智能体工作流/CLAUDE.md%20工程化指南：用最小规则预算构建可持续的%20AI%20编程上下文.md) — 用最小、分层规则维护 AI 编程上下文。

### 研究笔记

- [`verified`｜中国内地非货币开放式基金近 1 个月净值涨幅 Top 10](research/2026-07-31-china-open-end-fund-top10-one-month.md) — 2026-07-31 的历史数据快照，包含排行口径、复算和适用边界。

## 目录职责

| 目录 | 放什么 | 不放什么 |
| --- | --- | --- |
| `content/` | 可独立阅读、长期维护或发布的 Markdown 文章 | 调研过程、平台载荷、预览图 |
| `research/` | 一手证据、分析过程和有边界的研究结论 | 未整理的碎片、可再生发布产物 |
| `drafts/` | 尚未进入正式导航的草稿，首次需要时再创建 | 已发布文章 |
| `assets/` | 被正式内容或研究笔记引用的长期媒体资产 | 远端预览、回读截图、生成缓存 |
| `docs/adr/` | 难以逆转且需要解释原因的仓库决策 | 日常计划和过程日志 |
| `harness/` | 内容检查和格式转换工具 | 知识正文 |
| `.artifacts/` | 外部平台导出文件、渲染结果、远端预览和回读记录 | 权威内容；该目录不进入 Git |

根目录只保留入口和仓库级约束：

- `README.md`：阅读入口与目录说明。
- `CONTEXT.md`：项目领域术语。
- `AGENTS.md`：Agent 的摄取、查询、lint、索引与权限规则。
- `.gitignore`：本地产物边界。
- `package.json`：Harness 命令入口。

## 内容生命周期

```text
资料与问题
→ research/ 形成证据化研究笔记
→ drafts/ 形成可发布草稿
→ content/ 沉淀正式内容
→ Harness 检查结构、发布安全、链接和资产
→ 发布平台生成物进入 .artifacts/
```

不是每篇研究笔记都必须变成正式文章；不是每个发布产物都值得进入版本库。

## 内容约定

正式文章必须：

- 使用 Markdown；
- 位于 `content/`；
- `content/` 下的文件夹只使用中文；Markdown 文件名可沿用含中英文的原文标题，但必须包含中文并只使用常用标题字符；
- 直接从唯一的一级标题开始；
- 不包含 YAML Front Matter、导入来源、修订版本或转换日期；
- 不包含外部协作平台链接、公司内部标识或受限媒介关键词；
- 所有本地链接和媒体引用真实存在。

研究笔记必须：

- 使用 Markdown；
- 位于 `research/`；
- 直接从唯一的一级标题开始；
- 不包含 YAML Front Matter、导入来源、修订版本或转换日期；
- 不包含外部协作平台链接、公司内部标识或受限媒介关键词；
- 使用 `verified`、`partial`、`draft` 或 `stale` 标记证据状态；
- 标明证据日期和适用范围；
- 明确证据范围与结论边界；

草稿统一放入 `drafts/`，遵守同样的结构与发布安全规则，不进入本 README 的正式导航。

## Harness

运行完整检查：

```bash
npm run check
```

将外部平台 XML 转换成便于人工复核的 Markdown：

```bash
npm run convert:lark -- .artifacts/lark/input.xml drafts/output.md
```

转换只解决格式问题，不会自动把发布产物升级为正式内容；转换结果仍需人工审阅并放入正确目录。

详细规则见 [Harness 说明](harness/README.md)。仓库定位与术语见 [CONTEXT](CONTEXT.md)，关键边界决策见 [ADR-0001](docs/adr/0001-hybrid-personal-knowledge-base.md)。

## Agent 维护入口

- 操作规则：[AGENTS.md](AGENTS.md)
- 术语与状态：[CONTEXT.md](CONTEXT.md)
- 维护日志：[docs/wiki-activity.md](docs/wiki-activity.md)
- Agent 维护决策：[ADR-0002](docs/adr/0002-agent-maintained-llm-wiki.md)

查询默认只回答、不回写。新来源默认先进入 `research/`；当前规模使用本索引和文本检索，不引入额外检索服务。
