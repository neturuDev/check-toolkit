# check-toolkit

A TypeScript utility library for type checking and validation.

## Installation

```bash
npm install check-toolkit
```

## Usage

```typescript
import { isString } from "check-toolkit";
import { isNumber } from "check-toolkit";
import { isArray } from "check-toolkit";
// ... import other functions as needed

// Type checking examples
console.log(isString("test")); // true
console.log(isNumber(42)); // true
console.log(isArray([1, 2, 3])); // true
console.log(isObject({})); // true
console.log(isFunction(() => {})); // true
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
- `isUndefined` - Check if value is undefined
- `isNotUndefined` - Check if value is not undefined
- `isNil` - Check if value is null or undefined
- `isNotNil` - Check if value is not null and not undefined
- `isNotNaN` - Check if value is not NaN
- `isEmpty` - Check if value is empty
- `isEqual` - Check if two values are equal
- `isMatch` - Check if object matches source

### Array Operations

- `difference` - Create an array of unique values not included in other arrays
- `differenceBy` - Like difference but accepts iteratee
- `differenceWith` - Like difference but accepts comparator
- `keyBy` - Creates an object composed of keys generated from array

### String Operations

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

## Module Organization

- Internally, utility functions are grouped by domain in `lib/array.ts` and `lib/string.ts`.
- `lib/helpers.ts` is kept as a compatibility re-export layer for existing deep imports.
- Prefer importing from the package root (`check-toolkit`) rather than deep-importing internal files.

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

## Documentation

For detailed documentation and examples, please visit our [documentation](./docs).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

Originally created by [Volodymyr Cherevchuk](https://github.com/neturuDev)
