import {
  CompareStateParams,
  EditorSchema,
  EditorState,
  EditorStateParams,
  EditorView,
  FromToParams,
  ResolvedPosParams,
  TextParams,
  TransactionParams,
} from '@remirror/core-types';
import { bool } from '@remirror/core-helpers';
import { transactionChanged } from '@remirror/core-utils';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { ChangeReason, DEFAULT_SUGGESTER, ExitReason } from './suggest-constants';
import { isInvalidSplitReason, isJumpReason, isValidMatch } from './suggest-predicates';
import {
  CompareMatchParams,
  SuggestCallbackParams,
  Suggester,
  SuggestKeyBindingParams,
  SuggestReasonMap,
  SuggestStateMatch,
  SuggestStateMatchReason,
  AddIgnoredParams,
  RemoveIgnoredParams,
} from './suggest-types';
import { findFromSuggesters, findReason, runKeyBindings } from './suggest-utils';
import { Transaction } from 'prosemirror-state';

/**
 * The suggestion state which manages the list of suggestions.
 */
export class SuggestState<GSchema extends EditorSchema = any> {
  /**
   * Create an instance of the SuggestState class.
   */
  public static create(suggesters: Suggester[]) {
    return new SuggestState(suggesters);
  }

  /**
   * The suggesters that have been registered for the suggestions plugin.
   */
  private readonly suggesters: Array<Required<Suggester>>;

  /**
   * Keeps track of the current state.
   */
  private next?: Readonly<SuggestStateMatch>;

  /**
   * Holds onto the previous active state.
   */
  private prev?: Readonly<SuggestStateMatch>;

  /**
   * The handler matches which are passed into `onChange` / `onExit` handlers.
   */
  private handlerMatches: SuggestReasonMap = Object.create(null);

  /**
   * Holds a copy of the view
   */
  private view!: EditorView<GSchema>;

  /**
   * The set of ignored decorations
   */
  private ignored = DecorationSet.empty;

  /**
   * Lets us know whether the most recent change was to remove a mention.
   *
   * This is needed because sometimes removing a prosemirror `Mark` has no
   * effect. Hence we need to keep track of whether it's removed and then later
   * in the apply step check that a removal has happened and reset the
   * `handlerMatches` to prevent an infinite loop.
   */
  private removed = false;

  /**
   * Sets the removed property to be true. This is passed as a property to the
   * `createCommand` option.
   */
  private readonly setRemovedTrue = () => {
    this.removed = true;
  };

  /**
   * The actions created by the extension.
   */
  private getCommand(match: SuggestStateMatch, reason?: ExitReason | ChangeReason) {
    return match.suggester.createCommand({
      match,
      reason,
      view: this.view,
      setMarkRemoved: this.setRemovedTrue,
      addIgnored: this.addIgnored,
      clearIgnored: this.clearIgnored,
    });
  }

  /**
   * Returns the current active suggestion state field if one exists
   */
  get match(): Readonly<SuggestStateMatch> | undefined {
    return this.next ? this.next : this.prev && this.handlerMatches.exit ? this.prev : undefined;
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
    const names: string[] = [];
    this.suggesters = suggesters.map(suggester => {
      if (names.includes(suggester.name)) {
        throw new Error(
          `A suggester already exists with the name '${suggester.name}'. The name provided must be unique.`,
        );
      }

      names.push(suggester.name);
      return { ...DEFAULT_SUGGESTER, ...suggester };
    });
  }

  /**
   * Initialize the SuggestState with a view which is stored for use later.
   */
  public init(view: EditorView) {
    this.view = view;
    return this;
  }

  /**
   * Create the props which should be passed into each action handler
   */
  private createParams(match: SuggestStateMatch): SuggestCallbackParams {
    return {
      view: this.view,
      addIgnored: this.addIgnored,
      clearIgnored: this.clearIgnored,
      command: this.getCommand(match),
      ...match,
    };
  }

  /**
   * Create the prop to be passed into the `onChange` or `onExit` handler.
   */
  private createReasonParams<GReason extends ExitReason | ChangeReason>(
    match: SuggestStateMatchReason<GReason>,
  ) {
    return {
      ...this.createParams(match),
      command: this.getCommand(match, match.reason),
      ...match,
    };
  }

  /**
   * Manages the view updates.
   */
  private readonly onViewUpdate = () => {
    const {
      match,
      handlerMatches: { change, exit },
    } = this;

    // Cancel update when a suggestion isn't active
    if ((!change && !exit) || !isValidMatch(match)) {
      return;
    }

    // Call Handlers
    // When a jump happens run the action that involves the position that occurs
    // later in the document. This is so that changes don't affect previous
    // positions.
    if (change && exit && isJumpReason({ change, exit })) {
      const exitParams = this.createReasonParams(exit);
      const changeParams = this.createReasonParams(change);
      const movedForwards = exit.range.from < change.range.from;
      movedForwards ? change.suggester.onChange(changeParams) : exit.suggester.onExit(exitParams);
      movedForwards ? exit.suggester.onExit(exitParams) : change.suggester.onChange(changeParams);
      this.removed = false;
      return;
    }

    if (change) {
      change.suggester.onChange(this.createReasonParams(change));
    }

    if (exit) {
      exit.suggester.onExit(this.createReasonParams(exit));
      this.removed = false;
      if (isInvalidSplitReason(exit.reason)) {
        this.handlerMatches = Object.create(null);
      }
    }
  };

  /**
   * Update the current ignored decorations based on the latest changes to the
   * prosemirror document.
   */
  private mapIgnoredDecorations(tr: Transaction) {
    // Map over and update the ignored decorations.
    const ignored = this.ignored.map(tr.mapping, tr.doc);
    const decorations = ignored.find();

    // For suggesters with multiple characters it is possible for a `paste` or
    // any edit action within the decoration to expand the ignored section. We check for
    // that here and if the section size has changed it should be marked as
    // invalid and removed from the ignored `DecorationSet`.
    const invalid = decorations.filter(({ from, to, spec }) => {
      if (to - from !== spec.char.length) {
        return true;
      }
      return false;
    });

    this.ignored = ignored.remove(invalid);
  }

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
  public addIgnored = ({ from, char, name, specific = false }: AddIgnoredParams) => {
    const to = from + char.length;
    const suggester = this.suggesters.find(val => val.name === name);

    if (!suggester) {
      throw new Error(`No suggester exists for the name provided: ${name}`);
    }

    const attrs = suggester.ignoredClassName ? { class: suggester.ignoredClassName } : {};

    const decoration = Decoration.inline(
      from,
      to,
      { nodeName: suggester.ignoredTag, ...attrs },
      { char, name, specific },
    );

    this.ignored = this.ignored.add(this.view.state.doc, [decoration]);
  };

  /**
   * Removes a single match character from the ignored decorations.
   *
   * @remarks
   *
   * After this point event handlers will begin to be called again for match character.
   */
  public removeIgnored = ({ from, char, name }: RemoveIgnoredParams) => {
    const decorations = this.ignored.find(from, from + char.length);
    const decoration = decorations[0];

    if (!bool(decoration) || decoration.spec.name !== name) {
      return;
    }

    this.ignored = this.ignored.remove([decoration]);
  };

  /**
   * Removes all the ignored decorations so that suggesters can active their
   * handlers anywhere in the document.
   */
  public clearIgnored = (name?: string) => {
    if (name) {
      const decorations = this.ignored.find();
      const decorationsToClear = decorations.filter(({ spec }) => {
        return spec.name === name;
      });

      this.ignored = this.ignored.remove(decorationsToClear);
    } else {
      this.ignored = DecorationSet.empty;
    }
  };

  private shouldIgnoreMatch({ range, suggester: { name } }: SuggestStateMatch) {
    const decorations = this.ignored.find();

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
    this.handlerMatches = Object.create(null);
    this.next = undefined;
    this.removed = false;
  }

  /**
   * Update the next state value.
   */
  private updateReasons({ $pos, state }: UpdateReasonsParams) {
    const match = findFromSuggesters({ suggesters: this.suggesters, $pos });
    this.next = match && this.shouldIgnoreMatch(match) ? undefined : match;

    // Store the matches with reasons
    this.handlerMatches = findReason({ next: this.next, prev: this.prev, state, $pos });
  }

  /**
   * Used to handle the view property of the plugin spec.
   */
  public viewHandler() {
    return {
      update: this.onViewUpdate,
    };
  }

  public toJSON() {
    return this.match;
  }

  /**
   * Applies updates to the state to be used within the plugins apply method.
   *
   * @param - params
   */
  public apply({ tr, newState }: TransactionParams<GSchema> & CompareStateParams<GSchema>) {
    const { exit } = this.handlerMatches;

    if (!transactionChanged(tr) && !this.removed) {
      return this;
    }

    this.mapIgnoredDecorations(tr);

    // If the previous run was an exit reset the suggestion matches
    if (exit) {
      this.resetState();
    }

    this.prev = this.next;

    // Match against the current selection position
    this.updateReasons({ $pos: tr.selection.$from, state: newState });

    return this;
  }

  /**
   * Manages the keyDown event within the plugin props
   *
   * @param event
   */
  public handleKeyDown(event: KeyboardEvent): boolean {
    const { match } = this;

    if (!isValidMatch(match)) {
      return false;
    }

    const { keyBindings } = match.suggester;
    const params: SuggestKeyBindingParams = {
      event,
      setMarkRemoved: this.setRemovedTrue,
      ...this.createParams(match),
    };

    return runKeyBindings(keyBindings, params);
  }

  /**
   * Handle any key presses of non supported characters
   */
  public handleTextInput({ text, from, to }: HandleTextInputParams): boolean {
    const match = this.match;

    if (!isValidMatch(match)) {
      return false;
    }

    const { onCharacterEntry } = match.suggester;

    return onCharacterEntry({
      ...this.createParams(match),
      from,
      to,
      text,
    });
  }

  /**
   * Handle the decorations which wrap the mention while it is active and not
   * yet complete.
   */
  public decorations(state: EditorState) {
    const match = this.match;

    if (!isValidMatch(match)) {
      return this.ignored;
    }

    if (match.suggester.noDecorations) {
      return this.ignored;
    }

    const {
      range,
      suggester: { name, suggestTag: decorationsTag, suggestClassName: suggestionClassName },
    } = match;
    const { from, end } = range;

    return this.shouldIgnoreMatch(match)
      ? this.ignored
      : this.ignored.add(state.doc, [
          Decoration.inline(from, end, {
            nodeName: decorationsTag,
            class: name ? `${suggestionClassName} ${suggestionClassName}-${name}` : suggestionClassName,
          }),
        ]);
  }
}

interface HandleTextInputParams extends FromToParams, TextParams {}
interface UpdateReasonsParams<GSchema extends EditorSchema = any>
  extends EditorStateParams<GSchema>,
    ResolvedPosParams<GSchema>,
    Partial<CompareMatchParams> {}

/**
 * The parameter object for the {@link SuggestState.apply} method.
 *
 * @remarks
 *
 * **Extends**
 *
 * -  {@link @remirror/core-types#TransactionParams}
 * -  {@link @remirror/core-types#CompareStateParams}
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface SuggestStateApplyParams<GSchema extends EditorSchema = any>
  extends TransactionParams<GSchema>,
    CompareStateParams<GSchema> {}
