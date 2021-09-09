import 'remirror/styles/all.css';

import { EmojiButton } from '@joeattardi/emoji-button';
import React, { useCallback, useEffect, useRef } from 'react';
import { htmlToProsemirrorNode, ProsemirrorNode } from 'remirror';
import { CalloutExtension } from 'remirror/extensions';
import {
  Remirror,
  ThemeProvider,
  useCommands,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

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

const WithEmojiPicker: React.FC = () => {
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
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <EmojiPicker />
      </Remirror>
    </ThemeProvider>
  );
};

export default WithEmojiPicker;
