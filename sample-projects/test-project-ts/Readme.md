# Basic TypeScript Example

This project demonstrates a basic TypeScript application with various export patterns that the "Find unused exports" extension can detect.

## Project Structure

```
src/
├── models/
│   └── User.ts          # User model with mixed used/unused exports
├── services/
│   └── ApiService.ts    # API service with unused methods
└── utils/
    └── helpers.ts       # Utility functions with unused exports
index.ts                 # Main entry point
```

## What This Example Demonstrates

### Used Exports

- `User` interface (used in index.ts)
- `UserService` class (used in index.ts)
- `ApiService` class (used in index.ts)
- `formatDate`, `capitalize`, `CONSTANTS` (used in index.ts)

### Unused Exports (Should be detected)

- `UserMetadata` interface
- `UserService.deleteUser()` method
- `DEFAULT_USER_PREFERENCES` constant
- `ApiService.put()` and `ApiService.delete()` methods
- `createApiClient()` function
- `API_ENDPOINTS` constant and `ApiEndpoint` type
- `debounce()`, `throttle()` functions
- `UNUSED_CONSTANT`

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

This example showcases realistic TypeScript patterns including:

- Classes with both used and unused methods
- Interfaces and types
- Utility functions
- Constants and configuration objects
- Modern TypeScript features (strict mode, proper typing)
