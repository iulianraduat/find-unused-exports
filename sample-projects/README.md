# Sample Projects for Find Unused Exports Extension

This directory contains comprehensive example projects that demonstrate various scenarios and configurations for the "Find unused exports" VS Code extension. Each project showcases different use cases and helps test the extension's capabilities.

## Projects Overview

### 1. Basic TypeScript (`test-project-ts`)

**Purpose**: Demonstrates basic TypeScript project with mixed used/unused exports

**Key Features**:

- Modern TypeScript configuration with strict mode
- Realistic application structure (models, services, utils)
- Mix of classes, interfaces, functions, and constants
- Both used and unused exports for testing detection

**Use Cases**:

- Basic TypeScript project analysis
- Class method detection
- Interface and type detection
- Constant and function detection

### 2. JavaScript Project (`test-project-js`)

**Purpose**: Shows JavaScript project with both ES modules and CommonJS

**Key Features**:

- Mixed module systems (ES modules + CommonJS)
- Different export patterns (named, default, object exports)
- External dependencies (lodash)
- Event-driven architecture example

**Use Cases**:

- JavaScript project analysis
- Mixed module system detection
- CommonJS vs ES modules
- External dependency handling

### 3. Monorepo Example (`test-project-monorepo`)

**Purpose**: Demonstrates monorepo setup with cross-package dependencies

**Key Features**:

- Multiple packages with internal dependencies
- TypeScript project references
- Shared utilities and types
- Workspace configuration

**Use Cases**:

- Monorepo analysis
- Cross-package dependency detection
- TypeScript project references
- Internal package imports

### 4. Path Aliases (`test-project-paths-aliases`)

**Purpose**: Shows complex TypeScript path mapping and aliases

**Key Features**:

- Multiple path alias configurations
- Complex tsconfig.json path mapping
- Scoped and function-specific aliases
- Realistic component architecture

**Use Cases**:

- Path alias resolution
- Complex import path handling
- TypeScript path mapping
- Module resolution testing

### 5. Ignored Files (`test-project-ignored`)

**Purpose**: Demonstrates `.findUnusedExports.json` configuration

**Key Features**:

- Comprehensive include/exclude patterns
- Test file exclusion
- Legacy code exclusion
- Vendor library exclusion
- Mixed file types (JS/TS)

**Use Cases**:

- Configuration file testing
- File inclusion/exclusion patterns
- Test file handling
- Legacy code management

## Common Patterns Across Projects

### Export Types Covered

- **Named exports**: `export function name() {}`
- **Default exports**: `export default class Name {}`
- **Re-exports**: `export * from './module'`
- **Type exports**: `export interface Name {}`
- **Constant exports**: `export const NAME = value`
- **Class exports**: `export class Name {}`

### Import Patterns

- **Named imports**: `import { name } from './module'`
- **Default imports**: `import Name from './module'`
- **Namespace imports**: `import * as Name from './module'`
- **Mixed imports**: `import Name, { other } from './module'`
- **Dynamic imports**: `import('./module')`

### Unused Export Scenarios

Each project includes realistic unused exports:

- Unused functions and methods
- Unused interfaces and types
- Unused constants and configurations
- Unused classes and their methods
- Unused utility functions

## Testing the Extension

### Manual Testing

1. Open any sample project in VS Code
2. Ensure the "Find unused exports" extension is installed
3. Check the Problems panel for detected unused exports
4. Verify the extension correctly identifies used vs unused exports

### Expected Behavior

- **Used exports** should NOT appear in the problems panel
- **Unused exports** should be highlighted as problems
- **Excluded files** (in ignored files example) should not be analyzed
- **Path aliases** should be resolved correctly
- **Cross-package imports** (in monorepo) should be detected

### Configuration Testing

Use the ignored files example to test:

- Include/exclude patterns
- Configuration file handling
- Different file type handling
- Main export consideration

## Development and Maintenance

### Adding New Examples

When adding new sample projects:

1. Follow the established naming convention (`test-project-*`)
2. Include comprehensive README.md
3. Add both used and unused exports
4. Include package.json with appropriate scripts
5. Document the specific use case being demonstrated

### Updating Examples

When updating existing projects:

1. Maintain backward compatibility
2. Update README.md with changes
3. Ensure examples remain realistic
4. Test with the extension after changes

## Project Structure Standards

Each sample project should include:

- `package.json` with proper metadata and scripts
- `README.md` explaining the project's purpose
- Realistic code structure and patterns
- Mix of used and unused exports
- Appropriate configuration files (tsconfig.json, etc.)

## Usage in Extension Development

These sample projects serve multiple purposes:

- **Manual testing** during development
- **Regression testing** for new features
- **Documentation** of supported scenarios
- **Benchmarking** performance with different project types

The projects are designed to be comprehensive yet focused, each highlighting specific aspects of the extension's functionality while remaining realistic and maintainable.
