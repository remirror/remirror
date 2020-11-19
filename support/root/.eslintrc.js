/** @type {import('eslint').Linter.Config} */
let config = {
  parser: '@typescript-eslint/parser',
  plugins: [
    'jest',
    'jest-formatting',
    '@typescript-eslint',
    'react-hooks',
    'react',
    'unicorn',
    'jsx-a11y',
    'simple-import-sort',
    'eslint-comments',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
    'plugin:jest-formatting/recommended',
    'plugin:unicorn/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'latest',
    },
  },
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  rules: {
    'eslint-comments/no-unused-disable': 'error',

    'unicorn/no-fn-reference-in-iterator': 'off',
    'unicorn/no-object-as-default-parameter': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/prevent-abbreviations': 'off', // Too aggressive.
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/no-null': 'off',
    'unicorn/no-reduce': 'off',
    'unicorn/import-style': ['off'],

    'jest/no-test-return-statement': 'off',
    'jest/prefer-strict-equal': 'off',
    'jest/no-export': 'off',
    'jest/consistent-test-it': ['error'],
    'jest/prefer-spy-on': ['warn'],
    'jest/prefer-todo': ['warn'],
    'jest/prefer-hooks-on-top': ['error'],
    'jest/no-large-snapshots': ['warn', { maxSize: 20 }],
    'jest/no-duplicate-hooks': ['error'],
    'jest/no-if': ['error'],
    'jest/no-restricted-matchers': [
      'error',
      { toBeTruthy: 'Avoid `toBeTruthy`', toBeFalsy: 'Avoid `toBeFalsy`' },
    ],

    'sort-imports': 'off',

    // Use nice import rules
    'simple-import-sort/sort': [
      'warn',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // Packages that are not scoped to `remirror`
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^(?!@remirror)@?\\w'],

          // Scoped packages
          ['^@remirror'],

          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything that does not start with a dot.
          ['^[^.]'],

          // Relative imports.
          // Anything that starts with a dot.
          ['^\\.'],
        ],
      },
    ],

    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowTernary: true, allowShortCircuit: true },
    ],

    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'typeParameter', format: ['StrictPascalCase'] },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/ban-types': [
      'warn',
      {
        extendDefaults: false,
        types: {
          String: {
            message: 'Use string instead',
            fixWith: 'string',
          },
          Boolean: {
            message: 'Use boolean instead',
            fixWith: 'boolean',
          },
          Number: {
            message: 'Use number instead',
            fixWith: 'number',
          },
          Symbol: {
            message: 'Use symbol instead',
            fixWith: 'symbol',
          },
          Function: {
            message: [
              'The `Function` type accepts any function-like value.',
              'It provides no type safety when calling the function, which can be a common source of bugs.',
              'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
              'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
            ].join('\n'),
          },

          // object typing
          Object: {
            message: [
              'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
              '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` instead.',
            ].join('\n'),
          },
          '{}': {
            message: [
              '`{}` actually means "any non-nullish value".',
              '- If you want a type meaning "object", you probably want `object` instead.',
              '- If you want a type meaning "any value", you probably want `unknown` instead.',
            ].join('\n'),
            fixWith: 'object',
          },
        },
      },
    ],

    // @todo Set `explicit-module-boundary-types` lint rule to `error` once all
    // issues are resolve @block All exported methods that are exposed to end
    // users should be explicitly typed. It makes for better readability when
    // contributing since inference requires more work to determine the return
    // types, and also it forces deliberate planning.
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      { allowedNames: ['name', 'createHelpers', 'createCommands', 'createExtensions'] },
    ],

    // Turning off as it leads to code with bad patterns, where implementation
    // details are placed before the actual meaningful code.
    '@typescript-eslint/no-use-before-define': ['off', { typedefs: false }],
    '@typescript-eslint/member-ordering': [
      'warn',
      { default: ['signature', 'static-field', 'static-method', 'field', 'constructor', 'method'] },
    ],
    '@typescript-eslint/method-signature-style': 'warn',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/array-type': [
      'error',
      { default: 'array-simple', readonly: 'array-simple' },
    ],

    // React Rules

    'react/no-multi-comp': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'error',
    'react/no-unused-state': 'error',
    'react/no-children-prop': 'error',

    // React Hooks

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    // Built in eslint rules
    'no-constant-condition': 'off', // To many false positives
    'no-empty': 'warn',
    'no-else-return': 'warn',
    'no-useless-escape': 'warn',
    'default-case': 'warn',
    'prefer-template': 'warn',
    'guard-for-in': 'warn',
    'prefer-object-spread': 'warn',
    curly: ['warn', 'all'],
    'no-invalid-regexp': 'error',
    'no-multi-str': 'error',
    'no-extra-boolean-cast': 'error',
    radix: 'error',
    'no-return-assign': ['error', 'except-parens'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'prefer-exponentiation-operator': 'error',
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'padding-line-between-statements': [
      'warn',
      {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'switch', 'for', 'do', 'while', 'class', 'function'],
      },
      {
        blankLine: 'always',
        prev: ['if', 'switch', 'for', 'do', 'while', 'class', 'function'],
        next: '*',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-extra-non-null-assertion': ['error'],
        '@typescript-eslint/prefer-optional-chain': ['error'],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/no-dynamic-delete': ['error'],
        '@typescript-eslint/no-var-requires': 'error',
      },
    },
    {
      files: [
        '**/__tests__/**',
        '**/__stories__/**',
        'support/**',
        '**/__dts__/**',
        '**/*.test.ts',
      ],
      rules: {
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off', // Often you need to use @ts-ignore in tests
        '@typescript-eslint/no-non-null-assertion': 'off', // Makes writing tests more convenient
        '@typescript-eslint/no-use-before-define': 'off',
        'react/display-name': 'off',
      },
    },
    {
      files: [
        '**/*.d.ts',
        '**/__mocks__/**',
        'packages/@remirror/i18n/**/*.ts',
        'docs/**',
        'examples/**',
        'support/**',
        '**/__stories__',
        '**/*.stories.tsx',
        '**/*.stories.ts',
        'packages/@remirror/cli/**',
        'packages/@remirror/playground/**',
        'packages/@remirror/extension-emoji/src/data/*.ts',
      ],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['**/*.d.ts', '**/__mocks__/**'],
      rules: { 'import/no-duplicates': 'off', '@typescript-eslint/no-namespace': 'off' },
    },
    {
      files: ['**/__dts__/**'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars-experimental': 'off',
      },
    },
    {
      files: ['support/scripts/**', 'support/e2e/**', 'packages/@remirror/playground/scripts/**'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        'unicorn/no-process-exit': 'off',
        'unicorn/no-unreadable-array-destructuring': 'off',
      },
    },
    {
      files: ['packages/@remirror/i18n/**/*.js'],
      rules: {
        'eslint-comments/disable-enable-pair': 'off',
        'eslint-comments/no-unlimited-disable': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
        'eslint-comments/no-unused-disable': 'off',
      },
    },
    {
      files: [
        '**/*matchers.ts',
        'support/**',
        'examples/**',
        'packages/@remirror/playground/**',
        'packages/@remirror/core-utils/src/keyboard-utils.ts',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'import/max-dependencies': 'off',
      },
    },
    {
      files: ['packages/@remirror/playground/**', 'support/e2e/**'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
    {
      files: [
        '**/*extension.ts',
        '**/*extension.tsx',
        'packages/@remirror/core/src/manager/remirror-manager.ts',
        'packages/@remirror/core/src/framework/*.ts',
        'packages/@remirror/core/src/extension/extension-base.ts',
      ],
      rules: { '@typescript-eslint/method-signature-style': 'off' },
    },
    {
      files: ['packages/@remirror/styles/src/*.tsx'],
      // Turn these rules off to import `react` for TypeScript
      rules: {
        '@typescript-eslint/no-unused-vars-experimental': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};

// Only apply TypeScript specific rules when in TS Mode. This is a hack for now
// due to the issue raised
// https://github.com/typescript-eslint/typescript-eslint/issues/2373
if (process.env.FULL_ESLINT_CHECK) {
  const rules = {
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': [
      'warn',
      { ignoreConditionalTests: true, ignoreMixedLogicalExpressions: true },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'warn',
      { allowNumber: true, allowBoolean: true },
    ],
  };

  config = {
    ...config,
    plugins: [...config.plugins, 'import', 'sonarjs'],
    extends: [
      ...config.extends,
      'plugin:import/typescript',
      // TODO Turn this rule on once failures are fixed eventually.
      // 'plugin:sonarjs/recommended'
    ],
    rules: {
      ...config.rules,
      'import/no-deprecated': 'warn',
      'import/max-dependencies': ['warn', { max: 30 }],
      'import/no-default-export': 'warn',
      'import/no-mutable-exports': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/newline-after-import': 'error',

      // Turn off conflicting import rules
      'import/order': 'off',
      '@typescript-eslint/no-unused-vars-experimental': [
        'error',
        { ignoreArgsIfArgsAfterAreUsed: true },
      ],
    },
    overrides: [
      {
        parserOptions: { project: [require.resolve('../tsconfig.lint.json')] },
        files: ['**/!(*.{md,mdx})/*.ts', '**/!(*.{md,mdx})/*.tsx'],
        rules,
      },
      {
        files: [
          '**/__tests__/**',
          '**/__stories__/**',
          'support/**',
          '**/__dts__/**',
          '**/*.test.ts',
        ],
        // Switch off rules for test files.
        rules: Object.keys(rules).reduce(
          (accumulator, key) => ({ ...accumulator, [key]: 'off' }),
          {},
        ),
      },
      ...config.overrides,
    ],
  };
} else {
  config.plugins = [...config.plugins, 'markdown'];
  config = {
    ...config,
    // Apply the markdown plugin
    plugins: [...config.plugins, 'markdown'],

    // Only apply markdown rules when not in TypeScript mode, since they are
    // currently incompatible.
    overrides: [
      ...config.overrides,

      { files: ['*.mdx', '*.md'], processor: 'markdown/markdown' },
      {
        // Lint code blocks in markdown
        files: ['**/*.{md,mdx}/*.{ts,tsx,js}'],

        // Set up rules to be excluded in the markdown blocks.
        rules: {
          'simple-import-sort/sort': 'warn',
          'unicorn/filename-case': 'off',
          '@typescript-eslint/no-unused-vars-experimental': 'off',
          '@typescript-eslint/no-unused-vars': 'off',
        },
      },
    ],
  };
}

module.exports = config;
