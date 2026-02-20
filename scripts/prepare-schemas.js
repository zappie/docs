#!/usr/bin/env node
/**
 * scripts/prepare-schemas.js
 *
 * Merges all .gql files for each API into a single .graphql file under
 * schemas/merged/, skipping any files that are empty or whitespace-only.
 * SpectaQL configs then point to these merged files.
 */

const fs = require("fs");
const path = require("path");
const { sync: globSync } = require("glob");

const ROOT = path.resolve(__dirname, "..");
const API_ROOT = path.resolve(ROOT, "../api");

const APIs = [
  {
    name: "merchant",
    globs: [
      path.join(API_ROOT, "pkg/gql/common/schema/*.gql"),
      path.join(ROOT, "schemas/base.gql"),
      path.join(API_ROOT, "apps/merchant/gql/schema/*.gql"),
    ],
  },
  {
    name: "customer",
    globs: [
      path.join(API_ROOT, "pkg/gql/common/schema/*.gql"),
      path.join(ROOT, "schemas/base.gql"),
      path.join(API_ROOT, "apps/customer/gql/schema/*.gql"),
    ],
  },
  {
    name: "admin",
    globs: [
      path.join(API_ROOT, "pkg/gql/common/schema/*.gql"),
      path.join(ROOT, "schemas/base.gql"),
      path.join(API_ROOT, "apps/admin/gql/schema/*.gql"),
    ],
  },
];

// ---------------------------------------------------------------------------
// 1. Copy shared theme assets (JS + CSS) into each API's theme directory
//    so SpectaQL picks them up during its build step.
// ---------------------------------------------------------------------------
const THEME_APIS = ["merchant", "customer", "admin"];
const sharedDir = path.join(ROOT, "themes/shared");

for (const api of THEME_APIS) {
  const themeDir = path.join(ROOT, "themes", api);
  const sharedFiles = globSync(path.join(sharedDir, "**/*"), {
    absolute: true,
    nodir: true,
  });
  for (const src of sharedFiles) {
    const rel = path.relative(sharedDir, src);
    const dest = path.join(themeDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
console.log(`✓ shared theme assets copied to merchant/customer/admin themes`);

// ---------------------------------------------------------------------------
// 2. Merge .gql files per API into schemas/merged/*.graphql
// ---------------------------------------------------------------------------
const outDir = path.join(ROOT, "schemas/merged");
fs.mkdirSync(outDir, { recursive: true });

for (const { name, globs } of APIs) {
  const sections = [];
  let fileCount = 0;
  let skipped = 0;

  for (const pattern of globs) {
    const files = globSync(pattern, { absolute: true });
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8").trim();
      if (!content) {
        skipped++;
        continue;
      }
      sections.push(`# --- ${path.relative(ROOT, file)} ---`);
      sections.push(content);
      fileCount++;
    }
  }

  const merged = sections.join("\n\n") + "\n";
  const outFile = path.join(outDir, `${name}.graphql`);
  fs.writeFileSync(outFile, merged);
  console.log(
    `✓ ${name}: merged ${fileCount} files → ${path.relative(ROOT, outFile)}` +
      (skipped ? ` (skipped ${skipped} empty)` : ""),
  );
}
