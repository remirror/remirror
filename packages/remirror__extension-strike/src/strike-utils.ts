import { ExtensionStrikeMessages as Messages } from '@remirror/messages';

export const toggleStrikeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'strikethrough',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
