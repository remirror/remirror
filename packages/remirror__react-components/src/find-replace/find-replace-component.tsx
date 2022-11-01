import { Box, Button, ButtonGroup, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useCommands, useHelpers } from '@remirror/react-core';

import { Icon } from '../icons';
import { MdiFormatLetterCase } from './letter-icon';

interface FindReplaceState {
  searchTerm: string;
  replacement: string;
  activeIndex: number | null;
  total: number;
  caseSensitive: boolean;
}

function initialState(): FindReplaceState {
  return {
    searchTerm: '',
    replacement: '',
    activeIndex: null,
    total: 0,
    caseSensitive: false,
  };
}

function useFindReplace() {
  const helpers = useHelpers();
  const commands = useCommands();
  const [state, setState] = useState<FindReplaceState>(initialState);

  const find = useCallback(
    (indexDiff = 0): void => {
      setState((state): FindReplaceState => {
        const { searchTerm, caseSensitive, activeIndex } = state;
        const result = helpers.findRanges({
          searchTerm,
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
    const { searchTerm, replacement, caseSensitive } = state;
    commands.findAndReplace({ searchTerm, replacement, caseSensitive });
    find();
  }, [commands, state, find]);

  const replaceAll = useCallback((): void => {
    const { searchTerm, replacement, caseSensitive } = state;
    commands.findAndReplaceAll({ searchTerm, replacement, caseSensitive });
    find();
  }, [commands, state, find]);

  const toggleCaseSensitive = () => {
    setState((state) => ({ ...state, caseSensitive: !state.caseSensitive }));
  };
  const setSearchTerm = (searchTerm: string) => {
    setState((state) => ({ ...state, searchTerm }));
  };
  const setReplacement = (replacement: string) => {
    setState((state) => ({ ...state, replacement }));
  };

  useEffect(() => {
    if (state.searchTerm) {
      find();
    }
  }, [find, state.searchTerm, state.caseSensitive]);

  return {
    ...state,
    findNext,
    findPrev,
    stopFind,
    replace,
    replaceAll,

    toggleCaseSensitive,
    setSearchTerm,
    setReplacement,
  };
}

interface SearchCounterProps {
  activeIndex: number;
  totalCount: number;
}

const CounterAdornment: FC<SearchCounterProps> = ({ activeIndex, totalCount }) => {
  return (
    <InputAdornment position='end'>
      {totalCount && activeIndex >= 0 ? activeIndex + 1 : 0} of {totalCount}
    </InputAdornment>
  );
};

export interface FindReplaceComponentProps {
  onStopSearch?: () => void;
}

const FindReplaceComponent: FC<FindReplaceComponentProps> = ({ onStopSearch }) => {
  const {
    searchTerm,
    setSearchTerm,
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

  const searchInput = (
    <OutlinedInput
      fullWidth={true}
      margin='none'
      placeholder='Find'
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          if (event.shiftKey) {
            findPrev();
          } else {
            findNext();
          }
        }
      }}
      sx={{
        '& input': {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      }}
      size='small'
      inputProps={{ 'aria-label': 'Find' }}
      endAdornment={<CounterAdornment activeIndex={activeIndex ?? 0} totalCount={total} />}
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

  const searchController = (
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
          onStopSearch?.();
        }}
        size='small'
      >
        <Icon name={'closeFill'} />
      </IconButton>
    </>
  );

  const replaceController = (
    <ButtonGroup variant='outlined' size='small'>
      <Button aria-label='Relace' sx={{ textTransform: 'none' }} onClick={() => replace()}>
        Replace
      </Button>
      <Button aria-label='Relace all' sx={{ textTransform: 'none' }} onClick={() => replaceAll()}>
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
      <Box>{searchInput}</Box>
      <Box sx={{ justifySelf: 'end' }}>{searchController}</Box>
      <Box>{replaceInput}</Box>
      <Box sx={{ justifySelf: 'end' }}>{replaceController}</Box>
    </Box>
  );
};

export { FindReplaceComponent };
