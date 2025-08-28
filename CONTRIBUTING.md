# Contributing to Find Unused Exports

Thank you for your interest in contributing to the Find Unused Exports VS Code extension! This guide will help you get started with development and ensure your contributions align with the project's standards.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Debugging](#debugging)

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Latest version (comes with Node.js)
- **VS Code**: Version 1.75.0 or higher
- **Git**: For version control

### Initial Setup

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/find-unused-exports.git
   cd find-unused-exports
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup Git hooks**:

   ```bash
   npm run prepare
   ```

   This installs Husky hooks that will automatically run linting and formatting before commits.

4. **Verify setup**:
   ```bash
   npm run validate
   ```
   This runs the complete validation suite to ensure everything is working correctly.

### VS Code Configuration

The project includes optimized VS Code settings in `.vscode/`:

- **settings.json**: Workspace-specific settings for consistent development
- **extensions.json**: Recommended extensions for the best development experience
- **launch.json**: Debug configurations for running and testing the extension

Install the recommended extensions when prompted by VS Code for the best development experience.

## Code Standards

### TypeScript Guidelines

- **Strict mode**: The project uses TypeScript strict mode. All code must pass strict type checking.
- **Explicit types**: Prefer explicit return types for functions, especially public APIs.
- **No `any`**: Avoid using `any` type. Use proper typing or `unknown` when necessary.
- **Null safety**: Handle null and undefined values explicitly.

### Code Style

The project uses **Prettier** for code formatting and **ESLint** for code quality:

- **Formatting**: All code is automatically formatted with Prettier
- **Linting**: ESLint enforces code quality rules and best practices
- **Import organization**: Imports are automatically organized and sorted

### Naming Conventions

- **Files**: Use kebab-case for file names (`my-component.ts`)
- **Classes**: Use PascalCase (`MyClass`)
- **Functions/Variables**: Use camelCase (`myFunction`, `myVariable`)
- **Constants**: Use UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces**: Use PascalCase with descriptive names (`UserData`, `ConfigOptions`)

### Documentation

- **JSDoc**: Use JSDoc comments for public functions and classes
- **README updates**: Update documentation when adding new features
- **Code comments**: Write clear, concise comments for complex logic

## Development Workflow

### Daily Development

1. **Start development session**:

   ```bash
   npm run dev
   ```

   This formats code, runs linting, and builds the extension.

2. **Run tests during development**:

   ```bash
   npm run test:watch
   ```

3. **Type checking in watch mode**:
   ```bash
   npm run type-check:watch
   ```

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code standards

3. **Run validation frequently**:

   ```bash
   npm run validate
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Pre-commit hooks will automatically:
   - Format your code with Prettier
   - Run ESLint and fix auto-fixable issues
   - Run tests to ensure nothing is broken

### Commit Message Format

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

- `feat: add circular import detection`
- `fix: resolve path alias resolution issue`
- `docs: update README with new configuration options`

## Testing Guidelines

### Test Structure

The project uses **Vitest** for testing with the following structure:

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests with VS Code APIs
├── fixtures/       # Test data and mock files
├── mocks/          # Mock implementations
└── setup.ts        # Test setup and configuration
```

### Writing Tests

1. **Unit Tests**: Test individual functions and classes in isolation

   ```typescript
   import { describe, it, expect } from 'vitest'
   import { myFunction } from '../src/myModule'

   describe('myFunction', () => {
     it('should return expected result', () => {
       const result = myFunction('input')
       expect(result).toBe('expected')
     })
   })
   ```

2. **Integration Tests**: Test VS Code integration with mocked APIs

   ```typescript
   import { describe, it, expect, vi } from 'vitest'
   import * as vscode from 'vscode'

   vi.mock('vscode', () => ({
     workspace: {
       getConfiguration: vi.fn(),
     },
   }))
   ```

3. **Test Coverage**: Aim for at least 80% code coverage
   ```bash
   npm run test:coverage
   ```

### Running Tests

- **All tests**: `npm test`
- **Watch mode**: `npm run test:watch`
- **With UI**: `npm run test:ui`
- **Coverage report**: `npm run test:coverage:html`
- **Unit tests only**: `npm run test:unit`
- **Integration tests only**: `npm run test:integration`

### Test Best Practices

- **Descriptive names**: Use clear, descriptive test names
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Test edge cases**: Include tests for error conditions and edge cases
- **Mock external dependencies**: Use mocks for VS Code APIs and file system operations
- **Clean up**: Ensure tests clean up after themselves

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:

   ```bash
   npm run validate
   ```

2. **Update documentation** if needed

3. **Add tests** for new functionality

4. **Check the sample projects** still work correctly

### Submitting the PR

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to any related issues
   - Screenshots if UI changes are involved

3. **Respond to feedback** and make requested changes

### PR Requirements

- ✅ All tests pass
- ✅ Code coverage maintained or improved
- ✅ ESLint passes with no warnings
- ✅ Code is properly formatted
- ✅ Documentation is updated
- ✅ Commit messages follow conventional format

## Project Structure

### Source Code Organization

```
src/
├── extension.ts              # Main extension entry point
├── core.ts                   # Core unused export detection logic
├── provider.ts               # VS Code tree data provider
├── circularImports.ts        # Circular import detection
├── unusedExports.ts          # Main unused exports functionality
└── unused-exports/           # Core analysis modules
    ├── app.ts               # Application logic
    ├── context.ts           # Analysis context
    ├── exports.ts           # Export detection
    ├── imports.ts           # Import detection
    ├── fsUtils.ts           # File system utilities
    └── ...                  # Other analysis modules
```

### Key Components

- **Extension**: Main VS Code extension activation and commands
- **Core**: Core logic for detecting unused exports
- **Provider**: VS Code UI integration (tree view, decorations)
- **Circular Imports**: Detection and reporting of circular dependencies
- **Analysis Modules**: Specialized modules for different aspects of code analysis

### Configuration Files

- **tsconfig.json**: TypeScript configuration with strict settings
- **eslint.config.cjs**: ESLint flat configuration
- **.prettierrc**: Prettier formatting rules
- **vitest.config.ts**: Vitest testing configuration
- **package.json**: Dependencies, scripts, and extension metadata

## Debugging

### VS Code Extension Debugging

1. **Open the project in VS Code**

2. **Press F5** or use the "Run Extension" launch configuration

3. **A new VS Code window opens** with the extension loaded

4. **Set breakpoints** in the source code

5. **Use the extension** in the new window to trigger breakpoints

### Debug Configurations

The project includes several debug configurations in `.vscode/launch.json`:

- **Run Extension**: Launch the extension in a new VS Code window
- **Run Tests**: Debug tests with breakpoints
- **Attach to Extension Host**: Attach debugger to running extension

### Logging

Enable debug logging in the extension settings:

```json
{
  "findUnusedExports.debug": true,
  "findUnusedExports.logInFile": true
}
```

This will log detailed information to:

- VS Code Output panel (Find Unused Exports channel)
- Log file at `.vscode/find-unused-exports.log`

### Common Issues

1. **Extension not loading**: Check the VS Code developer console for errors
2. **Tests failing**: Ensure VS Code APIs are properly mocked
3. **Build errors**: Run `npm run type-check` to see TypeScript errors
4. **Linting errors**: Run `npm run lint:fix` to auto-fix issues

## Getting Help

- **Issues**: Check existing [GitHub issues](https://github.com/d0whc3r/find-unused-exports/issues)
- **Discussions**: Start a discussion for questions or ideas
- **Documentation**: Refer to the README.md and code comments
- **VS Code Extension API**: [Official VS Code Extension API documentation](https://code.visualstudio.com/api)

Thank you for contributing to Find Unused Exports! 🎉
