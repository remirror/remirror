import Downshift, { DownshiftProps, DownshiftState } from 'downshift';
import React, { createContext, FC, ReactElement, ReactNode, useContext, useState } from 'react';

// const DownshiftContext = createContext<DownshiftState<any> | null>(null);

// interface DownshiftProviderProps<GItem = any> extends Omit<DownshiftProps<GItem>, 'children'> {
//   children?: ReactNode;
// }

// const DownshiftProvider: <GItem = any>(
//   props: DownshiftProviderProps<GItem>,
// ) => ReactElement<DownshiftProviderProps<GItem>> = ({ children, ...props }) => (
//   <Downshift {...props}>
//     {value => (
//       <div>
//         <DownshiftContext.Provider value={value}>{children}</DownshiftContext.Provider>
//       </div>
//     )}
//   </Downshift>
// );

// const useDownshift = () => {
//   const downshiftParams = useContext(DownshiftContext);

//   if (!downshiftParams) {
//     throw new Error('No context found for downshift');
//   }

//   return downshiftParams;
// };

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
  onSelect: (item: DropdownItem) => void;
}

export interface DropdownProps {
  /**
   * The list of items available for this dropdown.
   */
  items: DropdownItem[];

  /**
   * The value when the dropdown is first rendered. Defaults to
   * the first item in the list.
   */
  initialValue?: string;
}

export const DropDown = ({ items, initialValue = '' }: DropdownProps) => {
  const itemToString = (item: DropdownItem) => item.value;
  const [selected, setSelected] = useState(initialValue);

  const onChange = (item: DropdownItem | null) => {
    if (item) {
      setSelected(item.value);
    }
  };

  return (
    <Downshift onChange={onChange} selectedItem={selected} itemToString={itemToString}>
      {({ isOpen, getToggleButtonProps, getItemProps, highlightedIndex, selectedItem: dsSelectedItem }) => (
        <div>
          <button className='dropdown-button' {...getToggleButtonProps()}>
            {this.state.selectedBook !== '' ? this.state.selectedBook : 'Select a book ...'}
          </button>
          <div style={{ position: 'relative' }}>
            // if the input element is open, render the div else render nothing
            {isOpen ? (
              <div className='downshift-dropdown'>
                {// map through all the books and render them
                this.books.map((item, index) => (
                  <div
                    className='dropdown-item'
                    {...getItemProps({ key: index, index, item })}
                    style={{
                      backgroundColor: highlightedIndex === index ? 'lightgray' : 'white',
                      fontWeight: dsSelectedItem === item ? 'bold' : 'normal',
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Downshift>
  );
};
