import { useMeasure, usePrevious } from '@remirror/react-hooks';
import { useRemirrorTheme } from '@remirror/ui';
import { Button } from '@remirror/ui-buttons';
import { AngleDownIcon, AngleRightIcon } from '@remirror/ui-icons';
import { Label } from '@remirror/ui-text';
import { MultishiftPropGetters, Type, useMultishift } from 'multishift';
import React, { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { dropdownPositions } from './dropdown-constants';
import { DropdownItem, DropdownPosition, DropdownProps } from './dropdown-types';
import { transformDropdownPosition } from './dropdown-utils';

/**
 * A dropdown for select components
 */
export const DropdownSelect = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      items,
      multiple = false,
      showSelectedAsLabel = true,
      label,
      showLabel,
      renderLabel,
      initialItem,
      IconComponent,
      iconProps = {},
      dropdownPosition: dropdownPositionProp = 'below left',
      autoPositionY,
      autoPositionYSpace = 20,
      autoPositionX,
      autoPositionXSpace = 5,
      minWidth,
      width = 'max-content',
      disabled,
      initialIsOpen,
      onSelect,
      selectedItems: selectedItemsProp,
      ...props
    },
    ref,
  ) => {
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>(dropdownPositionProp);
    const {
      isOpen,
      getToggleButtonProps,
      getItemProps,
      itemHighlightedAtIndex,
      itemIsSelected,
      getMenuProps,
      getLabelProps,
      selectedItems,
      hoveredIndex,
    } = useMultishift({
      items,
      multiple,
      selectedItems: selectedItemsProp,
      type: Type.Select,
      onSelectedItemsChange: onSelect,
      itemToString: item => item.label,
      getItemId: item => item.id,
    });

    const { sx } = useRemirrorTheme();
    const previous = usePrevious(isOpen);
    const [bind, rect] = useMeasure<HTMLDivElement>();
    const [{ height, opacity, transform }, setSpring] = useSpring(() => ({
      height: 0,
      opacity: 0,
      transform: 'translate3d(20px,0,0)',
    }));
    const buttonRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
      let newDropdownPosition = dropdownPosition;
      if (!buttonRef.current) {
        return;
      }
      const buttonRect = buttonRef.current.getBoundingClientRect();

      if (autoPositionY) {
        const yDirection =
          window.innerHeight - buttonRect.bottom < rect.height + autoPositionYSpace &&
          buttonRect.top > rect.height
            ? 'above'
            : 'below';
        newDropdownPosition = transformDropdownPosition(newDropdownPosition, yDirection);
      }

      if (autoPositionX) {
        const xDirection =
          window.innerWidth - buttonRect.right < rect.width + autoPositionXSpace &&
          buttonRect.left > rect.width
            ? 'left'
            : 'right';
        newDropdownPosition = transformDropdownPosition(newDropdownPosition, xDirection);
      }

      if (newDropdownPosition !== dropdownPosition) {
        setDropdownPosition(newDropdownPosition);
      }
    }, [
      rect.top,
      rect.bottom,
      rect.height,
      dropdownPosition,
      autoPositionY,
      autoPositionX,
      rect.width,
      autoPositionYSpace,
      autoPositionXSpace,
    ]);

    setSpring({
      height: isOpen ? rect.height : 0,
      opacity: isOpen ? 1 : 0,
      transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
    });

    const labelElement = renderLabel ? (
      renderLabel({ getLabelProps, label, selectedItems })
    ) : showLabel && label ? (
      <Label {...getLabelProps()}>{label}</Label>
    ) : null;

    return (
      <div css={sx({ width })} {...props} ref={ref}>
        {labelElement}
        <Button
          active={isOpen}
          variant='background'
          {...getToggleButtonProps({ disabled, ref: buttonRef })}
          content={showSelectedAsLabel && selectedItems[0] ? selectedItems[0].label : label}
          RightIconComponent={IconComponent ? IconComponent : isOpen ? AngleDownIcon : AngleRightIcon}
          rightIconProps={{ backgroundColor: 'transparent', ...iconProps }}
          fontWeight='normal'
          css={sx({ position: 'relative' })}
          minWidth={minWidth}
        >
          <animated.div
            {...getMenuProps({ ...bind })}
            style={{ opacity, height: isOpen && previous === isOpen ? 'auto' : height, transform }}
            className='remirror-dropdown-item-wrapper'
            css={sx(
              {
                position: 'absolute',
                minWidth,
                py: 1,
                margin: '0 auto',
                borderRadius: 1,
                boxShadow: 'card',
                zIndex: '10',
              },
              !isOpen && { display: 'none' },
              dropdownPositions[dropdownPosition],
            )}
          >
            {isOpen &&
              items.map((item, index) => (
                <DropdownItemComponent
                  key={item.id}
                  getItemProps={getItemProps}
                  index={index}
                  item={item}
                  isHighlighted={itemHighlightedAtIndex(index)}
                  isSelected={itemIsSelected(item)}
                  isHovered={hoveredIndex === index}
                />
              ))}
          </animated.div>
        </Button>
      </div>
    );
  },
);

interface DropdownItemProps {
  item: DropdownItem;
  getItemProps: MultishiftPropGetters<DropdownItem>['getItemProps'];
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isHovered: boolean;
}

const DropdownItemComponent = ({
  getItemProps,
  index,
  item,
  isHighlighted,
  isSelected,
  isHovered,
}: DropdownItemProps) => {
  const { sxx } = useRemirrorTheme();
  return (
    <div
      css={sxx({
        backgroundColor: isSelected ? 'grey' : isHighlighted ? 'light' : isHovered ? 'grey' : 'background',
        p: 2,
      })}
      {...getItemProps({ index, item })}
    >
      {item.element || item.label}
    </div>
  );
};
