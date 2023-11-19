import { Box, IconButton } from '@mui/material';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Icon } from '@remirror/react-components';

import { UiThemeProvider } from '../providers/ui-theme-provider';
import { FindController } from './find-controller';
import { FindInput } from './find-input';
import { ReplaceController } from './replace-controller';
import { ReplaceInput } from './replace-input';
import { useFindReplace } from './use-find-replace';

export interface FindReplaceComponentProps {
  canToggleReplace?: boolean;
  onDismiss?: () => void;
}

export const FindReplaceComponent: FC<FindReplaceComponentProps> = ({
  canToggleReplace = false,
  onDismiss,
}) => {
  const [isReplaceVisible, setIsReplaceVisible] = useState<boolean>(!canToggleReplace);
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

  const handleToggleReplace = useCallback(() => {
    setIsReplaceVisible((bool) => !bool);
  }, []);

  useEffect(() => {
    if (!isReplaceVisible) {
      setReplacement('');
    }
  }, [isReplaceVisible, setReplacement]);

  const label = isReplaceVisible ? 'Hide replace field' : 'Show replace field';

  return (
    <UiThemeProvider>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: canToggleReplace ? 'max-content 1fr max-content' : '1fr max-content',
          gridTemplateRows: isReplaceVisible ? '32px 32px' : '32px',
          rowGap: 1,
          columnGap: 1,
          alignItems: 'center',
        }}
      >
        {canToggleReplace && (
          <Box>
            <IconButton onClick={handleToggleReplace} size='small' title={label} aria-label={label}>
              <Icon name={'arrowRightSFill'} />
            </IconButton>
          </Box>
        )}
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
        {isReplaceVisible && (
          <>
            {canToggleReplace && <Box />}
            <Box>
              <ReplaceInput replacement={replacement} setReplacement={setReplacement} />
            </Box>
            <Box sx={{ justifySelf: 'end' }}>
              <ReplaceController replace={replace} replaceAll={replaceAll} />
            </Box>
          </>
        )}
      </Box>
    </UiThemeProvider>
  );
};
