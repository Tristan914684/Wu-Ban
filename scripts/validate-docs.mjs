#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import process from "node:process";

const repositoryRoot = resolve(import.meta.dirname, "..");
const docsRoot = resolve(repositoryRoot, "docs");
const docsIndexPath = resolve(docsRoot, "README.md");
const errors = [];

function listMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function displayPath(filePath) {
  return relative(repositoryRoot, filePath);
}

function validateLink(sourcePath, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  if (
    target === "" ||
    target.startsWith("#") ||
    /^(https?:|mailto:|tel:)/i.test(target)
  ) {
    return;
  }

  const pathOnly = target.split("#", 1)[0].split("?", 1)[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathOnly);
  } catch {
    errors.push(`${displayPath(sourcePath)} has invalid encoded link: ${target}`);
    return;
  }

  const resolvedTarget = resolve(dirname(sourcePath), decodedPath);
  if (!existsSync(resolvedTarget)) {
    errors.push(
      `${displayPath(sourcePath)} links to missing ${displayPath(resolvedTarget)}`,
    );
  }
}

if (!existsSync(docsRoot) || !statSync(docsRoot).isDirectory()) {
  console.error("docs/ directory is missing");
  process.exit(1);
}

const markdownFiles = listMarkdownFiles(docsRoot).sort();
const entrypointFiles = [
  resolve(repositoryRoot, "README.md"),
  resolve(repositoryRoot, "AGENTS.md"),
];
const docsIndex = readFileSync(docsIndexPath, "utf8");
const linkPattern = /(?<!!)\[[^\]]*]\(([^)]+)\)/g;

for (const filePath of [...entrypointFiles, ...markdownFiles]) {
  const content = readFileSync(filePath, "utf8");
  const relativeToDocs = relative(docsRoot, filePath);

  if (!content.startsWith("# ")) {
    errors.push(`${displayPath(filePath)} must start with one H1`);
  }

  const isDocsFile = !relativeToDocs.startsWith("..");
  const isIndex = relativeToDocs === "README.md";
  const isSectionIndex = basename(relativeToDocs) === "README.md";
  if (
    isDocsFile &&
    !isIndex &&
    !isSectionIndex &&
    !docsIndex.includes(basename(relativeToDocs))
  ) {
    errors.push(`${displayPath(filePath)} is missing from docs/README.md`);
  }

  for (const match of content.matchAll(linkPattern)) {
    validateLink(filePath, match[1]);
  }
}

const requiredFiles = [
  "AGENTS.md",
  "docs/PRODUCT_REQUIREMENTS.md",
  "docs/README.md",
  "docs/ai/agent-rules.md",
  "docs/context/current-project-state.md",
  "docs/context/business-rules.md",
  "docs/engineering/architecture.md",
  "docs/product/decision-log.md",
  "docs/workflow/development-lifecycle.md",
];

for (const requiredFile of requiredFiles) {
  if (!existsSync(resolve(repositoryRoot, requiredFile))) {
    errors.push(`${requiredFile} is required`);
  }
}

if (errors.length > 0) {
  console.error(`Documentation validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Documentation validation passed for ${markdownFiles.length} docs files and ${entrypointFiles.length} entrypoints.`,
);
