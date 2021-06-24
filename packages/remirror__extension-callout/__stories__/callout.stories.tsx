import 'remirror/styles/all.css';

import { EmojiButton } from '@joeattardi/emoji-button';
import { Blobmoji } from '@svgmoji/blob';
import React, { useCallback } from 'react';
import { CalloutExtension } from 'remirror/extensions';
import svgmojiData from 'svgmoji/emoji.json';
import { EditorView, htmlToProsemirrorNode, ProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Callouts' };

const renderDialogEmoji = (node: ProsemirrorNode, view: EditorView, getPos: () => number) => {
  const { emoji: prevEmoji, type } = node.attrs;
  const emoji = document.createElement('span');
  emoji.textContent = prevEmoji;

  const picker = new EmojiButton({
    position: 'bottom',
    autoFocusSearch: false,
  });

  /**
   * Handle the selected emoji here
   * Pass the new attributes to transaction to enable updating it from within the extension.
   */
  picker.on('emoji', (selection) => {
    const transaction = view.state.tr.setNodeMarkup(getPos(), undefined, {
      emoji: selection.emoji,
      type,
    });
    view.dispatch(transaction);
  });

  emoji.addEventListener('click', (e) => {
    e.preventDefault();
    picker.togglePicker(emoji);
  });

  // Prevent ProseMirror from handling the `mousedown` event so that the cursor
  // won't move when users click the emoji.
  emoji.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  return emoji;
};

const renderRandomEmoji = (node: ProsemirrorNode, view: EditorView, getPos: () => number) => {
  const { emoji: emojiCode, type } = node.attrs;
  const emoji = document.createElement('img');
  emoji.style.height = '48px';
  emoji.style.width = '48px';
  const blobmoji = new Blobmoji({ data: svgmojiData, type: 'individual' });
  emoji.src = blobmoji.url(emojiCode);

  const choiceRandomEmoji = (currEmoji: string): string => {
    const availableEmojis = ['😭', '😊', '🥰', '😂', '🙄', '😫', '🤔', '😌', '😍', '🤣'];
    const nextEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
    return currEmoji === nextEmoji ? choiceRandomEmoji(currEmoji) : nextEmoji!;
  };

  emoji.addEventListener('click', (e) => {
    e.preventDefault();

    const transaction = view.state.tr.setNodeMarkup(getPos(), undefined, {
      emoji: choiceRandomEmoji(node.attrs.emoji),
      type,
    });
    view.dispatch(transaction);
  });

  // Prevent ProseMirror from handle the `mousedown` event so that the cursor
  // won't move when users click the emoji.
  emoji.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  return emoji;
};

export const Basic = (): JSX.Element => {
  const basicExtensions = useCallback(() => [new CalloutExtension()], []);
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<div data-callout-type="info"><p>Info callout</p></div><p />' +
      '<div data-callout-type="warning"><p>Warning callout</p></div><p />' +
      '<div data-callout-type="error"><p>Error callout</p></div><p />' +
      '<div data-callout-type="success"><p>Success callout</p></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

Basic.args = {
  autoLink: true,
  openLinkOnClick: true,
};

export const WithEmojiPicker: React.FC = () => {
  const basicExtensions = useCallback(
    () => [new CalloutExtension({ renderEmoji: renderDialogEmoji, defaultEmoji: '💡' })],
    [],
  );
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<div data-callout-type="blank" data-callout-emoji="💡"><p>Blank callout</p></div><p />' +
      '<div data-callout-type="warning" data-callout-emoji="💡"><p>Click the emoji to open a emoji picker.</p></div><p />' +
      '<div data-callout-type="success" data-callout-emoji="💡"><p>Powered by https://www.npmjs.com/package/@joeattardi/emoji-button</p></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

export const WithRandomEmoji: React.FC = () => {
  const basicExtensions = useCallback(
    () => [new CalloutExtension({ renderEmoji: renderRandomEmoji, defaultEmoji: '💡' })],
    [],
  );
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<div data-callout-type data-callout-emoji="💡"><p>Click the emoji to get a new random emoji.</p><p> Powered by https://github.com/svgmoji/svgmoji</p></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
