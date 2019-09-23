const { TS_PROJECTS } = process.env;

const extraOptions = TS_PROJECTS
  ? {
      project: ['./tsconfig.lint.json'],
    }
  : {};

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended', // Disables incompatible eslint:recommended settings
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  plugins: ['jest', '@typescript-eslint', 'react-hooks', 'react', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    ...extraOptions,
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
    '@typescript-eslint/camelcase': 'off', // Gatsby and other projects use snake_case
    '@typescript-eslint/no-empty-function': 'off', // Empty functions/methods are often desired
    '@typescript-eslint/no-empty-interface': 'off', // Empty interfaces are useful for future planning
    '@typescript-eslint/no-var-requires': 'off', // We use 'require(..)' throughout

    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',

    'react/prop-types': 'off', // Because we're using TypeScript

    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',

    // ESLint rules (those without a '/' in) come after here

    'no-nested-ternary': 'off', // Prettier makes nested ternaries more acceptable
    'no-return-assign': ['error', 'except-parens'],
    'no-unused-expressions': [
      'error',
      {
        allowTernary: true,
      },
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: true,
      },
    ],

    ////////////////////////////////////////////////////////////////////////////

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
    'react/no-children-prop': 'warn',
    'react/no-multi-comp': 'off', // Might want to enable this later
    'no-extra-boolean-cast': 'warn',
    'no-empty': 'warn', // Later, put a `/* noop */` comment in empty blocks to explain why
    'no-useless-escape': 'warn',
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
  ],
};
