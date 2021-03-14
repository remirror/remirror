import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const TOGGLE_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.toggle-upper-case.label',
  comment: 'Label for toggling between upper and lower case.',
  message: `{case, select, upper {Uppercase}
                          lower {Lowercase}
                          capitalize {Sentence case}
                          smallCaps {Small caps}
                          other {Text case}}`,
});

export const SET_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.set-casing.label',
  comment: 'Label for setting the case.',
  message: 'Set text case',
});
