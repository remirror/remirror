// https://github.com/conventional-changelog/commitlint/blob/v13.1.0/docs/reference-rules.md
module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',

        // Custom
        'wip',
      ],
    ],
    'header-max-length': [2, 'always', 200],
  },
};
