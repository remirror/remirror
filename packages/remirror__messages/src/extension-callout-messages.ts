import type { RemirrorMessage } from '@remirror/core-types';

export const LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.toggle-callout.label',
  comment: 'Label for callout command with support for callout types.',
  message: `{type, select, info {Information Callout}
                            warning {Warning Callout}
                            error {Error Callout}
                            success {Success Callout}
                            other {Callout}}`,
};

export const DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.toggle-callout.description',
  comment: 'Description of the callout command with support for callout types.',
  message: `{type, select, info {Create an information callout block}
                            warning {Create a warning callout block}
                            error {Create an error callout block}
                            success {Create a success callout block}
                            other {Create a callout block}}`,
};
