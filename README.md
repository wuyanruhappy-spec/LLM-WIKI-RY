# LLM-WIKI-RY

RY 的混合型个人知识库：用正式文章沉淀可长期阅读的知识，用研究笔记保留结论背后的证据与边界，并通过内容 Harness 阻止发布产物重新污染仓库。

## 内容导航

### 正式内容

- [LLM Wiki 入门与建设思考](content/基础知识/大语言模型知识库入门.md)
- [业务知识的完整生命周期](content/知识建模/业务知识生命周期.md)
- [从 LLM 到 Agentic Workflow](content/智能体工作流/从%20LLM%20到%20Agentic%20Workflow.md)
- [从 Vibe Coding 到 Agentic Engineering](content/智能体工作流/从%20Vibe%20Coding%20到%20Agentic%20Engineering：把%20AI%20编程升级为可验证、可复利的软件工厂.md)
- [Dynamic Workflow、Harness 与 Protocol Glue](content/智能体工作流/Dynamic%20Workflow、Harness%20与%20Protocol%20Glue：把%20Agent%20从“会做事”变成“可运行系统”.md)
- [让 AI 安全进入生产环境：从 Spec、Zero Trust 到 Evaluation 的工程闭环](content/智能体工作流/让%20AI%20安全进入生产环境：从%20Spec、Zero%20Trust%20到%20Evaluation%20的工程闭环.md)
- [从 Loop 到 Graph：把智能体组织成可控、可恢复的执行系统](content/智能体工作流/从%20Loop%20到%20Graph：把智能体组织成可控、可恢复的执行系统.md)
- [把 AI 成本花在刀刃上：Model Routing 的任务分工、交付链与升级机制](content/智能体工作流/把%20AI%20成本花在刀刃上：Model%20Routing%20的任务分工、交付链与升级机制.md)

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
