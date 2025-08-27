# Path Aliases Example

This project demonstrates TypeScript path aliases configuration and how the "Find unused exports" extension handles aliased imports.

## Project Structure

```
src/
├── components/
│   └── Button.ts          # UI component using path aliases
├── services/
│   └── ApiClient.ts       # API service with aliased imports
└── utils/
    ├── validation.ts      # Validation utilities
    ├── url.ts            # URL utilities
    └── error.ts          # Error handling
types/
├── component.ts          # Component-related types
└── api.ts               # API-related types
utils/functions/
└── logger.ts            # Logging utilities (via @functions alias)
```

## Path Aliases Configuration

The `tsconfig.json` includes multiple path aliases:

```json
{
  "paths": {
    "@/types/*": ["./types/*"],
    "@/components/*": ["./src/components/*"],
    "@/services/*": ["./src/services/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/functions/*": ["./utils/functions/*"],
    "@functions/*": ["./utils/functions/*"],
    "@/*": ["./src/*"],
    "~/*": ["./src/*"]
  }
}
```

## What This Example Demonstrates

### Used Exports (Via Path Aliases)

- `Button`, `ButtonProps` from `@/components/Button`
- `ApiClient` from `@/services/ApiClient`
- `ComponentProps` from `@/types/component`
- `ApiResponse` from `@/types/api`
- `logEvent`, `logError` from `@functions/logger`
- `validateProps` from `@/utils/validation`
- `formatUrl` from `~/utils/url`
- `handleError` from `@/utils/error`

### Unused Exports (Should be detected)

- `Button.setDisabled()`, `Button.getVariant()` methods
- `createButton`, `BUTTON_VARIANTS` from Button component
- `ApiClient.post()`, `ApiClient.delete()` methods
- `createApiClient` from ApiClient
- `validateUrl`, `validateRequired`, `ERROR_MESSAGES` from validation
- `parseQueryString`, `buildQueryString` from url utils
- `createError`, `ApiError` class from error utils
- `ComponentConfig` interface from types
- `PaginatedResponse`, `HttpMethod` from api types
- `logWarning`, `logDebug`, `DEFAULT_LOG_CONFIG` from logger

## Running the Example

```bash
npm install
npm run build
npm start
```

## Development

```bash
npm run dev  # Run with ts-node
```

## Path Alias Patterns Demonstrated

- **Scoped aliases**: `@/types/*`, `@/components/*`
- **Function-specific aliases**: `@functions/*`, `@/functions/*`
- **Root aliases**: `@/*`, `~/*`
- **Multiple aliases for same path**: Both `@functions/*` and `@/functions/*`

This example showcases:

- Complex TypeScript path mapping configuration
- Multiple alias patterns for different module types
- Realistic component and service architecture
- Cross-module dependencies via aliases
- Mixed used and unused exports across aliased modules
