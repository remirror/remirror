import 'remirror/styles/all.css';

import React from 'react';
import { CalloutExtension, HeadingExtension } from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import { htmlToProsemirrorNode, IdentifierSchemaAttributes } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Callouts' };
const basicExtensions = () => [
  new CalloutExtension({
    emojiData: data,
    moji: 'noto',
  }),
  new HeadingExtension(),
];
const extraAttributes: IdentifierSchemaAttributes[] = [
  { identifiers: ['emoji'], attributes: { role: { default: 'presentation' } } },
];
export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content: '',
    stringHandler: htmlToProsemirrorNode,
    extraAttributes,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
