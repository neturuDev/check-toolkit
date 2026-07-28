import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const catalogPath = resolve(root, "ai/catalog.json");
const indexPath = resolve(root, "lib/index.ts");
const llmsPath = resolve(root, "ai/llms.txt");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const indexSource = readFileSync(indexPath, "utf8");

const exportNames = [
  ...indexSource.matchAll(/\bexport\s*\{([^}]+)\}/g),
].flatMap((match) =>
  match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(/\s+as\s+/).at(-1).trim()),
);

const catalogNames = catalog.functions.map((fn) => fn.name);
const catalogSet = new Set(catalogNames);
const exportSet = new Set(exportNames);

const missingInCatalog = exportNames.filter((name) => !catalogSet.has(name));
const extraInCatalog = catalogNames.filter((name) => !exportSet.has(name));
const duplicateInCatalog = catalogNames.filter(
  (name, index) => catalogNames.indexOf(name) !== index,
);

if (
  missingInCatalog.length ||
  extraInCatalog.length ||
  duplicateInCatalog.length
) {
  const lines = [];
  if (missingInCatalog.length) {
    lines.push(`Missing in catalog: ${missingInCatalog.join(", ")}`);
  }
  if (extraInCatalog.length) {
    lines.push(`Extra in catalog: ${extraInCatalog.join(", ")}`);
  }
  if (duplicateInCatalog.length) {
    lines.push(`Duplicate in catalog: ${[...new Set(duplicateInCatalog)].join(", ")}`);
  }
  console.error("catalog validation failed:\n" + lines.join("\n"));
  process.exit(1);
}

const byCategory = new Map();
for (const fn of catalog.functions) {
  if (!byCategory.has(fn.category)) {
    byCategory.set(fn.category, []);
  }
  byCategory.get(fn.category).push(fn);
}

const categoryOrder = [
  "type-guard",
  "object",
  "array",
  "string",
  "clone",
  "function",
  "math",
  "promise",
];

/** CommonMark inline code: fence longer than any backtick run inside the text. */
const toInlineCode = (text) => {
  const longestRun = Math.max(
    0,
    ...(text.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = "`".repeat(longestRun + 1);
  const needsPad =
    text.startsWith("`") || text.endsWith("`") || /^\s|\s$/.test(text);
  const content = needsPad ? ` ${text} ` : text;
  return `${fence}${content}${fence}`;
};

const lines = [
  `# ${catalog.name}`,
  "",
  catalog.summary,
  "",
  `schemaVersion: ${catalog.schemaVersion}`,
  `version: ${catalog.version}`,
  `import: ${catalog.import}`,
  `machine-readable catalog: ${catalog.catalogExport} (shipped in the npm package)`,
  "",
  "## Not included",
  "",
  "Do not invent these APIs; they are not part of check-toolkit:",
  "",
  catalog.notIncluded.map((name) => `- ${name}`).join("\n"),
  "",
  "## TypeScript narrowing recipes",
  "",
];

for (const recipe of catalog.recipes) {
  lines.push(`### ${recipe.id}`);
  lines.push("");
  lines.push(recipe.intent);
  lines.push("");
  lines.push("```ts");
  lines.push(recipe.code);
  lines.push("```");
  lines.push("");
}

lines.push("## Functions");
lines.push("");

for (const category of categoryOrder) {
  const functions = byCategory.get(category);
  if (!functions?.length) continue;

  lines.push(`### ${category}`);
  lines.push("");

  for (const fn of functions) {
    lines.push(`#### ${fn.name}`);
    lines.push("");
    lines.push(`- signature: ${toInlineCode(fn.signature)}`);
    lines.push(`- summary: ${fn.summary}`);
    if (fn.narrows) {
      lines.push(`- narrows: ${toInlineCode(fn.narrows)}`);
    }
    if (fn.intents?.length) {
      lines.push(`- intents: ${fn.intents.join(", ")}`);
    }
    if (fn.examples?.length) {
      lines.push("- examples:");
      for (const example of fn.examples) {
        lines.push(`  - ${toInlineCode(example)}`);
      }
    }
    if (fn.antiPatterns?.length) {
      lines.push("- anti-patterns:");
      for (const anti of fn.antiPatterns) {
        lines.push(`  - ${anti}`);
      }
    }
    lines.push("");
  }
}

writeFileSync(llmsPath, lines.join("\n"), "utf8");
console.log(
  `Validated ${catalogNames.length} functions against lib/index.ts and wrote ai/llms.txt`,
);
