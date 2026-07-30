#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node harness/convert-lark-xml.mjs <input.xml> <output.md>");
  process.exit(1);
}

const blocks = [];

function decodeEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function cleanInline(value) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, "<br>")
      .replace(/<\/?p\b[^>]*>/gi, " ")
      .replace(/<(b|strong)\b[^>]*>(.*?)<\/\1>/gis, "**$2**")
      .replace(/<code\b[^>]*>(.*?)<\/code>/gis, "`$1`")
      .replace(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s*<br>\s*/g, "<br>")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function stash(value) {
  const token = `@@LARK_BLOCK_${blocks.length}@@`;
  blocks.push(value.trim());
  return `\n\n${token}\n\n`;
}

function convertTable(table) {
  const rows = [...table.matchAll(/<tr\b[^>]*>(.*?)<\/tr>/gis)].map((match) =>
    [...match[1].matchAll(/<(th|td)\b[^>]*>(.*?)<\/\1>/gis)].map((cell) => ({
      header: cell[1].toLowerCase() === "th",
      value: cleanInline(cell[2]).replaceAll("|", "\\|"),
    }))
  );

  if (rows.length === 0) {
    return "";
  }

  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) =>
    Array.from({ length: width }, (_, index) => row[index]?.value ?? "")
  );
  const firstRowIsHeader = rows[0].some((cell) => cell.header);
  const header = firstRowIsHeader
    ? normalized.shift()
    : Array.from({ length: width }, (_, index) => `列 ${index + 1}`);

  const renderRow = (row) => `| ${row.join(" | ")} |`;
  return [
    renderRow(header),
    renderRow(header.map(() => "---")),
    ...normalized.map(renderRow),
  ].join("\n");
}

let source = fs.readFileSync(inputPath, "utf8");

source = source.replace(/<table\b[^>]*>.*?<\/table>/gis, (table) =>
  stash(convertTable(table))
);

source = source.replace(
  /<whiteboard\b[^>]*type="mermaid"[^>]*>(.*?)<\/whiteboard>/gis,
  (_, body) => stash(`\`\`\`mermaid\n${decodeEntities(body).trim()}\n\`\`\``)
);

source = source.replace(
  /<pre\b([^>]*)>\s*<code>(.*?)<\/code>\s*<\/pre>/gis,
  (_, attributes, body) => {
    const caption = attributes.match(/caption="([^"]+)"/i)?.[1];
    const label = caption ? `**${decodeEntities(caption)}**\n\n` : "";
    return stash(`${label}\`\`\`text\n${decodeEntities(body).trim()}\n\`\`\``);
  }
);

source = source.replace(/<callout\b[^>]*>(.*?)<\/callout>/gis, (_, body) => {
  const paragraphs = [...body.matchAll(/<p\b[^>]*>(.*?)<\/p>/gis)]
    .map((match) => cleanInline(match[1]))
    .filter(Boolean);
  const lines = paragraphs.length > 0 ? paragraphs : [cleanInline(body)];
  return stash(lines.map((line) => `> ${line}`).join("\n>"));
});

source = source.replace(
  /<checkbox\b[^>]*done="(true|false)"[^>]*>(.*?)<\/checkbox>/gis,
  (_, done, body) => `\n- [${done === "true" ? "x" : " "}] ${cleanInline(body)}\n`
);

source = source.replace(/<ol\b[^>]*>(.*?)<\/ol>/gis, (_, body) => {
  const items = [...body.matchAll(/<li\b[^>]*>(.*?)<\/li>/gis)].map(
    (match, index) => `${index + 1}. ${cleanInline(match[1])}`
  );
  return `\n\n${items.join("\n")}\n\n`;
});

source = source.replace(/<ul\b[^>]*>(.*?)<\/ul>/gis, (_, body) => {
  const items = [...body.matchAll(/<li\b[^>]*>(.*?)<\/li>/gis)].map(
    (match) => `- ${cleanInline(match[1])}`
  );
  return `\n\n${items.join("\n")}\n\n`;
});

source = source
  .replace(/<title\b[^>]*>(.*?)<\/title>/gis, (_, body) => `# ${cleanInline(body)}`)
  .replace(/<h1\b[^>]*>(.*?)<\/h1>/gis, (_, body) => `## ${cleanInline(body)}`)
  .replace(/<h2\b[^>]*>(.*?)<\/h2>/gis, (_, body) => `### ${cleanInline(body)}`)
  .replace(/<hr\s*\/?>/gi, "\n\n---\n\n")
  .replace(/<p\b[^>]*>(.*?)<\/p>/gis, (_, body) => `\n\n${cleanInline(body)}\n\n`)
  .replace(/<(b|strong)\b[^>]*>(.*?)<\/\1>/gis, "**$2**")
  .replace(/<code\b[^>]*>(.*?)<\/code>/gis, "`$1`")
  .replace(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)")
  .replace(/<br\s*\/?>/gi, "  \n")
  .replace(/<[^>]+>/g, "");

source = decodeEntities(source)
  .split("\n")
  .map((line) => line.replace(/[ \t]+$/g, ""))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

for (let index = 0; index < blocks.length; index += 1) {
  source = source.replace(`@@LARK_BLOCK_${index}@@`, blocks[index]);
}

source = `${source.replace(/\n{3,}/g, "\n\n").trim()}\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, source, "utf8");
