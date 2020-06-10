import { css, cx } from 'linaria';
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
import {
  DispatchWithCallback,
  PartialSetStateAction,
  useExtension,
  usePositioner,
  useSetState,
} from '@remirror/react';

import {
  emojiSuggestionsDropdownWrapperStyles,
  emojiSuggestionsItemStyles,
} from '../social-editor-styles';
import { indexFromArrowPress, useSocialRemirror } from '../social-editor-utils';

interface EmojiState {
  list: EmojiObject[];
  hideSuggestions: boolean;
  index: number;
  command?: EmojiSuggestCommand;
}

const initialState: EmojiState = { list: [], hideSuggestions: false, index: 0 };

interface EmojiHookParameter extends EmojiState {
  setState: DispatchWithCallback<PartialSetStateAction<EmojiState>>;
}

/**
 * A hook for managing changes in the emoji suggestions.
 */
function useEmojiChangeHandler(setState: DispatchWithCallback<PartialSetStateAction<EmojiState>>) {
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
      const change = addHandler('onChange', onChange);
      const exit = addHandler('onExit', onExit);

      return () => {
        change();
        exit();
      };
    },
    [],
  );
}

/**
 * A hook for adding keybindings to the emoji dropdown.
 */
function useEmojiKeyBindings(parameter: EmojiHookParameter) {
  const { setState, hideSuggestions, index, list } = parameter;

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

      return addCustomHandler('keyBindings', keyBindings);
    },
    [keyBindings],
  );
}

/**
 * The emoji suggestions component.
 */
export const EmojiSuggestions = () => {
  const [state, setState] = useSetState<EmojiState>(initialState);
  const { focus } = useSocialRemirror();
  const { ref, top, left } = usePositioner('popupMenu');
  const { hideSuggestions, index, list, command } = state;

  const { getMenuProps, getItemProps, itemHighlightedAtIndex, hoveredIndex } = useMultishift({
    highlightedIndexes: [index],
    type: Type.ControlledMenu,
    items: list,
    isOpen: true,
  });

  useEmojiChangeHandler(setState);
  useEmojiKeyBindings({ ...state, setState });

  if (hideSuggestions || !command) {
    return null;
  }

  return (
    <div
      {...getMenuProps({ ref })}
      className={emojiSuggestionsDropdownWrapperStyles}
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
            className={cx(
              emojiSuggestionsItemStyles,
              isHighlighted && 'highlighted',
              isHovered && 'hovered',
            )}
            {...getItemProps({
              onClick: () => {
                command(emoji);
                focus();
              },
              item: emoji,
              index,
            })}
          >
            <span className={emojiSuggestionsItemChar}>{emoji.char}</span>
            <span className={emojiSuggestionsItemName}>:{emoji.name}:</span>
          </div>
        );
      })}
    </div>
  );
};

const emojiSuggestionsItemName = css`
  color: rgb(121, 129, 134);
`;

const emojiSuggestionsItemChar = css`
  font-size: 1.25em;
  padding-right: 5px;
`;
