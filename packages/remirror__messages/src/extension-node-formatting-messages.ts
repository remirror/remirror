import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const INCREASE_INDENT_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.increase-indent.label',
  comment: 'Label for increasing the indentation level.',
  message: 'Increase indentation',
});

export const DECREASE_INDENT_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.decrease-indent.label',
  comment: 'Label for decreasing the indentation level of the current node block.',
  message: 'Decrease indentation',
});

export const CENTER_ALIGN_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.center-align.label',
  comment: 'Center align the text in the current node.',
  message: 'Center align',
});

export const JUSTIFY_ALIGN_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.justify-align.label',
  comment: 'Justify the alignment of the selected nodes.',
  message: 'Justify',
});

export const RIGHT_ALIGN_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.right-align.label',
  comment: 'Right align the selected nodes.',
  message: 'Right align',
});

export const LEFT_ALIGN_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.left-align.label',
  comment: 'Left align the selected nodes.',
  message: 'Left align',
});
