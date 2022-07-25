import 'remirror/styles/all.css';

import React, { useCallback } from 'react';
import { PlaceholderExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const Basic = (): JSX.Element => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder: `I'm a placeholder!` })],
    [],
  );
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};

export default Basic;
