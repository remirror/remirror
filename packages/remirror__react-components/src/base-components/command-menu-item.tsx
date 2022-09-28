import { ListItemIcon, ListItemText, MenuItem, MenuItemProps, Typography } from '@mui/material';
import React, { FC, MouseEventHandler, ReactNode, useCallback } from 'react';
import { CoreIcon, isString } from '@remirror/core';

import { Icon } from '../icons';
import { useCommandOptionValues, UseCommandOptionValuesParams } from '../use-command-option-values';
import { CommandMenuItemText } from './command-menu-item-text';

interface ButtonIconProps {
  icon: CoreIcon | JSX.Element | null;
}

const MenuItemIcon: FC<ButtonIconProps> = ({ icon }) => {
  if (icon) {
    return (
      <ListItemIcon>{isString(icon) ? <Icon name={icon} size='1rem' /> : <>{icon}</>}</ListItemIcon>
    );
  }

  return null;
};

export interface CommandMenuItemProps
  extends MenuItemProps,
    Omit<UseCommandOptionValuesParams, 'active' | 'attrs'> {
  active?: UseCommandOptionValuesParams['active'];
  commandId?: string;
  commandName: string;
  displayShortcut?: boolean;
  onSelect: () => void;
  icon?: CoreIcon | JSX.Element | null;
  attrs?: UseCommandOptionValuesParams['attrs'];
  label?: NonNullable<ReactNode>;
  description?: NonNullable<ReactNode>;
  displayDescription?: boolean;
}

export const CommandMenuItem: FC<CommandMenuItemProps> = ({
  commandId,
  commandName,
  active = false,
  enabled,
  attrs,
  onSelect,
  onClick,
  icon,
  displayShortcut = true,
  label,
  description,
  displayDescription = true,
  ...rest
}) => {
  const handleClick: MouseEventHandler<HTMLLIElement> = useCallback(
    (e) => {
      onSelect();
      onClick?.(e);
    },
    [onSelect, onClick],
  );

  const handleMouseDown: MouseEventHandler<HTMLLIElement> = useCallback((e) => {
    e.preventDefault();
  }, []);

  const commandOptions = useCommandOptionValues({ commandName, active, enabled, attrs });

  let fallbackIcon = null;

  if (commandOptions.icon) {
    fallbackIcon = isString(commandOptions.icon) ? commandOptions.icon : commandOptions.icon.name;
  }

  const primary = label ?? commandOptions.label ?? '';
  const secondary = description ?? commandOptions.description;

  return (
    <MenuItem
      selected={active}
      disabled={!enabled}
      onMouseDown={handleMouseDown}
      {...rest}
      onClick={handleClick}
    >
      {icon !== null && <MenuItemIcon icon={icon ?? fallbackIcon} />}
      <ListItemText primary={primary} secondary={displayDescription && secondary} />
      {displayShortcut && commandOptions.shortcut && (
        <Typography variant='body2' color='text.secondary' sx={{ ml: 2 }}>
          {commandOptions.shortcut}
        </Typography>
      )}
      <CommandMenuItemText commandId={commandId} label={primary} description={displayDescription && secondary} />
    </MenuItem>
  );
};
