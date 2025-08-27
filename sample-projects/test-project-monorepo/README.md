# Monorepo Example

This project demonstrates a monorepo setup with cross-package dependencies and various export patterns that the "Find unused exports" extension can detect.

## Project Structure

```
packages/
├── shared/                 # Shared utilities and types
│   ├── src/
│   │   ├── types.ts       # Common types and interfaces
│   │   ├── utils.ts       # Utility functions
│   │   └── index.ts       # Main export file
│   ├── package.json
│   └── tsconfig.json
└── api/                   # API package using shared utilities
    ├── src/
    │   ├── userService.ts # User service implementation
    │   └── index.ts       # API main entry point
    ├── package.json
    └── tsconfig.json
```

## What This Example Demonstrates

### Cross-Package Dependencies

- `@monorepo/api` depends on `@monorepo/shared`
- TypeScript project references for proper compilation order
- Workspace configuration for npm/yarn

### Used Exports (Cross-Package)

- `User`, `UserRole`, `ApiResponse` types from shared package
- `generateId`, `validateEmail`, `VALIDATION_MESSAGES` from shared utils
- `formatDate` from shared utils

### Unused Exports (Should be detected)

- `UserSettings`, `DatabaseConnection` types from shared package
- `DEFAULT_PAGINATION` constant from shared package
- `slugify`, `debounce` functions from shared utils
- `HTTP_STATUS_CODES` constant from shared utils
- `UserService.updateUser()`, `UserService.deleteUser()` methods
- `unusedApiFunction` from api package

## Running the Example

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Run the API package
cd packages/api
npm start
```

## Development

```bash
# Build in watch mode
npm run build -- --watch

# Run API in development mode
cd packages/api
npm run dev
```

## Monorepo Features Demonstrated

- **Workspaces**: npm/yarn workspace configuration
- **TypeScript Project References**: Proper compilation order and incremental builds
- **Cross-Package Dependencies**: Internal package dependencies
- **Shared Code**: Common types and utilities across packages
- **Build Orchestration**: Coordinated build scripts across packages

This example showcases:

- Realistic monorepo structure with shared utilities
- Cross-package import/export relationships
- TypeScript project references and path mapping
- Mixed used and unused exports across package boundaries
