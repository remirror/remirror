import escapeStringRegex from 'escape-string-regexp';
import matchAll from 'string.prototype.matchall';
import {
  command,
  CommandFunction,
  CreateExtensionPlugin,
  DispatchFunction,
  extension,
  FromToProps,
  Helper,
  helper,
  isNumber,
  PlainExtension,
  ProsemirrorNode,
  Transaction,
} from '@remirror/core';
import { Decoration, DecorationAttrs, DecorationSet } from '@remirror/pm/view';

import {
  ReplaceAllOptions,
  ReplaceOptions,
  SearchResult,
  StartSearchOptions,
} from './search-types';
import { rotateIndex } from './search-utils';

export interface SearchOptions {
  /**
   * The inline decoraton to apply to all search results.
   *
   * @defaultValue '{style: "background-color: yellow;"}'
   */
  searchDecoration?: DecorationAttrs;

  /**
   * The inline decoraton to apply to the active search result (if any).
   *
   * @defaultValue '{style: "background-color: orange;"}'
   */
  activeDecoration?: DecorationAttrs;

  /**
   * When the search is active, whether to do a search on every document change.
   *
   * @defaultValue false
   */
  alwaysSearch?: boolean;
}

/**
 * This extension add search functionality to your editor.
 */
@extension<SearchOptions>({
  defaultOptions: {
    searchDecoration: { style: 'background-color: yellow;' },
    activeDecoration: { style: 'background-color: orange;' },
    alwaysSearch: false,
  },
})
export class SearchExtension extends PlainExtension<SearchOptions> {
  get name() {
    return 'search' as const;
  }

  private _updating = false;
  private _searchTerm = '';
  private _caseSensitive = true;
  private _ranges: FromToProps[] = [];
  private _activeIndex?: number = undefined;

  @helper()
  search(options: StartSearchOptions): Helper<SearchResult> {
    this.store.commands.startSearch(options);
    return {
      activeIndex: this._activeIndex,
      ranges: this._ranges,
    };
  }

  @command()
  startSearch({ searchTerm, activeIndex, caseSensitive }: StartSearchOptions): CommandFunction {
    if (!searchTerm) {
      return this.stopSearch();
    }

    this._searchTerm = escapeStringRegex(searchTerm);
    this._activeIndex = activeIndex;
    this._caseSensitive = caseSensitive ?? false;

    return ({ tr, dispatch }) => {
      return this.updateView(tr, dispatch);
    };
  }

  @command()
  stopSearch(): CommandFunction {
    return ({ tr, dispatch }) => {
      this._searchTerm = '';
      this._activeIndex = undefined;
      return this.updateView(tr, dispatch);
    };
  }

  @command()
  replaceSearchResult({ replacement, index }: ReplaceOptions): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;
      index = rotateIndex(isNumber(index) ? index : this._activeIndex ?? 0, this._ranges.length);
      const result = this._ranges[index];

      if (!result) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      tr.insertText(replacement, result.from, result.to);
      return this.updateView(tr, dispatch);
    };
  }

  @command()
  replaceAllSearchResults({ replacement }: ReplaceAllOptions): CommandFunction {
    return (props) => {
      const { tr } = props;
      const ranges = this.gatherSearchResults(tr.doc);

      for (let i = ranges.length - 1; i >= 0; i--) {
        const { from, to } = ranges[i];
        tr.insertText(replacement, from, to);
      }

      return this.stopSearch()(props);
    };
  }

  /**
   * This plugin is responsible for do the searching and updating the
   * decorations.
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (tr, old) => {
          if (this._updating || (tr.docChanged && this.options.alwaysSearch)) {
            const doc = tr.doc;
            this._ranges = this.gatherSearchResults(doc);
            this.normalizeActiveIndex();
            this.scrollToActiveResult();
            return this.createDecorationSet(doc);
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

  private gatherSearchResults(doc: ProsemirrorNode): FromToProps[] {
    if (!this._searchTerm) {
      return [];
    }

    const re = new RegExp(this._searchTerm, this._caseSensitive ? 'gu' : 'gui');
    const ranges: FromToProps[] = [];

    doc.descendants((node, pos) => {
      if (!node.isTextblock) {
        return true;
      }

      const start = pos + 1;

      for (const match of matchAll(node.textContent, re)) {
        const from = start + (match.index ?? 0);
        const to = from + match[0].length;
        ranges.push({ from, to });
      }

      return false;
    });

    return ranges;
  }

  private normalizeActiveIndex(): void {
    if (this._activeIndex != null) {
      this._activeIndex = rotateIndex(this._activeIndex, this._ranges.length);
    }
  }

  private createDecorationSet(doc: ProsemirrorNode): DecorationSet {
    const decorations = this._ranges.map((deco, index) => {
      return Decoration.inline(
        deco.from,
        deco.to,
        index === this._activeIndex ? this.options.activeDecoration : this.options.searchDecoration,
      );
    });
    return DecorationSet.create(doc, decorations);
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

  private scrollToActiveResult(): void {
    if (this._activeIndex == null) {
      return;
    }

    const activeResult = this._ranges[this._activeIndex];

    if (!activeResult) {
      return;
    }

    const view = this.store.view;
    const maxSize = view.state.doc.content.size;
    const pos = activeResult.from;

    if (pos > maxSize) {
      return;
    }

    const dom = view.domAtPos(pos).node as HTMLElement;
    dom?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      search: SearchExtension;
    }
  }
}
