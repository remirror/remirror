import { storiesOf } from '@storybook/react';
import React, { useState } from 'react';
import { useMultishift } from '../multishift';

const names = ['Olu', 'Tolu', 'Bemi', 'Jay', 'Raj', 'Li Peng', 'Ryoku', 'Temi', 'Kima'];

const Component = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const onSelectedItemsChange = (items: string[]) => {
    setSelectedItems(items);
  };

  const {
    getMenuProps,
    getItemProps,
    getToggleButtonProps,
    getLabelProps,
    getIgnoredElementProps,
    isOpen,
    itemHighlightedAtIndex,
    hoveredIndex,
    clearSelection,
  } = useMultishift({
    type: 'select',
    multiple: true,
    closeOnSelection: false,
    items: names,
    onSelectedItemsChange,
  });

  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <button {...getToggleButtonProps()}>{`Names (${selectedItems.length})`}</button>
      <button {...getIgnoredElementProps({ onClick: () => clearSelection() })}>Clear</button>
      <ul {...getMenuProps()} style={{ height: 100, overflowY: 'scroll' }}>
        {isOpen &&
          names.map((name, index) => (
            <li
              style={{
                userSelect: 'none',
                fontWeight: selectedItems.includes(name) ? 'bold' : 'normal',
                ...(itemHighlightedAtIndex(index) || hoveredIndex === index
                  ? { backgroundColor: '#bde4ff' }
                  : {}),
              }}
              key={`${name}${index}`}
              {...getItemProps({ item: name, index, disabled: name === 'Bemi' })}
            >
              {name}
            </li>
          ))}
      </ul>
    </div>
  );
};

const Component2 = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const onSelectedItemsChange = (items: string[]) => {
    setSelectedItems(items);
  };

  const {
    getMenuProps,
    getItemProps,
    getToggleButtonProps,
    getLabelProps,
    getIgnoredElementProps,
    isOpen,
    itemHighlightedAtIndex,
    hoveredIndex,
    clearSelection,
  } = useMultishift({
    type: 'select',
    closeOnSelection: false,
    items: names,
    onSelectedItemsChange,
  });

  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <button {...getToggleButtonProps()}>{`Names (${selectedItems.length})`}</button>
      <button {...getIgnoredElementProps({ onClick: () => clearSelection() })}>Clear</button>
      <ul {...getMenuProps()} style={{ height: 100, overflowY: 'scroll' }}>
        {isOpen &&
          names.map((option, index) => (
            <li
              style={{
                userSelect: 'none',
                fontWeight: selectedItems.includes(option) ? 'bold' : 'normal',
                ...(itemHighlightedAtIndex(index) || hoveredIndex === index
                  ? { backgroundColor: '#bde4ff' }
                  : {}),
              }}
              key={`${option}${index}`}
              {...getItemProps({ item: option, index })}
            >
              {option}
            </li>
          ))}
      </ul>
    </div>
  );
};

storiesOf('Multishift', module)
  .add('Multiple Select', () => <Component />)
  .add('Single Select', () => <Component2 />);
