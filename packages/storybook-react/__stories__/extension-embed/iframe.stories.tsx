import 'remirror/styles/all.css';

import React from 'react';
import { IframeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Embed' };

const AddIframeButton = () => {
  const commands = useCommands();
  const handleClick = () =>
    commands.addIframe({ src: 'https://remirror.io/', height: 250, width: 500 });
  return <button onClick={handleClick}>Add iframe</button>;
};

export const Basic: React.FC = () => {
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

export const Resizable: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true })],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddIframeButton />
      </Remirror>
    </ThemeProvider>
  );
};

const AddYoutubeButton = () => {
  const commands = useCommands();
  const handleClick = () => commands.addYouTubeVideo({ video: 'Zi7sRMcJT-o', startAt: 450 });
  return <button onClick={handleClick}>Add video</button>;
};

export const Youtube: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true })],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddYoutubeButton />
      </Remirror>
    </ThemeProvider>
  );
};
