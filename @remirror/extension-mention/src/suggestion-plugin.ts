import {
  ActionGetter,
  CompareStateParams,
  EditorSchema,
  EditorState,
  EditorStateParams,
  EditorView,
  ExtensionManagerMarkTypeParams,
  FromToParams,
  isMarkActive,
  MarkExtension,
  MarkType,
  noop,
  ResolvedPosParams,
  TextParams,
  transactionChanged,
  TransactionParams,
} from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {
  ChangeReason,
  CompareMatchParams,
  ExitReason,
  MentionExtensionOptions,
  SuggestionActions,
  SuggestionCallbackParams,
  SuggestionCommandAttrs,
  SuggestionKeyBindingParams,
  SuggestionReasonMap,
  SuggestionStage,
  SuggestionStateMatch,
  SuggestionStateMatchReason,
} from './mention-types';
import {
  findFromMatchers,
  findReason,
  isInvalidSplitReason,
  isJumpReason,
  isRemovedReason,
  isSplitReason,
  isValidMatch,
  runKeyBindings,
} from './mention-utils';

export interface SuggestionStateCreateParams extends ExtensionManagerMarkTypeParams {
  extension: MarkExtension<MentionExtensionOptions>;
}

export class SuggestionState {
  /**
   * Create an instance of the SuggestionState.
   */
  public static create({ extension, type, getActions }: SuggestionStateCreateParams) {
    return new SuggestionState(extension, type, getActions);
  }

  /**
   * Keeps track of the current state.
   */
  private next?: Readonly<SuggestionStateMatch>;

  /**
   * Holds onto the previous active state.
   */
  private prev?: Readonly<SuggestionStateMatch>;

  /**
   * The handler matches which are passed into `onChange` / `onExit` handlers.
   */
  private handlerMatches: SuggestionReasonMap = {};

  /**
   * Holds a copy of the view
   */
  private view!: EditorView;

  /**
   * Lets us know whether the most recent change was to remove a mark. This is
   * needed because sometimes removing a mark has no effect. Hence we need to
   * keep track of whether it's removed and then later in the apply step check
   * that a removal has happened and reset the `handlerMatches` to prevent an
   * infinite loop.
   */
  private removed = false;

  /**
   * The actions created by the extension. The command prop
   */
  private getCommands(match: SuggestionStateMatch, reason?: ExitReason | ChangeReason): SuggestionActions {
    const { name, range } = match;
    const create = this.getActions('createMention');
    const update = this.getActions('updateMention');
    const remove = this.getActions('removeMention');
    const stage = this.stage;

    const fn = stage === 'new' ? create : update;
    const isSplit = isSplitReason(reason);
    const isInvalid = isInvalidSplitReason(reason);
    const isRemoved = isRemovedReason(reason);

    const command =
      isInvalid || isRemoved
        ? () => {
            this.removed = true;
            try {
              // This might fail when a deletion has taken place.
              isInvalid ? remove({ range: match.range }) : noop();
            } catch {}
          }
        : ({
            replacementType = isSplit ? 'partial' : 'full',
            id = match.query[replacementType],
            label = match.text[replacementType],
            appendText,
            ...attrs
          }: SuggestionCommandAttrs) => {
            fn({ id, label, appendText, replacementType, name, range, ...attrs });
          };

    return {
      create,
      update,
      remove,
      command,
      stage,
    };
  }

  /**
   * Returns the current active suggestion state field if one exists
   */
  get match(): Readonly<SuggestionStateMatch> | undefined {
    return this.next ? this.next : this.prev && this.handlerMatches.exit ? this.prev : undefined;
  }

  /**
   * Provides the current stage of the mention.
   */
  get stage(): SuggestionStage {
    return this.match &&
      isMarkActive({
        from: this.match.range.from,
        to: this.match.range.end,
        type: this.type,
        state: this.view.state,
      })
      ? 'edit'
      : 'new';
  }

  constructor(
    private extension: MarkExtension<MentionExtensionOptions>,
    private type: MarkType,
    private getActions: ActionGetter,
  ) {}

  /**
   * Initialize the SuggestionState with a view which is stored for use later.
   */
  public init(view: EditorView) {
    this.view = view;
    return this;
  }

  /**
   * Create the props which should be passed into each action handler
   */
  private createParams(match: SuggestionStateMatch): SuggestionCallbackParams {
    return {
      view: this.view,
      ...this.getCommands(match),
      ...match,
    };
  }

  /**
   * Create the prop to be passed into the `onChange` or `onExit` handler
   */
  private createReasonParams<GReason extends ExitReason | ChangeReason>(
    match: SuggestionStateMatchReason<GReason>,
  ) {
    return {
      view: this.view,
      ...this.getCommands(match, match.reason),
      ...match,
    };
  }

  /**
   * Manages the view updates
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

    const { onChange, onExit } = this.extension.options;

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
    this.next = findFromMatchers({ matchers: this.extension.options.matchers, $pos });

    // Store the matches with reasons
    this.handlerMatches = findReason({ next: this.next, prev: this.prev, state, $pos });
  }

  /**
   * Manages the keyDown event within the plugin props
   *
   * @param event
   */
  public handleKeyDown(event: KeyboardEvent): boolean {
    const { match, extension } = this;
    const { keyBindings } = extension.options;

    if (!isValidMatch(match)) {
      return false;
    }

    const params: SuggestionKeyBindingParams = {
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

    return this.extension.options.onCharacterEntry({
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
    const { decorationsTag, suggestionClassName } = this.extension.options;

    return DecorationSet.create(state.doc, [
      Decoration.inline(from, end, {
        nodeName: decorationsTag,
        class: name ? `${suggestionClassName} ${suggestionClassName}-${name}` : suggestionClassName,
      }),
    ]);
  }
}

/**
 * This creates the plugin that manages the suggestions to offer when the
 * MentionExtension is active.
 */
export const createSuggestionPlugin = ({ extension, ...params }: SuggestionStateCreateParams) => {
  const pluginState = SuggestionState.create({ extension, ...params });

  return new Plugin<SuggestionState, EditorSchema>({
    key: extension.pluginKey,

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
