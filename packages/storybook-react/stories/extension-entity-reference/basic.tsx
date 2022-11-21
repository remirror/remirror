import 'remirror/styles/all.css';
import './styles.css';

import React, { useCallback, useState } from 'react';
import { cx, uniqueId } from 'remirror';
import { CodeExtension, EntityReferenceExtension, ItalicExtension } from 'remirror/extensions';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useCommands,
  useExtensionEvent,
  useHelpers,
  useRemirror,
} from '@remirror/react';

const extensions = () => [
  new EntityReferenceExtension({}),
  new CodeExtension(),
  new ItalicExtension(),
];

const Buttons = () => {
  const { getEntityReferencesAt } = useHelpers<EntityReferenceExtension>(true);
  const { addEntityReference } = useCommands<EntityReferenceExtension>();

  const entityReferencesAt = getEntityReferencesAt();
  const active = entityReferencesAt.length > 0;

  const onClick = useCallback(() => {
    // Add entity reference
    const id = uniqueId();
    addEntityReference(id);
  }, [addEntityReference]);

  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cx(active && 'active')}
    >
      Add Entity Reference
    </button>
  );
};

const ClickPrinter: React.FC = () => {
  const [lastClickedRef, setLastClickedRef] = useState<string | null>(null);

  useExtensionEvent(
    EntityReferenceExtension,
    'onClick',
    useCallback((data) => {
      setLastClickedRef(JSON.stringify(data, null, 2));
    }, []),
  );

  if (!lastClickedRef) {
    return null;
  }

  return (
    <>
      <h3>Last clicked entity reference info</h3>
      <pre>
        <code>{lastClickedRef}</code>
      </pre>
    </>
  );
};

const content = `
  <p>Highlight important and interesting text. They can overlap one-another and be detected on click.</p>
  <p></p>
  <p>The assumption is that the <code>id</code> attribute refers to an entity <em>external</em> to Remirror - like a comment</p>
`;

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender={false}
      >
        <Buttons />
        <EditorComponent />
        <ClickPrinter />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
