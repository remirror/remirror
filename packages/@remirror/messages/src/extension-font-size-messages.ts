import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const SET_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.set-font-size.label',
  comment: 'Label for adding a font size.',
  message: 'Font size',
});

export const SET_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.set-font-size.description',
  comment: 'Description for adding a font size.',
  message: 'Set the font size for the selected text.',
});

export const INCREASE_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.increase-font-size.label',
  comment: 'Label for increasing the font size.',
  message: 'Increase',
});

export const INCREASE_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.increase-font-size.description',
  comment: 'Description for increasing the font size.',
  message: 'Increase the font size',
});

export const DECREASE_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.decrease-font-size.label',
  comment: 'Label for decreasing the font size.',
  message: 'Decrease',
});

export const DECREASE_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.decrease-font-size.description',
  comment: 'Description for decreasing the font size.',
  message: 'Decrease the font size.',
});
