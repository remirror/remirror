import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-italic.label',
  comment: 'Label for italic formatting command.',
  message: 'Italic',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-italic.description',
  comment: 'Description for italic formatting command.',
  message: 'Italicize the selected text',
});
