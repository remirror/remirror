import { FC } from 'react';
import { ComponentItem, FloatingToolbar, ToolbarItemUnion } from '@remirror/react';

const floatingToolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
    ],
  },
];

/**
 * Bubble menu for the pre-packaged editors
 */
export const BubbleMenu: FC = () => {
  return <FloatingToolbar items={floatingToolbarItems} positioner='selection' placement='bottom' />;
};
