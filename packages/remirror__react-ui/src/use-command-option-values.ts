import { useMemo } from 'react';
import type { CommandDecoratorMessageProps, CommandUiIcon } from '@remirror/core';
import type { CoreIcon } from '@remirror/icons';
import { useHelpers, useI18n } from '@remirror/react-core';

import {
  getCommandOptionValue,
  getShortcutString,
  getUiShortcutString,
} from './react-component-utils';

export interface UseCommandOptionValuesParams extends Omit<CommandDecoratorMessageProps, 't'> {
  commandName: string;
}

export interface UseCommandOptionValuesResult {
  description?: string;
  label?: string;
  icon?: CoreIcon | CommandUiIcon;
  shortcut?: string;
}

export const useCommandOptionValues = ({
  commandName,
  active,
  enabled,
  attrs,
}: UseCommandOptionValuesParams): UseCommandOptionValuesResult => {
  const t = useI18n();
  const { getCommandOptions } = useHelpers();
  const options = getCommandOptions(commandName);

  const { description, label, icon, shortcut } = options || {};
  const commandProps: CommandDecoratorMessageProps = useMemo(
    () => ({ active, attrs, enabled, t }),
    [active, attrs, enabled, t],
  );

  const shortcutString: string | undefined = useMemo(() => {
    if (!shortcut) {
      return;
    }

    return getShortcutString(getUiShortcutString(shortcut, attrs ?? {}), { t, separator: '' });
  }, [shortcut, attrs, t]);

  return useMemo(
    () => ({
      description: getCommandOptionValue(description, commandProps),
      label: getCommandOptionValue(label, commandProps),
      icon: getCommandOptionValue(icon, commandProps),
      shortcut: shortcutString,
    }),
    [commandProps, description, label, icon, shortcutString],
  );
};
