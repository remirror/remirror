import 'remirror/styles/all.css';

import { AnnotationExtension, PlaceholderExtension, YjsExtension } from 'remirror/extensions';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import {
  Remirror,
  ThemeProvider,
  useCommands,
  useCurrentSelection,
  useHelpers,
  useRemirror,
} from '@remirror/react';

const ydoc = new Y.Doc();
// clients connected to the same room-name share document updates
const provider = new WebrtcProvider('remirror-yjs-demo', ydoc);

const extensions = () => [
  new AnnotationExtension(),
  new PlaceholderExtension({ placeholder: 'Open second tab and start to type...' }),
  new YjsExtension({ getProvider: () => provider }),
];

const Menu = () => {
  const { removeAnnotations, addAnnotation, redrawAnnotations } = useCommands();
  const { getAnnotationsAt, selectionHasAnnotation } = useHelpers();
  const selection = useCurrentSelection();

  return (
    <>
      <button
        onClick={() => {
          addAnnotation({ id: `${Date.now()}` });
          focus();
        }}
        disabled={selection.empty}
      >
        Add annotation
      </button>
      <button
        onClick={() => {
          const annotations = getAnnotationsAt(selection.from);
          removeAnnotations(annotations.map(({ id }) => id));
          focus();
        }}
        disabled={!selectionHasAnnotation()}
      >
        Remove annotation(s)
      </button>
      <button
        onClick={() => {
          redrawAnnotations();
          focus();
        }}
      >
        Redraw annotation(s)
      </button>
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager } = useRemirror({ extensions, core: { excludeExtensions: ['history'] } });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus autoRender='end'>
        <Menu />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
