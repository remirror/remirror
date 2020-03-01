import { DropdownItem } from '@remirror/ui-dropdown';
import { ImagesRegularIcon } from '@remirror/ui-icons';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import useState from 'react-use/lib/useSetState';

import { MenubarContent } from '../menu-bar';
import { Menubar } from '..';

const MenuComponent = () => {
  const blockTypeItems = [
    { label: 'Normal Text', id: 'p' },
    { label: 'Heading 1', id: 'h1' },
    { label: 'Heading 2', id: 'h2' },
  ];
  const [selectedBlockType, setActiveBlockType] = useState<DropdownItem>(blockTypeItems[0]);

  const onSelectBlockTypeItem = (item: DropdownItem[]) => {
    setActiveBlockType(item[0]);
  };

  const content: MenubarContent[] = [
    {
      type: 'group',
      content: [
        {
          multiple: false,
          minWidth: 150,
          type: 'dropdown',
          label: 'Select block type',
          selectedItems: [selectedBlockType],
          onSelect: onSelectBlockTypeItem,
          items: blockTypeItems,
        },
        {
          type: 'button',
          RightIconComponent: ImagesRegularIcon,
          rightIconProps: { backgroundColor: 'transparent' },
          onClick: action('clicked image icon'),
        },
      ],
    },
  ];

  return <Menubar content={content} />;
};

storiesOf('Menus', module).add('Menu Bar', () => <MenuComponent />);
