import 'remirror/styles/all.css';

import React from 'react';
import { IframeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const AddYoutubeButton = () => {
  const commands = useCommands();
  const handleClick = () => commands.addYouTubeVideo({ video: 'Zi7sRMcJT-o', startAt: 450 });
  return (
    <button onMouseDown={(event) => event.preventDefault()} onClick={handleClick}>
      Add video
    </button>
  );
};

const Youtube: React.FC = () => {
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

export default Youtube;
