import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-code.label',
  comment: 'Label for the inline code formatting.',
  message: 'Code',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-code.description',
  comment: 'Description for the inline code formatting command.',
  message: 'Add inline code formatting to the selected text',
});
