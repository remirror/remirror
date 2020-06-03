import classNames from 'classnames';
import { Type, useMultishift } from 'multishift';
import React, { useCallback, useMemo } from 'react';

import { isEmptyArray, isUndefined } from '@remirror/core';
import {
  EmojiExtension,
  EmojiObject,
  EmojiSuggestCommand,
  EmojiSuggestionChangeHandler,
  EmojiSuggestionExitHandler,
  EmojiSuggestionKeyBindings,
} from '@remirror/extension-emoji';
import { useExtension, usePositioner, useSetState } from '@remirror/react';

import { indexFromArrowPress, useSocialRemirror } from '../social-utils';

interface EmojiState {
  list: EmojiObject[];
  hideSuggestions: boolean;
  index: number;
  command?: EmojiSuggestCommand;
}

/**
 * A hook for keeping track of the state of emoji extension integration.
 */
function useEmojiState() {
  const [state, setState] = useSetState<EmojiState>({ list: [], hideSuggestions: false, index: 0 });

  return { ...state, setState };
}

/**
 * A hook for managing changes in the emoji suggestions.
 */
function useEmojiChangeHandler() {
  const { setState } = useEmojiState();

  const onChange: EmojiSuggestionChangeHandler = useCallback(
    (parameter) => {
      const { emojiMatches, command } = parameter;

      setState({
        hideSuggestions: false,
        list: emojiMatches,
        index: 0,
        command,
      });
    },
    [setState],
  );

  const onExit: EmojiSuggestionExitHandler = useCallback(() => {
    setState({
      hideSuggestions: true,
      list: [],
      index: 0,
      command: undefined,
    });
  }, [setState]);

  useExtension(
    EmojiExtension,
    ({ addHandler }) => {
      const change = addHandler('onSuggestionChange', onChange);
      const exit = addHandler('onSuggestionExit', onExit);

      return () => {
        change();
        exit();
      };
    },
    [],
  );
}

function useEmojiKeyBindings() {
  const { list, index, hideSuggestions, setState } = useEmojiState();

  /**
   * Create the arrow bindings for the emoji suggesters.
   */
  const createArrowBinding = useCallback(
    (direction: 'up' | 'down') => () => {
      if (hideSuggestions || isEmptyArray(list)) {
        return false;
      }

      // pressed up arrow
      const activeIndex = indexFromArrowPress({
        direction,
        matchLength: list.length,
        prevIndex: index,
      });

      setState({ index: activeIndex });

      return true;
    },
    [hideSuggestions, index, list, setState],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  const keyBindings: EmojiSuggestionKeyBindings = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
       */
      Enter: ({ command }) => {
        if (hideSuggestions) {
          return false;
        }

        const emoji: EmojiObject | undefined = list[index];

        // Check if a matching id exists because the user has selected something.
        if (isUndefined(emoji)) {
          return false;
        }

        command(emoji);

        return true;
      },

      /**
       * Hide the suggesters when the escape key is pressed.
       */
      Escape: () => {
        if (isEmptyArray(list)) {
          return false;
        }

        setState({ hideSuggestions: true });
        return true;
      },

      ArrowDown,
      ArrowUp,
    }),
    [ArrowDown, ArrowUp, hideSuggestions, index, list, setState],
  );

  useExtension(
    EmojiExtension,
    (parameter) => {
      const { addCustomHandler } = parameter;

      return addCustomHandler('suggestionKeyBindings', keyBindings);
    },
    [keyBindings],
  );
}

export const EmojiSuggestions = () => {
  const { focus } = useSocialRemirror();
  const { ref, top, left } = usePositioner('popupMenu');
  const { command, hideSuggestions, index, list } = useEmojiState();

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [index],
    type: Type.ControlledMenu,
    items: list,
    isOpen: true,
  });

  useEmojiChangeHandler();
  useEmojiKeyBindings();

  if (hideSuggestions || !command) {
    return null;
  }

  return (
    <div
      {...getMenuProps({ ref })}
      className='emoji-suggestions-dropdown-wrapper'
      style={{
        top: top + 10,
        left,
      }}
    >
      {list.map((emoji, index) => {
        const isHighlighted = itemHighlightedAtIndex(index);
        const isHovered = index === hoveredIndex;
        return (
          <div
            key={emoji.name}
            className={classNames({
              'emoji-item': true,
              highlighted: isHighlighted,
              hovered: isHovered,
            })}
            {...getItemProps({
              onClick: () => {
                command(emoji);
                focus();
              },
              item: emoji,
              index,
            })}
          >
            <span style={{ fontSize: '1.25em' }}>{emoji.char}</span>{' '}
            <span style={{ color: 'darkGrey' }}>:{emoji.name}:</span>
          </div>
        );
      })}
    </div>
  );
};
