import { Button, FormControl } from '@mui/material';
import React, { MouseEvent } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { useCommands } from '@remirror/react-core';
import type { UsePositionerReturn } from '@remirror/react-hooks';

const defaultButtonText = 'format';

export interface FormatButtonProps {
  positioner: UsePositionerReturn<FindProsemirrorNodeResult>;
  text?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => boolean;
}

export const FormatButton = ({
  positioner,
  text = defaultButtonText,
  className = '',
  onClick,
}: FormatButtonProps): JSX.Element | null => {
  const { data, active } = positioner;
  const { focus, formatCodeBlock } = useCommands();

  const nodeLanguage: string | undefined = active ? data.node.attrs.language : undefined;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (onClick?.(e)) {
      return;
    }

    if (!nodeLanguage) {
      return;
    }

    formatCodeBlock();
    focus();
  };

  return (
    <FormControl margin='none' size='small' sx={{ m: 1 }} className={className}>
      <Button
        type='button'
        color='primary'
        sx={{
          bgcolor: 'background.paper',
          ':hover': {
            bgcolor: 'background.paper',
          },
          textTransform: 'none',
          fontSize: '1rem',
          color: 'currentColor',
        }}
        onClick={handleClick}
      >
        {text || defaultButtonText}
      </Button>
    </FormControl>
  );
};
