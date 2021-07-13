import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.set-text-highlight.label',
  comment: 'Label for adding a text highlight.',
  message: 'Text highlight',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.set-text-highlight.description',
  comment: 'Description for adding a text highlight.',
  message: 'Set the text highlight color for the selected text.',
});
