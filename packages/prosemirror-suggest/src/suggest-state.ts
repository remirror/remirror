import { PluginKey, Selection, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { isFunction, isString, object, sort } from '@remirror/core-helpers';

import {
  isInvalidSplitReason,
  isJumpReason,
  isTextSelection,
  isValidMatch,
} from './suggest-predicates';
import type {
  AddIgnoredProps,
  CompareMatchProps,
  EditorSchema,
  EditorState,
  EditorStateProps,
  EditorView,
  RemoveIgnoredProps,
  ResolvedPos,
  ResolvedPosProps,
  SuggestChangeHandlerProps,
  Suggester,
  SuggestMatch,
  SuggestReasonMap,
  Transaction,
  TransactionProps,
} from './suggest-types';
import {
  DEFAULT_SUGGESTER,
  findFromSuggesters,
  findReason,
  IGNORE_SUGGEST_META_KEY,
} from './suggest-utils';

/**
 * The `prosemirror-suggest` state which manages the list of suggesters.
 */
export class SuggestState<Schema extends EditorSchema = EditorSchema> {
  /**
   * Create an instance of the SuggestState class.
   */
  static create<Schema extends EditorSchema = EditorSchema>(
    suggesters: Array<Suggester<Schema>>,
  ): SuggestState<Schema> {
    return new SuggestState<Schema>(suggesters);
  }

  /**
   * True when the doc changed in the most recently applied transaction.
   */
  #docChanged = false;

  /**
   * Whether the next exit should be ignored.
   */
  #ignoreNextExit = false;

  /**
   * The suggesters that have been registered for the suggesters plugin.
   */
  #suggesters: Array<Required<Suggester<Schema>>>;

  /**
   * Keeps track of the current state.
   */
  #next?: Readonly<SuggestMatch<Schema>>;

  /**
   * Holds onto the previous active state.
   */
  #prev?: Readonly<SuggestMatch<Schema>>;

  /**
   * The handler matches which are passed into the `onChange` handler.
   */
  #handlerMatches: SuggestReasonMap<Schema> = object();

  /**
   * Holds a copy of the view
   */
  private view!: EditorView<Schema>;

  /**
   * The set of ignored decorations
   */
  #ignored = DecorationSet.empty;

  /**
   * Lets us know whether the most recent change was to remove a mention.
   */
  #removed = false;

  /**
   * This is true when the last change was caused by a transaction being appended via this plugin.
   */
  #lastChangeFromAppend = false;

  /**
   * The set of all decorations.
   */
  get decorationSet(): DecorationSet {
    return this.#ignored;
  }

  /**
   * True when the most recent change was to remove a mention.
   *
   * @remarks
   *
   * This is needed because sometimes removing a prosemirror `Mark` has no
   * effect. Hence we need to keep track of whether it's removed and then later
   * in the apply step check that a removal has happened and reset the
   * `handlerMatches` to prevent an infinite loop.
   */
  get removed(): boolean {
    return this.#removed;
  }

  /**
   * Returns the current active suggester state field if one exists
   */
  get match(): Readonly<SuggestMatch<Schema>> | undefined {
    return this.#next
      ? this.#next
      : this.#prev && this.#handlerMatches.exit
      ? this.#prev
      : undefined;
  }

  /**
   * Create the state for the `prosemirror-suggest` plugin.
   *
   * @remarks
   *
   * Each suggester must provide a name value which is globally unique since it
   * acts as the identifier.
   *
   * It is possible to register multiple suggesters with identical `char`
   * properties. The matched suggester is based on the specificity of the
   * `regex` and the order in which they are passed in. Earlier suggesters are
   * prioritized.
   */
  constructor(suggesters: Array<Suggester<Schema>>) {
    const mapper = createSuggesterMapper();
    this.#suggesters = suggesters.map(mapper);
    this.#suggesters = sort(this.#suggesters, (a, b) => b.priority - a.priority);
  }

  /**
   * Initialize the SuggestState with a view which is stored for use later.
   */
  init(view: EditorView<Schema>): this {
    this.view = view;
    return this;
  }

  /**
   * Sets the removed property to be true.
   *
   * This is useful when working with marks.
   */
  readonly setMarkRemoved = (): void => {
    this.#removed = true;
  };

  /**
   * Create the props which should be passed into each action handler
   */
  private createProps(match: SuggestMatch<Schema>): SuggestChangeHandlerProps<Schema> {
    const { name, char } = match.suggester;

    return {
      view: this.view,
      addIgnored: this.addIgnored,
      clearIgnored: this.clearIgnored,
      ignoreNextExit: this.ignoreNextExit,
      setMarkRemoved: this.setMarkRemoved,
      name,
      char,
      ...match,
    };
  }

  /**
   * Check whether the exit callback is valid at this time.
   */
  private shouldRunExit(): boolean {
    if (this.#ignoreNextExit) {
      this.#ignoreNextExit = false;
      return false;
    }

    return true;
  }

  /**
   * Find the next text selection from the current selection.
   */
  readonly findNextTextSelection = (selection: Selection<Schema>): TextSelection<Schema> | void => {
    const doc = selection.$from.doc;

    // Make sure the position doesn't exceed the bounds of the document.
    const pos = Math.min(doc.nodeSize - 2, selection.to + 1);
    const $pos = doc.resolve(pos);

    // Get the position furthest along in the editor to pass back to suggesters
    // which have the handler.
    const nextSelection = Selection.findFrom($pos, 1, true);

    // Ignore non-text selections and null / undefined values. This is needed
    // for TS mainly, since the `true` in the `Selection.findFrom` method means
    // only `TextSelection` instances will be returned.
    if (!isTextSelection<Schema>(nextSelection)) {
      return;
    }

    return nextSelection;
  };

  /**
   * Update all the suggesters with the next valid selection. This is called
   * within the `appendTransaction` ProseMirror method before any of the change
   * handlers are called.
   *
   * @internal
   */
  updateWithNextSelection(tr: Transaction<Schema>): void {
    // Get the position furthest along in the editor to pass back to suggesters
    // which have the handler.
    const nextSelection = this.findNextTextSelection(tr.selection);

    if (!nextSelection) {
      return;
    }

    // Update every suggester with a method attached.
    for (const suggester of this.#suggesters) {
      const change = this.#handlerMatches.change?.suggester.name;
      const exit = this.#handlerMatches.exit?.suggester.name;

      suggester.checkNextValidSelection?.(nextSelection.$from, tr, { change, exit });
    }
  }

  /**
   * Call the `onChange` handlers.
   *
   * @internal
   */
  changeHandler(tr: Transaction<Schema>, appendTransaction: boolean): void {
    const { change, exit } = this.#handlerMatches;
    const match = this.match;

    // Cancel update when a suggester isn't active
    if ((!change && !exit) || !isValidMatch(match)) {
      return;
    }

    const shouldRunExit =
      appendTransaction === exit?.suggester.appendTransaction && this.shouldRunExit();
    const shouldRunChange = appendTransaction === change?.suggester.appendTransaction;

    if (!shouldRunExit && !shouldRunChange) {
      return;
    }

    // When a jump happens run the action that involves the position that occurs
    // later in the document. This is so that changes don't affect previous
    // positions.
    if (change && exit && isJumpReason({ change, exit })) {
      const exitDetails = this.createProps(exit);
      const changeDetails = this.createProps(change);

      // Whether the jump was forwards or backwards. A forwards jump means that
      // the user was within a suggester nearer the beginning of the document,
      // before jumping forward to a point later on in the document.
      const movedForwards = exit.range.from < change.range.from;

      if (movedForwards) {
        // Subtle change to call exit first. Conceptually it happens before the
        // change so call the handler before the change handler.
        shouldRunExit && exit.suggester.onChange(exitDetails, tr);
        shouldRunChange && change.suggester.onChange(changeDetails, tr);
      } else {
        shouldRunExit && exit.suggester.onChange(exitDetails, tr);
        shouldRunChange && change.suggester.onChange(changeDetails, tr);
      }

      if (shouldRunExit) {
        this.#removed = false;
      }

      return;
    }

    if (change && shouldRunChange) {
      change.suggester.onChange(this.createProps(change), tr);
    }

    if (exit && shouldRunExit) {
      exit.suggester.onChange(this.createProps(exit), tr);
      this.#removed = false;

      if (isInvalidSplitReason(exit.exitReason)) {
        // When the split has made the match invalid, remove the matches before
        // the next input.
        this.#handlerMatches = object();
      }
    }

    return;
  }

  /**
   * Update the current ignored decorations based on the latest changes to the
   * prosemirror document.
   */
  private mapIgnoredDecorations(tr: Transaction<Schema>) {
    // Map over and update the ignored decorations.
    const ignored = this.#ignored.map(tr.mapping, tr.doc);
    const decorations = ignored.find();

    // For suggesters with multiple characters it is possible for a `paste` or
    // any edit action within the decoration to expand the ignored section. We
    // check for that here and if the section size has changed it should be
    // marked as invalid and removed from the ignored `DecorationSet`.
    const invalid = decorations.filter(({ from, to, spec }) => {
      const charLength = isString(spec.char) ? spec.char.length : 1;

      if (to - from !== charLength) {
        return true;
      }

      return false;
    });

    this.#ignored = ignored.remove(invalid);
  }

  /**
   * This sets the next exit to not trigger the exit reason inside the
   * `onChange` callback.
   *
   * This can be useful when you trigger a command, that exists the suggestion
   * match and want to prevent further onChanges from occurring for the
   * currently active suggester.
   */
  readonly ignoreNextExit = (): void => {
    this.#ignoreNextExit = true;
  };

  /**
   * Ignores the match specified. Until the match is deleted no more `onChange`
   * handler will be triggered. It will be like the match doesn't exist.
   *
   * @remarks
   *
   * All we need to ignore is the match character. This means that any further
   * matches from the activation character will be ignored.
   */
  readonly addIgnored = ({ from, name, specific = false }: AddIgnoredProps): void => {
    const suggester = this.#suggesters.find((value) => value.name === name);

    if (!suggester) {
      throw new Error(`No suggester exists for the name provided: ${name}`);
    }

    const offset = isString(suggester.char) ? suggester.char.length : 1;
    const to = from + offset;

    const attributes = suggester.ignoredClassName ? { class: suggester.ignoredClassName } : {};

    const decoration = Decoration.inline(
      from,
      to,
      { nodeName: suggester.ignoredTag, ...attributes },
      { name, specific, char: suggester.char },
    );

    this.#ignored = this.#ignored.add(this.view.state.doc, [decoration]);
  };

  /**
   * Removes a single match character from the ignored decorations.
   *
   * @remarks
   *
   * After this point event handlers will begin to be called again for the match
   * character.
   */
  readonly removeIgnored = ({ from, name }: RemoveIgnoredProps): void => {
    const suggester = this.#suggesters.find((value) => value.name === name);

    if (!suggester) {
      throw new Error(`No suggester exists for the name provided: ${name}`);
    }

    const offset = isString(suggester.char) ? suggester.char.length : 1;
    const decoration = this.#ignored.find(from, from + offset)[0];

    if (!decoration || decoration.spec.name !== name) {
      return;
    }

    this.#ignored = this.#ignored.remove([decoration]);
  };

  /**
   * Removes all the ignored sections of the document. Once this happens
   * suggesters will be able to activate in the previously ignored sections.
   */
  readonly clearIgnored = (name?: string): void => {
    if (!name) {
      this.#ignored = DecorationSet.empty;
      return;
    }

    const decorations = this.#ignored.find();
    const decorationsToClear = decorations.filter(({ spec }) => {
      return spec.name === name;
    });

    this.#ignored = this.#ignored.remove(decorationsToClear);
  };

  /**
   * Checks whether a match should be ignored.
   *
   * TODO add logic here to decide whether to ignore a match based on the active
   * node, or mark.
   */
  private shouldIgnoreMatch<Schema extends EditorSchema = EditorSchema>({
    range,
    suggester: { name },
  }: SuggestMatch<Schema>) {
    const decorations = this.#ignored.find();

    const shouldIgnore = decorations.some(({ spec, from }) => {
      if (from !== range.from) {
        return false;
      }

      return spec.specific ? spec.name === name : true;
    });

    return shouldIgnore;
  }

  /**
   * Reset the state.
   */
  private resetState() {
    this.#handlerMatches = object();
    this.#next = undefined;
    this.#removed = false;
    this.#lastChangeFromAppend = false;
  }

  /**
   * Update the next state value.
   */
  private updateReasons(props: UpdateReasonsProps<Schema>) {
    const { $pos, state } = props;
    const docChanged = this.#docChanged;
    const suggesters = this.#suggesters;
    const selectionEmpty = state.selection.empty;
    const match = isTextSelection(state.selection)
      ? findFromSuggesters({ suggesters, $pos, docChanged, selectionEmpty })
      : undefined;

    // Track the next match if not being ignored.
    this.#next = match && this.shouldIgnoreMatch(match) ? undefined : match;

    // Store the matches with reasons
    this.#handlerMatches = findReason({ next: this.#next, prev: this.#prev, state, $pos });
  }

  /**
   * A helper method to check is a match exists for the provided suggester name
   * at the provided position.
   */
  readonly findMatchAtPosition = (
    $pos: ResolvedPos<Schema>,
    name?: string,
  ): SuggestMatch<Schema> | undefined => {
    const suggesters = name
      ? this.#suggesters.filter((suggester) => suggester.name === name)
      : this.#suggesters;

    return findFromSuggesters({ suggesters, $pos, docChanged: false, selectionEmpty: true });
  };

  /**
   * Add a new suggest or replace it if it already exists.
   */
  addSuggester(suggester: Suggester<Schema>): () => void {
    const previous = this.#suggesters.find((item) => item.name === suggester.name);
    const mapper = createSuggesterMapper();

    if (previous) {
      this.#suggesters = this.#suggesters.map((item) =>
        item === previous ? mapper(suggester) : item,
      );
    } else {
      const suggesters = [...this.#suggesters, mapper(suggester)];
      this.#suggesters = sort(suggesters, (a, b) => b.priority - a.priority);
    }

    return () => this.removeSuggester(suggester.name);
  }

  /**
   * Remove a suggester if it exists.
   */
  removeSuggester(suggester: Suggester | string): void {
    const name = isString(suggester) ? suggester : suggester.name;
    this.#suggesters = this.#suggesters.filter((item) => item.name !== name);

    // When removing a suggester make sure to clear the ignored sections.
    this.clearIgnored(name);
  }

  toJSON(): SuggestMatch<Schema> | undefined {
    return this.match;
  }

  /**
   * Applies updates to the state to be used within the plugins apply method.
   *
   * @param - params
   */
  apply(props: TransactionProps<Schema> & EditorStateProps<Schema>): this {
    if (this.#lastChangeFromAppend) {
      this.#lastChangeFromAppend = false;
      return this;
    }

    const { tr, state } = props;
    const { exit } = this.#handlerMatches;
    const transactionHasChanged = tr.docChanged || tr.selectionSet;
    const shouldIgnoreUpdate: boolean = tr.getMeta(IGNORE_SUGGEST_META_KEY);

    if (shouldIgnoreUpdate || (!transactionHasChanged && !this.#removed)) {
      return this;
    }

    this.#docChanged = tr.docChanged;
    this.mapIgnoredDecorations(tr);

    // If the previous run was an exit, reset the suggester matches.
    if (exit) {
      this.resetState();
    }

    // Track the previous match.
    this.#prev = this.#next;

    // Match against the current selection position
    this.updateReasons({ $pos: tr.selection.$from, state });

    return this;
  }

  /**
   * Handle the decorations which wrap the mention while it is active and not
   * yet complete.
   */
  createDecorations(state: EditorState<Schema>): DecorationSet<Schema> {
    const match = this.match;

    if (!isValidMatch(match)) {
      return this.#ignored;
    }

    const { disableDecorations } = match.suggester;
    const shouldSkip = isFunction(disableDecorations)
      ? disableDecorations(state, match)
      : disableDecorations;

    if (shouldSkip) {
      return this.#ignored;
    }

    const { range, suggester } = match;
    const { name, suggestTag, suggestClassName } = suggester;
    const { from, to } = range;

    return this.shouldIgnoreMatch(match)
      ? this.#ignored
      : this.#ignored.add(state.doc, [
          Decoration.inline(
            from,
            to,
            {
              nodeName: suggestTag,
              class: name ? `${suggestClassName} suggest-${name}` : suggestClassName,
            },
            { name },
          ),
        ]);
  }

  /**
   * Set that the last change was caused by an appended transaction.
   *
   * @internal
   */
  setLastChangeFromAppend = (): void => {
    this.#lastChangeFromAppend = true;
  };
}
interface UpdateReasonsProps<Schema extends EditorSchema = EditorSchema>
  extends EditorStateProps<Schema>,
    ResolvedPosProps<Schema>,
    Partial<CompareMatchProps> {}

/**
 * Map over the suggesters provided and make sure they have all the required
 * properties.
 */
function createSuggesterMapper() {
  const names = new Set<string>();

  return <Schema extends EditorSchema = EditorSchema>(
    suggester: Suggester<Schema>,
  ): Required<Suggester<Schema>> => {
    if (names.has(suggester.name)) {
      throw new Error(
        `A suggester already exists with the name '${suggester.name}'. The name provided must be unique.`,
      );
    }

    // Attach the defaults to the passed in suggester.
    const suggesterWithDefaults = { ...DEFAULT_SUGGESTER, ...suggester };

    names.add(suggester.name);
    return suggesterWithDefaults;
  };
}

/**
 * This key is stored to provide access to the plugin state.
 */
export const suggestPluginKey = new PluginKey('suggest');
