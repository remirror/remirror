const { EXCLUDE_TS } = process.env;

const tsProjectOptions = EXCLUDE_TS ? {} : { project: ['./tsconfig.lint.json'] };
const tsProjectRules = EXCLUDE_TS
  ? {}
  : {
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unnecessary-condition': ['warn', { ignoreRhs: true }],
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    };

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended', // Disables incompatible eslint:recommended settings
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    // 'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  plugins: [
    'jest',
    '@typescript-eslint',
    'react-hooks',
    'react',
    'prettier',
    'unicorn',
    'import',
    'jsx-a11y',
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
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'default-case': 'warn',

    '@typescript-eslint/array-type': [
      'error',
      { default: 'array-simple', readonly: 'array-simple' },
    ],

    'prefer-template': 'warn',
    'guard-for-in': 'warn',

    '@typescript-eslint/camelcase': [
      'warn',
      { ignoreDestructuring: true, properties: 'never' },
    ],
    '@typescript-eslint/no-empty-function': 'off', // Empty functions/methods are often desired
    '@typescript-eslint/no-empty-interface': 'off', // Empty interfaces are useful for future planning
    '@typescript-eslint/no-var-requires': 'off', // We use 'require(..)' throughout

    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/no-duplicate-hooks': 'warn',
    'jest/no-if': 'warn',
    'jest/no-test-prefixes': 'warn',
    'jest/prefer-spy-on': 'warn',
    'jest/no-test-callback': 'warn',
    'jest/no-large-snapshots': ['warn', { maxSize: 12 }],

    'react/prop-types': 'off', // Because we're using TypeScript

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    'import/no-deprecated': 'warn',
    'import/first': 'warn',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/newline-after-import': 'warn',

    // ESLint rules (those without a '/' in) come after here

    'no-nested-ternary': 'off', // Prettier makes nested ternaries more acceptable
    'no-return-assign': ['error', 'except-parens'],
    'no-unused-expressions': ['error', { allowTernary: true }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],

    // Temporarily disabled rules (please re-enable these!):
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-namespace': 'off', // Migrate all the global namespaces to be in .d.ts files (see overrides)
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
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

    'no-invalid-regexp': 'warn',
    'no-multi-str': 'warn',
    'no-constant-condition': 'warn',
    'no-extra-boolean-cast': 'warn',
    'no-empty': 'warn', // Later, put a `/* noop */` comment in empty blocks to explain why
    'no-useless-escape': 'warn',
    radix: 'warn',
    'prefer-object-spread': 'warn',
    curly: ['warn', 'all'],
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off', // Often you need to use @ts-ignore in tests
        '@typescript-eslint/no-non-null-assertion': 'off', // Makes writing tests more convenient
        '@typescript-eslint/no-use-before-define': 'off',
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
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        ...tsProjectRules,
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
        '@typescript-eslint/camelcase': [
          'warn',
          { ignoreDestructuring: true, properties: 'never' },
        ],
      },
    },
  ],
};
