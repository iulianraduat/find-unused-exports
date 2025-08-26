const js = require('@eslint/js')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const prettierConfig = require('eslint-config-prettier')
const prettierPlugin = require('eslint-plugin-prettier')
const importPlugin = require('eslint-plugin-import')

// Common globals for Node.js and VS Code extensions
const commonGlobals = {
  __dirname: 'readonly',
  __filename: 'readonly',
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  global: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
}

// Common plugins for all file types
const commonPlugins = {
  prettier: prettierPlugin,
  import: importPlugin,
}

// Common code quality rules
const commonRules = {
  // Code quality
  curly: 'warn',
  eqeqeq: ['warn', 'always'],
  'no-throw-literal': 'warn',
  'prefer-const': 'error',
  'no-var': 'error',
  'no-console': 'warn',

  // Prettier integration
  'prettier/prettier': 'error',

  // Import organization
  'import/no-duplicates': 'error',
  'import/newline-after-import': 'error',
  'import/no-unresolved': 'off', // TypeScript handles this
}

// Common import order configuration
const importOrderConfig = [
  'error',
  {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    'newlines-between': 'never',
    alphabetize: {
      order: 'asc',
      caseInsensitive: true,
    },
  },
]

// Enhanced import order for TypeScript (includes type imports and VS Code patterns)
const tsImportOrderConfig = [
  'error',
  {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
    'newlines-between': 'never',
    alphabetize: {
      order: 'asc',
      caseInsensitive: true,
    },
    pathGroups: [
      {
        pattern: 'vscode',
        group: 'external',
        position: 'before',
      },
    ],
    pathGroupsExcludedImportTypes: ['builtin'],
  },
]

module.exports = [
  // Base JavaScript configuration
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'out/**',
      'node_modules/**',
      'test-project-*/**',
      '*.vsix',
      'coverage/**',
      '.vscode-test/**',
      '**/*.d.ts',
    ],
  },

  // Common configuration for all JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: commonGlobals,
    },
    plugins: commonPlugins,
    rules: {
      ...commonRules,
      'import/order': importOrderConfig,
    },
  },

  // JavaScript-specific configuration
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        // Additional Node.js globals for JS files
        module: 'readonly',
        require: 'readonly',
      },
    },
  },

  // TypeScript-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // VS Code extension specific globals
        NodeJS: 'readonly',
        Thenable: 'readonly',
      },
    },
    plugins: {
      ...commonPlugins,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable base ESLint rules covered by TypeScript
      semi: 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',

      // Override import order for TypeScript
      'import/order': tsImportOrderConfig,
      'import/extensions': 'off', // VS Code extensions don't use file extensions

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // VS Code extension naming conventions
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          format: ['camelCase', 'PascalCase', 'snake_case'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'method',
          format: ['camelCase'],
        },
      ],

      // TypeScript best practices
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/unified-signatures': 'error',
    },
  },

  // Prettier configuration to disable conflicting rules
  prettierConfig,

  // Test files configuration
  {
    files: ['**/*.{test,spec}.{ts,js}', '**/test/**/*.{ts,js}', '**/tests/**/*.{ts,js}'],
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // Configuration files
  {
    files: ['*.config.{js,mjs,ts}', '.eslintrc.{js,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },
]
