import 'remirror/styles/all.css';
import 'react-circular-progressbar/dist/styles.css';

import { FC } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { CountExtension } from '@remirror/extension-count';
import { Remirror, ThemeProvider, useHelpers, useRemirror } from '@remirror/react';

const TWEET_MAX_CHARS = 280;
const INITIAL_CONTENT = `<p>In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.</p>
<p>“Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”</p>
<p></p>`;

const Counter: FC<{ max: number }> = ({ max }) => {
  const { getCharacterCount, isCountValid } = useHelpers(true);
  const count = getCharacterCount();
  const remaining = max - count;

  if (!isCountValid()) {
    return <p style={{ color: 'red' }}>{remaining}</p>;
  }

  return (
    <div style={{ width: '2rem', margin: '0.5rem 0' }}>
      <CircularProgressbar
        value={(count / max) * 100}
        text={`${remaining}`}
        styles={{
          text: {
            fontSize: '2.5rem',
          },
        }}
      />
    </div>
  );
};

const CharacterLimit: FC = () => {
  const { manager, state } = useRemirror({
    extensions: () => [new CountExtension({ maximum: TWEET_MAX_CHARS })],
    content: INITIAL_CONTENT,
    stringHandler: 'html',
    selection: 'end',
  });

  return (
    <ThemeProvider>
      <p>
        A Twitter inspired character counter showing the{' '}
        <strong>number of characters remaining</strong> (using{' '}
        <code>react-circular-progressbar</code>).
      </p>
      <p>
        Note how when we go over the character limit ({TWEET_MAX_CHARS} characters), the text is
        highlighted.
      </p>
      <Remirror manager={manager} initialContent={state} autoRender='start' autoFocus>
        <Counter max={TWEET_MAX_CHARS} />
      </Remirror>
    </ThemeProvider>
  );
};

export default CharacterLimit;
