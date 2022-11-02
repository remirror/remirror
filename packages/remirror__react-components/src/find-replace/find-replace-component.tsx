import { Box, Button, ButtonGroup, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import React, { FC, useCallback, useEffect, useState } from 'react';
import type { FindExtension } from '@remirror/extension-find';
import { useCommands, useHelpers } from '@remirror/react-core';

import { Icon } from '../icons';
import { MdiFormatLetterCase } from './letter-icon';

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
    if (state.query) {
      find();
    }
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

export interface FindReplaceComponentProps {
  onDismiss?: () => void;
}

const FindReplaceComponent: FC<FindReplaceComponentProps> = ({ onDismiss }) => {
  const {
    query,
    setQuery,
    activeIndex,
    total,
    caseSensitive,
    replacement,
    setReplacement,
    toggleCaseSensitive,
    findNext,
    findPrev,
    stopFind,
    replace,
    replaceAll,
  } = useFindReplace();

  const counterLabel = `${total && activeIndex != null ? activeIndex + 1 : 0} of ${total}`;

  const findInput = (
    <OutlinedInput
      fullWidth={true}
      margin='none'
      placeholder='Find'
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      sx={{
        '& input': {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      }}
      size='small'
      inputProps={{ 'aria-label': 'Find' }}
      endAdornment={<InputAdornment position='end'>{counterLabel}</InputAdornment>}
    />
  );

  const replaceInput = (
    <OutlinedInput
      fullWidth={true}
      margin='none'
      placeholder='Replace'
      value={replacement}
      onChange={(event) => setReplacement(event.target.value)}
      sx={{
        '& input': {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      }}
      size='small'
      inputProps={{ 'aria-label': 'Replace' }}
    />
  );

  const findController = (
    <>
      <IconButton
        onClick={findPrev}
        size='small'
        title='Next Match (Enter)'
        aria-label='Next Match (Enter)'
      >
        <Icon name={'arrowLeftSFill'} />
      </IconButton>
      <IconButton
        onClick={findNext}
        size='small'
        title='Previous Match (Shift+Enter)'
        aria-label='Previous Match (Shift+Enter)'
      >
        <Icon name={'arrowRightSFill'} />
      </IconButton>
      <IconButton
        onClick={toggleCaseSensitive}
        size='small'
        color={caseSensitive ? 'primary' : 'default'}
        title='Match Case'
        aria-label='Match Case'
      >
        <MdiFormatLetterCase />
      </IconButton>
      <IconButton
        onClick={() => {
          stopFind();
          onDismiss?.();
        }}
        size='small'
      >
        <Icon name={'closeFill'} />
      </IconButton>
    </>
  );

  const replaceController = (
    <ButtonGroup variant='outlined' size='small'>
      <Button aria-label='Relace' sx={{ textTransform: 'none' }} onClick={replace}>
        Replace
      </Button>
      <Button aria-label='Relace all' sx={{ textTransform: 'none' }} onClick={replaceAll}>
        All
      </Button>
    </ButtonGroup>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr max-content',
        gridTemplateRows: '1fr 1fr',
        rowGap: 1,
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      <Box>{findInput}</Box>
      <Box sx={{ justifySelf: 'end' }}>{findController}</Box>
      <Box>{replaceInput}</Box>
      <Box sx={{ justifySelf: 'end' }}>{replaceController}</Box>
    </Box>
  );
};

export { FindReplaceComponent };
