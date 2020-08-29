import mergeDescriptors from 'merge-descriptors';
import type { Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

import { bool, isFunction, isString, object } from '@remirror/core-helpers';
import type {
  CompareStateParameter,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  FromToParameter,
  ResolvedPosParameter,
  TextParameter,
  TransactionParameter,
} from '@remirror/core-types';

import { ChangeReason, DEFAULT_SUGGESTER, ExitReason } from './suggest-constants';
import { isInvalidSplitReason, isJumpReason, isValidMatch } from './suggest-predicates';
import type {
  AddIgnoredParameter,
  CompareMatchParameter,
  RemoveIgnoredParameter,
  SuggestCallbackParameter,
  Suggester,
  SuggestKeyBindingParameter,
  SuggestReasonMap,
  SuggestStateMatch,
  SuggestStateMatchReason,
} from './suggest-types';
import { findFromSuggesters, findReason, runKeyBindings } from './suggest-utils';

/**
 * The `prosemirror-suggest` state which manages the list of suggesters.
 */
export class SuggestState {
  /**
   * Create an instance of the SuggestState class.
   */
  static create(suggesters: Suggester[]) {
    return new SuggestState(suggesters);
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
  #suggesters: Array<Required<Suggester>>;

  /**
   * Keeps track of the current state.
   */
  #next?: Readonly<SuggestStateMatch>;

  /**
   * Holds onto the previous active state.
   */
  #prev?: Readonly<SuggestStateMatch>;

  /**
   * The handler matches which are passed into `onChange` / `onExit` handlers.
   */
  #handlerMatches: SuggestReasonMap = object();

  /**
   * Holds a copy of the view
   */
  private view!: EditorView;

  /**
   * The set of ignored decorations
   */
  #ignored = DecorationSet.empty;

  /**
   * Lets us know whether the most recent change was to remove a mention.
   */
  #removed = false;

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
  get removed() {
    return this.#removed;
  }

  /**
   * Returns the current active suggester state field if one exists
   */
  get match(): Readonly<SuggestStateMatch> | undefined {
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
  constructor(suggesters: Suggester[]) {
    const mapper = createSuggesterMapper();
    this.#suggesters = suggesters.map(mapper);
  }

  /**
   * Initialize the SuggestState with a view which is stored for use later.
   */
  init(view: EditorView) {
    this.view = view;
    return this;
  }

  /**
   * Sets the removed property to be true. This is passed as a property to the
   * `createCommand` option.
   */
  readonly setMarkRemoved = () => {
    this.#removed = true;
  };

  /**
   * The actions created by the extension.
   */
  private getCommand(match: SuggestStateMatch, reason?: ExitReason | ChangeReason) {
    return match.suggester.createCommand({
      match,
      reason,
      view: this.view,
      setMarkRemoved: this.setMarkRemoved,
      addIgnored: this.addIgnored,
      clearIgnored: this.clearIgnored,
      ignoreNextExit: this.ignoreNextExit,
    });
  }

  /**
   * Create the props which should be passed into each action handler
   */
  private createParameter(match: SuggestStateMatch): SuggestCallbackParameter {
    return {
      view: this.view,
      addIgnored: this.addIgnored,
      clearIgnored: this.clearIgnored,
      ignoreNextExit: this.ignoreNextExit,
      command: this.getCommand(match),
      ...match,
    };
  }

  /**
   * Create the prop to be passed into the `onChange` or `onExit` handler.
   */
  private createReasonParameter<Reason extends ExitReason | ChangeReason>(
    match: SuggestStateMatchReason<Reason>,
  ) {
    return {
      ...this.createParameter(match),
      command: this.getCommand(match, match.reason),
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
   * Manages the view updates.
   */
  private onViewUpdate() {
    const { change, exit } = this.#handlerMatches;
    const match = this.match;

    // Cancel update when a suggester isn't active
    if ((!change && !exit) || !isValidMatch(match)) {
      return;
    }

    // When a jump happens run the action that involves the
    // position that occurs later in the document. This is so that changes don't
    // affect previous positions.
    if (change && exit && isJumpReason({ change, exit })) {
      const exitParameters = this.createReasonParameter(exit);
      const changeParameters = this.createReasonParameter(change);
      const movedForwards = exit.range.from < change.range.from;

      if (movedForwards) {
        change.suggester.onChange(changeParameters);
        this.shouldRunExit() && exit.suggester.onExit(exitParameters);
      } else {
        this.shouldRunExit() && exit.suggester.onExit(exitParameters);
        change.suggester.onChange(changeParameters);
      }

      this.#removed = false;
      return;
    }

    if (change) {
      change.suggester.onChange(this.createReasonParameter(change));
    }

    if (exit && this.shouldRunExit()) {
      exit.suggester.onExit(this.createReasonParameter(exit));
      this.#removed = false;

      if (isInvalidSplitReason(exit.reason)) {
        this.#handlerMatches = object();
      }
    }
  }

  /**
   * Update the current ignored decorations based on the latest changes to the
   * prosemirror document.
   */
  private mapIgnoredDecorations(tr: Transaction) {
    // Map over and update the ignored decorations.
    const ignored = this.#ignored.map(tr.mapping, tr.doc);
    const decorations = ignored.find();

    // For suggesters with multiple characters it is possible for a `paste` or
    // any edit action within the decoration to expand the ignored section. We
    // check for that here and if the section size has changed it should be
    // marked as invalid and removed from the ignored `DecorationSet`.
    const invalid = decorations.filter(({ from, to, spec }) => {
      if (to - from !== spec.char.length) {
        return true;
      }

      return false;
    });

    this.#ignored = ignored.remove(invalid);
  }

  readonly ignoreNextExit = () => {
    this.#ignoreNextExit = true;
  };

  /**
   * Ignores the match specified. Until the match is deleted no more `onChange`,
   * `onExit` handlers will be triggered. It will be like the match doesn't
   * exist.
   *
   * @remarks
   *
   * All we need to ignore is the match character. This means that any further
   * matches from the activation character will be ignored.
   */
  readonly addIgnored = ({ from, char, name, specific = false }: AddIgnoredParameter) => {
    const to = from + char.length;
    const suggester = this.#suggesters.find((value) => value.name === name);

    if (!suggester) {
      throw new Error(`No suggester exists for the name provided: ${name}`);
    }

    const attributes = suggester.ignoredClassName ? { class: suggester.ignoredClassName } : {};

    const decoration = Decoration.inline(
      from,
      to,
      { nodeName: suggester.ignoredTag, ...attributes },
      { char, name, specific },
    );

    this.#ignored = this.#ignored.add(this.view.state.doc, [decoration]);
  };

  /**
   * Removes a single match character from the ignored decorations.
   *
   * @remarks
   *
   * After this point event handlers will begin to be called again for match
   * character.
   */
  readonly removeIgnored = ({ from, char, name }: RemoveIgnoredParameter) => {
    const decorations = this.#ignored.find(from, from + char.length);
    const decoration = decorations[0];

    if (!bool(decoration) || decoration.spec.name !== name) {
      return;
    }

    this.#ignored = this.#ignored.remove([decoration]);
  };

  /**
   * Removes all the ignored decorations so that suggesters can active their
   * handlers anywhere in the document.
   */
  readonly clearIgnored = (name?: string) => {
    if (name) {
      const decorations = this.#ignored.find();
      const decorationsToClear = decorations.filter(({ spec }) => {
        return spec.name === name;
      });

      this.#ignored = this.#ignored.remove(decorationsToClear);
    } else {
      this.#ignored = DecorationSet.empty;
    }
  };

  private shouldIgnoreMatch({ range, suggester: { name } }: SuggestStateMatch) {
    const decorations = this.#ignored.find();

    return decorations.some(({ spec, from }) => {
      if (from !== range.from) {
        return false;
      }

      const shouldIgnore = spec.specific ? spec.name === name : true;
      return shouldIgnore;
    });
  }

  /**
   * Reset the state.
   */
  private resetState() {
    this.#handlerMatches = object();
    this.#next = undefined;
    this.#removed = false;
  }

  /**
   * Update the next state value.
   */
  private updateReasons(parameter: UpdateReasonsParameter) {
    const { $pos, state } = parameter;
    const docChanged = this.#docChanged;
    const match = findFromSuggesters({ suggesters: this.#suggesters, $pos, docChanged });

    // Track the next match if not being ignored.
    this.#next = match && this.shouldIgnoreMatch(match) ? undefined : match;

    // Store the matches with reasons
    this.#handlerMatches = findReason({ next: this.#next, prev: this.#prev, state, $pos });
  }

  /**
   * Add a new suggest or replace it if it already exists.
   */
  addSuggester(suggester: Suggester) {
    const previous = this.#suggesters.find((item) => item.name === suggester.name);
    const mapper = createSuggesterMapper();

    if (previous) {
      this.#suggesters = this.#suggesters.map((item) =>
        item === previous ? mapper(suggester) : item,
      );
    } else {
      this.#suggesters = [...this.#suggesters, mapper(suggester)];
    }

    return () => this.removeSuggester(suggester.name);
  }

  /**
   * Remove a suggester if it exists.
   */
  removeSuggester(suggester: Suggester | string): void {
    const name = isString(suggester) ? suggester : suggester.name;
    this.#suggesters = this.#suggesters.filter((item) => item.name !== name);
  }

  /**
   * Used to handle the view property of the plugin spec.
   */
  viewHandler() {
    return {
      update: this.onViewUpdate.bind(this),
    };
  }

  toJSON() {
    return this.match;
  }

  /**
   * Applies updates to the state to be used within the plugins apply method.
   *
   * @param - params
   */
  apply({ tr, newState }: TransactionParameter & CompareStateParameter) {
    const { exit } = this.#handlerMatches;
    const transactionHasChanged = tr.docChanged || tr.selectionSet;

    if (!transactionHasChanged && !this.#removed) {
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
    this.updateReasons({ $pos: tr.selection.$from, state: newState });

    return this;
  }

  /**
   * Manages the keyDown event within the plugin props
   *
   * @param event
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    const { match } = this;

    if (!isValidMatch(match)) {
      return false;
    }

    const { keyBindings } = match.suggester;
    const parameter: SuggestKeyBindingParameter = {
      event,
      setMarkRemoved: this.setMarkRemoved,
      ...this.createParameter(match),
    };

    // TODO recalculating the keybindings on every update this is a performance bottleneck
    return runKeyBindings(isFunction(keyBindings) ? keyBindings() : keyBindings, parameter);
  }

  /**
   * Handle any key presses of non supported characters
   */
  handleTextInput({ text, from, to }: HandleTextInputParameter): boolean {
    const match = this.match;

    if (!isValidMatch(match)) {
      return false;
    }

    const { onCharacterEntry } = match.suggester;

    return onCharacterEntry({
      ...this.createParameter(match),
      from,
      to,
      text,
    });
  }

  /**
   * Handle the decorations which wrap the mention while it is active and not
   * yet complete.
   */
  decorations(state: EditorState) {
    const match = this.match;

    if (!isValidMatch(match)) {
      return this.#ignored;
    }

    if (match.suggester.noDecorations) {
      return this.#ignored;
    }

    const {
      range,
      suggester: { name, suggestTag, suggestClassName },
    } = match;
    const { from, end } = range;

    return this.shouldIgnoreMatch(match)
      ? this.#ignored
      : this.#ignored.add(state.doc, [
          Decoration.inline(from, end, {
            nodeName: suggestTag,
            class: name ? `${suggestClassName} ${suggestClassName}-${name}` : suggestClassName,
          }),
        ]);
  }
}

interface HandleTextInputParameter extends FromToParameter, TextParameter {}
interface UpdateReasonsParameter<Schema extends EditorSchema = EditorSchema>
  extends EditorStateParameter<Schema>,
    ResolvedPosParameter<Schema>,
    Partial<CompareMatchParameter> {}

/**
 * The parameter object for the {@link SuggestState.apply} method.
 *
 * @remarks
 *
 * **Extends**
 *
 * -  {@link @remirror/core-types#TransactionParameter}
 * -  {@link @remirror/core-types#CompareStateParameter}
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface SuggestStateApplyParameter<Schema extends EditorSchema = EditorSchema>
  extends TransactionParameter<Schema>,
    CompareStateParameter<Schema> {}

function createSuggesterMapper() {
  const names = new Set<string>();

  return (suggester: Suggester) => {
    if (names.has(suggester.name)) {
      throw new Error(
        `A suggester already exists with the name '${suggester.name}'. The name provided must be unique.`,
      );
    }

    const clone = { ...DEFAULT_SUGGESTER, ...suggester };

    // Preserve any descriptors (getters and setters)
    mergeDescriptors(clone, suggester);

    names.add(suggester.name);
    return clone;
  };
}
