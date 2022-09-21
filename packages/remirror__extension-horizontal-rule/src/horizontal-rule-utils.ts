import { ExtensionHorizontalRuleMessages as Messages } from '@remirror/messages';

export const insertHorizontalRuleOptions: Remirror.CommandDecoratorOptions = {
  icon: 'separator',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
