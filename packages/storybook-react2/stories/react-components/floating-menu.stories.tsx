import React from 'react';
import { ColumnsExtension, wysiwygPreset } from 'remirror/extensions';
import {
  ComponentItem,
  EditorComponent,
  FloatingActionsMenu,
  FloatingToolbar,
  MenuActionItemUnion,
  Remirror,
  ThemeProvider,
  ToolbarItemUnion,
  useRemirror,
} from '@remirror/react';

import { hugeContent } from './sample-content/huge';

export default { title: 'Components (labs) / Floating Menu' };

const floatingActions: MenuActionItemUnion[] = [
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 1 },
    tags: ['heading', '1', 'one'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 1 },
    tags: ['heading', '1', 'one'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 2 },
    tags: ['heading', '2', 'two'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 3 },
    tags: ['heading', '3', 'three'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 4 },
    tags: ['heading', '4', 'four'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 5 },
    tags: ['heading', '5', 'five'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 6 },
    tags: ['heading', '6', 'six'],
  },
  { type: ComponentItem.MenuCommandAction, commandName: 'toggleBold', tags: ['bold'] },
  { type: ComponentItem.MenuCommandAction, commandName: 'toggleItalic', tags: ['italic'] },
  { type: ComponentItem.MenuCommandAction, commandName: 'toggleUnderline', tags: ['underline'] },
];

const floatingToolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleUnderline', display: 'icon' },
    ],
  },
];

const extensions = () => [...wysiwygPreset(), new ColumnsExtension()];

const floatingBlockToolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
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
  },
];

export const FloatingBlockNodeEditor = () => {
  const { manager, state } = useRemirror({
    extensions,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <FloatingToolbar
          items={floatingBlockToolbarItems}
          placement='right-end'
          positioner='emptyBlockStart'
        />
      </Remirror>
    </ThemeProvider>
  );
};

export const ActionsEditor = () => {
  const { manager, state } = useRemirror({
    extensions,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <FloatingActionsMenu actions={floatingActions} />
      </Remirror>
    </ThemeProvider>
  );
};

export const EditorWithLotsOfContent = () => {
  const { manager, state } = useRemirror({
    extensions,
    selection: 'end',
    content: hugeContent,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <FloatingToolbar items={floatingToolbarItems} positioner='selection' />
      </Remirror>
    </ThemeProvider>
  );
};
