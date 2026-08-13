# 内容 Harness

Harness 负责验证仓库边界，不负责判断文章观点是否正确。

## 检查范围

- 顶层目录和根文件白名单；
- `content/` 下的文件夹只使用中文；Markdown 文件名可沿用含中英文的原文标题，但必须包含中文，且只使用安全的常用标题字符；
- `content/`、`research/`、`drafts/` 直接从唯一一级标题开始；
- 禁止 YAML Front Matter、导入来源、修订版本和转换日期；
- 禁止外部协作平台链接、公司内部标识和受限媒介关键词；
- Markdown 本地链接和媒体引用；
- 未被内容引用的长期媒体资产；
- Git 中误入的 XML 或发布产物。

## 命令

```bash
npm run check
```

成功时输出：

```text
CONTENT_HARNESS=PASS
```

失败时会列出所有问题并返回非零退出码。

## 外部平台 XML 转换

```bash
npm run convert:lark -- <输入.xml> <输出.md>
```

转换器支持标题、段落、表格、列表、Callout、代码块、Mermaid 和复选框。转换后的 Markdown 必须人工检查；工具不会判断内容应进入 `content/`、`research/` 还是 `drafts/`。
