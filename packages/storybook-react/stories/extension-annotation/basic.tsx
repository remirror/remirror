import 'remirror/styles/all.css';

import { FC, useEffect } from 'react';
import { AnnotationExtension, createCenteredAnnotationPositioner } from 'remirror/extensions';
import {
  EditorComponent,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  usePositioner,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const SAMPLE_TEXT = 'This is a sample text';

const Popup: FC = () => {
  const { helpers, getState } = useRemirrorContext({ autoUpdate: true });

  const positioner = usePositioner(
    createCenteredAnnotationPositioner(helpers.getAnnotationsAt),
    [],
  );

  if (!positioner.active) {
    return null;
  }

  const sel = getState().selection;
  const annotations = helpers.getAnnotationsAt(sel.from);
  const label = annotations.map((annotation) => annotation.text).join('\n');

  return (
    <PositionerPortal>
      <div
        style={{
          top: positioner.y + positioner.height,
          left: positioner.x,
          position: 'absolute',
          border: '1px solid black',
          whiteSpace: 'pre-line',
          background: 'white',
        }}
        title='Floating annotation'
        ref={positioner.ref}
      >
        {label}
      </div>
    </PositionerPortal>
  );
};

const SmallEditor: FC = () => {
  const { setContent, commands, helpers } = useRemirrorContext({
    autoUpdate: true,
  });

  useEffect(() => {
    setContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `${SAMPLE_TEXT} `,
            },
          ],
        },
      ],
    });
    commands.setAnnotations([
      {
        id: 'a-1',
        from: 1,
        to: SAMPLE_TEXT.length + 1,
      },
      {
        id: 'a-2',
        from: 9,
        to: SAMPLE_TEXT.length + 1,
      },
      {
        id: 'a-3',
        from: 11,
        to: 17,
      },
    ]);
  }, [setContent, commands]);

  return (
    <div>
      <EditorComponent />
      <Popup />
      <div>Annotations:</div>
      <pre>{JSON.stringify(helpers.getAnnotations(), null, '  ')}</pre>
    </div>
  );
};

const Basic: FC = () => {
  const { manager } = useRemirror({ extensions: () => [new AnnotationExtension()] });

  return (
    <ThemeProvider>
      <Remirror manager={manager}>
        <SmallEditor />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
