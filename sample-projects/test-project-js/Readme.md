# JavaScript Project Example

This project demonstrates a JavaScript application using both ES modules and CommonJS with various export patterns that the "Find unused exports" extension can detect.

## Project Structure

```
src/
├── calculator.js        # ES module with math functions
├── dataProcessor.js     # CommonJS module with data utilities
└── eventEmitter.js      # ES module with default and named exports
index.js                 # Main entry point using mixed imports
```

## What This Example Demonstrates

### Used Exports

- `add`, `subtract`, `multiply`, `MATH_CONSTANTS` from calculator.js
- `EventEmitter` default export from eventEmitter.js
- `processArray`, `sortData`, `DEFAULT_CONFIG` from dataProcessor.js

### Unused Exports (Should be detected)

- `divide`, `power`, `factorial` functions from calculator.js
- `UNUSED_MATH_CONSTANT` from calculator.js
- `createEventEmitter`, `EVENT_TYPES` from eventEmitter.js
- `EventEmitter.off()`, `EventEmitter.once()` methods
- `groupData`, `aggregateData` from dataProcessor.js
- `UNUSED_CONFIG` from dataProcessor.js
- `processArraySync`, `sortDataSync` from dataProcessor.js

## Module Systems Demonstrated

### ES Modules

- Named exports: `export function add() {}`
- Default exports: `export default class EventEmitter {}`
- Mixed exports in same file

### CommonJS

- `module.exports = {}` object export
- `exports.name = value` individual exports
- `require()` imports

## Running the Example

```bash
npm install
npm start
```

## Development

```bash
npm run dev  # Run with --watch flag
```

This example showcases:

- Mixed ES modules and CommonJS in the same project
- Different export patterns (named, default, object, individual)
- Realistic JavaScript patterns with external dependencies
- Event-driven architecture
- Data processing utilities
