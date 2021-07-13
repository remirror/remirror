import { FC, useEffect, useMemo, useState } from 'react';
import { uniqueId } from 'remirror';
import {
  AnnotationExtension,
  BoldExtension,
  createCenteredAnnotationPositioner,
  ItalicExtension,
  MarkdownExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import {
  Button,
  ComponentItem,
  ControlledDialogComponent,
  EditorComponent,
  FloatingToolbar,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  ToolbarItemUnion,
  useCommands,
  useHelpers,
  usePositioner,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

export default { title: 'Annotation Extension' };

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
  const { getRootProps, setContent, commands, helpers } = useRemirrorContext({
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
  const { manager } = useRemirror({ extensions: () => [new AnnotationExtension()] });

  return (
    <Remirror manager={manager}>
      <SmallEditor />
    </Remirror>
  );
};

const simpleExtensions = [new BoldExtension({}), new UnderlineExtension(), new ItalicExtension()];

interface AnnotationEditorProps {
  onChange: (markdown: string) => void;
}
/**
 * The editor which is used to create the annotation. Supports formatting.
 */
const AnnotationEditor = (props: AnnotationEditorProps) => {
  const { manager, state } = useRemirror({
    extensions: () => [...simpleExtensions, new MarkdownExtension({})],
    content: '**bold** content is the _best_',
    stringHandler: 'markdown',
  });

  return (
    <Remirror
      manager={manager}
      initialContent={state}
      autoFocus
      onChange={({ helpers }) => {
        props.onChange(helpers.getMarkdown());
      }}
    />
  );
};

export const Configurable = () => {
  const { manager, state } = useRemirror({
    extensions: () => [...simpleExtensions, new AnnotationExtension()],
    content: '<p>Select some text, and click the button to add annotated text.</p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <FloatingAnnotations />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

const FloatingAnnotations = () => {
  const [visible, setVisible] = useState(false);
  const commands = useCommands();
  const { getAnnotationsAt } = useHelpers();
  const floatingToolbarItems = useMemo<ToolbarItemUnion[]>(
    () => [
      {
        type: ComponentItem.ToolbarButton,
        onClick: () => {
          // setVisible(true);
          commands.addAnnotation({ id: uniqueId() });
        },
        icon: 'chatNewLine',
      },
    ],
    [commands],
  );

  const annotations = getAnnotationsAt();
  const label = annotations.map((annotation) => annotation.text).join('\n');
  const positioner = usePositioner(createCenteredAnnotationPositioner(getAnnotationsAt), []);

  return (
    <>
      <FloatingToolbar items={floatingToolbarItems} positioner='selection' placement='top' />
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
          ref={positioner.ref}
        >
          {label}
        </div>
      </PositionerPortal>
      <ControlledDialogComponent visible={visible} onUpdate={(v) => setVisible(v)} backdrop={true}>
        <AnnotationEditor onChange={(text) => console.log(text)} />
        <Button
          onClick={() => {
            commands.addAnnotation({ id: uniqueId() });
            setVisible(false);
          }}
        >
          Done
        </Button>
      </ControlledDialogComponent>
    </>
  );
};
