import {
  bool,
  EditorState,
  EditorView,
  Extension,
  Selection,
  selectionEmpty,
  Transaction,
} from '@remirror/core';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {
  ActionTaken,
  MentionNodeAttrs,
  MentionOptions,
  SuggestionsCallbackParams,
  SuggestionStateField,
} from './types';
import { actionsTaken, getSuggestionMatchState, runSuggestionsCommand } from './utils';

export class SuggestionState {
  /**
   * Keeps track of the current state
   */
  private next?: SuggestionStateField;

  /**
   * Holds onto the previous active state
   */
  private prev?: SuggestionStateField;

  /**
   * The actions taken in the most recent view update
   */
  private actions: ActionTaken[] = [];

  /**
   * Holds a copy of the view
   */
  private view!: EditorView;

  /**
   * Returns the current active suggestion state field if one exists
   */
  get current(): SuggestionStateField | undefined {
    return this.next
      ? this.next
      : this.prev && this.actions.includes(ActionTaken.Exited)
      ? this.prev
      : undefined;
  }

  /**
   * Returns whether state holds an active suggestion or not
   */
  get active(): boolean {
    return bool(this.current);
  }

  /**
   * The last state update created a new suggestion match
   */
  get entered(): boolean {
    return this.actions.some(action => [ActionTaken.Entered, ActionTaken.Moved].includes(action));
  }

  /**
   * The last state update caused a change in the suggestion matched
   */
  get changed(): boolean {
    return this.actions.includes(ActionTaken.Changed) && !this.actions.includes(ActionTaken.Moved);
  }

  /**
   * The last state update led to an exit from the suggestion match
   */
  get exited(): boolean {
    return this.actions.some(action => [ActionTaken.Exited, ActionTaken.Moved].includes(action));
  }

  constructor(private extension: Extension<MentionOptions>) {}

  public init(view: EditorView) {
    this.view = view;
    return this;
  }

  /**
   * Resets the state when a match is no longer available
   */
  private resetState() {
    this.next = undefined;
    this.prev = undefined;
    this.actions = [];
  }

  /**
   * Manages the view updates
   *
   * @param view
   * @param state
   */
  private onViewUpdate: (view: EditorView, prevState: EditorState) => void = () => {
    this.actions = actionsTaken(this.prev, this.next);
    const stateField = this.current;
    const { entered, changed, exited } = this;

    // Cancel when a suggestion isn't active
    if (!this.actions.length || !stateField || (!entered && !changed && !exited)) {
      return;
    }

    const { appendText, onChange, onEnter, onExit } = this.extension.options;

    const props: SuggestionsCallbackParams = {
      view: this.view,
      ...stateField,
      command: (attrs: MentionNodeAttrs) => {
        if (stateField.name) {
          attrs.name = stateField.name;
        }

        runSuggestionsCommand({
          name: this.extension.name,
          range: stateField.range,
          attrs,
          schema: this.view.state.schema,
          appendText: attrs.hasOwnProperty('appendText') ? String(attrs.appendText) : appendText,
        })(this.view.state, this.view.dispatch, this.view);
      },
    };

    // Trigger the hooks when necessary
    if (exited) {
      onExit(props);
    }

    if (changed) {
      onChange(props);
    }

    if (entered) {
      onEnter(props);
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
    return this.current;
  }

  /**
   * Resets the value of next when the user has exited a previous suggestion range.
   * This will then register as an exit in the next view update and can be used to trigger the onExit callback.
   * This is used to determine whether to reset the next field state.
   *
   * @param selection
   */
  private resetNextOnExit(selection: Selection) {
    if (this.prev && (selection.from < this.prev.range.from || selection.from > this.prev.range.to)) {
      this.next = undefined;
    }
  }

  /**
   * Applies updates to the state to be used within the plugins apply method.
   *
   * @param tr
   */
  public apply(tr: Transaction) {
    if (!tr.docChanged) {
      return this;
    }

    this.prev = this.next;
    // If the last run included an ending action reset the state fields
    if (this.actions.includes(ActionTaken.Exited)) {
      this.resetState();
    }

    const { selection } = tr;

    if (!selectionEmpty(selection)) {
      this.next = undefined;
    } else {
      this.resetNextOnExit(selection);

      // Match against the current selection position
      const $position = selection.$from;

      // Find the first match and break when done
      for (const matcher of this.extension.options.matchers) {
        const match = getSuggestionMatchState(matcher, $position);
        if (match) {
          this.next = match;
          break;
        }
      }
    }

    return this;
  }

  /**
   * Managers the keyDown event within the plugin props
   *
   * @param event
   */
  public handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.current || !this.current.query.length) {
      return false;
    }
    return this.extension.options.onKeyDown({ view: this.view, event, range: this.current.range });
  }

  /**
   * Handle the decorations which wrap the mention while it is active and not yet complete.
   *
   * @param state
   */
  public decorations(state: EditorState) {
    if (!this.current || !this.current.query.length) {
      return;
    }

    const { range, name } = this.current;
    const { from, to } = range;
    const { decorationsTag, suggestionClassName } = this.extension.options;

    return DecorationSet.create(state.doc, [
      Decoration.inline(from, to, {
        nodeName: decorationsTag,
        class: name ? `${suggestionClassName} ${suggestionClassName}-${name}` : suggestionClassName,
      }),
    ]);
  }
}
