import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-strike.label',
  comment: 'Label for strike formatting command.',
  message: 'Strikethrough',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-strike.description',
  comment: 'Description for strike formatting command.',
  message: 'Strikethrough the selected text',
});
