import 'remirror/styles/all.css';

import { EmojiButton } from '@joeattardi/emoji-button';
import { Blobmoji } from '@svgmoji/blob';
import React, { useCallback, useEffect, useRef } from 'react';
import { CalloutExtension } from 'remirror/extensions';
import svgmojiData from 'svgmoji/emoji.json';
import { htmlToProsemirrorNode, ProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import {
  Remirror,
  ThemeProvider,
  useCommands,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

export default { title: 'Callouts' };

const EmojiPicker = () => {
  const pickerRef = useRef(new EmojiButton({ position: 'bottom', autoFocusSearch: false }));
  const { updateCallout } = useCommands();
  const { view } = useRemirrorContext();
  const pos = useRef(-1);

  const handleClickEmoji = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      e.preventDefault();

      if (!target.matches('[data-emoji-container]')) {
        return;
      }

      /**
       * Find the document position of the click element.
       */
      pos.current = view.posAtDOM(target, 0);

      pickerRef.current.togglePicker(target);
    },
    [view],
  );

  /**
   * Handle the selected emoji here.
   * Use `updateCallout` commands to update new emoji.
   * Need to pass pos information to commands, otherwise it will update the node where the cursor is located.
   */
  const handleSelectEmoji = useCallback(
    (selection) => {
      updateCallout({ emoji: selection.emoji }, pos.current);
    },
    [updateCallout],
  );

  useEffect(() => {
    const picker = pickerRef.current;
    picker.on('emoji', handleSelectEmoji);
    document.addEventListener('click', handleClickEmoji);

    return () => {
      picker.destroyPicker();
      document.removeEventListener('click', handleClickEmoji);
    };
  }, [handleClickEmoji, handleSelectEmoji]);

  return null;
};

const renderDialogEmoji = (node: ProsemirrorNode) => {
  const { emoji: prevEmoji } = node.attrs;
  const emoji = document.createElement('span');
  emoji.dataset.emojiContainer = '';
  emoji.textContent = prevEmoji;
  emoji.style.cursor = 'pointer';

  // Prevent ProseMirror from handling the `mousedown` event so that the cursor
  // won't move when users click the emoji.
  emoji.addEventListener('mousedown', (e) => e.preventDefault());

  return emoji;
};

const RandomEmoji = () => {
  const { updateCallout } = useCommands();
  const { view } = useRemirrorContext();
  const pos = useRef(-1);

  const choiceRandomEmoji = useCallback((currEmoji: string): string => {
    const availableEmojis = ['😭', '😊', '🥰', '😂', '🙄', '😫', '🤔', '😌', '😍', '🤣'];
    const nextEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
    return currEmoji === nextEmoji ? choiceRandomEmoji(currEmoji) : nextEmoji!;
  }, []);

  const handleClickEmoji = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLImageElement;
      e.preventDefault();

      if (!target.matches('[data-emoji-container]')) {
        return;
      }

      /**
       * Find the document position of the click element.
       */
      pos.current = view.posAtDOM(target, 0);

      updateCallout({ emoji: choiceRandomEmoji(target.alt) }, pos.current);
    },
    [view, updateCallout, choiceRandomEmoji],
  );

  useEffect(() => {
    document.addEventListener('click', handleClickEmoji);

    return () => {
      document.removeEventListener('click', handleClickEmoji);
    };
  }, [handleClickEmoji]);

  return null;
};
const renderRandomEmoji = (node: ProsemirrorNode) => {
  const { emoji: emojiCode } = node.attrs;
  const emoji = document.createElement('img');
  emoji.style.height = '48px';
  emoji.style.width = '48px';
  emoji.dataset.emojiContainer = '';
  emoji.style.cursor = 'pointer';
  emoji.alt = emojiCode;

  const blobmoji = new Blobmoji({ data: svgmojiData, type: 'individual' });
  emoji.src = blobmoji.url(emojiCode);

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
        <EmojiPicker />
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
        <RandomEmoji />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
