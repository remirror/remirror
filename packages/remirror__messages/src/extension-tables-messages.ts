import type { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';

export const CREATE_COMMAND_LABEL: MessageDescriptor = defineMessage({
  id: 'extension.command.create-table.label',
  comment: 'Label for creating a table',
  message: 'Create table',
});

export const CREATE_COMMAND_DESCRIPTION: MessageDescriptor = defineMessage({
  id: 'extension.command.create-table.description',
  comment: 'Description for creating a table',
  message: 'Create a table with set number of rows and columns.',
});

/**
 * Takes a `{ count: number }` value to denote the number of columns.
 */
export const COLUMN_COUNT: MessageDescriptor = defineMessage({
  id: 'extension.table.column_count',
  comment: 'The number of columns',
  message: '{count, plural, one {# column} other {# columns}}',
});

/**
 * Takes a `{ count: number }` value to denote the number of rows.
 */
export const ROW_COUNT: MessageDescriptor = defineMessage({
  id: 'extension.table.row_count',
  comment: 'The number of rows',
  message: '{count, plural, one {# row} other {# rows}}',
});
