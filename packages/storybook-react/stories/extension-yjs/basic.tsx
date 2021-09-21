import 'remirror/styles/all.css';

import { AnnotationExtension, PlaceholderExtension, YjsExtension } from 'remirror/extensions';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const ydoc = new Y.Doc();
// clients connected to the same room-name share document updates
const provider = new WebrtcProvider('remirror-yjs-demo', ydoc);

const extensions = () => [
  new AnnotationExtension(),
  new PlaceholderExtension({ placeholder: 'Open second tab and start to type...' }),
  new YjsExtension({ getProvider: () => provider }),
];

const Basic = (): JSX.Element => {
  const { manager } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus autoRender='end' />
    </ThemeProvider>
  );
};

export default Basic;
