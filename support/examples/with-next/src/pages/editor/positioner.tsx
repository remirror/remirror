import React, { useCallback, useState } from 'react';

import { EMPTY_PARAGRAPH_NODE } from 'remirror/core';
import { BoldExtension } from 'remirror/extension/bold';
import { HeadingExtension } from 'remirror/extension/heading';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { ListPreset } from 'remirror/preset/list';
import { RemirrorProvider, useManager, usePositioner, useRemirror } from 'remirror/react';

const EXTENSIONS = [
  new HeadingExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new ListPreset(),
];

function Menu() {
  const [activeCommands, setActiveCommands] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const { commands, active } = useRemirror<BoldExtension | ItalicExtension | UnderlineExtension>(
    () => {
      setActiveCommands({
        bold: active.bold(),
        italic: active.italic(),
        underline: active.underline(),
      });
    },
  );

  // The use positioner hook allows for tracking the current selection in the editor.
  const { bottom, left, ref } = usePositioner('bubble');

  return (
    <div ref={ref} style={{ bottom, left, position: 'absolute' }} data-testid='bubble-menu'>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: activeCommands.bold ? 'bold' : undefined }}
        data-testid='bubble-menu-bold'
      >
        Bold
      </button>
      <button
        onClick={() => commands.toggleItalic()}
        style={{ fontWeight: activeCommands.italic ? 'bold' : undefined }}
      >
        Italic
      </button>
      <button
        onClick={() => commands.toggleUnderline()}
        style={{ fontWeight: activeCommands.underline ? 'bold' : undefined }}
      >
        Underline
      </button>
    </div>
  );
}

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor = () => {
  const { getRootProps } = useRemirror();
  return (
    <div>
      <div {...getRootProps()} />
      <Menu />
    </div>
  );
};
const SmallEditorWrapper = () => {
  const extensionManager = useManager(EXTENSIONS);
  const [value, setValue] = useState(
    extensionManager.createState({ content: EMPTY_PARAGRAPH_NODE }),
  );

  const onChange = useCallback((event) => {
    setValue(event.state);
  }, []);

  return (
    <RemirrorProvider manager={extensionManager} value={value} onChange={onChange}>
      <SmallEditor />
    </RemirrorProvider>
  );
};

export default SmallEditorWrapper;
