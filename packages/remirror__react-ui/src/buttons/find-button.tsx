import styled from '@emotion/styled';
import { ClickAwayListener, Paper } from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { PositionerPortal } from '@remirror/react-components';
import { usePositioner } from '@remirror/react-hooks';

import { FindReplaceComponent } from '../find-replace';
import { CommandButton, CommandButtonProps } from './command-button';

const Menu = styled.div`
  min-width: 30rem;
  max-width: 100%;
  position: absolute;
`;

export interface FindButtonProps
  extends Omit<CommandButtonProps, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'> {}

export const FindButton: FC<FindButtonProps> = (props) => {
  const [showFind, setShowFind] = useState<boolean>(false);

  const { ref, y, active } = usePositioner('editor');

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
          <Menu ref={ref} style={{ top: y, right: 0 }}>
            <ClickAwayListener onClickAway={hideFind}>
              <Paper sx={{ m: 1, p: 1 }} elevation={3}>
                <FindReplaceComponent canToggleReplace onDismiss={hideFind} />
              </Paper>
            </ClickAwayListener>
          </Menu>
        )}
      </PositionerPortal>
    </>
  );
};
