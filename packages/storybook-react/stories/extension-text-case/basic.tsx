import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { TextCaseExtension } from 'remirror/extensions';
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

const extensions = () => [new TextCaseExtension()];

const TEXT_CASES: Array<[React.CSSProperties['textTransform'], string]> = [
  ['none', 'None'],
  ['uppercase', 'Upper'],
  ['lowercase', 'Lower'],
  ['capitalize', 'Capitalize'],
];

const TextCaseButton = () => {
  const { setTextCase } = useCommands();
  const { textCase } = useActive();
  return (
    <CommandButtonGroup>
      <DropdownButton aria-label='Text case' icon='fontSize2'>
        {TEXT_CASES.map(([casing, label]) => (
          <CommandMenuItem
            key={casing}
            commandName='setTextCase'
            onSelect={() => setTextCase(casing as string)}
            enabled={setTextCase.enabled(casing as string)}
            active={textCase({ casing })}
            label={<span style={{ textTransform: casing }}>{label}</span>}
          />
        ))}
        <CommandMenuItem
          commandName='setTextCase'
          onSelect={() => setTextCase('small-caps')}
          enabled={setTextCase.enabled('small-caps')}
          active={textCase({ casing: 'small-caps' })}
          label={<span style={{ fontVariant: 'small-caps' }}>Small caps</span>}
        />
      </DropdownButton>
    </CommandButtonGroup>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<p>Some text</p>`,
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
          <TextCaseButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
