import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { PositionerPortal } from '@remirror/react-components';
import { usePositioner } from '@remirror/react-hooks';

import { FindReplaceComponent } from '../find-replace';
import { CommandButton, CommandButtonProps } from './command-button';

const EditorViewport = styled.div`
  position: absolute;
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;

export interface FindButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const FindButton: FC<FindButtonProps> = (props) => {
  const [showFind, setShowFind] = useState<boolean>(false);

  const { ref, x, y, width, height, active } = usePositioner('editor');

  const handleSelect = useCallback(() => {
    setShowFind((bool) => !bool);
  }, []);

  const hideFind = useCallback(() => {
    setShowFind(false);
  }, []);

  return (
    <>
      <CommandButton
        aria-label='Search in document'
        icon='searchLine'
        {...props}
        commandName='find'
        active={showFind}
        enabled
        onSelect={handleSelect}
      />

      <PositionerPortal>
        {active && showFind && (
          <EditorViewport ref={ref} style={{ left: x, top: y, width, height }}>
            <Paper
              elevation={3}
              sx={{
                m: 1,
                p: 1,
                width: 'var(--rmr-space-8)',
                maxWidth: '100%',
                pointerEvents: 'all',
              }}
            >
              <FindReplaceComponent canToggleReplace onDismiss={hideFind} />
            </Paper>
          </EditorViewport>
        )}
      </PositionerPortal>
    </>
  );
};
