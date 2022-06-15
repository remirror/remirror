import React, { useCallback } from 'react';
import { EmojiExtension, PlaceholderExtension } from 'remirror/extensions';
import data from 'svgmoji/emoji.json';
import {
  EditorComponent,
  EmojiPopupComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

export default { title: 'Components (labs) / Emoji Popup' };

export const PlainText = () => {
  const extensions = useCallback(
    () => [
      new EmojiExtension({ data, plainText: true }),
      new PlaceholderExtension({ placeholder: `Type : to insert emojis` }),
    ],
    [],
  );
  const { manager, state } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <EmojiPopupComponent />
      </Remirror>
    </ThemeProvider>
  );
};

export const Noto = () => {
  const extensions = useCallback(
    () => [
      new EmojiExtension({ data, moji: 'noto' }),
      new PlaceholderExtension({ placeholder: `Type : to insert emojis` }),
    ],
    [],
  );
  const { manager, state } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EmojiPopupComponent />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};
