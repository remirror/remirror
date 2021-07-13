/**
 * @module
 *
 * The builtin menus.
 */

import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { forwardRef, useEffect, useRef } from 'react';
import { Box } from 'reakit/Box';
import type { MenuBarStateReturn, MenuStateReturn } from 'reakit/Menu';
import {
  Menu as ReakitMenu,
  MenuBar as ReakitMenuBar,
  MenuButton as ReakitMenuButton,
  MenuGroup as ReakitMenuGroup,
  MenuItem as ReakitMenuItem,
  MenuSeparator,
  useMenuBarState,
  useMenuState,
} from 'reakit/Menu';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import type { AnyExtension, CommandDecoratorMessageProps } from '@remirror/core';
import { cx, ErrorConstant, includes, invariant, isString } from '@remirror/core';
import {
  useActive,
  useChainedCommands,
  useCommands,
  useHelpers,
  useI18n,
  useRemirrorContext,
} from '@remirror/react-core';
import { ComponentsTheme } from '@remirror/theme';

import { CommandIconComponent } from '../components';
import { useTheme } from '../providers';
import {
  ComponentItem,
  MenuBarGroupItem,
  MenuBarItem,
  MenuCommandPaneItem,
  MenuDropdownItem,
  MenuGroupItem,
  MenuPaneItem,
  MenuSeparatorItem,
} from '../react-component-types';
import {
  getCommandOptionValue,
  getShortcutString,
  getUiShortcutString,
} from '../react-component-utils';

interface MenuGroupProps extends BaseMenuProps {
  item: MenuGroupItem;
}

const MenuGroup = (props: MenuGroupProps) => {
  const { menuState, item: group } = props;
  const { items, label, role, separator } = group;
  const startSeparator = includes(['start', 'both'], separator) && <MenuSeparator {...menuState} />;
  const endSeparator = includes(['end', 'both'], separator) && <MenuSeparator {...menuState} />;

  return (
    <>
      {startSeparator}
      <ReakitMenuGroup {...menuState} aria-label={label}>
        {items.map((item, index) => {
          switch (item.type) {
            case ComponentItem.MenuPane:
              return <MenuPane menuState={menuState} item={item} key={index} />;

            case ComponentItem.MenuCommandPane:
              return <MenuCommandPane menuState={menuState} item={item} role={role} key={index} />;

            case ComponentItem.MenuDropdown:
              return <MenuDropdown item={item} menuState={menuState} key={index} />;
          }
        })}
      </ReakitMenuGroup>
      {endSeparator}
    </>
  );
};

interface MenuPaneProps extends BaseMenuBarProps {
  item: MenuPaneItem;
}

const MenuPane = (props: MenuPaneProps): JSX.Element => {
  return <ReakitMenuItem {...props.menuState} />;
};

interface MenuCommandPaneProps extends BaseMenuBarProps {
  item: MenuCommandPaneItem;
  autoFocus?: boolean;
  role?: 'radio' | 'checkbox';
}

const MenuCommandPane = (props: MenuCommandPaneProps): JSX.Element => {
  // Gather all the hooks used for this component.
  const context = useRemirrorContext();
  const { menuState, item, role } = props;
  const commands = useCommands();
  const chain = useChainedCommands();
  const { getCommandOptions } = useHelpers();
  const { t } = useI18n();
  const autoFocus = item.refocusEditor ?? props.autoFocus ?? false;

  // Will cause the editor to rerender for each state update.
  const active = useActive<AnyExtension>();
  const { commandName, attrs, displayShortcut = true } = item;
  const options = getCommandOptions(commandName);

  if (!options) {
    return <span>Not found: {commandName}</span>;
  }

  const enabled = commands[commandName]?.isEnabled(attrs) ?? false;
  const isActive = active[options.name]?.(attrs) ?? false;
  const commandProps: CommandDecoratorMessageProps = { active: isActive, attrs, enabled, t };
  const label = getCommandOptionValue(options.label, commandProps);
  const icon = getCommandOptionValue(options.icon, commandProps);
  const shortcutString =
    displayShortcut && options.shortcut
      ? `${getShortcutString(getUiShortcutString(options.shortcut, attrs ?? {}), { t })}`
      : undefined;
  const onClick = (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (item.onClick) {
      item.onClick(event, context);
      return;
    }

    if (options.disableChaining) {
      commands[commandName]?.(attrs);
      return;
    }

    const command = chain[commandName]?.(attrs);

    if (autoFocus) {
      command?.focus?.();
    }

    command?.run();
  };

  return (
    <BaseMenuPane
      menuState={menuState}
      disabled={!enabled}
      focusable={enabled}
      onClick={onClick}
      active={isActive}
      role={role}
    >
      {icon && (
        <Box as='span' className={ComponentsTheme.MENU_PANE_ICON}>
          <CommandIconComponent icon={icon} />
        </Box>
      )}
      <Box as='span' className={ComponentsTheme.MENU_PANE_LABEL}>
        {label}
      </Box>
      {shortcutString && (
        <Box as='span' className={ComponentsTheme.MENU_PANE_SHORTCUT}>
          {shortcutString}
        </Box>
      )}
    </BaseMenuPane>
  );
};

// type MenuDropdownProps = SubMenuDropdownProps | MenuBarDropdownProps;

interface MenuDropdownProps extends BaseMenuBarProps {
  item: MenuDropdownItem;
}

const MenuDropdown = (props: MenuDropdownProps): JSX.Element => {
  const { menuState, item } = props;
  const { items, label, menuLabel } = item;

  return (
    <ReakitMenuItem
      as={DropdownComponent}
      {...menuState}
      menuItems={items}
      label={label}
      menuLabel={menuLabel}
    />
  );
};

interface DropdownComponentProps
  extends Omit<MenuDropdownItem, 'type' | 'items'>,
    Partial<MenuStateReturn> {
  menuItems: Array<
    MenuPaneItem | MenuSeparatorItem | MenuCommandPaneItem | MenuGroupItem | MenuDropdownItem
  >;
}

/**
 * A dropdown menu which can be composed together with other dropdown menus.
 */
export const DropdownComponent = forwardRef<HTMLButtonElement, DropdownComponentProps>(
  (props, ref) => {
    const menuState = useMenuState();
    const { menuItems, label: Label, menuLabel, icon, ...rest } = props;

    let labelElement: ReactNode | undefined;
    let label: string | undefined = menuLabel;

    if (isString(Label)) {
      label ??= Label;
    } else if (Label != null) {
      labelElement = <Label menuState={menuState} />;
    }

    return (
      <>
        <ReakitMenuButton {...menuState} {...rest} ref={ref} aria-label={label}>
          {labelElement && (
            <Box as='span' className={ComponentsTheme.MENU_DROPDOWN_LABEL}>
              {labelElement}
            </Box>
          )}
          {icon && (
            <Box as='span' className={ComponentsTheme.MENU_PANE_ICON}>
              <CommandIconComponent icon={icon} />
            </Box>
          )}
        </ReakitMenuButton>
        <MenuComponent items={menuItems} menuState={menuState} label={label} />
      </>
    );
  },
);

DropdownComponent.displayName = 'Dropdown';

interface MenuComponentProps extends BaseMenuProps {
  /**
   * Whether the menu is open or not.
   */
  open?: boolean | null;

  /**
   * The sub items to render
   */
  items: Array<
    MenuPaneItem | MenuSeparatorItem | MenuCommandPaneItem | MenuGroupItem | MenuDropdownItem
  >;

  /**
   * The aria label for this menu.
   */
  label?: string;
}

/**
 * A menu without the menu button trigger. The menu is opened and closed via the
 * `open` prop.
 */
export const MenuComponent = (props: MenuComponentProps): JSX.Element => {
  const { open, items, menuState, label } = props;
  const isControlled = useRef(open != null);

  useEffect(() => {
    invariant(isControlled.current === (open != null), {
      code: ErrorConstant.REACT_COMPONENTS,
      message:
        'The controllable menu must either be controlled with a boolean value for `open` or uncontrolled (null | undefined value for `open`) for the lifetime of the component.',
    });

    if (!isControlled.current) {
      return;
    }

    open ? menuState.show() : menuState.hide();
  }, [open, menuState]);

  return (
    <ReakitMenu {...menuState} aria-label={label}>
      {items.map((item, index) => {
        switch (item.type) {
          case ComponentItem.MenuSeparator:
            return <MenuSeparator {...menuState} key={index} />;

          case ComponentItem.MenuPane:
            return <MenuPane menuState={menuState} item={item} key={index} />;

          case ComponentItem.MenuCommandPane:
            return <MenuCommandPane menuState={menuState} item={item} key={index} />;

          case ComponentItem.MenuGroup:
            return <MenuGroup item={item} menuState={menuState} key={index} />;

          case ComponentItem.MenuDropdown:
            return <MenuDropdown item={item} menuState={menuState} key={index} />;

          default:
            return <></>;
        }
      })}
    </ReakitMenu>
  );
};

interface MenuBarProps {
  item: MenuBarItem;
}

export const MenuBar = (props: MenuBarProps): JSX.Element => {
  const menuState = useMenuBarState();
  const { items } = props.item;

  return (
    <ReakitMenuBar {...menuState}>
      {items.map((item) => {
        switch (item.type) {
          case ComponentItem.MenuSeparator:
            return <MenuSeparator {...menuState} />;

          case ComponentItem.MenuBarGroup:
            return <MenuBarGroup item={item} menuState={menuState} />;

          case ComponentItem.MenuDropdown:
            return <MenuDropdown item={item} menuState={menuState} />;
        }
      })}
    </ReakitMenuBar>
  );
};

interface MenuBarGroupProps extends BaseMenuBarProps {
  item: MenuBarGroupItem;
}

const MenuBarGroup = (props: MenuBarGroupProps) => {
  const { menuState, item } = props;

  return (
    <ReakitMenuGroup {...menuState} aria-label={item.label}>
      {item.items.map((item) => {
        switch (item.type) {
          case ComponentItem.MenuDropdown:
            return <MenuDropdown item={item} menuState={menuState} />;
        }
      })}
    </ReakitMenuGroup>
  );
};

interface BaseMenuProps {
  menuState: MenuStateReturn;
}

interface BaseMenuBarProps {
  menuState: MenuBarStateReturn;
}

interface BaseMenuPaneProps extends BaseMenuBarProps {
  children: ReactNode;
  active: boolean;
  tooltip?: string;
  tooltipClass?: string;
  disabled?: boolean;
  focusable?: boolean;
  className?: string;
  role?: 'radio' | 'checkbox';
  onClick: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const BaseMenuPane = (props: BaseMenuPaneProps) => {
  const {
    menuState: state,
    children,
    tooltip,
    disabled,
    focusable,
    onClick,
    tooltipClass,
    active,
    className,
  } = props;
  const tooltipState = useTooltipState({ gutter: 5 });
  const themeProps = useTheme({ className: tooltipClass });
  const checked = props.role ? (active ? 'true' : 'false') : undefined;
  const role =
    props.role === 'checkbox'
      ? 'menuitemcheckbox'
      : props.role === 'radio'
      ? 'menuitemradio'
      : undefined;

  return (
    <>
      <TooltipReference {...tooltipState}>
        {(props) => (
          <ReakitMenuItem
            {...props}
            {...state}
            role={role}
            aria-checked={checked}
            disabled={disabled}
            focusable={focusable}
            onClick={onClick}
            className={cx(
              className,
              ComponentsTheme.MENU_PANE,
              active && ComponentsTheme.MENU_PANE_ACTIVE,
            )}
          >
            {children}
          </ReakitMenuItem>
        )}
      </TooltipReference>
      {tooltip && (
        <Tooltip {...tooltipState} style={themeProps.style} className={cx(themeProps.className)}>
          {tooltip}
        </Tooltip>
      )}
    </>
  );
};
