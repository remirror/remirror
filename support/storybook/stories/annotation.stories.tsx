import React, { FC, useEffect } from 'react';
import { AnnotationExtension } from 'remirror/extension/annotation';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';

export default { title: 'Editor with annotation' };

const SAMPLE_TEXT = 'This is a sample text';

const SmallEditor: FC = () => {
  const { getRootProps, setContent, commands } = useRemirror();

  useEffect(() => {
    setContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: SAMPLE_TEXT,
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
