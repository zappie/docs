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
const { parse } = require("graphql");

/**
 * gqlgen accepts some SDL that graphql-js (and therefore SpectaQL) rejects.
 * Remove the offending bits — they are codegen details with no meaning for
 * the rendered docs:
 *   - @goModel repeated on a type extension when the base type already has it
 *   - @deprecated on required (non-null, no default) input fields
 * Cuts are made by AST source location so the original text (comments,
 * formatting, file markers) is otherwise preserved.
 */
function sanitizeForGraphqlJs(sdl) {
  const doc = parse(sdl);
  const cuts = [];
  for (const def of doc.definitions) {
    if (
      def.kind === "ObjectTypeExtension" ||
      def.kind === "InterfaceTypeExtension"
    ) {
      for (const d of def.directives ?? []) {
        if (d.name.value === "goModel") cuts.push([d.loc.start, d.loc.end]);
      }
    }
    if (
      def.kind === "InputObjectTypeDefinition" ||
      def.kind === "InputObjectTypeExtension"
    ) {
      for (const f of def.fields ?? []) {
        if (f.type.kind !== "NonNullType" || f.defaultValue != null) continue;
        for (const d of f.directives ?? []) {
          if (d.name.value === "deprecated") cuts.push([d.loc.start, d.loc.end]);
        }
      }
    }
  }
  let out = sdl;
  for (const [start, end] of cuts.sort((a, b) => b[0] - a[0])) {
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

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

  const merged = sanitizeForGraphqlJs(sections.join("\n\n") + "\n");
  const outFile = path.join(outDir, `${name}.graphql`);
  fs.writeFileSync(outFile, merged);
  console.log(
    `✓ ${name}: merged ${fileCount} files → ${path.relative(ROOT, outFile)}` +
      (skipped ? ` (skipped ${skipped} empty)` : ""),
  );
}
