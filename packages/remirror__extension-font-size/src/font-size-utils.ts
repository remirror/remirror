import { ExtensionFontSizeMessages as Messages } from '@remirror/messages';

export const setFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'fontSize',
  description: ({ t }) => t(Messages.SET_DESCRIPTION),
  label: ({ t }) => t(Messages.SET_LABEL),
};

export const increaseFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'addLine',
  description: ({ t }) => t(Messages.INCREASE_DESCRIPTION),
  label: ({ t }) => t(Messages.INCREASE_LABEL),
};

export const decreaseFontSizeOptions: Remirror.CommandDecoratorOptions = {
  icon: 'subtractLine',
  description: ({ t }) => t(Messages.DECREASE_DESCRIPTION),
  label: ({ t }) => t(Messages.DECREASE_LABEL),
};

export const FONT_SIZE_ATTRIBUTE = 'data-font-size-mark';
