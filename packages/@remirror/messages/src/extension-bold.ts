import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-bold.label',
  comment: 'Label for bold formatting command.',
  message: 'Bold',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-bold.description',
  comment: 'Description for bold formatting command.',
  message: 'Add bold formatting to the selected text',
});
