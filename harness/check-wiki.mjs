#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];
const validStatuses = new Set(["verified", "partial", "draft", "stale"]);

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...markdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }
  return files;
}

function markdownTargets(filePath, body) {
  const targets = [];
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  for (const match of body.matchAll(pattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) {
      continue;
    }
    target = target.split("#", 1)[0].split("?", 1)[0];
    if (!target) {
      continue;
    }
    try {
      target = decodeURIComponent(target);
    } catch {
      errors.push(`${relative(filePath)}: 无法解码索引链接 ${target}`);
      continue;
    }
    targets.push(path.resolve(path.dirname(filePath), target));
  }
  return targets;
}

function firstHeading(body) {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
}

const contentFiles = markdownFiles(path.join(root, "content"));
const researchFiles = markdownFiles(path.join(root, "research"));
const draftFiles = markdownFiles(path.join(root, "drafts"));
const managedPages = [...contentFiles, ...researchFiles, ...draftFiles];

const readmePath = path.join(root, "README.md");
if (!fs.existsSync(readmePath)) {
  errors.push("缺少唯一总入口 README.md");
}
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
const indexedTargets = new Set(
  markdownTargets(readmePath, readme).map((target) => path.resolve(target))
);

for (const filePath of [...contentFiles, ...researchFiles]) {
  if (!indexedTargets.has(path.resolve(filePath))) {
    errors.push(`${relative(filePath)}: 未被 README.md 索引`);
  }
}

for (const requiredEntry of [
  "AGENTS.md",
  "CONTEXT.md",
  "docs/wiki-activity.md",
  "docs/adr/0002-agent-maintained-llm-wiki.md",
]) {
  if (!indexedTargets.has(path.resolve(root, requiredEntry))) {
    errors.push(`README.md: 缺少维护入口 ${requiredEntry}`);
  }
}

const headings = new Map();
for (const filePath of managedPages) {
  const body = fs.readFileSync(filePath, "utf8");
  const heading = firstHeading(body);
  if (!heading) {
    continue;
  }
  const previous = headings.get(heading);
  if (previous) {
    errors.push(`${relative(filePath)}: 一级标题与 ${relative(previous)} 重复 -> ${heading}`);
  } else {
    headings.set(heading, filePath);
  }
}

for (const filePath of researchFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  const status = body.match(/^>\s*状态：(verified|partial|draft|stale)\s*$/m)?.[1];
  const evidenceDate = body.match(/^>\s*证据日期：(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  const scope = body.match(/^>\s*适用范围：(.\S|\S.+)\s*$/m)?.[1];

  if (!status || !validStatuses.has(status)) {
    errors.push(`${relative(filePath)}: 缺少合法研究状态`);
  }
  if (!evidenceDate || Number.isNaN(Date.parse(`${evidenceDate}T00:00:00Z`))) {
    errors.push(`${relative(filePath)}: 缺少合法证据日期`);
  }
  if (!scope) {
    errors.push(`${relative(filePath)}: 缺少适用范围`);
  }
  if (!/https?:\/\/|!?\[[^\]]*]\((?!#)[^)]+\)/i.test(body)) {
    errors.push(`${relative(filePath)}: 没有可追溯来源链接`);
  }
  if (!/^##\s+.*(?:边界|限制|风险|待确认|不确定)/m.test(body)) {
    errors.push(`${relative(filePath)}: 缺少结论边界或风险章节`);
  }
  if (status === "stale") {
    warnings.push(`${relative(filePath)}: 状态为 stale，使用前需要复核`);
  }
}

for (const filePath of contentFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  if (!/https?:\/\/|\]\([^)]*research\//i.test(body)) {
    warnings.push(`${relative(filePath)}: 未发现显式外部来源或 research/ 证据链接`);
  }
}

if (errors.length > 0) {
  console.error("WIKI_HARNESS=FAIL");
  for (const error of errors) {
    console.error(`- ERROR ${error}`);
  }
  for (const warning of warnings) {
    console.error(`- WARNING ${warning}`);
  }
  process.exit(1);
}

console.log("WIKI_HARNESS=PASS");
console.log(`indexed_content=${contentFiles.length}`);
console.log(`indexed_research=${researchFiles.length}`);
console.log(`drafts=${draftFiles.length}`);
console.log(`warnings=${warnings.length}`);
for (const warning of warnings) {
  console.warn(`- WARNING ${warning}`);
}
