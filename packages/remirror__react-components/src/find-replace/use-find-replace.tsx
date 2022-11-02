import { useCallback, useEffect, useState } from 'react';
import type { FindExtension } from '@remirror/extension-find';
import { useCommands, useHelpers } from '@remirror/react-core';

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

type UseFindReplaceReturn = FindReplaceState & {
  findNext: () => void;
  findPrev: () => void;
  stopFind: () => void;
  replace: () => void;
  replaceAll: () => void;
  toggleCaseSensitive: () => void;
  setQuery: (query: string) => void;
  setReplacement: (replacement: string) => void;
};

export function useFindReplace(): UseFindReplaceReturn {
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
    const { query, replacement, caseSensitive } = state;
    commands.findAndReplace({ query, replacement, caseSensitive });
    find();
  }, [commands, state, find]);

  const replaceAll = useCallback((): void => {
    const { query, replacement, caseSensitive } = state;
    commands.findAndReplaceAll({ query, replacement, caseSensitive });
    find();
  }, [commands, state, find]);

  const toggleCaseSensitive = useCallback(() => {
    setState((state) => ({ ...state, caseSensitive: !state.caseSensitive }));
  }, []);
  const setQuery = useCallback((query: string) => {
    setState((state) => ({ ...state, query }));
  }, []);
  const setReplacement = useCallback((replacement: string) => {
    setState((state) => ({ ...state, replacement }));
  }, []);

  useEffect(() => {
    find();
  }, [find, commands, state.query, state.caseSensitive]);

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
