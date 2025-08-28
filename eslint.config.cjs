const js = require('@eslint/js')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const prettierConfig = require('eslint-config-prettier')
const importPlugin = require('eslint-plugin-import')
const prettierPlugin = require('eslint-plugin-prettier')
const unicornPlugin = require('eslint-plugin-unicorn').default

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
      '*.vsix',
      'coverage/**',
      '.vscode-test/**',
      '**/*.d.ts',
      'sample-projects/**',
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
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
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
      unicorn: unicornPlugin,
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
          filter: {
            // Allow TypeScript path mapping keys like '@/*', '@utils/*' and VS Code config keys like 'findUnusedExports.debug'
            regex: '^(@.*\\*$|.*\\..*$)',
            match: false,
          },
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
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',

      // Unicorn plugin rules for best practices
      ...unicornPlugin.configs.recommended.rules,
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/no-array-for-each': 'off',
      // 'unicorn/better-regex': 'error',
      // 'unicorn/catch-error-name': 'error',
      // 'unicorn/consistent-destructuring': 'error',
      // 'unicorn/consistent-function-scoping': 'error',
      // 'unicorn/custom-error-definition': 'off',
      // 'unicorn/empty-brace-spaces': 'error',
      // 'unicorn/error-message': 'error',
      // 'unicorn/escape-case': 'error',
      // 'unicorn/expiring-todo-comments': 'off',
      // 'unicorn/explicit-length-check': [
      //   'error',
      //   {
      //     'non-zero': 'not-equal',
      //   },
      // ],
      // 'unicorn/import-style': 'off',
      // 'unicorn/new-for-builtins': 'error',
      // 'unicorn/no-abusive-eslint-disable': 'error',
      // 'unicorn/no-array-push-push': 'error',
      // 'unicorn/no-await-expression-member': 'error',
      // 'unicorn/no-console-spaces': 'error',
      // 'unicorn/no-document-cookie': 'error',
      // 'unicorn/no-empty-file': 'error',
      // 'unicorn/no-for-loop': 'error',
      // 'unicorn/no-hex-escape': 'error',
      // 'unicorn/no-instanceof-array': 'error',
      // 'unicorn/no-invalid-remove-event-listener': 'error',
      // 'unicorn/no-keyword-prefix': 'off',
      // 'unicorn/no-lonely-if': 'error',
      // 'unicorn/no-nested-ternary': 'off',
      // 'unicorn/no-new-array': 'error',
      // 'unicorn/no-new-buffer': 'error',
      // 'unicorn/no-object-as-default-parameter': 'error',
      // 'unicorn/no-process-exit': 'off',
      // 'unicorn/no-static-only-class': 'error',
      // 'unicorn/no-thenable': 'error',
      // 'unicorn/no-this-assignment': 'error',
      // 'unicorn/no-typeof-undefined': 'error',
      // 'unicorn/no-unnecessary-await': 'error',
      // 'unicorn/no-unreadable-array-destructuring': 'error',
      // 'unicorn/no-unreadable-iife': 'error',
      // 'unicorn/no-unused-properties': 'off',
      // 'unicorn/no-useless-fallback-in-spread': 'error',
      // 'unicorn/no-useless-length-check': 'error',
      // 'unicorn/no-useless-promise-resolve-reject': 'error',
      // 'unicorn/no-useless-spread': 'error',
      // 'unicorn/no-useless-switch-case': 'error',
      // 'unicorn/no-zero-fractions': 'error',
      // 'unicorn/number-literal-case': 'error',
      // 'unicorn/numeric-separators-style': 'error',
      // 'unicorn/prefer-add-event-listener': 'error',
      // 'unicorn/prefer-array-find': 'error',
      // 'unicorn/prefer-array-flat': 'error',
      // 'unicorn/prefer-array-flat-map': 'error',
      // 'unicorn/prefer-array-index-of': 'error',
      // 'unicorn/prefer-array-some': 'error',
      // 'unicorn/prefer-at': 'off',
      // 'unicorn/prefer-code-point': 'error',
      // 'unicorn/prefer-date-now': 'error',
      // 'unicorn/prefer-default-parameters': 'error',
      // 'unicorn/prefer-dom-node-append': 'error',
      // 'unicorn/prefer-dom-node-dataset': 'error',
      // 'unicorn/prefer-dom-node-remove': 'error',
      // 'unicorn/prefer-dom-node-text-content': 'error',
      // 'unicorn/prefer-export-from': 'error',
      // 'unicorn/prefer-includes': 'error',
      // 'unicorn/prefer-json-parse-buffer': 'off',
      // 'unicorn/prefer-keyboard-event-key': 'error',
      // 'unicorn/prefer-logical-operator-over-ternary': 'error',
      // 'unicorn/prefer-math-trunc': 'error',
      // 'unicorn/prefer-modern-dom-apis': 'error',
      // 'unicorn/prefer-modern-math-apis': 'error',
      // 'unicorn/prefer-module': 'off',
      // 'unicorn/prefer-native-coercion-functions': 'error',
      // 'unicorn/prefer-negative-index': 'error',
      // 'unicorn/prefer-node-protocol': 'error',
      // 'unicorn/prefer-number-properties': 'error',
      // 'unicorn/prefer-object-from-entries': 'error',
      // 'unicorn/prefer-optional-catch-binding': 'error',
      // 'unicorn/prefer-prototype-methods': 'error',
      // 'unicorn/prefer-query-selector': 'error',
      // 'unicorn/prefer-reflect-apply': 'error',
      // 'unicorn/prefer-regexp-test': 'error',
      // 'unicorn/prefer-set-has': 'error',
      // 'unicorn/prefer-set-size': 'error',
      // 'unicorn/prefer-spread': 'error',
      // 'unicorn/prefer-string-replace-all': 'off',
      // 'unicorn/prefer-string-slice': 'error',
      // 'unicorn/prefer-string-starts-ends-with': 'error',
      // 'unicorn/prefer-string-trim-start-end': 'error',
      // 'unicorn/prefer-switch': 'error',
      // 'unicorn/prefer-ternary': 'off',
      // 'unicorn/prefer-top-level-await': 'off',
      // 'unicorn/prefer-type-error': 'error',
      // 'unicorn/prevent-abbreviations': 'off',
      // 'unicorn/relative-url-style': 'error',
      // 'unicorn/require-array-join-separator': 'error',
      // 'unicorn/require-number-to-fixed-digits-argument': 'error',
      // 'unicorn/require-post-message-target-origin': 'off',
      // 'unicorn/string-content': 'off',
      // 'unicorn/switch-case-braces': 'error',
      // 'unicorn/template-indent': 'warn',
      // 'unicorn/text-encoding-identifier-case': 'error',
      // 'unicorn/throw-new-error': 'error',
    },
  },

  // Prettier configuration to disable conflicting rules
  prettierConfig,

  // Test files configuration - disable type-checking
  {
    files: ['**/*.{test,spec}.{ts,js}', '**/test/**/*.{ts,js}', '**/tests/**/*.{ts,js}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false, // Disable type-checking for test files
      },
    },
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-module': 'off',
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
