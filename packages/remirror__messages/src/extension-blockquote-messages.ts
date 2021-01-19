import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-blockquote.label',
  comment: 'Label for blockquote formatting command.',
  message: 'Blockquote',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-blockquote.description',
  comment: 'Description for blockquote formatting command.',
  message: 'Add blockquote formatting to the selected text',
});
