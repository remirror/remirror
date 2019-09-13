import { isPlainObject } from '@remirror/core-helpers';
import { useRemirrorTheme } from '@remirror/ui';
import { Button, ButtonProps } from '@remirror/ui-buttons';
import { Dropdown, DropdownProps } from '@remirror/ui-dropdown';
import React, { FC, forwardRef, ReactElement } from 'react';

interface MenubarDropdownConfiguration extends DropdownProps {
  type: 'dropdown';
}

interface MenubarGroupConfiguration extends MenubarGroupProps {
  type: 'group';
}

interface MenubarButton extends Omit<ButtonProps, 'ref'> {
  type: 'button';
}

export type MenubarContent = MenubarDropdownConfiguration | MenubarGroupConfiguration | MenubarButton;

interface MenubarProps {
  content: MenubarContent[];
}

export const Menubar = ({ content }: MenubarProps) => {
  const { sx } = useRemirrorTheme();
  return (
    <nav css={sx({ display: 'flex' })}>
      <MenuTree content={content} />
    </nav>
  );
};

interface MenuTreeProps {
  content: MenubarContent[];
}

const MenuTree: FC<MenuTreeProps> = ({ content }) => {
  const tree = content.map((item, index) => {
    switch (item.type) {
      case 'group': {
        const { type, ...rest } = item;
        return (
          <MenubarGroup key={index} {...rest}>
            <MenuTree content={rest.content} />
          </MenubarGroup>
        );
      }

      case 'dropdown': {
        const { type, ...rest } = item;
        return <Dropdown key={index} dropdownPosition='below left' {...rest} />;
      }

      case 'button': {
        const { type, ...rest } = item;
        return <Button key={index} variant='background' {...rest} />;
      }

      default:
        throw new Error(
          `Invalid configuration passed into the MenuTree: ${
            isPlainObject(item) ? JSON.stringify(item, null, 2) : item
          }`,
        );
    }
  });

  return <>{tree}</>;
};

interface MenubarGroupProps {
  render?(MenubarGroupProps: MenubarGroupConfiguration): ReactElement;
  content: MenubarContent[];
}

export const MenubarGroup: FC<MenubarGroupProps> = ({ children, render, ...props }) => {
  const { sx } = useRemirrorTheme();

  if (render) {
    return render({ ...props, type: 'group' });
  }

  return (
    <div
      css={sx({
        display: 'flex',
        position: 'relative',
        ':after': {
          position: 'absolute',
          content: '""',
          top: 0,
          right: 0,
          height: '100%',
          width: '1px',
          backgroundColor: 'grey:fade',
        },
      })}
    >
      {children}
    </div>
  );
};

/**
 * The menu component.
 */
export const Menu = forwardRef<HTMLMenuElement, JSX.IntrinsicElements['menu']>(
  ({ children, ...props }, ref) => {
    const { sx } = useRemirrorTheme();
    return (
      <nav {...props} css={sx({ display: 'flex' })} ref={ref}>
        {children}
      </nav>
    );
  },
);
