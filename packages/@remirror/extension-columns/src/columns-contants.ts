import { ExtensionColumnsMessages } from '@remirror/messages';

import { BaseColumnAttributes } from './columns-extension';

export const toggleColumnsOptions: Remirror.CommandDecoratorOptions = {
  icon: ({ attrs }) => ({ name: 'layoutColumnLine', sup: attrs?.count as string }),
  label: ({ t, attrs }) => t(ExtensionColumnsMessages.LABEL, { count: attrs?.count }),
  description: ({ t, attrs }) => t(ExtensionColumnsMessages.DESCRIPTION, { count: attrs?.count }),
};

export const DEFAULT_COLUMN_ATTRIBUTES: Required<BaseColumnAttributes> = {
  count: 2,
  fill: 'auto',
  gap: 'inherit',
  ruleColor: 'inherit',
  ruleStyle: 'none',
  ruleWidth: 'inherit',
  width: 'inherit',
};
