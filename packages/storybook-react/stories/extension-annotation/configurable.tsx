import 'remirror/styles/all.css';

import React, { FC, useCallback } from 'react';
import { uniqueId } from 'remirror';
import {
  AnnotationExtension,
  BoldExtension,
  createCenteredAnnotationPositioner,
  ItalicExtension,
  UnderlineExtension,
} from 'remirror/extensions';
import {
  CommandButton,
  EditorComponent,
  FloatingToolbar,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  useCommands,
  useHelpers,
  usePositioner,
  useRemirror,
} from '@remirror/react';

const simpleExtensions = [new BoldExtension({}), new UnderlineExtension(), new ItalicExtension()];

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
  const { addAnnotation } = useCommands();
  const { getAnnotationsAt } = useHelpers();

  const handleSelect = useCallback(() => {
    const id = uniqueId();

    if (addAnnotation.enabled({ id })) {
      addAnnotation({ id });
    }
  }, [addAnnotation]);

  const annotations = getAnnotationsAt();
  const label = annotations.map((annotation) => annotation.text).join('\n');
  const positioner = usePositioner(createCenteredAnnotationPositioner(getAnnotationsAt), []);
  const enabled = addAnnotation.enabled({ id: '' });

  return (
    <>
      <FloatingToolbar>
        <CommandButton
          icon='chatNewLine'
          commandName='addAnnotation'
          enabled={enabled}
          onSelect={handleSelect}
        />
      </FloatingToolbar>
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
    </>
  );
};

export default Configurable;
