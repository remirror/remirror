import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { FontSizeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';
import {
  CommandButtonGroup,
  CommandMenuItem,
  DecreaseFontSizeButton,
  DropdownButton,
  IncreaseFontSizeButton,
  Toolbar,
} from '@remirror/react-ui';

const extensions = () => [new FontSizeExtension({ defaultSize: '16', unit: 'px' })];

const FONT_SIZES = ['8', '10', '12', '14', '16', '18', '24', '30'];

const FontSizeButtons = () => {
  const { setFontSize } = useCommands();
  const { fontSize } = useActive();
  return (
    <DropdownButton aria-label='Set font size' icon='fontSize'>
      {FONT_SIZES.map((size) => (
        <CommandMenuItem
          key={size}
          commandName='setFontSize'
          onSelect={() => setFontSize(size)}
          enabled={setFontSize.enabled(size)}
          active={fontSize({ size })}
          label={size}
          icon={null}
          displayDescription={false}
        />
      ))}
    </DropdownButton>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Some text to resize</p>',
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
          <CommandButtonGroup>
            <DecreaseFontSizeButton />
            <FontSizeButtons />
            <IncreaseFontSizeButton />
          </CommandButtonGroup>
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
