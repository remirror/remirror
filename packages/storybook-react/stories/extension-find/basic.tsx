import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { FindExtension } from '@remirror/extension-find';
import { Remirror, ThemeProvider, useCommands, useHelpers, useRemirror } from '@remirror/react';

const extensions = () => [new FindExtension({})];

const SearchInput = () => {
  const helpers = useHelpers();
  const commands = useCommands();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [currIndex, setCurrIndex] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [caseSensitive, setCaseSensitive] = React.useState(false);

  const search = (index: number) => {
    const result = helpers.search({ searchTerm, caseSensitive, activeIndex: index });
    setTotal(result.ranges.length);
    setCurrIndex(result.activeIndex ?? 0);
  };

  const clear = () => {
    setSearchTerm('');
    setCurrIndex(0);
    setTotal(0);
    commands.stopSearch();
  };

  return (
    <div>
      <input
        placeholder='Search'
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            search(currIndex);
          }
        }}
      />
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          search(currIndex);
        }}
      >
        Search
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          search(currIndex + 1);
        }}
      >
        Next
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          search(currIndex - 1);
        }}
      >
        Previous
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          clear();
        }}
      >
        Clear
      </button>

      <span>
        {total ? currIndex + 1 : 0} of {total}
      </span>

      <span>
        <input
          type='checkbox'
          id='case-sensitive-checkbox'
          checked={caseSensitive}
          onClick={() => {
            setCaseSensitive((value) => !value);
          }}
        />
        <label htmlFor='case-sensitive-checkbox'>Match case</label>
      </span>
    </div>
  );
};

const ReplaceInput = (): JSX.Element => {
  const [replacement, setReplacement] = React.useState('');
  // const commands = useCommands();

  return (
    <div>
      <input
        placeholder='Replace'
        value={replacement}
        onChange={(event) => setReplacement(event.target.value)}
      />
      {/* TODO */}
      {/* <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.findAndReplace({ replacement })}
      >
        Replace
      </button> */}
      {/* <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.findAndReplaceAll({ replacement })}
      >
        Replace all
      </button> */}
    </div>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>',
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
        <SearchInput />
        <ReplaceInput />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
