import 'remirror/styles/all.css';

import { FC, useMemo, useState } from 'react';
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
} from '@remirror/react';

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

const Configurable: FC = () => {
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

export default Configurable;
