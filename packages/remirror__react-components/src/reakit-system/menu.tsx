import { cloneElement, createContext, ReactNode, useCallback, useContext } from 'react';
import { MenuHTMLProps, MenuOptions } from 'reakit/Menu/Menu';
import { MenuBarHTMLProps, MenuBarOptions } from 'reakit/Menu/MenuBar';
import { MenuButtonHTMLProps, MenuButtonOptions } from 'reakit/Menu/MenuButton';
import { MenuGroupHTMLProps, MenuGroupOptions } from 'reakit/Menu/MenuGroup';
import { MenuItemHTMLProps, MenuItemOptions } from 'reakit/Menu/MenuItem';
import { MenuItemCheckboxHTMLProps, MenuItemCheckboxOptions } from 'reakit/Menu/MenuItemCheckbox';
import { MenuItemRadioHTMLProps, MenuItemRadioOptions } from 'reakit/Menu/MenuItemRadio';
import { MenuStateReturn } from 'reakit/Menu/MenuState';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapMenuBarOptions = BootstrapRoleOptions & MenuBarOptions;

export function useMenuBarProps(
  { orientation }: BootstrapMenuBarOptions,
  htmlProps: MenuBarHTMLProps = {},
): MenuBarHTMLProps {
  return {
    ...htmlProps,
    className: cx(
      ComponentsTheme.MENU_BAR,
      orientation === 'horizontal' ? ComponentsTheme.FLEX_ROW : ComponentsTheme.FLEX_COLUMN,
      htmlProps.className,
    ),
  };
}

export type BootstrapMenuItemOptions = BootstrapRoleOptions & MenuItemOptions;

export function useMenuItemProps(
  { orientation }: BootstrapMenuItemOptions,
  htmlProps: MenuItemHTMLProps = {},
): MenuItemHTMLProps {
  return {
    ...htmlProps,
    className: cx(
      ComponentsTheme.MENU_ITEM,
      orientation === 'horizontal'
        ? ComponentsTheme.MENU_ITEM_ROW
        : ComponentsTheme.MENU_ITEM_COLUMN,
      htmlProps.className,
    ),
  };
}

export type BootstrapMenuOptions = BootstrapRoleOptions & MenuOptions;

// eslint-disable-next-line unicorn/no-useless-undefined
const OrientationContext = createContext<'horizontal' | 'vertical' | undefined>(undefined);

export function useMenuOptions({
  unstable_system: { palette = 'background', fill = 'opaque', ...system } = {},
  ...options
}: BootstrapMenuOptions): BootstrapMenuOptions {
  const parentOrientation = useContext(OrientationContext);
  const unstable_system = { palette, fill, ...system };
  const transform = options.unstable_popoverStyles?.transform ?? '';

  if (parentOrientation === 'vertical' && options.orientation === 'vertical') {
    return {
      ...options,
      unstable_system,
      unstable_popoverStyles: {
        ...options.unstable_popoverStyles,
        transform: `${transform} translate3d(0px, -0.3em, 0px)`,
      },
    };
  }

  return { ...options, unstable_system };
}

export function useMenuProps(
  options: BootstrapMenuOptions,
  { wrapElement: htmlWrapElement, ...htmlProps }: MenuHTMLProps = {},
): MenuHTMLProps {
  const wrapElement = useCallback(
    (element: ReactNode) => {
      if (htmlWrapElement) {
        element = htmlWrapElement(element);
      }

      return (
        <OrientationContext.Provider value={options.orientation}>
          {element}
        </OrientationContext.Provider>
      );
    },
    [htmlWrapElement, options.orientation],
  );

  return {
    ...htmlProps,
    wrapElement,
    className: cx(ComponentsTheme.MENU, htmlProps.className),
  };
}

export type BootstrapMenuButtonOptions = BootstrapRoleOptions &
  MenuButtonOptions &
  Pick<Partial<MenuStateReturn>, 'unstable_originalPlacement'>;

export function useMenuButtonProps(
  options: BootstrapMenuButtonOptions,
  { children, ...htmlProps }: MenuButtonHTMLProps = {},
): MenuButtonHTMLProps {
  const placement = options.unstable_originalPlacement ?? options.placement;
  const dir = placement
    ? (placement.split('-')[0] as 'top' | 'bottom' | 'right' | 'left')
    : undefined;

  const svg = dir
    ? {
        top: (
          <svg viewBox='0 0 50 43.3'>
            <polygon points='25 0 0 43.3 50 43.3 25 0' />
          </svg>
        ),
        bottom: (
          <svg viewBox='0 0 50 43.3'>
            <polygon points='25 43.3 50 0 0 0 25 43.3' />
          </svg>
        ),
        right: (
          <svg viewBox='0 0 43.3 50'>
            <polygon points='43.3 25 0 0 0 50 43.3 25' />
          </svg>
        ),
        left: (
          <svg viewBox='0 0 43.3 50'>
            <polygon points='0 25 43.3 50 43.3 0 0 25' />
          </svg>
        ),
      }[dir]
    : null;

  return {
    ...htmlProps,
    children:
      typeof children === 'function' ? (
        (props: any) => {
          const child = children(props);
          return cloneElement(child, {
            children: (
              <>
                {child.props.children}
                {svg}
              </>
            ),
          });
        }
      ) : (
        <>
          {children}
          {svg}
        </>
      ),
    className: cx(
      ComponentsTheme.MENU_BUTTON,
      dir === 'left' ? ComponentsTheme.MENU_BUTTON_LEFT : ComponentsTheme.MENU_BUTTON_RIGHT,
      children && dir === 'left' && ComponentsTheme.MENU_BUTTON_NESTED_LEFT,
      children && dir === 'right' && ComponentsTheme.MENU_BUTTON_NESTED_RIGHT,
      htmlProps.className,
    ),
  };
}

export type BootstrapMenuItemCheckboxOptions = BootstrapRoleOptions & MenuItemCheckboxOptions;

export function useMenuItemCheckboxProps(
  _: BootstrapMenuItemCheckboxOptions,
  htmlProps: MenuItemCheckboxHTMLProps = {},
): MenuItemCheckboxHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.MENU_ITEM_CHECKBOX, htmlProps.className) };
}

export type BootstrapMenuItemRadioOptions = BootstrapRoleOptions & MenuItemRadioOptions;

export function useMenuItemRadioProps(
  _: BootstrapMenuItemRadioOptions,
  htmlProps: MenuItemRadioHTMLProps = {},
): MenuItemRadioHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.MENU_ITEM_CHECKBOX, htmlProps.className) };
}

export type BootstrapMenuGroupOptions = BootstrapRoleOptions & MenuGroupOptions;

export function useMenuGroupProps(
  _: BootstrapMenuGroupOptions,
  htmlProps: MenuGroupHTMLProps = {},
): MenuGroupHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.MENU_GROUP, htmlProps.className) };
}
