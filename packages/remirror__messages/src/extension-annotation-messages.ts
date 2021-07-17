import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const ADD_ANNOTATION: MessageDescriptor = defineMessage({
  id: 'extension.command.add-annotation.label',
  comment: 'Label for adding an annotation.',
  message: 'Add annotation',
});

export const UPDATE_ANNOTATION: MessageDescriptor = defineMessage({
  id: 'extension.command.update-annotation.label',
  comment: 'Label for updating an annotation.',
  message: 'Update annotation',
});

export const REMOVE_ANNOTATION: MessageDescriptor = defineMessage({
  id: 'extension.command.remove-annotation.label',
  comment: 'Label for removing an annotation.',
  message: 'Remove annotation',
});
