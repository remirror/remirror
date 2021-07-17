import escapeStringRegexp from 'escape-string-regexp';
import {
  assertGet,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  cx,
  DispatchFunction,
  extension,
  findMatches,
  FromToProps,
  getSelectedWord,
  Handler,
  isEmptyArray,
  isNumber,
  isSelectionEmpty,
  isString,
  keyBinding,
  KeyBindingCommandFunction,
  KeyBindingProps,
  NamedShortcut,
  PlainExtension,
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
   * Whether to clear the search when the `Escape` key is pressed.
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
    clearOnEscape: true,
  },
  handlerKeys: ['onSearch'],
  staticKeys: ['searchClass', 'highlightedClass'],
})
export class SearchExtension extends PlainExtension<SearchOptions> {
  get name() {
    return 'search' as const;
  }

  private _updating = false;
  private _searchTerm?: string;
  private _results: FromToProps[] = [];
  private _activeIndex = 0;

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
   * Find a search term in the editor. If no search term is provided it
   * defaults to the currently selected text.
   */
  @command()
  search(searchTerm?: string, direction?: SearchDirection): CommandFunction {
    return this.find(searchTerm, direction);
  }

  /**
   * Find the next occurrence of the search term.
   */
  @command()
  searchNext(): CommandFunction {
    return this.find(this._searchTerm, 'next');
  }

  /**
   * Find the previous occurrence of the search term.
   */
  @command()
  searchPrevious(): CommandFunction {
    return this.find(this._searchTerm, 'previous');
  }

  /**
   * Replace the provided
   */
  @command()
  replaceSearchResult(replacement: string, index?: number): CommandFunction {
    return this.replace(replacement, index);
  }

  /**
   * Replaces all search results with the replacement text.
   */
  @command()
  replaceAllSearchResults(replacement: string): CommandFunction {
    return this.replaceAll(replacement);
  }

  /**
   * Clears the current search.
   */
  @command()
  clearSearch(): CommandFunction {
    return this.clear();
  }

  @keyBinding<SearchExtension>({ shortcut: NamedShortcut.Find })
  searchForwardShortcut(props: KeyBindingProps): boolean {
    return this.createSearchKeyBinding('next')(props);
  }

  @keyBinding<SearchExtension>({ shortcut: NamedShortcut.FindBackwards })
  searchBackwardShortcut(props: KeyBindingProps): boolean {
    return this.createSearchKeyBinding('previous')(props);
  }

  @keyBinding<SearchExtension>({ shortcut: 'Escape', isActive: (options) => options.clearOnEscape })
  escapeShortcut(_: KeyBindingProps): boolean {
    if (!isString(this._searchTerm)) {
      return false;
    }

    this.clearSearch();

    return true;
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

      this.find(searchTerm, direction);

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

  private gatherSearchResults(doc: ProsemirrorNode) {
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
      const mergedTextNode = mergedTextNodes[index];

      if (!node.isText && mergedTextNode) {
        index += 1;
        return;
      }

      if (mergedTextNode) {
        mergedTextNodes[index] = {
          text: `${mergedTextNode.text}${node.text ?? ''}`,
          pos: mergedTextNode.pos + (index === 0 ? 1 : 0),
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
          to: pos + match.index + assertGet(match, 0).length,
        });
      });
    }
  }

  private replace(replacement: string, index?: number): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
      const result = this._results[isNumber(index) ? index : this._activeIndex];

      if (!result) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      tr.insertText(replacement, result.from, result.to);
      return this.searchNext()(props);
    };
  }

  private rebaseNextResult({ replacement, index, lastOffset = 0 }: RebaseNextResultProps) {
    const nextIndex = index + 1;

    if (!this._results[nextIndex]) {
      return;
    }

    const current = assertGet(this._results, index);
    const offset = current.to - current.from - replacement.length + lastOffset;
    const next = assertGet(this._results, nextIndex);

    this._results[nextIndex] = {
      to: next.to - offset,
      from: next.from - offset,
    };

    return offset;
  }

  private replaceAll(replacement: string): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
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

      return this.find(this._searchTerm)(props);
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

      this._activeIndex = !direction
        ? 0
        : rotateHighlightedIndex({
            direction,
            previousIndex: this._activeIndex,
            resultsLength: this._results.length,
          });

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
    this.gatherSearchResults(doc);
    const decorations = this.getDecorations();

    return decorations ? DecorationSet.create(doc, decorations) : [];
  }
}

interface RebaseNextResultProps {
  replacement: string;
  index: number;
  lastOffset?: number;
}

interface RotateHighlightedIndexProps {
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
export const rotateHighlightedIndex = (props: RotateHighlightedIndexProps): number => {
  const { direction, resultsLength, previousIndex } = props;

  if (direction === 'next') {
    return previousIndex + 1 > resultsLength - 1 ? 0 : previousIndex + 1;
  }

  return previousIndex - 1 < 0 ? resultsLength - 1 : previousIndex - 1;
};

declare global {
  namespace Remirror {
    interface AllExtensions {
      search: SearchExtension;
    }
  }
}
