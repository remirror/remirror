import type { RemirrorMessage } from '@remirror/core-types';

export const LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.set-text-direction.label',
  comment: 'Label for setting the text direction.',
  message: `{dir, select, ltr {Left-To-Right}
                          rtl {Right-To-Left}
                          other {Reset Direction}}`,
};

export const DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.set-text-direction.description',
  comment: 'Description for setting the text direction.',
  message: `{dir, select, ltr {Set the text direction from left to right}
                          rtl {Set the text direction from right to left}
                          other {Reset text direction}}`,
};
