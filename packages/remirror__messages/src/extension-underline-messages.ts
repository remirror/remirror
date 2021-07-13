import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-underline.label',
  comment: 'Label for underline formatting command.',
  message: 'Underline',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-underline.description',
  comment: 'Description for underline formatting command.',
  message: 'Underline the selected text',
});
