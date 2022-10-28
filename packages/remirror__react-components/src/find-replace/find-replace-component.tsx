import { Box, Button, ButtonGroup, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import React, { FC, useEffect } from 'react';
import { useCommands, useHelpers } from '@remirror/react-core';

import { Icon } from '../icons';
import { MdiFormatLetterCase } from './letter-icon';

function useSearch() {
  const helpers = useHelpers();
  const commands = useCommands();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currIndex, setCurrIndex] = React.useState(-1);
  const [total, setTotal] = React.useState(0);
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [replacement, setReplacement] = React.useState('');

  const search = (index: number) => {
    const result = helpers.search({ searchTerm, caseSensitive, activeIndex: index });
    setTotal(result.ranges.length);
    setCurrIndex(result.activeIndex ?? -1);
  };

  const searchNext = () => {
    search(currIndex + 1);
  };

  const searchPrevious = () => {
    search(currIndex - 1);
  };

  const searchCurrent = () => {
    search(currIndex);
  };

  const stopSearch = () => {
    setSearchTerm('');
    setCurrIndex(-1);
    setTotal(0);
    commands.stopSearch();
  };

  const replace = () => {
    commands.replaceSearchResult({ replacement });
  };

  const replaceAll = () => {
    commands.replaceAllSearchResults({ replacement });
  };

  useEffect(() => {
    if (searchTerm) {
      searchCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseSensitive]);

  return {
    searchTerm,
    setSearchTerm,
    currIndex,
    total,
    caseSensitive,
    setCaseSensitive,
    replacement,
    setReplacement,
    searchCurrent,
    searchNext,
    searchPrevious,
    stopSearch,
    replace,
    replaceAll,
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
    currIndex,
    total,
    caseSensitive,
    replacement,
    setReplacement,
    setCaseSensitive,
    searchNext,
    searchPrevious,
    stopSearch,
    replace,
    replaceAll,
  } = useSearch();

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
            searchPrevious();
          } else {
            searchNext();
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
      endAdornment={<CounterAdornment activeIndex={currIndex} totalCount={total} />}
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
        onClick={() => searchPrevious()}
        size='small'
        title='Next Match (Enter)'
        aria-label='Next Match (Enter)'
      >
        <Icon name={'arrowLeftSFill'} />
      </IconButton>
      <IconButton
        onClick={() => searchNext()}
        size='small'
        title='Previous Match (Shift+Enter)'
        aria-label='Previous Match (Shift+Enter)'
      >
        <Icon name={'arrowRightSFill'} />
      </IconButton>
      <IconButton
        onClick={() => {
          setCaseSensitive((value) => !value);
        }}
        size='small'
        color={caseSensitive ? 'primary' : 'default'}
        title='Match Case'
        aria-label='Match Case'
      >
        <MdiFormatLetterCase />
      </IconButton>
      <IconButton
        onClick={() => {
          stopSearch();
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
