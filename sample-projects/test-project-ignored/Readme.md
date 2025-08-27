# Ignored Files Example

This project demonstrates how to configure the "Find unused exports" extension using `.findUnusedExports.json` to include/exclude specific files and directories.

## Project Structure

```
src/
├── core/
│   ├── calculator.js      # Core functionality (included)
│   └── calculator.test.js # Test file (excluded)
├── utils/
│   ├── helpers.ts         # Utilities (included)
│   └── helpers.spec.ts    # Spec file (excluded)
└── legacy/
    └── oldCalculator.js   # Legacy code (excluded)
lib/
├── utils.js               # Library utilities (included)
└── vendor/
    └── external.js        # Vendor code (excluded)
```

## Configuration (.findUnusedExports.json)

```json
{
  "include": ["./src/**/*.{js,ts}", "./lib/**/*.js"],
  "exclude": ["./src/**/*.test.{js,ts}", "./src/**/*.spec.{js,ts}", "./src/legacy/**/*", "./lib/vendor/**/*"],
  "considerMainExportsUsed": false,
  "ignoreExportsUsedInFile": true,
  "allowUnusedTypes": false
}
```

## What This Example Demonstrates

### Included Files (Will be analyzed)

- `src/core/calculator.js` - Core functionality
- `src/utils/helpers.ts` - Utility functions
- `lib/utils.js` - Library utilities

### Excluded Files (Will be ignored)

- `src/core/calculator.test.js` - Test files
- `src/utils/helpers.spec.ts` - Spec files
- `src/legacy/oldCalculator.js` - Legacy code
- `lib/vendor/external.js` - Vendor/external libraries

### Used Exports (From included files)

- `add`, `subtract`, `MATH_OPERATIONS` from calculator.js
- `formatNumber`, `isEven`, `DEFAULT_PRECISION` from helpers.ts
- `debounce`, `TIMING_CONSTANTS` from lib/utils.js

### Unused Exports (Should be detected from included files)

- `multiply`, `divide`, `CALCULATOR_VERSION` from calculator.js
- `isOdd`, `clamp`, `MathUtils`, `MAX_SAFE_INTEGER` from helpers.ts
- `throttle`, `PERFORMANCE_CONFIG` from lib/utils.js
- `mainExportFunction` from index.js (since `considerMainExportsUsed: false`)

### Ignored Exports (From excluded files - won't be analyzed)

- All exports from test/spec files
- All exports from legacy folder
- All exports from vendor folder

## Configuration Options Explained

- **include**: Glob patterns for files to analyze
- **exclude**: Glob patterns for files to ignore (overrides include)
- **considerMainExportsUsed**: Whether main file exports are considered used
- **ignoreExportsUsedInFile**: Ignore exports used within the same file
- **allowUnusedTypes**: Whether unused TypeScript types are allowed

## Running the Example

```bash
npm start
```

This example showcases:

- Comprehensive include/exclude patterns
- Mixed JavaScript and TypeScript files
- Test file exclusion patterns
- Legacy code exclusion
- Vendor/external library exclusion
- Main export configuration
- Realistic project structure with different file types
