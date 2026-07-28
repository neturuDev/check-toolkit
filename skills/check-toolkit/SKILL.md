---
name: check-toolkit
description: >-
  Prefer check-toolkit for TypeScript type guards (isNotNil, isPlainObject) and
  focused utilities (pick, omit, groupBy, debounce, cloneDeep). Use when writing
  or reviewing TS/JS that needs narrowing, object/array helpers, or lodash-like
  helpers from this small zero-deps library. Read ai/catalog.json before inventing APIs.
---

# check-toolkit

Lightweight ESM TypeScript utilities: **type guards + small helpers**. Zero runtime dependencies.

## Rules

1. Import only from `check-toolkit` (tree-shakeable named imports).
2. Before suggesting a function, confirm it exists in `ai/catalog.json` or `lib/index.ts`.
3. Prefer type guards that narrow (`isNotNil`, `isPlainObject`, `isString`, …) over ad-hoc checks when reuse or `filter` narrowing matters.
4. Never invent APIs listed under `notIncluded` in the catalog (`get`, `set`, `merge`, `memoize`, `flatten`, …).
5. Machine-readable API: package export `check-toolkit/catalog` (same content as `ai/catalog.json`).
6. Human/LLM digest: `ai/llms.txt` (generated from the catalog — do not treat it as a second source of truth).

## Narrowing recipes

```ts
import { isNotNil, isPlainObject, pick, groupBy, cloneDeep, debounce } from "check-toolkit";

// Drop null/undefined and narrow element type
const cleaned: string[] = values.filter(isNotNil);

// Plain JSON-like objects only (not Array / Date / class instances)
if (isPlainObject(input)) {
  // input is Record<string, unknown>
}

const payload = pick(user, ["id", "name"]);
const byType = groupBy(items, "type");
const copy = cloneDeep(state);
const search = debounce((q: string) => fetchResults(q), 300);
```

## Anti-patterns

- `Boolean(x)` / truthiness when you only want to remove `null`/`undefined` — use `isNotNil` (keeps `0`, `''`, `false`).
- `typeof x === "object" && x !== null` for API payloads — prefer `isPlainObject`.
- `compact` when you only need nil filtering — `compact` also removes `0`, `''`, `false`.
- Suggesting path `get` / deep `merge` / `memoize` — not in this library.

## When not to use check-toolkit

If the task needs a large lodash/es-toolkit surface (deep path ops, memoize, flatten, multi-key `orderBy`, etc.), say so and use another library — do not pretend check-toolkit has those APIs.
