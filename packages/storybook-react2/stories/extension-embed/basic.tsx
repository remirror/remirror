import 'remirror/styles/all.css';

import React, {
  ChangeEventHandler,
  FormEventHandler,
  MouseEventHandler,
  useCallback,
  useState,
} from 'react';
import { IframeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const AddIframeButton = () => {
  const { addIframe } = useCommands();
  const [href, setHref] = useState<string>('https://remirror.io');

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setHref(e.target.value);
  }, []);

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      addIframe({ src: href, height: 250, width: 500 });
      setHref('');
    },
    [addIframe, href],
  );

  return (
    <form onSubmit={handleSubmit}>
      <input type='url' placeholder='Enter link...' value={href} onChange={handleChange} required />
      <button type='submit' onMouseDown={handleMouseDown}>
        Add iframe
      </button>
    </form>
  );
};

const Basic: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension()],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end' autoFocus>
        <AddIframeButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
