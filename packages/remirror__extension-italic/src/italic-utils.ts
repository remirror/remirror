import { ExtensionItalicMessages as Messages } from '@remirror/messages';

export const toggleItalicOptions: Remirror.CommandDecoratorOptions = {
  icon: 'italic',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
