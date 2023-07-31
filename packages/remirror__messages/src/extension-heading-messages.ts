import type { RemirrorMessage } from '@remirror/core-types';

export const LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.toggle-heading.label',
  comment: 'Label for heading command with support for levels.',
  message: `{level, select, 1 {Heading 1}
                            2 {Heading 2}
                            3 {Heading 3}
                            4 {Heading 4}
                            5 {Heading 5}
                            6 {Heading 6}
                            other {Heading}}`,
};
