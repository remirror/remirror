import { CoreIcon, NamedShortcut } from '@remirror/core';
import { ExtensionHeadingMessages } from '@remirror/messages';

const { LABEL } = ExtensionHeadingMessages;

/**
 * Command options for the heading.
 */
export const toggleHeadingOptions: Remirror.CommandDecoratorOptions = {
  icon: ({ attrs }) => `h${attrs?.level ?? '1'}` as CoreIcon,
  label: ({ t, attrs }) => t(LABEL, { level: attrs?.level }),
};

/**
 * The named shortcuts for the default 6 levels of commands.
 */
export const shortcuts = [
  NamedShortcut.H1,
  NamedShortcut.H2,
  NamedShortcut.H3,
  NamedShortcut.H4,
  NamedShortcut.H5,
  NamedShortcut.H6,
];
