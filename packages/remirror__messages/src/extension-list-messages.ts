import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const ORDERED_LIST_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-ordered-list.label',
  comment: 'Label for inserting an ordered list into the editor.',
  message: 'Ordered list',
});

export const BULLET_LIST_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-bullet-list.description',
  comment: 'Description for inserting a bullet list into the editor.',
  message: 'Bulleted list',
});
