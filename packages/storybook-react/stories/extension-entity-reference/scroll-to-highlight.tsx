import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { EntityReferenceExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new EntityReferenceExtension()];

const TEST_ID = 'testId';
const lineBreakHTML = `<p><br class="ProseMirror-trailingBreak"></p>`;
const numberOfLineBreaks = 100;

const ScrollIntoHighlight = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `${lineBreakHTML.repeat(
      numberOfLineBreaks,
    )}<p>Highlight <span data-entity-reference=${TEST_ID}>important and interesting</span> text</p>`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} onChange={onChange} initialContent={state} autoRender='end'>
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => manager.store.commands.scrollToEntityReference(TEST_ID)}
        >
          Scroll into highlight
        </button>
      </Remirror>
    </ThemeProvider>
  );
};

export default ScrollIntoHighlight;
