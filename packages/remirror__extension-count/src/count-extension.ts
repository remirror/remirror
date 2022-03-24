import type {
  CreateExtensionPlugin,
  EditorState,
  Helper,
  Static,
  Transaction,
} from '@remirror/core';
import { extension, findMatches, helper, PlainExtension } from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import {
  getCharacterExceededPosition,
  getTextLength,
  getWordExceededPosition,
  WORDS_REGEX,
} from './count-utils';

export enum CountStrategy {
  CHARACTERS = 'CHARACTERS',
  WORDS = 'WORDS',
}

export interface CountOptions {
  /**
   * An optional soft limit. Text that exceeds this limit will be highlighted.
   *
   * @default -1
   */
  maximum?: Static<number>;

  /**
   * The classname to use when highlighting text that exceed the given maximum.
   *
   * @default 'remirror-max-count-exceeded'
   */
  maximumExceededClassName?: Static<string>;

  /**
   * The counting strategy to use. Either CountStrategy.CHARACTERS or CountStrategy.WORDS
   *
   * @default CountStrategy.CHARACTERS
   */
  maximumStrategy?: Static<CountStrategy>;
}

interface CountPluginState {
  decorationSet: DecorationSet;
}

/**
 * Count words or characters in your editor, and set a soft max length
 */
@extension<CountOptions>({
  defaultOptions: {
    maximum: -1,
    maximumExceededClassName: 'remirror-max-count-exceeded',
    maximumStrategy: CountStrategy.CHARACTERS,
  },
  staticKeys: ['maximum', 'maximumStrategy', 'maximumExceededClassName'],
})
export class CountExtension extends PlainExtension<CountOptions> {
  get name() {
    return 'count' as const;
  }

  /**
   * Get the configured maximum characters/words.
   */
  @helper()
  getCountMaximum(): Helper<number> {
    return this.options.maximum;
  }

  /**
   * Get the count of characters in the document.
   *
   * @param state
   */
  @helper()
  getCharacterCount(state: EditorState = this.store.getState()): Helper<number> {
    let count = 0;

    state.doc.nodesBetween(0, state.doc.nodeSize - 2, (node) => {
      count += getTextLength(node);
      return true;
    });

    // Remove the last line break character
    return Math.max(count - 1, 0);
  }

  /**
   * Get the count of words in the document.
   *
   * @param state
   */
  @helper()
  getWordCount(state: EditorState = this.store.getState()): Helper<number> {
    const text = this.store.helpers.getText({ lineBreakDivider: ' ', state });
    return findMatches(text, WORDS_REGEX).length;
  }

  /**
   * Is the current number of characters/words valid in the current strategy.
   *
   * @param state
   */
  @helper()
  isCountValid(state: EditorState = this.store.getState()): Helper<boolean> {
    const { maximumStrategy, maximum } = this.options;

    if (maximum < 1) {
      return true;
    }

    if (maximumStrategy === CountStrategy.CHARACTERS) {
      const count = this.store.helpers.getCharacterCount(state);
      return count <= maximum;
    }

    return this.store.helpers.getWordCount(state) <= maximum;
  }

  protected createDecorationSet(state: EditorState): DecorationSet {
    const { maximum = -1, maximumStrategy, maximumExceededClassName } = this.options;

    const isCharacterCountStrategy = maximumStrategy === CountStrategy.CHARACTERS;
    const posStrategy = isCharacterCountStrategy
      ? getCharacterExceededPosition
      : getWordExceededPosition;

    const pos = posStrategy(state, maximum);

    return DecorationSet.create(state.doc, [
      Decoration.inline(pos, state.doc.nodeSize - 2, {
        class: maximumExceededClassName,
      }),
    ]);
  }

  createPlugin(): CreateExtensionPlugin<CountPluginState> {
    const { maximum } = this.options;

    return {
      state: {
        init: (_, state: EditorState) => {
          if (this.isCountValid(state)) {
            return {
              decorationSet: DecorationSet.empty,
            };
          }

          return {
            decorationSet: this.createDecorationSet(state),
          };
        },
        apply: (
          tr: Transaction,
          pluginState: CountPluginState,
          _: EditorState,
          state: EditorState,
        ) => {
          if (!tr.docChanged || maximum < 1) {
            return pluginState;
          }

          if (this.isCountValid(state)) {
            return {
              decorationSet: DecorationSet.empty,
            };
          }

          return {
            decorationSet: this.createDecorationSet(state),
          };
        },
      },
      props: {
        decorations(state: EditorState) {
          return this.getState(state).decorationSet;
        },
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      count: CountExtension;
    }
  }
}
