import React, { FC, useEffect, useMemo } from 'react';
import {
  AnnotationExtension,
  createCenteredAnnotationPositioner,
} from 'remirror/extension/annotation';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import { usePositioner } from 'remirror/react/hooks';

export default { title: 'Editor with annotation' };

const SAMPLE_TEXT = 'This is a sample text';

const Popup: FC = () => {
  const { helpers, getState } = useRemirror({ autoUpdate: true });

  const memoizedPositioner = useMemo(
    () => createCenteredAnnotationPositioner(helpers.getAnnotationsAt),
    [helpers],
  );
  const positioner = usePositioner(memoizedPositioner);

  if (!positioner.active) {
    return null;
  }

  const sel = getState().selection;
  const annotations = helpers.getAnnotationsAt(sel.from);
  const label = annotations.map((annotation) => annotation.text).join('\n');

  return (
    <div
      style={{
        top: positioner.bottom,
        left: positioner.left,
        position: 'absolute',
        border: '1px solid black',
        whiteSpace: 'pre-line',
        background: 'white',
      }}
      ref={positioner.ref}
    >
      {label}
    </div>
  );
};

const SmallEditor: FC = () => {
  const { getRootProps, setContent, commands, helpers } = useRemirror({
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
      <div {...getRootProps()} />
      <Popup />
      <div>Annotations:</div>
      <pre>{JSON.stringify(helpers.getAnnotations(), null, '  ')}</pre>
    </div>
  );
};

export const Basic = () => {
  const extensionManager = useManager([new AnnotationExtension()]);

  return (
    <RemirrorProvider manager={extensionManager}>
      <SmallEditor />
    </RemirrorProvider>
  );
};
