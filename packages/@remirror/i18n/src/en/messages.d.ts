import type { CompiledMessage } from '@lingui/core/cjs/i18n';

export type EnMessages = Record<
  | 'components.image.dialog.description.label'
  | 'components.image.dialog.description.placeholder'
  | 'components.image.dialog.label'
  | 'components.image.dialog.source.label'
  | 'components.image.menu.icon.label'
  | 'components.italic.menu.icon.label'
  | 'components.underline.menu.icon.label'
  | 'extension.command.toggle-blockquote.description'
  | 'extension.command.toggle-blockquote.label'
  | 'extension.command.toggle-bold.description'
  | 'extension.command.toggle-bold.label'
  | 'extension.command.toggle-code.description'
  | 'extension.command.toggle-code.label'
  | 'extension.command.toggle-heading.description'
  | 'extension.command.toggle-heading.label'
  | 'react-components.top-menu.label',
  CompiledMessage
>;

/**
 * The messages available for the `en` locale.
 */
export const messages: EnMessages;
