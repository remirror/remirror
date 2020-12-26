import { Static } from '@remirror/core';
import { ExtensionBoldMessages as Messages } from '@remirror/messages';

export const toggleBoldOptions: Remirror.CommandDecoratorOptions = {
  icon: 'bold',
  label: ({ t }) => t(Messages.LABEL),
  description: ({ t }) => t(Messages.DESCRIPTION),
};

type FontWeightProperty =
  | '-moz-initial'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset'
  | 'bold'
  | 'normal'
  | 'bolder'
  | 'lighter'
  | number;

export interface BoldOptions {
  /**
   * Optionally set the font weight property for this extension.
   */
  weight?: Static<FontWeightProperty>;
}
