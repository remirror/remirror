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
import { transactionChanged } from '@remirror/core-utils';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { ChangeReason, DEFAULT_SUGGESTER, ExitReason } from './suggest-constants';
import {
  CompareMatchParams,
  SuggestCallbackParams,
  Suggester,
  SuggestKeyBindingParams,
  SuggestReasonMap,
  SuggestStage,
  SuggestStateMatch,
  SuggestStateMatchReason,
} from './suggest-types';
import {
  findFromMatchers,
  findReason,
  isInvalidSplitReason,
  isJumpReason,
  isValidMatch,
  runKeyBindings,
} from './suggest-utils';

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
  private suggesters: Array<Required<Suggester>>;

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
  private handlerMatches: SuggestReasonMap = {};

  /**
   * Holds a copy of the view
   */
  private view!: EditorView<GSchema>;

  /**
   * Lets us know whether the most recent change was to remove a mark. This is
   * needed because sometimes removing a mark has not effect. Hence we need to
   * keep track of whether it's removed and then later in the apply step check
   * that a removal has happened and reset the `handlerMatches` to prevent an
   * infinite loop.
   */
  private removed = false;

  /**
   * The actions created by the extension.
   */
  private getCommand(match: SuggestStateMatch, reason?: ExitReason | ChangeReason) {
    return match.suggester.createCommand({ match, reason, stage: this.stage });
  }

  /**
   * Returns the current active suggestion state field if one exists
   */
  get match(): Readonly<SuggestStateMatch> | undefined {
    return this.next ? this.next : this.prev && this.handlerMatches.exit ? this.prev : undefined;
  }

  /**
   * Provides the current stage of the mention.
   */
  get stage(): SuggestStage {
    return this.match && this.match.suggester.getStage({ match: this.match, state: this.view.state })
      ? 'edit'
      : 'new';
  }

  // TODO Check for duplicate names and characters and log warnings when these
  // are found
  constructor(suggesters: Suggester[]) {
    this.suggesters = suggesters.map(suggester => ({ ...DEFAULT_SUGGESTER, ...suggester }));
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
      stage: this.stage,
      command: this.getCommand(match),
      ...match,
    };
  }

  /**
   * Create the prop to be passed into the `onChange` or `onExit` handler
   */
  private createReasonParams<GReason extends ExitReason | ChangeReason>(
    match: SuggestStateMatchReason<GReason>,
  ) {
    return {
      view: this.view,
      stage: this.stage,
      command: this.getCommand(match, match.reason),
      ...match,
    };
  }

  /**
   * Manages the view updates.
   */
  private onViewUpdate: OnViewUpdate = () => {
    const {
      match,
      handlerMatches: { change, exit },
    } = this;

    // Cancel when a suggestion isn't active
    if ((!change && !exit) || !isValidMatch(match)) {
      return;
    }

    const { onChange, onExit } = match.suggester;

    // Call Handlers

    // When a jump happens run the action that involves the position that occurs
    // later in the document. This is so that changes don't affect previous
    // positions.

    if (change && exit && isJumpReason({ change, exit })) {
      const exitParams = this.createReasonParams(exit);
      const changeParams = this.createReasonParams(change);
      const movedForwards = exit.range.from < change.range.from;

      movedForwards ? onChange(changeParams) : onExit(exitParams);
      movedForwards ? onExit(exitParams) : onChange(changeParams);
    }

    if (change) {
      onChange(this.createReasonParams(change));
    }

    if (exit) {
      onExit(this.createReasonParams(exit));
      if (isInvalidSplitReason(exit.reason)) {
        this.handlerMatches = {};
      }
    }
  };

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
   * Reset the state.
   */
  private resetState() {
    this.handlerMatches = {};
    this.next = undefined;
    this.removed = false;
  }

  /**
   * Applies updates to the state to be used within the plugins apply method.
   */
  public apply({ tr, newState }: TransactionParams & CompareStateParams) {
    const { exit } = this.handlerMatches;

    if (!transactionChanged(tr) && !this.removed) {
      return this;
    }

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
   * Update the next state value.
   */
  private updateReasons({ $pos, state }: UpdateReasonsParams) {
    this.next = findFromMatchers({ suggesters: this.suggesters, $pos });

    // Store the matches with reasons
    this.handlerMatches = findReason({ next: this.next, prev: this.prev, state, $pos });
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
      entry: { text, from, to },
    });
  }

  /**
   * Handle the decorations which wrap the mention while it is active and not
   * yet complete.
   */
  public decorations(state: EditorState) {
    const match = this.match;
    if (!isValidMatch(match)) {
      return;
    }

    const { range, name } = match;
    const { from, end } = range;
    const { decorationsTag, suggestionClassName } = match.suggester;

    return DecorationSet.create(state.doc, [
      Decoration.inline(from, end, {
        nodeName: decorationsTag,
        class: name ? `${suggestionClassName} ${suggestionClassName}-${name}` : suggestionClassName,
      }),
    ]);
  }
}

export const suggestPluginKey = new PluginKey('suggest');

/**
 * This creates the plugin that manages the suggestions to offer when the
 * MentionExtension is active.
 */
export const suggest = (...suggesters: Suggester[]) => {
  const pluginState = SuggestState.create(suggesters);

  return new Plugin<SuggestState, EditorSchema>({
    key: suggestPluginKey,

    // Handle the plugin view
    view(view) {
      return pluginState.init(view).viewHandler();
    },

    state: {
      // Initialize the state
      init() {
        return pluginState;
      },

      // Apply changes to the state
      apply(tr, _, oldState, newState) {
        return pluginState.apply({ tr, oldState, newState });
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(_, event) {
        return pluginState.handleKeyDown(event);
      },

      // Defer to the pluginState handler
      handleTextInput(_, from, to, text) {
        return pluginState.handleTextInput({ text, from, to });
      },

      // Sets up a decoration (styling options) on the currently active
      // decoration
      decorations(state) {
        return pluginState.decorations(state);
      },
    },
  });
};

interface HandleTextInputParams extends FromToParams, TextParams {}

interface UpdateReasonsParams extends EditorStateParams, ResolvedPosParams, Partial<CompareMatchParams> {}

type OnViewUpdate = (view: EditorView, state: EditorState) => void;
