import { Box } from '@mui/material';
import React, { FC } from 'react';

import { FindController } from './find-controller';
import { FindInput } from './find-input';
import { ReplaceController } from './replace-controller';
import { ReplaceInput } from './replace-input';
import { useFindReplace } from './use-find-replace';

export interface FindReplaceComponentProps {
  onDismiss?: () => void;
}

export const FindReplaceComponent: FC<FindReplaceComponentProps> = ({ onDismiss }) => {
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
      <Box>
        <FindInput query={query} setQuery={setQuery} total={total} activeIndex={activeIndex} />
      </Box>
      <Box sx={{ justifySelf: 'end' }}>
        <FindController
          findPrev={findPrev}
          findNext={findNext}
          toggleCaseSensitive={toggleCaseSensitive}
          caseSensitive={caseSensitive}
          stopFind={stopFind}
          onDismiss={onDismiss}
        />
      </Box>
      <Box>
        <ReplaceInput replacement={replacement} setReplacement={setReplacement} />
      </Box>
      <Box sx={{ justifySelf: 'end' }}>
        <ReplaceController replace={replace} replaceAll={replaceAll} />
      </Box>
    </Box>
  );
};
