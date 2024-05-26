import { Button, FormControl } from '@mui/material';
import React, { CSSProperties } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType } from '@remirror/core';
import { PositionerPortal } from '@remirror/react-components';
import { useCommands, useRemirrorContext } from '@remirror/react-core';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

import { UiThemeProvider } from '../providers/ui-theme-provider';
import { createPositioner } from './code-block-utils';

const defaultButtonText = 'Format';

export interface CodeBlockFormatCodeProps {
  text?: string;
  position?: 'left' | 'right';
  offset?: { x: number; y: number };
  className?: string;
}

export const CodeBlockFormatCode = ({
  text = defaultButtonText,
  position = 'right',
  offset = { x: 0, y: 0 },
  className = '',
}: CodeBlockFormatCodeProps): JSX.Element | null => {
  const { ref, x, y, width, active } = usePositioner<FindProsemirrorNodeResult>(
    createPositioner,
    [],
  );
  const { focus, formatCodeBlock } = useCommands();
  const { getState } = useRemirrorContext();
  const { selection } = getState();

  const nodeLanguage = findParentNodeOfType({
    selection,
    types: 'codeBlock',
  })?.node.attrs.language;

  if (!nodeLanguage) {
    return <></>;
  }

  return (
    <UiThemeProvider>
      <PositionerPortal>
        {active && (
          <div
            ref={ref}
            className={ExtensionCodeBlockTheme.FORMAT_CODE_POSITIONER}
            style={
              {
                '--x': position === 'right' ? `${x + width + offset.x}px` : `${x + offset.x}px`,
                '--y': `${y + offset.y}px`,
                '--translate-x': position === 'right' ? '-100%' : '0',
              } as CSSProperties
            }
          >
            <FormControl margin='none' size='small' sx={{ m: 1 }}>
              <Button
                className={className}
                sx={{
                  bgcolor: 'background.paper',
                  ':hover': {
                    bgcolor: 'background.paper',
                  },
                  textTransform: 'none',
                }}
                onClick={() => {
                  formatCodeBlock();
                  focus();
                }}
              >
                {text || defaultButtonText}
              </Button>
            </FormControl>
          </div>
        )}
      </PositionerPortal>
    </UiThemeProvider>
  );
};
