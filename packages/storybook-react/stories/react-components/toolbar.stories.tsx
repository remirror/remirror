import { wysiwygPreset } from 'remirror/extensions';
import {
  ComponentItem,
  EditorComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
} from '@remirror/react';

import { mediumContent } from './sample-content/medium';

export default { title: 'Components (labs) / Toolbar' };

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleColumns',
        display: 'icon',
        attrs: { count: 2 },
      },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Clipboard',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'copy', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'cut', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'paste', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 3 },
      },
    ],
    separator: 'none',
  },
  {
    type: ComponentItem.ToolbarMenu,
    label: 'Headings',
    items: [
      {
        type: ComponentItem.MenuGroup,
        role: 'radio',
        items: [
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 1 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 2 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 3 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 4 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 5 },
          },
          {
            type: ComponentItem.MenuCommandPane,
            commandName: 'toggleHeading',
            attrs: { level: 6 },
          },
        ],
      },
    ],
  },
];

const extensions = () => [...wysiwygPreset()];

export const FixedToolbar = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: mediumContent,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus placeholder='Enter your text'>
        <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};
