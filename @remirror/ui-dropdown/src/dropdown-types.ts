import { IconProps } from '@remirror/ui-icons';
import { PropGetters } from 'downshift';
import { ComponentType, ReactNode } from 'react';
import { dropdownPositions } from './dropdown-constants';

export interface DropdownItem {
  /**
   * The string label to render for the dropdown
   */
  label: string;

  /**
   * An optional element which can be rendered in place of the label when provided.
   */
  element?: ReactNode;

  /**
   * The value this dropdown represents
   */
  value: string;

  /**
   * What to do when this item is selected
   */
  onSelect?: (item: DropdownItem) => void;

  active?: boolean;
}

export type DropdownPosition = keyof typeof dropdownPositions;

export interface DropdownProps {
  /**
   * The list of items available for this dropdown.
   */
  items: DropdownItem[];

  /**
   * The value when the dropdown is first rendered. Defaults to
   * the first item in the list.
   */
  initialItem?: DropdownItem;

  /**
   * Set to true to support multiple item selection.
   */
  multiSelect?: boolean;

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
   *   * @default true
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
   * @default 'below left'
   */
  dropdownPosition?: DropdownPosition;
}

export interface RenderLabelParams {
  getLabelProps: PropGetters<any>['getLabelProps'];
  label?: string;
  activeItems: DropdownItem[];
}
