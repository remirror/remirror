import 'remirror/styles/all.css';

import { FC } from 'react';
import { CountExtension } from '@remirror/extension-count';
import { Remirror, ThemeProvider, useHelpers, useRemirror } from '@remirror/react';

const Counter: FC = () => {
  const { getWordCount } = useHelpers(true);
  const count = getWordCount();

  return (
    <p>
      {count} {count === 1 ? 'word' : 'words'}
    </p>
  );
};

const WordCount: FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new CountExtension()],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='start'>
        <Counter />
      </Remirror>
    </ThemeProvider>
  );
};

export default WordCount;
