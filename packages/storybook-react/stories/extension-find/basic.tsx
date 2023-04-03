import 'remirror/styles/all.css';

import React, { useCallback, useEffect, useState } from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { FindExtension } from '@remirror/extension-find';
import { Remirror, ThemeProvider, useCommands, useHelpers, useRemirror } from '@remirror/react';

const extensions = () => [new FindExtension({})];

interface FindReplaceState {
  query: string;
  replacement: string;
  activeIndex: number | null;
  total: number;
  caseSensitive: boolean;
}

function initialState(): FindReplaceState {
  return {
    query: '',
    replacement: '',
    activeIndex: null,
    total: 0,
    caseSensitive: false,
  };
}

function useFindReplace() {
  const helpers = useHelpers<FindExtension>();
  const commands = useCommands<FindExtension>();
  const [state, setState] = useState<FindReplaceState>(initialState);

  const find = useCallback(
    (indexDiff = 0): void => {
      setState((state): FindReplaceState => {
        const { query, caseSensitive, activeIndex } = state;
        const result = helpers.findRanges({
          query,
          caseSensitive,
          activeIndex: activeIndex == null ? 0 : activeIndex + indexDiff,
        });
        return { ...state, total: result.ranges.length, activeIndex: result.activeIndex ?? 0 };
      });
    },
    [helpers],
  );

  const findNext = useCallback(() => find(+1), [find]);
  const findPrev = useCallback(() => find(-1), [find]);

  const stopFind = useCallback(() => {
    setState(initialState());
    commands.stopFind();
  }, [commands]);

  const replace = useCallback((): void => {
    const { query, replacement, caseSensitive, activeIndex } = state;
    const index = activeIndex as number;
    commands.findAndReplace({ query, replacement, caseSensitive, index });

    const isQuerySubsetOfReplacement = caseSensitive
      ? replacement.includes(query)
      : replacement.toLowerCase().includes(query.toLowerCase());

    if (isQuerySubsetOfReplacement) {
      findNext();
    } else {
      find();
    }
  }, [commands, state, find, findNext]);

  const replaceAll = useCallback((): void => {
    const { query, replacement, caseSensitive } = state;
    commands.findAndReplaceAll({ query, replacement, caseSensitive });
    find();
  }, [commands, state, find]);

  const toggleCaseSensitive = useCallback(() => {
    setState((state) => {
      return { ...state, caseSensitive: !state.caseSensitive };
    });
  }, []);
  const setQuery = useCallback((query: string) => {
    setState((state) => ({ ...state, query }));
  }, []);
  const setReplacement = useCallback((replacement: string) => {
    setState((state) => ({ ...state, replacement }));
  }, []);

  useEffect(() => {
    find();
  }, [find, state.query, state.caseSensitive]);

  return {
    ...state,
    findNext,
    findPrev,
    stopFind,
    replace,
    replaceAll,

    toggleCaseSensitive,
    setQuery,
    setReplacement,
  };
}

const FindReplace = (): JSX.Element => {
  const {
    query,
    setQuery,
    findNext,
    findPrev,
    stopFind,
    total,
    activeIndex,
    caseSensitive,
    toggleCaseSensitive,
    replace,
    replaceAll,
    replacement,
    setReplacement,
  } = useFindReplace();

  return (
    <div>
      <div>
        <input
          placeholder='Search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button onMouseDown={(event) => event.preventDefault()} onClick={findNext}>
          Next
        </button>
        <button onMouseDown={(event) => event.preventDefault()} onClick={findPrev}>
          Previous
        </button>
        <button onMouseDown={(event) => event.preventDefault()} onClick={stopFind}>
          Clear
        </button>

        <span>
          {total && activeIndex != null ? activeIndex + 1 : 0} of {total}
        </span>

        <span>
          <input
            type='checkbox'
            id='case-sensitive-checkbox'
            checked={caseSensitive}
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleCaseSensitive}
          />
          <label htmlFor='case-sensitive-checkbox'>Match case</label>
        </span>
      </div>
      <div>
        <input
          placeholder='Replace'
          value={replacement}
          onChange={(event) => setReplacement(event.target.value)}
        />
        <button onMouseDown={(event) => event.preventDefault()} onClick={replace}>
          Replace
        </button>
        <button onMouseDown={(event) => event.preventDefault()} onClick={replaceAll}>
          Replace all
        </button>
      </div>
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
        <FindReplace />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
