import 'remirror/styles/all.css';

import { FC } from 'react';
import { CountExtension, CountStrategy } from '@remirror/extension-count';
import { Remirror, ThemeProvider, useHelpers, useRemirror } from '@remirror/react';

const MAX_WORDS = 10;
const INITIAL_CONTENT = '<p>One Two Three Four Five Six Seven Eight Nine Ten Eleven</p>';

const Counter: FC<{ max: number }> = ({ max }) => {
  const { getWordCount, isCountValid } = useHelpers(true);
  const count = getWordCount();

  return (
    <p style={{ color: isCountValid() ? 'inherit' : 'red' }}>
      {count} / {max} words
    </p>
  );
};

const WordLimit: FC = () => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new CountExtension({ maximumStrategy: CountStrategy.WORDS, maximum: MAX_WORDS }),
    ],
    content: INITIAL_CONTENT,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <p>An editor limited to 10 words.</p>
      <p>Note how when we go over the word limit, the text is highlighted.</p>
      <Remirror manager={manager} initialContent={state} autoRender='start'>
        <Counter max={MAX_WORDS} />
      </Remirror>
    </ThemeProvider>
  );
};

export default WordLimit;
