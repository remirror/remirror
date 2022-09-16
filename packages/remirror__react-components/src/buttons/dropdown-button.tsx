import { IconButton, Menu, MenuProps, Tooltip } from '@mui/material';
import React, { FC, MouseEventHandler, ReactNode, useCallback, useRef, useState } from 'react';
import { uniqueId } from '@remirror/core';

import { Icon } from '../icons';

export interface DropdownButtonProps extends Omit<MenuProps, 'open' | 'anchorEl' | 'id'> {
  'aria-label': string;
  label?: NonNullable<ReactNode>;
  icon?: JSX.Element;
}

export const DropdownButton: FC<DropdownButtonProps> = ({
  label,
  'aria-label': ariaLabel,
  icon,
  children,
  onClose,
  ...rest
}) => {
  const id = useRef<string>(uniqueId());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleClick: MouseEventHandler<HTMLElement> = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose: MenuProps['onClose'] = useCallback(
    (e: Event, reason: 'backdropClick' | 'escapeKeyDown') => {
      setAnchorEl(null);
      onClose?.(e, reason);
    },
    [onClose],
  );

  return (
    <>
      <Tooltip title={label ?? ariaLabel}>
        <IconButton
          aria-label={ariaLabel}
          aria-controls={open ? id.current : undefined}
          aria-haspopup
          aria-expanded={open ? 'true' : undefined}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          size='small'
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: `${theme.shape.borderRadius}px`,
            padding: '6px 12px',
            '&:not(:first-of-type)': {
              marginLeft: '-1px',
              borderLeft: '1px solid transparent',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
            '&:not(:last-of-type)': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            },
          })}
        >
          {icon}
          <Icon name='arrowDownSFill' size='1rem' />
        </IconButton>
      </Tooltip>
      <Menu {...rest} id={id.current} anchorEl={anchorEl} open={open} onClose={handleClose}>
        {children}
      </Menu>
    </>
  );
};
