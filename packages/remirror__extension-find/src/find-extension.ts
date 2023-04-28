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
  PlainExtension,
  ProsemirrorNode,
  Transaction,
} from '@remirror/core';
import { Decoration, DecorationAttrs, DecorationSet } from '@remirror/pm/view';

import { FindAndReplaceAllProps, FindAndReplaceProps, FindProps, FindResult } from './find-types';
import { rotateIndex } from './find-utils';

export interface FindOptions {
  /**
   * The inline decoraton to apply to all search results.
   *
   * @defaultValue '{style: "background-color: yellow;"}'
   */
  decoration?: DecorationAttrs;

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
  alwaysFind?: boolean;
}

/**
 * This extension add find and replace functionality to your editor.
 */
@extension<FindOptions>({
  defaultOptions: {
    decoration: { style: 'background-color: yellow;' },
    activeDecoration: { style: 'background-color: orange;' },
    alwaysFind: false,
  },
})
export class FindExtension extends PlainExtension<FindOptions> {
  get name() {
    return 'find' as const;
  }

  private _updating = false;
  private _query = '';
  private _caseSensitive = true;
  private _ranges: FromToProps[] = [];
  private _activeIndex?: number = undefined;

  /**
   * Find and highlight the search result in the editor.
   */
  @command()
  find({ query, activeIndex, caseSensitive }: FindProps): CommandFunction {
    if (!query) {
      return this.stopFind();
    }

    this.setProps({ query, activeIndex, caseSensitive });

    return ({ tr, dispatch }) => this.updateView(tr, dispatch);
  }

  /**
   * Stop find and remove all highlight.
   */
  @command()
  stopFind(): CommandFunction {
    return ({ tr, dispatch }) => {
      this._query = '';
      this._activeIndex = undefined;
      return this.updateView(tr, dispatch);
    };
  }

  /**
   * Find and replace one search result.
   */
  @command()
  findAndReplace({
    query,
    caseSensitive,
    replacement,
    index,
  }: FindAndReplaceProps): CommandFunction {
    return (props) => {
      this.setProps({ query, caseSensitive });

      const { tr, dispatch } = props;
      const ranges = this.gatherFindResults(tr.doc);
      index = rotateIndex(index ?? this._activeIndex ?? 0, ranges.length);
      const result = ranges[index];

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

  /**
   * Find and replace all search results.
   */
  @command()
  findAndReplaceAll({
    query,
    caseSensitive,
    replacement,
  }: FindAndReplaceAllProps): CommandFunction {
    return (props) => {
      this.setProps({ query, caseSensitive });

      const { tr } = props;
      const ranges = this.gatherFindResults(tr.doc);

      for (let i = ranges.length - 1; i >= 0; i--) {
        const { from, to } = ranges[i];
        tr.insertText(replacement, from, to);
      }

      return this.stopFind()(props);
    };
  }

  /**
   * Find and highlight the search result in the editor. Returns search results.
   */
  @helper()
  findRanges(options: FindProps): Helper<FindResult> {
    this.store.commands.find(options);
    return {
      activeIndex: this._activeIndex,
      ranges: this._ranges,
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
          if (this._updating || (tr.docChanged && this.options.alwaysFind)) {
            const doc = tr.doc;
            this._ranges = this.gatherFindResults(doc);
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
        decorations: (state) => this.getPluginState(state),
      },
    };
  }

  private setProps({
    query,
    activeIndex,
    caseSensitive,
  }: {
    query: string;
    activeIndex?: number;
    caseSensitive?: boolean;
  }) {
    this._query = escapeStringRegex(query);
    this._activeIndex = activeIndex;
    this._caseSensitive = caseSensitive ?? false;
  }

  private gatherFindResults(doc: ProsemirrorNode): FromToProps[] {
    if (!this._query) {
      return [];
    }

    const re = new RegExp(this._query, this._caseSensitive ? 'gu' : 'gui');
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
    const decorations = this._ranges.map((deco, index) =>
      Decoration.inline(
        deco.from,
        deco.to,
        index === this._activeIndex ? this.options.activeDecoration : this.options.decoration,
      ),
    );
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
      find: FindExtension;
    }
  }
}
