/**
 * @module
 *
 * The whitespace extension which adds support for displaying whitespace
 * characters in the editor.
 *
 * This is heavily inspired by
 * [`prosemirror-invisibles`](https://github.com/guardian/prosemirror-invisibles].
 */

import {
  ApplyStateLifecycleProps,
  command,
  CommandFunction,
  EditorState,
  extension,
  getChangedRanges,
  getDocRange,
  isEmptyObject,
  isString,
  OnSetOptionsProps,
  PlainExtension,
  ProsemirrorNode,
} from '@remirror/core';
import { DecorationSet } from '@remirror/pm/view';

import { WhitespaceDecorator, WhitespaceOptions } from './whitespace-types';
import {
  createDefaultWhitespaceDecorators,
  generateDecorations,
  toggleWhitespaceOptions,
} from './whitespace-utils';

/**
 * Manage whitespace characters within your editor.
 *
 * This adds decorators to the editor to represent the whitespace characters and
 * can be useful for increasing the accessibility of your editor.
 */
@extension<WhitespaceOptions>({
  defaultOptions: {
    initialVisibility: false,
    breakNodes: ['hardBreak'],
    paragraphNodes: ['paragraph'],
    spaceCharacters: [' '],
    decorators: ['hardBreak', 'paragraph', 'space'],
  },
  staticKeys: ['initialVisibility'],
})
export class WhitespaceExtension extends PlainExtension<WhitespaceOptions> {
  private active = this.options.initialVisibility;

  /**
   * Set this to true to force updates to the decorationSet even if the editor
   * doc hasn't been changed. This is set to true when running commands.
   */
  private forcedUpdate = false;

  /**
   * The white space decorations to be applied.
   */
  private decorationSet: DecorationSet = DecorationSet.empty;

  /**
   * The decorator methods which are used to produce the whitespace characters
   * in for the provided ranges.
   */
  private decorators: WhitespaceDecorator[] = [];

  get name() {
    return 'whitespace' as const;
  }

  // Setup the initial decorators.
  protected init(): void {
    this.updateDecorators();
  }

  /**
   * Create the initial decoration state.
   */
  onInitState(state: EditorState): void {
    this.decorationSet = this.createFullDecorationSet(state.doc);
  }

  /**
   * Update the whitespace decorations for each state update.
   */
  onApplyState(props: ApplyStateLifecycleProps): void {
    const { tr } = props;

    if (!tr.docChanged && !this.forcedUpdate) {
      return;
    }

    if (this.forcedUpdate) {
      this.forcedUpdate = false;
      this.decorationSet = this.active ? this.createFullDecorationSet(tr.doc) : DecorationSet.empty;

      return;
    }

    const changedRanges = getChangedRanges(tr);
    this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);

    for (const { from, to } of changedRanges) {
      this.decorationSet = generateDecorations({
        from,
        to,
        doc: tr.doc,
        decorationSet: this.decorationSet,
        decorators: this.decorators,
      });
    }
  }

  createDecorations(): DecorationSet {
    return this.decorationSet;
  }

  /**
   * When the decorators are updated we should update trigger an update to the
   * editor state.
   */
  protected onSetOptions(props: OnSetOptionsProps<WhitespaceOptions>): void {
    const { pickChanged } = props;
    const allUpdates = pickChanged([
      'breakNodes',
      'decorators',
      'paragraphNodes',
      'spaceCharacters',
    ]);

    if (isEmptyObject(allUpdates)) {
      return;
    }

    this.updateDecorators();
    this.store.commands.emptyUpdate(() => {
      // Make sure to update the decorations, even though the document hasn't
      // changed.
      this.forcedUpdate = true;
    });
  }

  /**
   * Generate the whitespace decorations for the full .
   */
  private createFullDecorationSet(doc: ProsemirrorNode): DecorationSet {
    const { from, to } = getDocRange(doc);
    return generateDecorations({ from, to, doc, decorators: this.decorators });
  }

  /**
   * Create the decorators array.
   */
  private updateDecorators() {
    const decorators: WhitespaceDecorator[] = [];
    const { breakNodes, paragraphNodes, spaceCharacters } = this.options;
    const defaultDecorators = createDefaultWhitespaceDecorators({
      breakNodes,
      paragraphNodes,
      spaceCharacters,
    });

    for (const decorator of this.options.decorators) {
      decorators.push(isString(decorator) ? defaultDecorators[decorator] : decorator);
    }

    // Store the decorators.
    this.decorators = decorators;
  }

  /**
   * Toggle the visibility of whitespace characters.
   */
  @command(toggleWhitespaceOptions)
  toggleWhitespace(): CommandFunction {
    return (props) => {
      return this.store.commands.emptyUpdate.original(() => {
        this.forcedUpdate = true;
        this.active = !this.active;
      })(props);
    };
  }

  /**
   * Force the white space characters to be shown.
   */
  @command()
  showWhitespace(): CommandFunction {
    return (props) => {
      if (this.active) {
        return false;
      }

      return this.store.commands.emptyUpdate.original(() => {
        this.forcedUpdate = true;
        this.active = true;
      })(props);
    };
  }

  /**
   * Force the white space characters to be shown.
   */
  @command()
  hideWhitespace(): CommandFunction {
    return (props) => {
      if (!this.active) {
        return false;
      }

      return this.store.commands.emptyUpdate.original(() => {
        this.forcedUpdate = true;
        this.active = false;
      })(props);
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      whitespace: WhitespaceExtension;
    }
  }
}
