---
title: Sophon Trace → 评估 → Badcase → 数据集回流
type: research-note
status: reference
topics:
  - trace
  - evaluation
  - badcase
---

# Sophon Trace → 评估 → Badcase → 数据集回流：官方资料核查

> 核查时间：2026-07-28<br>
> 证据范围：仅使用 [Sophon AI 官方知识库](https://bytedance.larkoffice.com/wiki/S7SFwgp0qiG12Vk0wGpcV16bnDc) 及其中的一手产品手册、OpenAPI 文档。未使用缓存或二手调研材料。

## 结论

Sophon 已经把以下链路作为正式产品能力对外描述：

```text
线上 Trace
  → 单条/批量诊断
  → 识别异常环节及 Badcase/典型 Case
  → 回流至评估集
  → 打标/人工确认成为有效题目
  → 自动评估或人工复核
  → 周期性评估、实验对比和后续优化
```

但官方材料对这条链路的证据强度并不完全一致：

1. **已明确确认的产品能力**：Trace 可视化、单条/批量 Trace 诊断、诊断报告、Badcase/典型会话一键回流至评估集、评估集管理、自动/人工评估、周期性评估。
2. **已明确确认的 OpenAPI 能力**：创建/维护评估集、批量插入或 Upsert 题目、基于评估集创建评估任务、读取逐题结果及评估任务的 Kiwi Trace。
3. **尚未在公开手册中确认**：将“任意线上 Trace 或诊断报告”直接回流为评估集题目的 OpenAPI、诊断报告读取 API、统一的 Badcase 对象 Schema、诊断结果自动触发数据回流的接口。
4. 因此，对 VedaClaw/DataBrain 最稳妥的方案是：**Sophon 负责线上 Trace 与诊断；目标租户若已开放一键回流则直接复用，若需要自动化或该能力尚未开放，则由业务侧或 Host Adapter 提取 Trace/诊断结果并调用评估集 OpenAPI 写入数据，再创建或触发评估任务。**

## 一、已确认的产品操作链路

### 1. 线上 Trace 进入 Sophon 观测

[SophonAI 观测 OnePage](https://bytedance.larkoffice.com/wiki/PwWGwySy4i2uaTkdGlmcsqFen0d)明确说明：

- Sophon 采集各服务处理 AI 请求产生的 Span，构建完整执行追踪树；
- Trace 列表支持按 `Trace id`、`Chat id`、`Name`、`Status`、时间范围搜索；
- Trace 详情可以查看节点状态、输入输出与 Metadata；
- 平台将“一次应用对话”记录为一条 Trace。

这部分证明：**线上调用链和后续诊断的共同输入是 Sophon Trace。**

### 2. Trace 进入诊断与 Badcase 识别

[Sophon AI Trace 诊断产品操作手册](https://bytedance.larkoffice.com/wiki/H1u8w3YKqiBdNzkUAtmcGEkWnCc)确认了两种操作：

- **单 Trace 诊断**：在“观测 → 追踪”打开一条 Trace，选择诊断模型和 Skill 后开始诊断；
- **批量 Trace 诊断**：
  - 在“观测 → 追踪”筛选并勾选 Trace，点击“生成诊断报告”；或
  - 在“观测 → 诊断”新建诊断任务，配置时间范围、筛选条件、采样量、Skill、模型和一次性/周期性分析方式。

诊断报告会产出：

- 执行摘要；
- 异常环节；
- 问题归因；
- 修复建议；
- 可回溯证据；
- 批量问题汇总，并可下钻到单条 Trace。

因此，官方当前公开资料里的 “Badcase” 更适合解释为：**经过筛选或诊断后确认的问题 Trace/典型 Case**。目前没有看到独立的 `Badcase` 实体定义或统一字段协议。

### 3. Badcase/典型会话回流至评估集

以下两份当前产品材料都明确写有回流能力：

- [SophonAI OnePage](https://bytedance.larkoffice.com/wiki/ZphcwnVFkiUb9vkKakrcpJ9wnWg)：
  - “支持将线上 Badcase 或典型会话一键回流至评估集”；
  - “通过 Trace + Skill + Kiwi 自助分析线上异常，提取 Badcase 和典型 Case 回流至评测集”；
  - 将该闭环概括为“全链路观测 + 数据回流”。
- [SophonAI 观测 OnePage](https://bytedance.larkoffice.com/wiki/PwWGwySy4i2uaTkdGlmcsqFen0d)：
  - “支持将线上 Badcase 或典型会话一键回流至评估集，实现效果评估的闭环迭代”。

可以确认产品目标和产品能力表述；但当前 Trace 诊断操作手册只说明如何生成和查看诊断报告，**没有展示具体的“回流至评估集”按钮位置、字段选择、去重和 Schema 映射步骤**。

### 4. 评估集进入评估

[模型评估平台基本概念及流程](https://bytedance.larkoffice.com/wiki/W2l4wt37TiA29HkPJUzcScehnjf)区分了两种题目状态：

- **原始题目**：用户创建或从外部导入，需要治理并经过人工确认后才能用于评估；
- **有效题目**：经过人工确认、具备正确答案和自动化评分 Logic 等必要信息，可以用于评估。

因此，Trace 回流到数据集不等于样本已可直接评估；对于缺少 Ground Truth、评分规则或业务确认的 Badcase，应先进入打标和确认环节。

[SophonAI 评估功能产品操作手册](https://bytedance.larkoffice.com/wiki/L5nqwaPUkim8gEkckCNcGOW4nyd)确认：

- 创建评估任务时需要选择评估集、视图和答案列；
- 可选择评估工作流或自动化逻辑；
- 评估对象支持模型、智能体、CSV 等；
- 评估详情展示机器评分，并支持人工标注和自定义评论；
- 支持选中题目重跑。

[Sophon AI 周期性评估操作手册](https://bytedance.larkoffice.com/wiki/QtbFwUPL9ieLuIkGW5ucgu1cngd)进一步确认：

- 可在预先准备好的标准评估集上定期运行模型、Agent、Skill；
- 支持按日/周调度、失败重试、生成评估分析报告；
- 可用于持续追踪效果、发现漂移和防止性能退化。

所以回流后的完整使用方式是：

```text
回流样本进入评估集
  → 打标/人工确认成为有效题目
  → 选择评估工作流/自动化逻辑
  → 自动评分
  → 人工复核/评论
  → 重跑、周期性评估或评估实验对比
```

## 二、OpenAPI 证据

### 1. 写入评估集：已确认

[评估集相关 OpenAPI](https://bytedance.larkoffice.com/wiki/Dtuyw1aRDilAGNkII0OcxHugnjb)提供：

- 新建评估集；
- 查询评估集；
- 更新 Schema；
- 批量插入题目：
  - `POST /evals/api/v2/openAPI/dataset/batchInsert/v2`
  - `POST /evals/api/v2/openAPI/dataset/batchInsertTx/v2`
- 按唯一索引追加或更新：
  - `POST /evals/api/v2/openAPI/dataset/batchInsertOrUpdate/v2`
- 创建评估集视图。

这意味着即使目标租户暂时无法使用 UI 一键回流，也可以实现以下自动化适配：

```text
Trace/诊断结果
  → 提取 query、answer、过程摘要、问题分类、trace_id 等业务字段
  → 映射到既定评估集 Schema
  → batchInsert 或 batchInsertOrUpdate
```

注意：上述字段映射由接入方定义，官方文档没有提供通用的 Trace → 评估集 Schema。

### 2. 基于评估集创建评估：已确认

[评估相关 OpenAPI](https://bytedance.larkoffice.com/wiki/PC4gwuQrKi8QQskZvuZcy0Ienmh)。

其 `POST /evals/api/v2/openAPI/evaluation/create/` 支持：

- 指定 `datasetId`；
- 指定 `viewId` 或题目 `ids`；
- 指定模型、Agent、Skill 或 Kiwi 评估工作流；
- 配置标注模板、展示模板、并发度和评分权重；
- 创建后自动执行评估任务。

因此，自动化闭环可以继续为：

```text
评估集写入成功
  → 使用 datasetId + ids/viewId 创建评估任务
  → 获取评分、报告或人工复核结果
```

### 3. Kiwi Trace 查询：已确认，但不是线上 Trace 回流接口

同一份[评估相关 OpenAPI](https://bytedance.larkoffice.com/wiki/PC4gwuQrKi8QQskZvuZcy0Ienmh)提供：

- `POST /evals/api/v2/openAPI/evaluation/kiwiTrace`
- `POST /evals/api/v2/openAPI/evaluation/kiwiTrace/span`

它们按 `evaluationId + rowId` 查询**评估任务执行过程中的 Kiwi Trace**，可获得执行树及 Span 输入输出。

该接口的方向是：

```text
评估任务 → 查询评估执行 Trace
```

而不是：

```text
线上 Sophon Trace → 写入评估集
```

不能把它当成线上 Trace 回流接口。

### 4. 获取逐题结果并筛选 Badcase：已确认

同一份[评估相关 OpenAPI](https://bytedance.larkoffice.com/wiki/PC4gwuQrKi8QQskZvuZcy0Ienmh)还提供：

```text
POST /evals/api/v2/openAPI/evaluation/quizzesDetail
```

该接口可实时返回评估任务逐题的：

- `status` 和失败原因；
- 加权总分；
- 模型答案和 Ground Truth；
- Skill/Flow/Policy 的打分字段及打分原因；
- 执行次数与最近执行时间。

这允许接入方按失败状态、分数阈值或评分原因筛选新一轮 Badcase。需要注意，这是一种**基于评估结果定义 Badcase 的业务规则**；官方资料仍未定义统一的 Badcase 对象或默认阈值。

### 5. 线上会话 Event 导入：接口存在，但不应作为新方案主路径

[线上会话相关 OpenAPI](https://bytedance.larkoffice.com/wiki/ENIZwYwooiUpo9kO0BzcrfQPnpb)记录了：

```text
PUT /evals/api/v2/openAPI/event
```

可以按 `sessionId`、`eventName`、`uniqId`、`time`、`log` 写入线上会话事件。

但 [SophonAI 评估 OnePage](https://bytedance.larkoffice.com/wiki/BKXsw7xwciLfY3kHud5cQjnrnIh)已经把原 Evals+ 的“线上会话”“Case 分析/Debug/回流评测集”整行标记为删除线，并说明品牌升级后其他模块由 SophonAI 对应模块承载。

因此：

- 这个 API 可以作为历史能力证据；
- **不宜默认把它写成 VedaClaw/DataBrain 新接入的推荐路径**；
- 新方案应优先走 Sophon 观测 Trace + 当前评估集 API，并向 Sophon 团队确认是否有新版回流接口。

## 三、当前不能写成“已确认”的内容

官方公开目录中尚未找到以下接口或规范：

1. 通过 `trace_id` 直接调用“一键回流”的 OpenAPI；
2. 获取单条或批量 Trace 诊断报告的 OpenAPI；
3. 诊断完成后自动创建 Badcase 的事件或回调；
4. Badcase 的统一对象 Schema、状态机和去重规则；
5. Trace 字段到评估集 Schema 的官方标准映射；
6. 回流时是否自动携带完整 Span 树、只携带最终输入输出，或允许业务选择字段；
7. 回流后是否能自动触发评估任务。

文档设计时应区分：

- **产品已宣称能力**：线上 Badcase/典型会话一键回流至评估集；
- **接入仍需确认能力**：面向 VedaClaw/DataBrain 的租户开放情况、按钮位置、权限、字段映射及 OpenAPI；
- **需要本方案承担的能力**：业务 Span、样本判定、脱敏、去重、评估集字段映射和自动化触发。

## 四、建议写入 Trace 方案文档的表述

### 推荐正文

> Sophon 作为 VedaClaw、DataBrain 的目标线上 Trace 平台，承载自动调用链与自定义业务 Span。线上 Trace 可在 Sophon 中进行单条或批量诊断，产出异常环节、问题归因、修复建议与证据引用；确认的 Badcase 或典型 Case 可回流至评估集，进入自动评估、人工复核和周期性回归。产品说明已明确声明一键回流能力，但当前操作手册尚未公开具体步骤；如需自动化闭环，由接入方将 Trace/诊断结果映射为评估集 Schema，通过 Sophon 评估集 OpenAPI 批量插入或 Upsert，再创建或触发评估任务。

### 必须保留的待确认备注

> VedaClaw、DataBrain 目标租户是否开放 Trace 一键回流、是否提供新版回流/诊断 OpenAPI，以及回流字段、权限和去重规则，需与 Sophon 团队联调确认；在确认前，不将“诊断后自动回流并自动触发评估”写成已落地事实。

## 五、面向接入沟通的最小问题清单

1. VedaClaw/DataBrain 的 Trace 页面是否显示“回流至评估集”，具体权限由什么控制？
2. 回流能否选择目标评估集、视图及字段映射？
3. 能否携带 `trace_id`、`session_id`、输入、输出、业务 Span 摘要、诊断问题分类和证据？
4. 是否提供新版 Trace 回流或诊断报告 OpenAPI？若无，推荐使用哪套评估集写入 API？
5. 如何处理脱敏、重复 Case、同一 Case 的多版本和人工复核状态？
6. 回流后能否自动触发指定评估工作流或周期性评估？

## 六、核查覆盖与限制

- 实时递归枚举官方目录，共 94 个节点，其中 90 个 Docx（含根文档）。
- 当前非归档的核心产品手册、Trace 手册、评估手册和 OpenAPI 文档均成功实时读取。
- 全量关键词扫描期间，11 篇位于“归档[已弃用]”下的文档触发飞书限流；本报告未依赖这些归档材料。
- 当前结论以活跃产品文档为准，并明确标注了已删除线的历史“线上会话”能力。
