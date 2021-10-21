import 'remirror/styles/all.css';

import React from 'react';
import { IframeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const AddIframeButton = () => {
  const commands = useCommands();
  const handleClick = () =>
    commands.addIframe({ src: 'https://remirror.io/', height: 250, width: 500 });
  return <button onClick={handleClick}>Add iframe</button>;
};

const Basic: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension()],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddIframeButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
