# LLM-WIKI-RY

RY 的混合型个人知识库：用正式文章沉淀可长期阅读的知识，用研究笔记保留结论背后的证据与边界，并通过内容 Harness 阻止发布产物重新污染仓库。

## 内容导航

### 正式内容

- [LLM Wiki 入门与建设思考](content/foundations/llm-wiki-introduction.md)
- [业务知识的完整生命周期](content/knowledge-modeling/knowledge-lifecycle.md)
- [从 LLM 到 Agentic Workflow](content/agentic-workflows/from-llm-to-agentic-workflow.md)

## 目录职责

| 目录 | 放什么 | 不放什么 |
| --- | --- | --- |
| `content/` | 可独立阅读、长期维护或发布的 Markdown 文章 | 调研过程、平台载荷、预览图 |
| `research/` | 一手证据、分析过程和有边界的研究结论 | 未整理的碎片、可再生发布产物 |
| `drafts/` | 尚未进入正式导航的草稿，首次需要时再创建 | 已发布文章 |
| `assets/` | 被正式内容或研究笔记引用的长期媒体资产 | 远端预览、回读截图、生成缓存 |
| `docs/adr/` | 难以逆转且需要解释原因的仓库决策 | 日常计划和过程日志 |
| `harness/` | 内容检查和格式转换工具 | 知识正文 |
| `.artifacts/` | 飞书 XML、渲染结果、远端预览和回读记录 | 权威内容；该目录不进入 Git |

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
→ Harness 检查结构、元数据、链接和资产
→ 发布平台生成物进入 .artifacts/
```

不是每篇研究笔记都必须变成正式文章；不是每个发布产物都值得进入版本库。

## 内容约定

正式文章必须：

- 使用 Markdown；
- 位于 `content/`；
- 包含 `title`、`type: article`、`status: published`；
- 只有一个一级标题；
- 所有本地链接和媒体引用真实存在。

研究笔记必须：

- 使用 Markdown；
- 位于 `research/`；
- 包含 `title`、`type: research-note`、`status: reference`；
- 明确证据范围与结论边界；
- 只有一个一级标题。

草稿统一使用 `status: draft`，不进入本 README 的正式导航。

## Harness

运行完整检查：

```bash
npm run check
```

将飞书 XML 转换成便于人工复核的 Markdown：

```bash
npm run convert:lark -- .artifacts/lark/input.xml drafts/output.md
```

转换只解决格式问题，不会自动把发布产物升级为正式内容；转换结果仍需人工审阅并放入正确目录。

详细规则见 [Harness 说明](harness/README.md)。仓库定位与术语见 [CONTEXT](CONTEXT.md)，关键边界决策见 [ADR-0001](docs/adr/0001-hybrid-personal-knowledge-base.md)。
