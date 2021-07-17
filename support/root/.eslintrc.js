/** @type {import('eslint').Linter.Config} */
let config = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['*.d.ts'],
  plugins: [
    'jest',
    'jest-formatting',
    '@typescript-eslint',
    'react-hooks',
    'react',
    'react-native',
    'unicorn',
    'jsx-a11y',
    'simple-import-sort',

    // For `remirror__lit-components`
    'lit',
    'lit-a11y',

    // For custom hooks
    '@kyleshevlin',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:jest-formatting/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:lit/recommended',
    'plugin:lit-a11y/recommended',
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
    'prefer-const': ['error', { destructuring: 'all' }],

    'unicorn/better-regex': 'error',
    'unicorn/catch-error-name': 'error',
    'unicorn/consistent-destructuring': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/expiring-todo-comments': 'error',
    'unicorn/explicit-length-check': 'error',
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/import-style': 'error',
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/no-array-reduce': 'error',
    'unicorn/no-console-spaces': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-hex-escape': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/no-new-array': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-process-exit': 'error',
    'unicorn/no-unreadable-array-destructuring': 'error',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/no-zero-fractions': 'error',
    'unicorn/number-literal-case': 'error',
    'unicorn/numeric-separators-style': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-flat-map': 'error',
    'unicorn/prefer-array-index-of': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-default-parameters': 'error',
    'unicorn/prefer-dom-node-append': 'error',
    'unicorn/prefer-dom-node-dataset': 'error',
    'unicorn/prefer-dom-node-remove': 'error',
    'unicorn/prefer-dom-node-text-content': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-keyboard-event-key': 'error',
    'unicorn/prefer-math-trunc': 'error',
    'unicorn/prefer-modern-dom-apis': 'error',
    'unicorn/prefer-negative-index': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-query-selector': 'error',
    'unicorn/prefer-reflect-apply': 'error',
    'unicorn/prefer-regexp-test': 'error',
    'unicorn/prefer-set-has': 'error',
    'unicorn/prefer-spread': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/prefer-ternary': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
    'unicorn/no-array-push-push': 'error',

    'unicorn/no-keyword-prefix': 'off',
    'no-nested-ternary': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-unsafe-regex': 'off',
    'unicorn/no-unused-properties': 'off',
    'unicorn/string-content': 'off',
    'unicorn/custom-error-definition': 'off',
    'unicorn/empty-brace-spaces': 'off',

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

    // Use nice import and export rules
    'simple-import-sort/exports': ['warn'], // TODO switch on after release
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // Packages that are not scoped to `remirror`
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^(?!@remirror)@?\\w', '^@remirror'],

          // Scoped packages
          // [],

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

    /**
     * @todo Set `explicit-module-boundary-types` lint rule to `error` once all
     * issues are resolved
     * @block All exported methods that are exposed to end users should be
     * explicitly typed. It makes for better readability when contributing since
     * inference requires more work to determine the return types, and also it
     * forces deliberate planning.
     */
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      {
        allowedNames: ['name', 'createHelpers', 'createCommands', 'createExtensions', 'createTags'],
      },
    ],

    // Turning off as it leads to code with bad patterns, where implementation
    // details are placed before the actual meaningful code.
    '@typescript-eslint/no-use-before-define': 'off',
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
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'error',
    'react/no-unused-state': 'error',
    'react/no-children-prop': 'error',
    'react/self-closing-comp': 'error',

    // React Hooks

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    // See https://kyleshevlin.com/use-encapsulation
    '@kyleshevlin/prefer-custom-hooks': 'warn',

    // Built in eslint rules
    'no-constant-condition': 'off', // To many false positives
    'no-empty': 'warn',
    'no-else-return': 'warn',
    'no-useless-escape': 'warn',
    'default-case': 'off',
    'default-case-last': 'error',
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

    // Rules exclusive to published packages.
    {
      files: ['packages/*/src/**'],
      rules: {
        'no-console': 'error',
      },
    },
    {
      files: [
        '*.spec.{ts,tsx}*',
        '**/__stories__/**',
        '*.stories.{ts,tsx}',
        'support/**',
        'website/**',
        '**/__dts__/**',
        '**/*.test.ts',
      ],
      rules: {
        'unicorn/consistent-destructuring': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off', // Often you need to use @ts-ignore in tests
        '@typescript-eslint/no-non-null-assertion': 'off', // Makes writing tests more convenient
        '@typescript-eslint/no-use-before-define': 'off',
        'react/display-name': 'off',
        '@kyleshevlin/prefer-custom-hooks': 'off',
      },
    },
    {
      files: [
        '**/*.d.ts',
        '**/__mocks__/**',
        'packages/remirror__i18n/**/*.ts',
        'docs/**',
        'examples/**',
        'support/**',
        'website/**',
        '**/__stories__/**',
        '**/__fixtures__/**',
        '**/*.stories.tsx',
        '**/*.stories.ts',
        'examples/**',
        'packages/remirror__cli/**',
        'packages/remirror__playground/**',
        'packages/remirror__extension-emoji/src/data/*.ts',
        'packages/remirror__svelte/rollup.config.js',
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
      files: [
        'support/**',
        'packages/testing/**/*.{js,ts}',
        'packages/remirror__playground/**',
        'packages/remirror__playground-deprecated/**',
      ],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'unicorn/no-process-exit': 'off',
        'unicorn/no-unreadable-array-destructuring': 'off',
      },
    },
    {
      files: ['packages/remirror__i18n/**/messages.ts'],
      rules: {
        'eslint-comments/disable-enable-pair': 'off',
        'eslint-comments/no-unlimited-disable': 'off',
        'unicorn/no-abusive-eslint-disable': 'off',
        'eslint-comments/no-unused-disable': 'off',
      },
    },
    {
      files: [
        '**/__tests__/**',
        '**/__stories__/**',
        '**/__fixtures__/**',
        '**/*matchers.ts',
        'website/**',
        'support/**',
        'packages/testing/**',
        'examples/**',
        'packages/remirror__playground/**',
        'packages/remirror__core-utils/src/keyboard-utils.ts',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['packages/remirror__playground/**', 'packages/testing/**'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
    {
      files: [
        '**/*extension.ts',
        '**/*extension.tsx',
        'packages/remirror__core/src/manager/remirror-manager.ts',
        'packages/remirror__core/src/framework/*.ts',
        'packages/remirror__core/src/extension/extension-base.ts',
      ],
      rules: { '@typescript-eslint/method-signature-style': 'off' },
    },
    {
      files: ['packages/remirror__styles/src/*.tsx'],
      // Turn these rules off to import `react` for TypeScript
      rules: {
        '@typescript-eslint/no-unused-vars-experimental': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: [
        'examples/with-react-native/**/*.{ts,tsx}',
        'packages/remirror__react-native/**/*.{ts,tsx}',
      ],
      rules: {
        'react-native/no-unused-styles': ['error'],
        'react-native/split-platform-components': ['error'],
        'react-native/no-inline-styles': ['error'],
        'react-native/no-color-literals': ['error'],
        // 'react-native/no-raw-text': ['error'],
        'react-native/no-single-element-style-arrays': ['error'],
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
  };

  const rulesOff = {};

  for (const rule of Object.keys(rules)) {
    rulesOff[rule] = 'off';
  }

  config = {
    ...config,
    plugins: [...config.plugins, 'import'],
    extends: [...config.extends, 'plugin:import/typescript'],
    rules: {
      ...config.rules,
      'import/no-default-export': 'warn',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      // 'import/no-cycle': 'error', // Conflicts with `react-native`.
      'import/no-self-import': 'error',
      'import/newline-after-import': 'error',

      // Turn off conflicting import rules
      // 'import/order': 'off',
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
          '**/__fixtures__/**',
          'support/**',
          'website/**',
          '**/__dts__/**',
          '**/*.test.ts',
        ],
        // Switch off rules for test files.
        rules: rulesOff,
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
          '@kyleshevlin/prefer-custom-hooks': 'off',
          'simple-import-sort/exports': 'warn',
          'simple-import-sort/imports': 'warn',
          'unicorn/filename-case': 'off',
          '@typescript-eslint/no-unused-vars-experimental': 'off',
          '@typescript-eslint/no-unused-vars': 'off',
        },
      },
    ],
  };
}

module.exports = config;
