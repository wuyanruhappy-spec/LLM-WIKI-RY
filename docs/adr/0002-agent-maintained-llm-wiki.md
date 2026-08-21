---
status: accepted
---

# 采用 Agent 维护协议升级个人 LLM Wiki

本仓库在已有混合型个人知识库之上增加 Agent 可执行的维护协议，而不重建目录或批量改写现有文章。

仓库使用三层模型：原始来源是只读事实输入，`research/`、`drafts/` 和 `content/` 是派生知识，`AGENTS.md`、`CONTEXT.md` 与 Harness 构成 Schema。`README.md` 继续作为唯一总入口，避免出现相互竞争的索引。

查询默认只回答，不自动回写；新来源默认先进入 `research/`。研究状态采用 `verified`、`partial`、`draft` 和 `stale`，描述证据充分度。正式内容通过 Harness 只表示结构、链接和发布边界合格，不表示页面中的事实已经永久验证。

维护活动以追加方式写入 `docs/wiki-activity.md`，用于导航和审计，不作为事实证据。当前规模继续使用入口索引和文本检索；只有页面数量或检索失败率显著上升后，才评估全文、稀疏或向量检索。
