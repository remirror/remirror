import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import {
  BlockquoteExtension,
  BulletListExtension,
  NodeFormattingExtension,
} from 'remirror/extensions';
import {
  CommandButtonGroup,
  CommandMenuItem,
  DropdownButton,
  IndentationButtonGroup,
  Remirror,
  TextAlignmentButtonGroup,
  ThemeProvider,
  Toolbar,
  useCommands,
  useRemirror,
} from '@remirror/react';

const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [
      new BlockquoteExtension(),
      new NodeFormattingExtension(),
      new BulletListExtension(),
    ],
    content: '<p>Click buttons to change alignment, indent,<br> and line height</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <Toolbar>
          <TextAlignmentButtonGroup />
          <IndentationButtonGroup />
          <LineHeightButtonDropdown />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

const LineHeightButtonDropdown = () => {
  const { setLineHeight } = useCommands();
  return (
    <CommandButtonGroup>
      <DropdownButton aria-label='Line height' icon='lineHeight'>
        <CommandMenuItem
          commandName='setLineHeight'
          onSelect={() => setLineHeight(1)}
          enabled={setLineHeight.enabled(1)}
          label='Narrow'
        />
        <CommandMenuItem
          commandName='setLineHeight'
          onSelect={() => setLineHeight(2)}
          enabled={setLineHeight.enabled(2)}
          label='Wide'
        />
      </DropdownButton>
    </CommandButtonGroup>
  );
};

export default Basic;
