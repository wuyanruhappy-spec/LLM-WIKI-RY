#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const ignoredDirectories = new Set([
  ".artifacts",
  ".git",
  ".idea",
  "node_modules",
]);
const allowedRootDirectories = new Set([
  ".github",
  "assets",
  "content",
  "docs",
  "drafts",
  "harness",
  "research",
]);
const allowedRootFiles = new Set([
  ".gitignore",
  "CONTEXT.md",
  "LICENSE",
  "README.md",
  "package.json",
]);

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") {
      continue;
    }
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...walk(entryPath));
      }
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function parseFrontMatter(filePath, body) {
  if (!body.startsWith("---\n")) {
    errors.push(`${relative(filePath)}: 缺少 Front Matter`);
    return {};
  }

  const end = body.indexOf("\n---\n", 4);
  if (end === -1) {
    errors.push(`${relative(filePath)}: Front Matter 未闭合`);
    return {};
  }

  const fields = {};
  for (const line of body.slice(4, end).split("\n")) {
    const match = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/i);
    if (match) {
      fields[match[1]] = match[2].trim();
    }
  }
  return fields;
}

function countLevelOneHeadings(body) {
  let inFence = false;
  let count = 0;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    } else if (!inFence && /^#\s+\S/.test(line)) {
      count += 1;
    }
  }
  return count;
}

function validateDocument(filePath, expected) {
  const body = fs.readFileSync(filePath, "utf8");
  const fields = parseFrontMatter(filePath, body);
  for (const field of ["title", "type", "status"]) {
    if (!fields[field]) {
      errors.push(`${relative(filePath)}: Front Matter 缺少 ${field}`);
    }
  }
  if (fields.type && fields.type !== expected.type) {
    errors.push(
      `${relative(filePath)}: type 应为 ${expected.type}，实际为 ${fields.type}`
    );
  }
  if (fields.status && fields.status !== expected.status) {
    errors.push(
      `${relative(filePath)}: status 应为 ${expected.status}，实际为 ${fields.status}`
    );
  }
  const headingCount = countLevelOneHeadings(body);
  if (headingCount !== 1) {
    errors.push(`${relative(filePath)}: 一级标题数量应为 1，实际为 ${headingCount}`);
  }
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
      errors.push(`${relative(filePath)}: 无法解码本地链接 ${target}`);
      continue;
    }
    targets.push(path.resolve(path.dirname(filePath), target));
  }
  return targets;
}

const rootEntries = fs.readdirSync(root, { withFileTypes: true });
for (const entry of rootEntries) {
  if (entry.name === ".DS_Store" || ignoredDirectories.has(entry.name)) {
    continue;
  }
  if (entry.isDirectory() && !allowedRootDirectories.has(entry.name)) {
    errors.push(`根目录存在未定义目录: ${entry.name}/`);
  }
  if (entry.isFile() && !allowedRootFiles.has(entry.name)) {
    errors.push(`根目录存在未定义文件: ${entry.name}`);
  }
}

const files = walk(root);
const markdownFiles = files.filter((filePath) => filePath.endsWith(".md"));
const contentFiles = files.filter((filePath) =>
  relative(filePath).startsWith("content/") && filePath.endsWith(".md")
);
const researchFiles = files.filter((filePath) =>
  relative(filePath).startsWith("research/") && filePath.endsWith(".md")
);
const draftFiles = files.filter((filePath) =>
  relative(filePath).startsWith("drafts/") && filePath.endsWith(".md")
);

for (const filePath of contentFiles) {
  validateDocument(filePath, { type: "article", status: "published" });
}
for (const filePath of researchFiles) {
  validateDocument(filePath, { type: "research-note", status: "reference" });
}
for (const filePath of draftFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  const fields = parseFrontMatter(filePath, body);
  if (fields.status && fields.status !== "draft") {
    errors.push(`${relative(filePath)}: drafts/ 中的 status 必须为 draft`);
  }
  if (countLevelOneHeadings(body) !== 1) {
    errors.push(`${relative(filePath)}: 草稿必须有且只有一个一级标题`);
  }
}

const artifactPatterns = [
  /\.xml$/i,
  /(^|\/)diagrams\//i,
  /remote-(?:preview|raw)/i,
  /\.raw(?:-[^/]+)?\.json$/i,
];
for (const filePath of files) {
  const file = relative(filePath);
  if (artifactPatterns.some((pattern) => pattern.test(file))) {
    errors.push(`${file}: 发布产物必须放入 .artifacts/`);
  }
}

let trackedFiles = [];
try {
  trackedFiles = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
} catch {
  errors.push("无法读取 Git 跟踪文件列表");
}

for (const file of trackedFiles) {
  if (file.endsWith(".xml") && fs.existsSync(path.join(root, file))) {
    errors.push(`${file}: Git 中禁止跟踪 XML 发布产物`);
  }
}

const referencedAssets = new Set();
for (const filePath of markdownFiles) {
  const body = fs.readFileSync(filePath, "utf8");
  for (const target of markdownTargets(filePath, body)) {
    if (!fs.existsSync(target)) {
      errors.push(`${relative(filePath)}: 本地链接不存在 -> ${relative(target)}`);
      continue;
    }
    if (relative(target).startsWith("assets/")) {
      referencedAssets.add(path.resolve(target));
    }
  }
}

const assetRoot = path.join(root, "assets");
const assetFiles = fs.existsSync(assetRoot) ? walk(assetRoot) : [];
for (const asset of assetFiles) {
  if (!referencedAssets.has(path.resolve(asset))) {
    errors.push(`${relative(asset)}: 媒体资产未被任何 Markdown 引用`);
  }
}

if (contentFiles.length === 0) {
  errors.push("content/ 中没有正式内容");
}

if (errors.length > 0) {
  console.error("CONTENT_HARNESS=FAIL");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("CONTENT_HARNESS=PASS");
console.log(`articles=${contentFiles.length}`);
console.log(`research_notes=${researchFiles.length}`);
console.log(`drafts=${draftFiles.length}`);
console.log(`assets=${assetFiles.length}`);
