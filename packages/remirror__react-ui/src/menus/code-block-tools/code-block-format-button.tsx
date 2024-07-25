import { Button, FormControl } from '@mui/material';
import React, { MouseEvent } from 'react';
import { codeBlockPositioner } from '@remirror/extension-code-block';
import { useCommands } from '@remirror/react-core';
import { usePositioner } from '@remirror/react-hooks';

const defaultButtonText = 'format';

export interface CodeBlockFormatButtonProps {
  text?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => boolean;
}

export const CodeBlockFormatButton = ({
  text = defaultButtonText,
  className = '',
  onClick,
}: CodeBlockFormatButtonProps): JSX.Element | null => {
  const { ref, data, active } = usePositioner(codeBlockPositioner, []);
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

  if (!active) {
    return null;
  }

  return (
    <FormControl ref={ref} margin='none' size='small' sx={{ m: 1 }} className={className}>
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
