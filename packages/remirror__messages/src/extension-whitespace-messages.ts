import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-whitespace.label',
  comment: 'Label for displaying whitespace characters.',
  message: 'Toggle Whitespace',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-whitespace.description',
  comment: 'Description for displaying whitespace characters.',
  message: 'Show hidden whitespace characters in your editor.',
});
