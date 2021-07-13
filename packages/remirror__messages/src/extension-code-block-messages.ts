import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-code-block.label',
  comment: 'Label for the code block command.',
  message: 'Codeblock',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-code-block.description',
  comment: 'Description for the code block command.',
  message: 'Add a code block',
});
