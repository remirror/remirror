import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { SearchExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [
  new SearchExtension({
    searchClass: 'my-custom-search-class',
    highlightedClass: 'my-custom-highlighted-class',
  }),
];

const SearchInput = () => {
  const commands = useCommands();

  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div>
      <input
        style={{ width: '280px' }}
        placeholder='Input something and press the search button'
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          commands.search(searchTerm);
        }}
      >
        search
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          commands.searchNext();
        }}
      >
        searchNext
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          commands.searchPrevious();
        }}
      >
        searchPrevious
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const replaceText = window.prompt('Replace search result with:') || '';
          const replaceIndex = Number.parseInt(
            window.prompt('Which search result index you would replace? Please input a number') ||
              '0',
            10,
          );
          commands.replaceSearchResult(replaceText, replaceIndex);
        }}
      >
        replaceSearchResult
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const replaceText = window.prompt('Replace all search results with:') || '';
          commands.replaceAllSearchResults(replaceText);
        }}
      >
        replaceAllSearchResult
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          commands.clearSearch();
        }}
      >
        clearSearch
      </button>
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
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
