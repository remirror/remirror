import { isFunction } from '@remirror/core-helpers';
import { useCombinedRefs, useMeasure, usePrevious } from '@remirror/react-hooks';
import { useRemirrorTheme } from '@remirror/ui';
import { Button } from '@remirror/ui-buttons';
import { AngleDownIcon, AngleRightIcon } from '@remirror/ui-icons';
import { Label } from '@remirror/ui-text';
import Downshift, { ControllerStateAndHelpers, PropGetters } from 'downshift';
import React, { forwardRef, Ref } from 'react';
import { animated, useSpring } from 'react-spring';
import { dropdownPositions } from './dropdown-constants';
import { DropdownItem, DropdownProps } from './dropdown-types';

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>((props, ref) => {
  return (
    <Downshift
      onSelect={props.onSelect}
      selectedItem={null}
      initialSelectedItem={props.initialItem}
      itemToString={item => item.value}
      initialIsOpen={props.initialIsOpen}
    >
      {({ getRootProps, ...params }) => {
        const { ref: downshiftRef, ...rootProps } = getRootProps();
        const refFn: Ref<HTMLDivElement> = instance => {
          downshiftRef(instance);
          if (isFunction(ref)) {
            ref(instance);
          } else if (ref) {
            (ref as any).current = instance;
          }
        };

        return <InnerDropdown ref={refFn} downshift={params} {...rootProps} {...props} />;
      }}
    </Downshift>
  );
});

interface InnerDropdownProps extends DropdownProps {
  downshift: Omit<ControllerStateAndHelpers<DropdownItem>, 'getRootProps'>;
}

const InnerDropdown = forwardRef<HTMLDivElement, InnerDropdownProps>(
  (
    {
      downshift,
      items,
      multiSelect = false,
      showSelectedAsLabel = true,
      label,
      showLabel,
      renderLabel,
      initialItem,
      IconComponent,
      iconProps = {},
      dropdownPosition = 'below left',
      minWidth,
      width = 'max-content',
      disabled,
      initialIsOpen,
      onSelect,
      selectedItems,
      ...props
    },
    ref,
  ) => {
    const {
      isOpen,
      getToggleButtonProps,
      getItemProps,
      highlightedIndex,
      selectedItem,
      getMenuProps,
      getLabelProps,
    } = downshift;
    const { sx } = useRemirrorTheme();
    const previous = usePrevious(isOpen);
    const [bind, { height: viewHeight }] = useMeasure();
    const [{ height, opacity, transform }, setSpring] = useSpring(() => ({
      height: 0,
      opacity: 0,
      transform: 'translate3d(20px,0,0)',
    }));

    setSpring({
      height: isOpen ? viewHeight : 0,
      opacity: isOpen ? 1 : 0,
      transform: `translate3d(${isOpen ? 0 : 20}px,0,0)`,
    });

    const labelElement = renderLabel ? (
      renderLabel({ getLabelProps, label, selectedItems })
    ) : showLabel && label ? (
      <Label {...getLabelProps()}>{label}</Label>
    ) : null;

    const combineRefs = useCombinedRefs<HTMLDivElement>();

    return (
      <div css={sx({ width })} {...props} ref={ref}>
        {labelElement}
        <Button
          active={isOpen}
          variant='background'
          {...getToggleButtonProps({ disabled })}
          content={showSelectedAsLabel && selectedItem ? selectedItem.label : label}
          RightIconComponent={IconComponent ? IconComponent : isOpen ? AngleDownIcon : AngleRightIcon}
          rightIconProps={{ backgroundColor: 'transparent', ...iconProps }}
          fontWeight='normal'
          css={sx({ position: 'relative' })}
          minWidth={minWidth}
        >
          <animated.div
            {...combineRefs(getMenuProps(), bind)}
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
                  isHighlighted={highlightedIndex === index}
                  isSelected={item === selectedItem}
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
