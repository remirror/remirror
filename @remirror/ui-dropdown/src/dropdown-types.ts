import { IconProps } from '@remirror/ui-icons';
import { MinWidthProperty, WidthProperty } from 'csstype';
import { MultishiftChangeHandlerProps, MultishiftPropGetters } from 'multishift';
import { ComponentType, ReactNode } from 'react';
import { dropdownPositions } from './dropdown-constants';

export interface DropdownItem {
  /**
   * A unique identifier for this item.
   *
   * This is also used as the key.
   */
  id: string;

  /**
   * The string label to render for the dropdown
   */
  label: string;

  /**
   * An optional element which can be rendered in place of the label when provided.
   */
  element?: ReactNode;
}

export type DropdownPosition = keyof typeof dropdownPositions;

export interface DropdownProps {
  minWidth?: MinWidthProperty<number | string>;
  width?: WidthProperty<number | string>;

  /**
   * The list of items available for this dropdown.
   */
  items: DropdownItem[];

  /**
   * An array of the selected items.
   */
  selectedItems?: DropdownItem[];

  /**
   * The value when the dropdown is first rendered. Defaults to
   * the first item in the list.
   */
  initialItem?: DropdownItem;

  /**
   * Set to true to support multiple item selection.
   */
  multiple?: boolean;

  /**
   * The string to render when no item is selected.
   */
  label: string;

  /**
   * Whether a label component should be displayed. Uses the label provided
   * as the value.
   */
  showLabel?: boolean;

  /**
   * A render prop for the label. Allows setting a custom label.
   */
  renderLabel?(params: RenderLabelParams): ReactNode;

  /**
   * Whether to show the selected item label within the button.
   *
   * @defaultValue `true`
   */
  showSelectedAsLabel?: boolean;

  /**
   * The Icon to render within the dropdown
   */
  IconComponent?: ComponentType<IconProps>;

  /**
   * The props for the icon component.
   */
  iconProps?: IconProps;

  /**
   * Whether the dropdown is useable.
   */
  disabled?: boolean;

  /**
   * Sets whether the position that the drop down will render in.
   *
   * @defaultValue 'below left'
   */
  dropdownPosition?: DropdownPosition;

  /**
   * Whether to auto position the dropdown open direction based on remaining
   * space in the Y direction.
   */
  autoPositionY?: boolean;

  /**
   * The spacing to give the dropdown menu.
   *
   * @defaultValue 20
   */
  autoPositionYSpace?: number;

  /**
   * Whether to horizontally auto position the dropdown open direction based on
   * remaining space in the Y direction.
   */
  autoPositionX?: boolean;

  /**
   * The X-axis spacing to give the dropdown menu.
   *
   * @defaultValue 5
   */
  autoPositionXSpace?: number;

  /**
   * Called when a new item is selected.
   */
  onSelect?: MultishiftChangeHandlerProps<DropdownItem>['onSelectedItemsChange'];

  /**
   * Whether the dropdown should be open by default.
   */
  initialIsOpen?: boolean;
}

export interface RenderLabelParams {
  getLabelProps: MultishiftPropGetters<DropdownItem>['getLabelProps'];
  label?: string;
  selectedItems: DropdownItem[];
}
