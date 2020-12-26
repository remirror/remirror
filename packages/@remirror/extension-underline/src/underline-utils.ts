import { ExtensionUnderlineMessages as Messages } from '@remirror/messages';

export const toggleUnderlineOptions: Remirror.CommandDecoratorOptions = {
  icon: 'underline',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};
