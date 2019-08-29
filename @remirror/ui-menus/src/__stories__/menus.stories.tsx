import { DropdownItem } from '@remirror/ui-dropdown';
import { ImagesRegularIcon } from '@remirror/ui-icons/lib/editor/images-regular-icon';
import { storiesOf } from '@storybook/react';
import React from 'react';
import useState from 'react-use/lib/useSetState';
import { Menubar } from '..';
import { MenubarContent } from '../menu-bar';

const MenuComponent = () => {
  type BlockType = keyof typeof defaultBlockTypes;

  const defaultBlockTypes = { p: false, h1: false, h2: false };
  const [activeBlockTypes, setActiveBlockTypes] = useState({ ...defaultBlockTypes, p: true });

  const onSelectBlockTypeItem = (item: DropdownItem) => {
    setActiveBlockTypes({ ...defaultBlockTypes, [item.id as BlockType]: true });
  };

  const onClickImageIcon = () => {
    console.log('image icon clicked');
  };

  const content: MenubarContent[] = [
    {
      type: 'group',
      content: [
        {
          minWidth: 150,
          type: 'dropdown',
          label: 'Select block type',
          items: [
            {
              label: 'Normal Text',
              id: 'p',
              onSelect: onSelectBlockTypeItem,
              active: activeBlockTypes.p,
            },
            {
              label: 'Heading 1',
              id: 'h1',
              onSelect: onSelectBlockTypeItem,
              active: activeBlockTypes.h1,
            },
            {
              label: 'Heading 2',
              id: 'h2',
              onSelect: onSelectBlockTypeItem,
              active: activeBlockTypes.h2,
            },
          ],
        },
        {
          type: 'button',
          RightIconComponent: ImagesRegularIcon,
          rightIconProps: { backgroundColor: 'transparent' },
          onClick: onClickImageIcon,
        },
      ],
    },
  ];

  return <Menubar content={content} />;
};

storiesOf('Menus', module).add('Menu Bar', () => <MenuComponent />);
