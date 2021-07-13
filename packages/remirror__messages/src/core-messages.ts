import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const COPY_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.copy.label',
  comment: 'Label for copy command.',
  message: 'Copy',
});

export const COPY_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.copy.description',
  comment: 'Description for copy command.',
  message: 'Copy the selected text',
});

export const CUT_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.cut.label',
  comment: 'Label for cut command.',
  message: 'Cut',
});

export const CUT_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.cut.description',
  comment: 'Description for cut command.',
  message: 'Cut the selected text',
});

export const PASTE_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.paste.label',
  comment: 'Label for paste command.',
  message: 'Paste',
});

export const PASTE_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.paste.description',
  comment: 'Description for paste command.',
  message: 'Paste content into the editor',
});

export const SELECT_ALL_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.select-all.label',
  comment: 'Label for select all command.',
  message: 'Select all',
});

export const SELECT_ALL_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.select-all.description',
  comment: 'Description for select all command.',
  message: 'Select all content within the editor',
});
