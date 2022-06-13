import 'remirror/styles/all.css';

import { Blobmoji } from '@svgmoji/blob';
import React, { useCallback, useEffect, useRef } from 'react';
import { htmlToProsemirrorNode, ProsemirrorNode } from 'remirror';
import { CalloutExtension } from 'remirror/extensions';
import svgmojiData from 'svgmoji/emoji.json';
import {
  Remirror,
  ThemeProvider,
  useCommands,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const RandomEmoji: React.FC = () => {
  const { updateCallout } = useCommands();
  const { view } = useRemirrorContext();
  const pos = useRef(-1);

  const choiceRandomEmoji = useCallback((currEmoji: string): string => {
    const availableEmojis = ['😭', '😊', '🥰', '😂', '🙄', '😫', '🤔', '😌', '😍', '🤣'];
    const nextEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
    return currEmoji === nextEmoji ? choiceRandomEmoji(currEmoji) : nextEmoji;
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
const WithRandomEmoji: React.FC = () => {
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
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <RandomEmoji />
      </Remirror>
    </ThemeProvider>
  );
};

export default WithRandomEmoji;
