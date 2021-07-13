import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';
import type { MenuStateReturn } from 'reakit/Menu';
import type { ToolbarItem as ReakitToolbarItem, ToolbarStateReturn } from 'reakit/Toolbar';
import type { AnyExtension, ProsemirrorAttributes } from '@remirror/core';
import type { CoreIcon } from '@remirror/icons';
import type { ReactFrameworkOutput } from '@remirror/react-core';

export enum ComponentItem {
  /**
   * The top level toolbar configuration.
   */
  Toolbar = 'toolbar',

  /**
   * A custom button.
   */
  ToolbarButton = 'toolbar-button',

  /**
   * A button that uses one of the internally available commands.
   */
  ToolbarCommandButton = 'toolbar-command-button',

  /**
   * A custom component
   */
  ToolbarComponent = 'toolbar-component',

  /**
   * A custom react element
   */
  ToolbarElement = 'toolbar-element',

  /**
   * Add a divider to the toolbar.
   */
  ToolbarSeparator = 'toolbar-separator',

  /**
   * Create a group which can wrap multiple ToolbarComponents
   */
  ToolbarGroup = 'toolbar-group',

  /**
   * A menu which can be placed inside a toolbar.
   */
  ToolbarMenu = 'toolbar-menu',

  /**
   * A menu bar which includes top level dropdown menus.
   */
  MenuBar = 'menu-bar',

  /**
   * Group items in the menu bar together.
   */
  MenuBarGroup = 'menu-bar-group',

  /**
   * A menu dropdown.
   */
  MenuDropdown = 'menu-bar-dropdown',

  /**
   * A generic separator which can be placed in both the menu bar and dropdown
   * (sub) menus.
   */
  MenuSeparator = 'menu-separator',

  /**
   * A menu tile.
   */
  MenuPane = 'menu-pane',

  /**
   * A menu tile derived from a builtin UI command.
   */
  MenuCommandPane = 'menu-command-pane',

  /**
   * Group menu items together.
   */
  MenuGroup = 'menu-group',

  /**
   * A menu action (alias of MenuPane)
   */
  MenuAction = 'menu-action',

  /**
   * A menu action which uses the built in commands. (alias of MenuCommandPane)
   */
  MenuCommandAction = 'menu-command-action',
}

/**
 * Handle click events.
 */
export type ButtonClickHandler<Extension extends AnyExtension = Remirror.Extensions> = (
  event: ReactMouseEvent<HTMLButtonElement, MouseEvent>,
  context: ReactFrameworkOutput<Extension>,
) => void;

export interface BaseButtonItem {
  /**
   * Whether to automatically focus the editor when commands are run. This can
   * be overridden within each configuration item.
   */
  refocusEditor?: boolean;

  /**
   * Whether the button should be focusable.
   */
  focusable?: boolean;
}

export interface ToolbarItem extends BaseButtonItem, BaseItem {
  type: ComponentItem.Toolbar;

  /**
   * All the items within this toolbar group.
   */
  items: ToolbarItemUnion[];

  /**
   * A label for improved a11y.
   */
  label?: string;

  /**
   * Whether to loop through the items in the toolbar with tabs or arrow keys.
   */
  loop?: boolean;
}

/**
 * Generate UI from the supported extensions.
 */
export interface ToolbarCommandButtonItem extends BaseButtonItem, BaseItem {
  /**
   * A button that is configured directly from a command name within the editor.
   */
  type: ComponentItem.ToolbarCommandButton;

  /**
   * Whether to show the icon, the label or label before the icon or icon after
   * the label.
   */
  display: 'icon' | 'label' | 'label-icon' | 'icon-label';

  /**
   * The name of the command to use.
   */
  commandName: Remirror.AllUiCommandNames;

  /**
   * The attributes to pass through when the command is called.
   */
  attrs?: ProsemirrorAttributes;

  /**
   * Whether to display the shortcut.
   *
   * @default true
   */
  displayShortcut?: boolean;

  /**
   * Override the default onClick handler.
   */
  onClick?: ButtonClickHandler;
}

export interface ToolbarButtonItem extends BaseButtonItem, BaseItem {
  type: ComponentItem.ToolbarButton;
  onClick: ButtonClickHandler;
  icon?: CoreIcon;
  label?: string;
  disabled?: boolean;
  active?: boolean;
}

export interface ToolbarDividerItem extends BaseItem {
  type: ComponentItem.ToolbarSeparator;
}

export interface ToolbarElementItem extends BaseItem {
  type: ComponentItem.ToolbarElement;

  /**
   * The JSX to insert at this position.
   */
  element: JSX.Element;
}

export interface CustomToolbarComponentProps {
  /**
   * The state which can be spread into the `Wrapper` component to provide
   * accessibility support (via [Reakit](https://reakit.io/)).
   */
  toolbarState: ToolbarStateReturn;

  /**
   * The wrapper component which can be used to make the component you render
   * accessible.
   *
   * ```tsx
   * import { ComponentConstant } from '@remirror/react';
   * const toolbar = [{
   *   type: ComponentConstant.Component,
   *   Component: ({ Wrapper, toolbarState }) => <Wrapper {...toolbarState} as='button' />,
   * }]
   * ```
   *
   * Under the hood it is using the `ToolbarItem` from `reakit/Toolbar`.
   */
  Wrapper: typeof ReakitToolbarItem;
}

export interface ToolbarComponentItem extends BaseItem {
  type: ComponentItem.ToolbarComponent;

  /**
   * A custom component to use within the toolbar.
   */
  Component: ComponentType<CustomToolbarComponentProps>;
}

export interface ToolbarGroupItem extends BaseGroupItem, BaseItem {
  type: ComponentItem.ToolbarGroup;

  /**
   * The items within the toolbar group.
   */
  items: ToolbarGroupItemUnion[];
}

export interface ToolbarMenuItem extends Omit<MenuDropdownItem, 'type'> {
  type: ComponentItem.ToolbarMenu;
}

export type ToolbarItemUnion =
  | ToolbarDividerItem
  | ToolbarElementItem
  | ToolbarComponentItem
  | ToolbarButtonItem
  | ToolbarCommandButtonItem
  | ToolbarGroupItem
  | ToolbarMenuItem;

/**
 * A valid item which can be placed within a group item in the toolbar.
 */
type ToolbarGroupItemUnion = Exclude<ToolbarItemUnion, ToolbarGroupItem>;

export interface MenuSeparatorItem {
  type: ComponentItem.MenuSeparator;
}

export interface MenuPaneItem extends BaseButtonItem, BaseItem {
  type: ComponentItem.MenuPane;
  label?: string;
  icon?: CoreIcon | ComponentType<object>;
  onClick: ButtonClickHandler;
  shortcut?: string;
}

type PaneLayoutSection = 'icon' | 'label' | 'shortcut' | 'icon-label';

/**
 * Get the configuration directly from a built in extension.
 */
export interface MenuCommandPaneItem extends BaseButtonItem {
  /**
   * A button that is configured directly from a command name within the editor.
   */
  type: ComponentItem.MenuCommandPane;

  /**
   * @default ['icon', 'label', 'shortcut']
   */
  layout?: PaneLayoutSection[];

  /**
   * The name of the command to use.
   */
  commandName: Remirror.AllUiCommandNames;

  /**
   * The attributes to pass through when the command is called.
   */
  attrs?: ProsemirrorAttributes;

  /**
   * Whether to display the shortcut.
   *
   * @default true
   */
  displayShortcut?: boolean;

  /**
   * The role that should be passed to the button element.
   */
  role?: 'radio' | 'checkbox';

  /**
   * An optional click handler to use if you want to override the default click
   * behaviour.
   */
  onClick?: ButtonClickHandler;

  /**
   * The option to override the built in shortcut string.
   */
  shortcut?: string;
}

export interface MenuGroupItem extends BaseGroupItem, BaseItem {
  type: ComponentItem.MenuGroup;
  items: Array<MenuDropdownItem | MenuCommandPaneItem | MenuPaneItem>;
  role?: 'radio' | 'checkbox';
}

export interface MenuBarGroupItem extends BaseItem {
  type: ComponentItem.MenuBarGroup;
  items: MenuDropdownItem[];
  label?: string;
}
interface MenuLabelComponentProps {
  menuState: MenuStateReturn;
}

export interface MenuDropdownItem extends BaseItem {
  type: ComponentItem.MenuDropdown;
  label?: string | ComponentType<MenuLabelComponentProps>;
  items: Array<
    MenuPaneItem | MenuSeparatorItem | MenuCommandPaneItem | MenuGroupItem | MenuDropdownItem
  >;
  icon?: CoreIcon;

  /**
   * Defaults to label when it is a string and used for the aria label for the
   * menu element.
   *
   * @default `label`
   */
  menuLabel?: string;
}

export interface MenuBarItem extends BaseItem {
  type: ComponentItem.MenuBar;

  /**
   * The items provided by the menu.
   */
  items: Array<MenuDropdownItem | MenuSeparatorItem | MenuBarGroupItem>;
}

export interface MenuActionItem extends Omit<MenuPaneItem, 'type'>, BaseMenuActionItem {
  type: ComponentItem.MenuAction;
}

export interface MenuCommandActionItem
  extends Omit<MenuCommandPaneItem, 'type'>,
    BaseMenuActionItem {
  type: ComponentItem.MenuCommandAction;
}

export type MenuActionItemUnion = MenuActionItem | MenuCommandActionItem;

interface BaseMenuActionItem {
  /**
   * A group of descriptive tags which will be used to search through the
   * actions dynamically.
   */
  tags: string[];

  /**
   * Description of the command which will be used to aid search.
   */
  description?: string;
}

export interface BaseGroupItem {
  /**
   * A label for improved a11y.
   */
  label?: string;

  /**
   * Whether to automatically insert a divider.
   */
  separator?: 'none' | 'start' | 'end' | 'both';
}

interface BaseItem {
  type: ComponentItem;

  /**
   * A key which is used as the key when provided. Otherwise the index is used.
   */
  key?: string | number;
}
