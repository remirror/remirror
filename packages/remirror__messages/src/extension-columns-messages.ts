import type * as _ from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const LABEL = defineMessage({
  id: 'extension.command.toggle-columns.label',
  comment: 'Label for columns command with support for number of columns counts.',
  message: `{count, select, 2 {Two Column Block}
                            3 {Three Column Block}
                            4 {Four Column Block}
                            other {Multi Column Block}}`,
});

export const DESCRIPTION = defineMessage({
  id: 'extension.command.toggle-columns.description',
  comment: 'Description of the columns command with support for number of columns counts.',
  message: `{count, select, 2 {Split the block into two columns}
                            3 {Split the current block into three columns}
                            4 {Split the current block into four columns}
                            other {Split the current block into multiple columns}}`,
});
