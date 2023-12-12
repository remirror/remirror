import type { RemirrorMessage } from '@remirror/core-types';

export const UNDO_LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.undo.label',
  comment: 'Label for undo.',
  message: 'Undo',
};

export const UNDO_DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.undo.description',
  comment: 'Description for undo.',
  message: 'Undo the most recent action',
};

export const REDO_LABEL: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.redo.label',
  comment: 'Label for redo.',
  message: 'Redo',
};

export const REDO_DESCRIPTION: RemirrorMessage = /*i18n*/ {
  id: 'extension.command.redo.description',
  comment: 'Description for redo.',
  message: 'Redo the most recent action',
};
