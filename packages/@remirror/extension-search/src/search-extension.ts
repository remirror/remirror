import { cx } from '@linaria/core';
import escapeStringRegexp from 'escape-string-regexp';

import {
  CommandFunction,
  CreateExtensionPlugin,
  DispatchFunction,
  extension,
  findMatches,
  FromToParameter,
  getSelectedWord,
  Handler,
  isEmptyArray,
  isNumber,
  isSelectionEmpty,
  isString,
  KeyBindingCommandFunction,
  KeyBindings,
  object,
  PlainExtension,
  PrioritizedKeyBindings,
  ProsemirrorNode,
  Static,
  Transaction,
} from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

export interface SearchOptions {
  /**
   * @default false
   */
  autoSelectNext?: boolean;

  /**
   * @default 'search'
   */
  searchClass?: Static<string>;

  /**
   * The class to apply to the currently highlighted index.
   *
   * @default 'highlighted-search'
   */
  highlightedClass?: Static<string>;

  /**
   * @default false
   */
  searching?: boolean;

  /**
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * @default true
   */
  disableRegex?: boolean;

  /**
   * @default false
   */
  alwaysSearch?: boolean;

  /**
   * Set to false to disable.
   *
   * @default 'Mod-f'
   */
  searchForwardShortcut?: string | false;

  /**
   * Set to false to disable.
   *
   * @default 'Mod-Shift-f'
   */
  searchBackwardShortcut?: string | false;

  /**
   * Whether to clear the search when the esc key is pressed.
   *
   * @default true
   */
  clearOnEscape?: boolean;

  /**
   * Search handler
   */
  onSearch: Handler<(selectedText: string, direction: SearchDirection) => void>;
}

export type SearchDirection = 'next' | 'previous';

/**
 * This extension add search functionality to your editor.
 */
@extension<SearchOptions>({
  defaultOptions: {
    autoSelectNext: true,
    searchClass: 'search',
    highlightedClass: 'highlighted-search',
    searching: false,
    caseSensitive: false,
    disableRegex: true,
    alwaysSearch: false,
    searchForwardShortcut: 'Mod-f',
    searchBackwardShortcut: 'Mod-Shift-f',
    clearOnEscape: true,
  },
  handlerKeys: ['onSearch'],
  staticKeys: ['highlightedClass', 'searchClass'],
})
export class SearchExtension extends PlainExtension<SearchOptions> {
  get name() {
    return 'search' as const;
  }

  private _updating = false;
  private _searchTerm?: string;
  private _results: FromToParameter[] = [];
  private _activeIndex = 0;

  createCommands() {
    return {
      /**
       * Find a search term in the editor. If no search term is provided it
       * defaults to the currently selected text.
       */
      find: (searchTerm?: string, direction?: SearchDirection): CommandFunction =>
        this.find(searchTerm, direction),

      /**
       * Find the next occurrence of the search term.
       */
      findNext: (): CommandFunction => this.find(this._searchTerm, 'next'),

      /**
       * Find the previous occurrence of the search term.
       */
      findPrevious: (): CommandFunction => this.find(this._searchTerm, 'previous'),

      /**
       * Replace the provided
       */
      replace: (replacement: string, index?: number): CommandFunction =>
        this.replace(replacement, index),

      /**
       * Replaces all search results with the replacement text.
       */
      replaceAll: (replacement: string): CommandFunction => this.replaceAll(replacement),

      /**
       * Clears the current search.
       */
      clearSearch: (): CommandFunction => this.clear(),
    };
  }

  /**
   * This plugin is responsible for adding something decorations to the
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (tr, old) => {
          if (
            this._updating ||
            this.options.searching ||
            (tr.docChanged && this.options.alwaysSearch)
          ) {
            return this.createDecoration(tr.doc);
          }

          if (tr.docChanged) {
            return old.map(tr.mapping, tr.doc);
          }

          return old;
        },
      },

      props: {
        decorations: (state) => {
          return this.getPluginState(state);
        },
      },
    };
  }

  /**
   * Create the keymap for this extension.
   */
  createKeymap(): PrioritizedKeyBindings {
    const { searchBackwardShortcut, searchForwardShortcut, clearOnEscape } = this.options;
    const bindings: KeyBindings = object();

    if (searchBackwardShortcut) {
      bindings[searchBackwardShortcut] = this.createSearchKeyBinding('previous');
    }

    if (searchForwardShortcut) {
      bindings[searchForwardShortcut] = this.createSearchKeyBinding('next');
    }

    if (clearOnEscape) {
      bindings.Escape = () => {
        if (!isString(this._searchTerm)) {
          return false;
        }

        const { clearSearch } = this.store.commands;
        clearSearch();

        return true;
      };
    }

    return bindings;
  }

  private createSearchKeyBinding(direction: SearchDirection): KeyBindingCommandFunction {
    return ({ state }) => {
      let searchTerm: string | undefined;

      if (isSelectionEmpty(state)) {
        if (!this._searchTerm) {
          return false;
        }

        searchTerm = this._searchTerm;
      }

      const { find } = this.store.commands;
      find(searchTerm, direction);

      return true;
    };
  }

  private findRegExp() {
    return new RegExp(this._searchTerm ?? '', !this.options.caseSensitive ? 'gui' : 'gu');
  }

  private getDecorations() {
    return this._results.map((deco, index) =>
      Decoration.inline(deco.from, deco.to, {
        class: cx(
          this.options.searchClass,
          index === this._activeIndex && this.options.highlightedClass,
        ),
      }),
    );
  }

  private search(doc: ProsemirrorNode) {
    interface MergedTextNode {
      text: string;
      pos: number;
    }

    this._results = [];
    const mergedTextNodes: MergedTextNode[] = [];
    let index = 0;

    if (!this._searchTerm) {
      return;
    }

    doc.descendants((node, pos) => {
      if (!node.isText && mergedTextNodes[index]) {
        index += 1;
        return;
      }

      if (mergedTextNodes[index]) {
        mergedTextNodes[index] = {
          text: `${mergedTextNodes[index].text}${node.text ?? ''}`,
          pos: mergedTextNodes[index].pos + (index === 0 ? 1 : 0),
        };

        return;
      }

      mergedTextNodes[index] = {
        text: node.text ?? '',
        pos,
      };
    });

    for (const { text, pos } of mergedTextNodes) {
      const search = this.findRegExp();

      findMatches(text, search).forEach((match) => {
        this._results.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        });
      });
    }
  }

  private replace(replacement: string, index?: number): CommandFunction {
    return ({ tr, dispatch }) => {
      const result = this._results[isNumber(index) ? index : this._activeIndex];

      if (!result) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      const { from, to } = result;

      dispatch(tr.insertText(replacement, from, to));
      const { findNext } = this.store.commands;
      findNext();

      return true;
    };
  }

  private rebaseNextResult({ replacement, index, lastOffset = 0 }: RebaseNextResultParameter) {
    const nextIndex = index + 1;

    if (!this._results[nextIndex]) {
      return;
    }

    const { from: currentFrom, to: currentTo } = this._results[index];
    const offset = currentTo - currentFrom - replacement.length + lastOffset;
    const { from, to } = this._results[nextIndex];

    this._results[nextIndex] = {
      to: to - offset,
      from: from - offset,
    };

    return offset;
  }

  private replaceAll(replacement: string): CommandFunction {
    return ({ tr, dispatch }) => {
      let offset: number | undefined;

      if (isEmptyArray(this._results)) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      this._results.forEach(({ from, to }, index) => {
        tr.insertText(replacement, from, to);
        offset = this.rebaseNextResult({ replacement, index, lastOffset: offset });
      });

      dispatch(tr);

      const { find } = this.store.commands;
      find(this._searchTerm);

      return true;
    };
  }

  private find(searchTerm?: string, direction?: SearchDirection): CommandFunction {
    return ({ tr, dispatch }) => {
      const range = isSelectionEmpty(tr) ? getSelectedWord(tr) : tr.selection;
      let actualSearch = '';

      if (searchTerm) {
        actualSearch = searchTerm;
      } else if (range) {
        const { from, to } = range;
        actualSearch = tr.doc.textBetween(from, to);
      }

      this._searchTerm = this.options.disableRegex
        ? escapeStringRegexp(actualSearch)
        : actualSearch;

      if (!direction) {
        this._activeIndex = 0;
      } else {
        this._activeIndex = rotateHighlightedIndex({
          direction,
          previousIndex: this._activeIndex,
          resultsLength: this._results.length,
        });
      }

      return this.updateView(tr, dispatch);
    };
  }

  private clear(): CommandFunction {
    return ({ tr, dispatch }) => {
      this._searchTerm = undefined;
      this._activeIndex = 0;

      return this.updateView(tr, dispatch);
    };
  }

  /**
   * Dispatch an empty transaction to trigger an update of the decoration.
   */
  private updateView(tr: Transaction, dispatch?: DispatchFunction): boolean {
    this._updating = true;

    if (dispatch) {
      dispatch(tr);
    }

    this._updating = false;

    return true;
  }

  private createDecoration(doc: ProsemirrorNode) {
    this.search(doc);
    const decorations = this.getDecorations();

    return decorations ? DecorationSet.create(doc, decorations) : [];
  }
}

interface RebaseNextResultParameter {
  replacement: string;
  index: number;
  lastOffset?: number;
}

interface RotateHighlightedIndexParameter {
  /**
   * Whether the search is moving forward or backward.
   */
  direction: SearchDirection;

  /**
   * The total number of matches
   */
  resultsLength: number;

  /**
   * The previously matched index
   */
  previousIndex: number;
}
export const rotateHighlightedIndex = (parameter: RotateHighlightedIndexParameter): number => {
  const { direction, resultsLength, previousIndex } = parameter;

  return direction === 'next'
    ? previousIndex + 1 > resultsLength - 1
      ? 0
      : previousIndex + 1
    : previousIndex - 1 < 0
    ? resultsLength - 1
    : previousIndex - 1;
};

declare global {
  namespace Remirror {
    interface AllExtensions {
      search: SearchExtension;
    }
  }
}
