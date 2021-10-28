import { forwardRef, Ref, useImperativeHandle, useRef } from 'react';
import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

const DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'New content',
        },
      ],
    },
  ],
};

export interface EditorRef {
  setContent: (content: any) => void;
}

const ImperativeHandle = forwardRef((_: unknown, ref: Ref<EditorRef>) => {
  const { setContent } = useRemirrorContext({
    autoUpdate: true,
  });

  // Expose content handling to outside
  useImperativeHandle(ref, () => ({ setContent }));

  return <></>;
});

const ReplaceContentImperative = (): JSX.Element => {
  const editorRef = useRef<EditorRef | null>(null);
  const { manager, state } = useRemirror({
    extensions: () => [],
    content: '<p>[Replace] button is placed outside the editor (see code)</p>',
    stringHandler: 'html',
  });

  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editorRef.current!.setContent(DOC)}
      >
        Replace content
      </button>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender='end'>
          <ImperativeHandle ref={editorRef} />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

export default ReplaceContentImperative;
