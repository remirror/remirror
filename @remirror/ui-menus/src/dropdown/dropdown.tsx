import { useRemirrorTheme } from '@remirror/ui';
import { Button } from '@remirror/ui-buttons';
import { AngleDownIcon, AngleRightIcon, IconProps } from '@remirror/ui-icons';
import Downshift, { PropGetters } from 'downshift';
import React, { ComponentType, useState } from 'react';
import { animated, useSpring } from 'react-spring';

export interface DropdownItem {
  /**
   * The string label to render for the dropdown
   */
  label: string;

  /**
   * An optional element which can be rendered in place of the label when provided.
   */
  element?: React.ReactNode;

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

type DropdownPosition = keyof typeof dropdownPositions;

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
  defaultLabel: string;
  showSelectedAsLabel?: boolean;
  IconComponent?: ComponentType<IconProps>;
  iconProps?: IconProps;

  /**
   * Sets whether the position that the drop down will render in.
   *
   * @default 'below'
   */
  dropdownPosition?: DropdownPosition;
}

const dropdownPositions = {
  above: { bottom: '100%', left: 0 },
  below: { top: '100%', left: 0 },
  left: { right: '100%', top: 0 },
  right: { left: '100%', top: 0 },
};

export const Dropdown = ({
  items,
  multiSelect = false,
  showSelectedAsLabel = true,
  defaultLabel,
  initialItem,
  IconComponent,
  iconProps = {},
  dropdownPosition = 'below',
}: DropdownProps) => {
  const { sx } = useRemirrorTheme();
  const itemToString = (item: DropdownItem) => (item ? item.value : '');
  const onChange = (item: DropdownItem | null) => {
    if (!item) {
      return;
    }

    if (item.onSelect) {
      item.onSelect(item);
      return;
    }
  };
  const [springProps, setSpring] = useSpring(() => ({ opacity: 1 }));

  const activeItems = items.filter(item => item.active);
  // const dropdownPositionStyle =

  return (
    <Downshift
      onChange={onChange}
      selectedItem={multiSelect ? null : activeItems[0] || null}
      initialSelectedItem={initialItem}
      itemToString={itemToString}
    >
      {({ isOpen, getToggleButtonProps, getItemProps, highlightedIndex, selectedItem }) => {
        setSpring({ opacity: isOpen ? 1 : 0 });

        return (
          <div>
            <Button
              active={isOpen}
              variant='background'
              {...getToggleButtonProps()}
              content={showSelectedAsLabel && selectedItem ? selectedItem.label : defaultLabel}
              RightIconComponent={IconComponent ? IconComponent : isOpen ? AngleDownIcon : AngleRightIcon}
              rightIconProps={{ backgroundColor: 'transparent', ...iconProps }}
              fontWeight='normal'
              css={sx({ position: 'relative' })}
            >
              {isOpen ? (
                <animated.div
                  style={springProps}
                  className='remirror-dropdown-item-wrapper'
                  css={sx(
                    {
                      position: 'absolute',
                      minWidth: 'max-content',
                      py: 1,
                      margin: '0 auto',
                      borderRadius: 1,
                      boxShadow: 'card',
                      zIndex: '10',
                    },
                    dropdownPositions[dropdownPosition],
                  )}
                >
                  {items.map((item, index) => (
                    <DropdownItemComponent
                      key={item.value}
                      getItemProps={getItemProps}
                      index={index}
                      item={item}
                      isHighlighted={highlightedIndex === index}
                      isSelected={item === selectedItem}
                    />
                  ))}
                </animated.div>
              ) : null}
            </Button>
          </div>
        );
      }}
    </Downshift>
  );
};

interface DropdownItemProps {
  item: DropdownItem;
  getItemProps: PropGetters<any>['getItemProps'];
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
}

const DropdownItemComponent = ({
  getItemProps,
  index,
  item,
  isHighlighted,
  isSelected,
}: DropdownItemProps) => {
  const { sxx } = useRemirrorTheme();
  const isActive = item.active || isSelected;
  return (
    <div
      {...getItemProps({ key: index, index, item })}
      css={sxx({
        backgroundColor: isActive ? 'grey' : isHighlighted ? 'light' : 'background',
        p: 2,
      })}
    >
      {item.element || item.label}
    </div>
  );
};
