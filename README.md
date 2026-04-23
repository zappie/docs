# Zappie API Documentation

Static API documentation for the Zappie platform.

Covers four APIs:

- **Merchant**, **Customer**, and **Admin** — GraphQL APIs generated with [SpectaQL](https://github.com/anvilco/spectaql), built from the shared common schema plus app-specific schema files.
- **B2B** — REST API documented via an OpenAPI 3.0 spec, rendered with [Redocly CLI](https://redocly.com/docs/cli/).

---

## Prerequisites

- Node.js ≥ 18
- The `api` repository cloned as a sibling directory:
  ```
  Projects/
  ├── api/                        ← source of truth for .gql files
  └── zappie-api-documentation/   ← this repo
  ```

## Setup

```bash
npm install
```

## Generating Docs

Build static HTML for a specific API:

```bash
npm run generate:merchant
npm run generate:customer
npm run generate:admin
npm run generate:b2b
```

Or build all four at once:

```bash
npm run generate:all
```

Output is written to `public/{merchant,customer,admin,b2b}/index.html`.

## Live Preview

Start a live-reloading preview on [http://localhost:4400](http://localhost:4400):

```bash
npm run dev:merchant
npm run dev:customer
npm run dev:admin
```

For the B2B API (Redocly preview on [http://localhost:4000](http://localhost:4000)):

```bash
npm run dev:b2b
```

---

## Project Structure

```
configs/
  merchant.yml          # SpectaQL config for the Merchant API
  customer.yml          # SpectaQL config for the Customer API
  admin.yml             # SpectaQL config for the Admin API
  b2b.yaml              # OpenAPI 3.0 spec for the B2B REST API

schemas/
  base.gql              # Stub base types required for SDL merging
  merged/               # Auto-generated merged schemas (git-ignored)

scripts/
  prepare-schemas.js    # Merges and de-dupes .gql files before SpectaQL runs

public/                 # Generated HTML output (git-ignored)
  merchant/
  customer/
  admin/
  b2b/
```

## How It Works

1. `scripts/prepare-schemas.js` is run before every SpectaQL build. It globs the `.gql` files from the `api` repo in the correct order:
   - `api/pkg/gql/common/schema/*.gql` — shared types
   - `schemas/base.gql` — stub roots (`Mutation`, `Subscription`, and any types that are only `extend`ed in SDL but defined in the Go codegen)
   - `api/apps/{api}/gql/schema/*.gql` — app-specific queries, mutations, and types
2. Empty files are skipped automatically.
3. The merged output is written to `schemas/merged/{api}.graphql`, which SpectaQL ingests.
