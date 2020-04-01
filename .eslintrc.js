const { existsSync } = require('fs');

const tsProjectOptions = { project: ['./tsconfig.lint.json'] };

const tsProjectRules = {
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-readonly': 'warn',
  '@typescript-eslint/await-thenable': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
  '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
  '@typescript-eslint/restrict-plus-operands': 'warn',
  '@typescript-eslint/no-misused-promises': 'warn',
  '@typescript-eslint/prefer-includes': 'warn',
  '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
};

const schemaJsonFilePath = `${__dirname}/docs/.cache/caches/gatsby-plugin-typegen/schema.json`;
const graphqlRules = existsSync(schemaJsonFilePath)
  ? {
      'graphql/template-strings': [
        'error',
        {
          env: 'apollo',
          schemaJsonFilepath: schemaJsonFilePath,
          tagName: 'gql',
        },
      ],
    }
  : {};

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    'jest',
    'jest-formatting',
    '@typescript-eslint',
    'react-hooks',
    'react',
    'unicorn',
    'import',
    'jsx-a11y',
    'graphql',
    'simple-import-sort',
    'eslint-comments',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended', // Disables incompatible eslint:recommended settings
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
    'plugin:jest-formatting/strict',
    'plugin:unicorn/recommended',
    'plugin:eslint-comments/recommended',
  ],

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    ...tsProjectOptions,
  },
  settings: {
    react: {
      version: 'detect',
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
    ...graphqlRules,
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'prefer-exponentiation-operator': 'error',

    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/prevent-abbreviations': [
      'error',
      {
        replacements: {
          doc: false,
          prop: false,
          props: false,
          params: false,
        },
      },
    ],
    'default-case': 'warn',

    'prefer-template': 'warn',
    'guard-for-in': 'warn',

    '@typescript-eslint/array-type': [
      'error',
      { default: 'array-simple', readonly: 'array-simple' },
    ],
    '@typescript-eslint/camelcase': ['warn', { ignoreDestructuring: true, properties: 'never' }],
    '@typescript-eslint/no-empty-function': 'off', // Empty functions/methods are often desired
    '@typescript-eslint/no-empty-interface': 'off', // Empty interfaces are useful for future planning
    '@typescript-eslint/no-var-requires': 'off', // We use 'require(..)' throughout

    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/no-duplicate-hooks': 'error',
    'jest/no-if': 'error',
    'jest/no-test-prefixes': 'error',
    'jest/prefer-spy-on': 'warn',
    'jest/no-test-callback': 'error',
    'jest/no-large-snapshots': ['warn', { maxSize: 12 }],

    'react/prop-types': 'off', // Because we're using TypeScript

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    'import/no-deprecated': 'warn',
    // 'import/exports-last': 'error',
    'import/max-dependencies': ['error', { max: 10 }],
    'import/no-default-export': 'error',
    'import/no-mutable-exports': 'error',
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': 'error',

    // Turn off conflicting import rules
    'import/order': 'off',
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
          ['^(?!@?remirror)@?\\w'],

          // Scoped packages
          ['^@?remirror'],

          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything that does not start with a dot.
          ['^[^.]'],

          // Relative imports.
          // Anything that starts with a dot.
          ['^\\.'],
        ],
      },
    ],

    // ESLint rules (those without a '/' in) come after here

    'no-return-assign': ['error', 'except-parens'],
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowTernary: true, allowShortCircuit: true },
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],

    // Temporarily disabled rules (please re-enable these!):
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-use-before-define': ['warn', { typedefs: false }],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/ban-types': 'warn',

    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/no-unused-state': 'warn',
    'react/no-children-prop': 'warn',
    'react/no-multi-comp': 'off', // Might want to enable this later

    'no-invalid-regexp': 'error',
    'no-multi-str': 'error',
    'no-constant-condition': 'error',
    'no-extra-boolean-cast': 'error',
    'no-empty': 'warn', // Later, put a `/* noop */` comment in empty blocks to explain why
    'no-useless-escape': 'warn',
    radix: 'warn',
    'prefer-object-spread': 'warn',
    curly: ['warn', 'all'],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        ...tsProjectRules,
        '@typescript-eslint/no-extra-non-null-assertion': ['error'],
        '@typescript-eslint/prefer-optional-chain': ['error'],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/explicit-member-accessibility': [
          'warn',
          {
            accessibility: 'explicit',
            overrides: {
              accessors: 'off',
              constructors: 'no-public',
              methods: 'explicit',
              properties: 'explicit',
              parameterProperties: 'explicit',
            },
          },
        ],
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/restrict-template-expressions': [
          'warn',
          { allowNumber: true, allowBoolean: true },
        ],
        '@typescript-eslint/no-dynamic-delete': ['error'],
        '@typescript-eslint/camelcase': [
          'warn',
          { ignoreDestructuring: true, properties: 'never' },
        ],
      },
    },
    {
      files: ['**/__tests__/**'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off', // Often you need to use @ts-ignore in tests
        '@typescript-eslint/no-non-null-assertion': 'off', // Makes writing tests more convenient
        '@typescript-eslint/no-use-before-define': 'off',
        'react/display-name': 'off',
        ...Object.keys(tsProjectRules).reduce(
          (accumulator, key) => ({ ...accumulator, [key]: 'off' }),
          {},
        ),
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/no-duplicates': 'off',
        '@typescript-eslint/no-namespace': 'off',
      },
    },
    {
      files: ['**/*.dts.ts'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  ],
};
