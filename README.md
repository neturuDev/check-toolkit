# check-toolkit

A lightweight TypeScript utility library: type guards plus small helpers for objects, arrays, strings, cloning, and functions. Zero runtime dependencies — import only what you need.

## Why check-toolkit?

- **Utilities + type guards** — `pick` / `groupBy` / `debounce` alongside `isNotNil` and friends
- **Lightweight** — focused helpers without a full lodash-sized surface
- **Tree-shakeable** — each function is imported separately
- **Zero runtime dependencies** — nothing extra in your bundle
- **Typed** — type guards like `isNotNil` and `isPlainObject` narrow types in TypeScript
- **AI-friendly catalog** — machine-readable API at `check-toolkit/catalog` so agents use real exports, not invented ones

Use it when you want a small ESM toolkit with solid TypeScript narrowing, not a large utility framework.

## Installation

```bash
npm install check-toolkit
```

## Usage

```typescript
import { isString, isPlainObject, pick } from "check-toolkit";

console.log(isString("test")); // true
console.log(isPlainObject({ a: 1 })); // true

const payload = pick({ a: 1, b: 2, c: 3 }, ["a", "c"]);
// { a: 1, c: 3 }
```

## Available Functions

### Type Checking

- `isSymbol` - Check if value is a symbol
- `isArray` - Check if value is an array
- `isArrayLike` - Check if value is array-like
- `isNan` - Check if value is NaN
- `isObject` - Check if value is an object
- `isNull` - Check if value is null
- `isFunction` - Check if value is a function
- `isNumber` - Check if value is a number
- `isString` - Check if value is a string
- `isBoolean` - Check if value is a boolean
- `isPlainObject` - Check if value is a plain object
- `isUndefined` - Check if value is undefined
- `isNotUndefined` - Check if value is not undefined
- `isNil` - Check if value is null or undefined
- `isNotNil` - Check if value is not null and not undefined
- `isNotNaN` - Check if value is not NaN
- `isEmpty` - Check if value is empty
- `isEqual` - Check if two values are equal
- `isMatch` - Check if object matches source

### Object Operations

- `pick` - Creates a new object with only the specified keys
- `omit` - Creates a new object without the specified keys
- `pickBy` - Creates a new object with entries that satisfy a predicate
- `omitBy` - Creates a new object without entries that satisfy a predicate

### Array Operations

- `compact` - Removes falsy values from an array
- `countBy` - Counts elements grouped by iteratee result
- `uniq` - Creates an array with unique values
- `uniqBy` - Like uniq but accepts an iteratee
- `groupBy` - Groups array elements by iteratee result
- `partition` - Splits an array into two groups by predicate
- `sortBy` - Creates a sorted copy by iteratee result
- `difference` - Create an array of unique values not included in other arrays
- `differenceBy` - Like difference but accepts iteratee
- `differenceWith` - Like difference but accepts comparator
- `keyBy` - Creates an object composed of keys generated from array

### String Operations

- `capitalize` - Uppercases the first character only (not title case; uses `toUpperCase`)
- `camelCase` - Converts a string to camel case
- `kebabCase` - Converts a string to kebab case
- `snakeCase` - Converts a string to snake case
- `startCase` - Converts each word to start case (title-style)
- `escape` - Escapes HTML special characters
- `unescape` - Unescapes HTML special characters
- `escapeRegExp` - Escapes RegExp special characters

### Clone Operations

- `clone` - Creates a shallow clone of a value
- `cloneDeep` - Creates a deep clone of a value
- `cloneWith` - Creates a shallow clone with a customizer
- `cloneDeepWith` - Creates a deep clone with a customizer

### Function Utilities

- `debounce` - Creates a debounced function
- `throttle` - Creates a throttled function
- `noop` - No-op default callback
- `identity` - Returns the first argument unchanged
- `once` - Invokes a function at most once

### Math

- `clamp` - Clamps a number between min and max

### Promise

- `delay` - Resolves after the specified milliseconds

## AI / Agent integration

check-toolkit ships a **vendor-neutral** machine-readable catalog (not an LLM runtime). Any tool that can read JSON or docs can use it.

### Catalog (source of truth)

```ts
import catalog from "check-toolkit/catalog" with { type: "json" };
// or read node_modules/check-toolkit/ai/catalog.json / ai/catalog.json from the repo
```

Each entry includes `signature`, `intents`, `narrows`, `examples`, and `antiPatterns`. The root also lists `notIncluded` APIs (for example `get`, `merge`, `memoize`) so agents do not hallucinate them.

### `llms.txt`

A compact digest generated from the catalog:

- In the repo: [`ai/llms.txt`](./ai/llms.txt)
- On GitHub: `https://raw.githubusercontent.com/neturuDev/check-toolkit/main/ai/llms.txt`

Regenerate / validate (also runs as part of `npm run build`):

```bash
npm run generate:ai
```

### Agent skill (optional)

For coding agents that support Agent Skills, see [`skills/check-toolkit/SKILL.md`](./skills/check-toolkit/SKILL.md). Prefer the catalog as the API source of truth; the skill only encodes prefer/narrowing rules.

## Testing

To run the test suite:

```bash
npm run test
```

To build the project:

```bash
npm run build
```

To start development server:

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

Originally created by [Volodymyr Cherevchuk](https://github.com/neturuDev)
