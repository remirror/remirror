import 'remirror/styles/all.css';

import { FC } from 'react';
import { CountExtension } from '@remirror/extension-count';
import { Remirror, ThemeProvider, useHelpers, useRemirror } from '@remirror/react';

const Counter: FC = () => {
  const { getCharacterCount } = useHelpers(true);
  const count = getCharacterCount();

  return (
    <p>
      {count} {count === 1 ? 'character' : 'characters'}
    </p>
  );
};

const Basic: FC = () => {
  const { manager } = useRemirror({ extensions: () => [new CountExtension()] });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='start'>
        <Counter />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
