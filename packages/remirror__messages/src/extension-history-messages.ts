import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const UNDO_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.undo.label',
  comment: 'Label for undo.',
  message: 'Undo',
});

export const UNDO_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.undo.description',
  comment: 'Description for undo.',
  message: 'Undo the most recent action',
});

export const REDO_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.redo.label',
  comment: 'Label for redo.',
  message: 'Redo',
});

export const REDO_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.redo.description',
  comment: 'Description for redo.',
  message: 'Redo the most recent action',
});
