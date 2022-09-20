import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.insert-horizontal-rule.label',
  comment: 'Label for inserting a horizontal rule (divider) command.',
  message: 'Divider',
});

export const DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.insert-horizontal-rule.description',
  comment: 'Description for inserting a horizontal rule (divider) command.',
  message: 'Separate content with a diving horizontal line',
});
