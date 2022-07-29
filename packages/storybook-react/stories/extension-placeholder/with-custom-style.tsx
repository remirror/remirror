import 'remirror/styles/all.css';
import './styles.css';

import React, { useCallback } from 'react';
import { PlaceholderExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const WithCustomStyle = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({
        placeholder: `I'm a styled placeholder!`,
        emptyNodeClass: 'my-placeholder',
      }),
    ],
    [],
  );
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};

export default WithCustomStyle;
