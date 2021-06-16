import 'remirror/styles/all.css';

import React from 'react';
import { CalloutExtension, HeadingExtension } from 'remirror/extensions';
import { EmojiBlockExtension, EmojiExtension } from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Callouts' };

const basicExtensions = () => [
  new CalloutExtension(),
  new EmojiExtension({
    plainText: false,
    data: [
      {
        annotation: 'slightly smiling face',
        hexcode: '1F642',
        tags: ['face', 'smile'],
        emoji: '🙂',
        text: '',
        type: 1,
        order: 9,
        group: 0,
        subgroup: 0,
        version: 1,
        emoticon: ':)',
        shortcodes: ['slightly_smiling_face'],
      },
      {
        annotation: 'upside-down face',
        hexcode: '1F643',
        tags: ['face', 'upside-down'],
        emoji: '🙃',
        text: '',
        type: 1,
        order: 10,
        group: 0,
        subgroup: 0,
        version: 1,
        shortcodes: ['upside_down_face'],
      },
    ],
    moji: 'noto',
  }),
  new HeadingExtension(),
  new EmojiBlockExtension(),
];

export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content: '',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ProsemirrorDevTools />

        <Btn />
      </Remirror>
    </ThemeProvider>
  );
};

const Btn = () => {
  const commands = useCommands();
  return (
    <button
      onClick={() => {
        // commands.addEmoji('red_heart');

        commands.toggleCallout({ type: 'success' });
      }}
    >
      111
    </button>
  );
};
