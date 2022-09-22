import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { FontFamilyExtension } from 'remirror/extensions';
import {
  CommandButtonGroup,
  CommandMenuItem,
  DropdownButton,
  Remirror,
  ThemeProvider,
  Toolbar,
  useActive,
  useCommands,
  useRemirror,
} from '@remirror/react';

const extensions = () => [new FontFamilyExtension()];

const FONT_FAMILIES: Array<[React.CSSProperties['fontFamily'], string]> = [
  ['serif', 'Serif'],
  ['sans-serif', 'San serif'],
  ['cursive', 'Cursive'],
  ['fantasy', 'Fantasy'],
];

const FontFamilyButtons = () => {
  const { setFontFamily } = useCommands();
  const active = useActive();
  return (
    <CommandButtonGroup>
      <DropdownButton aria-label='Font family' icon='text'>
        {FONT_FAMILIES.map(([fontFamily, label]) => (
          <CommandMenuItem
            key={fontFamily}
            commandName='setFontFamily'
            onSelect={() => setFontFamily(fontFamily as string)}
            enabled={setFontFamily.enabled(fontFamily as string)}
            active={active.fontFamily({ fontFamily })}
            label={<span style={{ fontFamily }}>{label}</span>}
          />
        ))}
      </DropdownButton>
    </CommandButtonGroup>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content:
      '<p>Some text in <span style=" font-family:serif" data-font-family="serif">serif</span></p>',
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
          <FontFamilyButtons />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
