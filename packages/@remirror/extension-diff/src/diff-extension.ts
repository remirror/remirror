import {
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  EditorView,
  extension,
  FromToParameter,
  Handler,
  hasTransactionChanged,
  isDomNode,
  isEmptyArray,
  isEqual,
  isNumber,
  isString,
  PlainExtension,
  Static,
  Transaction,
} from '@remirror/core';
import { Mapping, StepMap } from '@remirror/pm/transform';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { Commit, Span, TrackState } from './diff-utils';

export interface DiffOptions {
  /**
   * @default 'blame-marker';
   */
  blameMarkerClass?: Static<string>;

  /**
   * @default `(message: string) => "Revert: '" + message + "'"`
   */
  revertMessage?: (message: string) => string;

  /**
   * A handler that is called whenever a tracked change is hovered over in the
   * editor.
   */
  onMouseOverCommit?: Handler<(parameter: HandlerParameter) => void>;

  /**
   * A handler that is called whenever a tracked change was being hovered is no
   * longer hovered.
   */
  onMouseLeaveCommit?: Handler<(parameter: HandlerParameter) => void>;

  /**
   * Called when the commit is part of the current text selection. Called with
   * an array of possible selection.
   */
  onSelectCommits?: Handler<
    (selections: HandlerParameter[], previousSelections?: HandlerParameter[]) => void
  >;

  /**
   * Called when commits are deselected.
   */
  onDeselectCommits?: Handler<(selections: HandlerParameter[]) => void>;
}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extension<DiffOptions>({
  defaultOptions: {
    blameMarkerClass: 'blame-marker',
    revertMessage: (message: string) => `Revert: '${message}'`,
  },
  staticKeys: ['blameMarkerClass'],
  handlerKeys: ['onMouseOverCommit', 'onMouseLeaveCommit', 'onSelectCommits', 'onDeselectCommits'],
})
export class DiffExtension extends PlainExtension<DiffOptions> {
  get name() {
    return 'diff' as const;
  }

  private hovered?: HandlerParameter;
  private selections?: HandlerParameter[];

  /**
   * Create the command for managing the commits in the document.
   */
  createCommands() {
    return {
      /**
       * Attach a commit message to the recent change.
       */
      commitChange: (message: string): CommandFunction => this.commit(message),

      /**
       * Revert the provided commit.
       */
      revertCommit: (commit?: Commit): CommandFunction => this.revertCommit(commit),

      /**
       * Highlight the provided commit.
       */
      highlightCommit: (commit: Commit | CommitId): CommandFunction => this.highlightCommit(commit),

      /**
       * Remove the highlight from the commit.
       */
      removeHighlightedCommit: (commit: Commit | CommitId): CommandFunction =>
        this.removeHighlightedCommit(commit),
    };
  }

  createHelpers() {
    return {
      /**
       * Get the full list of commits in the history.
       */
      getCommits: () => {
        return this.getCommits();
      },

      /**
       * Get the commit by it's ID.
       */
      getCommit: (id: CommitId) => this.getCommit(id),
    };
  }

  /**
   * Get the full list of tracked commit changes
   */
  private getCommits() {
    return this.getPluginState<DiffPluginState>().tracked.commits;
  }

  private getIndexByName(name: 'first' | 'last') {
    const length = this.getPluginState<DiffPluginState>().tracked.commits.length;

    switch (name) {
      case 'first':
        return 0;

      default:
        return length - 1;
    }
  }

  /**
   * Get the commit by it's index
   */
  private getCommit(id: CommitId) {
    const commits = this.getPluginState<DiffPluginState>().tracked.commits;

    if (isString(id)) {
      return commits[this.getIndexByName(id)];
    }

    return commits[id];
  }

  private getCommitId(commit: Commit) {
    const { tracked } = this.getPluginState<DiffPluginState>();
    return tracked.commits.indexOf(commit);
  }

  /**
   * Create the custom change tracking plugin.
   *
   * This has been adapted from the prosemirror website demo.
   * https://github.com/ProseMirror/website/blob/master/example/track/index.js
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init: (_, state) => {
          return this.createInitialState(state);
        },

        apply: (tr, pluginState: DiffPluginState, _: EditorState, state: EditorState) => {
          const newState = this.applyStateUpdates(tr, pluginState, state);
          this.handleSelection(tr, newState);

          return newState;
        },
      },
      props: {
        decorations: (state) => {
          return this.getPluginState<DiffPluginState>(state).decorations;
        },
        handleDOMEvents: {
          mouseover: (view, event) => {
            return this.handlerMouseOver(view, event);
          },
          mouseleave: (view, event) => {
            return this.handleMouseLeave(view, event);
          },
        },
      },
    };
  }

  /**
   * Calls the selection handlers when the selection changes the number of
   * commit spans covered.
   */
  private handleSelection(tr: Transaction, pluginState: DiffPluginState) {
    if (!hasTransactionChanged(tr)) {
      return;
    }

    const { from, to } = tr.selection;
    const { blameMap, commits } = pluginState.tracked;
    const selections: HandlerParameter[] = [];

    for (const map of blameMap) {
      const selectionIncludesSpan =
        (map.from <= from && map.to >= from) || (map.from <= to && map.to >= to);

      if (!selectionIncludesSpan || !isNumber(map.commit) || map.commit >= commits.length) {
        continue;
      }

      selections.push({ commit: this.getCommit(map.commit), from: map.from, to: map.to });
    }

    const selectionHasCommit = selections.length > 0;

    if (selectionHasCommit && !isEqual(selections, this.selections)) {
      this.options.onSelectCommits(selections, this.selections);
      this.selections = selections;

      return;
    }

    if (this.selections) {
      this.options.onDeselectCommits(this.selections);
      this.selections = undefined;
    }
  }

  /**
   * Transform the view and event into a commit and span.
   */
  private getHandlerParameterFromEvent(
    view: EditorView,
    event: Event,
  ): HandlerParameter | undefined {
    if (!isDomNode(event.target)) {
      return;
    }

    const pos = view.posAtDOM(event.target, 0);
    const { tracked } = this.getPluginState<DiffPluginState>();
    const span = tracked.blameMap.find((map) => map.from <= pos && map.to >= pos);

    if (!span || !isNumber(span.commit)) {
      return;
    }

    return { commit: this.getCommit(span.commit), from: span.from, to: span.to };
  }

  /**
   * Capture the mouseover event and trigger the `onMouseOverCommit` handler
   * when it is captured.
   */
  private handlerMouseOver(view: EditorView, event: Event) {
    const parameter = this.getHandlerParameterFromEvent(view, event);

    if (parameter) {
      this.hovered = parameter;
      this.options.onMouseOverCommit(parameter);
    }

    return false;
  }

  /**
   * Capture the mouseleave event and trigger the `onMouseLeaveCommit` handler.
   */
  private handleMouseLeave(view: EditorView, event: Event) {
    if (!this.hovered) {
      return false;
    }

    const commit = this.getHandlerParameterFromEvent(view, event);

    if (commit) {
      this.hovered = undefined;
      this.options.onMouseLeaveCommit(commit);
    }

    return false;
  }

  /**
   * Create the initial plugin state for the custom plugin.
   */
  private createInitialState(state: EditorState): DiffPluginState {
    return {
      tracked: new TrackState({
        blameMap: [new Span({ from: 0, to: state.doc.content.size, commit: undefined })],
        commits: [],
        uncommittedMaps: [],
        uncommittedSteps: [],
      }),
      decorations: DecorationSet.empty,
    };
  }

  /**
   * Apply state updates in response to document changes.
   */
  private applyStateUpdates(
    tr: Transaction,
    pluginState: DiffPluginState,
    state: EditorState,
  ): DiffPluginState {
    return {
      ...this.updateTracked(tr, pluginState),
      ...this.updateHighlights(tr, pluginState, state),
    };
  }

  private createDecorationSet(
    commits: number[],
    pluginState: DiffPluginState,
    state: EditorState,
  ): DecorationSet {
    const { tracked } = pluginState;
    const decorations: Decoration[] = [];

    for (const { commit, from, to } of tracked.blameMap) {
      if (!isNumber(commit) || !commits.includes(commit)) {
        continue;
      }

      decorations.push(Decoration.inline(from, to, { class: this.options.blameMarkerClass }));
    }

    return DecorationSet.create(state.doc, decorations);
  }

  /**
   * Apply updates to the highlight decorations.
   */
  private updateHighlights(
    tr: Transaction,
    pluginState: DiffPluginState,
    state: EditorState,
  ): HighlightStateParameter {
    const { add, clear } = this.getMeta(tr);

    if (isNumber(add) && pluginState.commits && !pluginState.commits.includes(add)) {
      const commits = [...pluginState.commits, add];
      const decorations = this.createDecorationSet(commits, pluginState, state);

      return { decorations, commits };
    }

    if (isNumber(clear) && pluginState.commits && pluginState.commits.includes(clear)) {
      const commits = pluginState.commits.filter((commit) => commit !== clear);
      const decorations = this.createDecorationSet(commits, pluginState, state);

      return { decorations, commits };
    }

    if (tr.docChanged && !isEmptyArray(pluginState.commits)) {
      return {
        decorations: pluginState.decorations.map(tr.mapping, tr.doc),
        commits: pluginState.commits,
      };
    }

    return { decorations: pluginState.decorations, commits: pluginState.commits ?? [] };
  }

  /**
   * Apply updates for the commit tracker.
   *
   * Please note this isn't able to track marks and diffs. It can only
   * track changes to content.
   */
  private updateTracked(tr: Transaction, state: TrackedStateParameter): TrackedStateParameter {
    let { tracked } = state;

    if (tr.docChanged) {
      tracked = tracked.applyTransform(tr);
    }

    const { message } = this.getMeta(tr);

    if (message) {
      tracked = tracked.applyCommit(message, tr.time);
    }

    return { tracked };
  }

  private highlightCommit(commit: Commit | CommitId): CommandFunction {
    return (parameter) => {
      const { tr, dispatch } = parameter;

      if (isString(commit)) {
        commit = this.getIndexByName(commit);
      }

      if (!isNumber(commit)) {
        commit = this.getCommitId(commit);
      }

      if (dispatch) {
        dispatch(this.setMeta(tr, { add: commit }));
      }

      return true;
    };
  }

  private removeHighlightedCommit(commit: Commit | CommitId): CommandFunction {
    return (parameter) => {
      const { tr, dispatch } = parameter;

      if (isString(commit)) {
        commit = this.getIndexByName(commit);
      }

      if (!isNumber(commit)) {
        commit = this.getCommitId(commit);
      }

      if (dispatch) {
        dispatch(this.setMeta(tr, { clear: commit }));
      }

      return true;
    };
  }

  /**
   * Add a commit to the transaction history.
   */
  private commit(message: string): CommandFunction {
    return (parameter) => {
      const { tr, dispatch } = parameter;

      if (dispatch) {
        dispatch(this.setMeta(tr, { message }));
      }

      return true;
    };
  }

  /**
   * Revert a commit which was added to the transaction history.
   */
  private readonly revertCommit = (commit?: Commit): CommandFunction => (parameter) => {
    const { state, tr, dispatch } = parameter;

    if (!commit) {
      commit = this.getCommit('last');
    }

    const { tracked } = this.getPluginState<DiffPluginState>(state);
    const index = tracked.commits.indexOf(commit);

    // If this commit is not in the history, we can't revert it
    if (index === -1) {
      return false;
    }

    // Reverting is only possible if there are no uncommitted changes
    if (!isEmptyArray(tracked.uncommittedSteps)) {
      // return alert('Commit your changes first!');
      return false; // TODO add a handler here.
    }

    if (!dispatch) {
      return true;
    }

    // This is the mapping from the document as it was at the start of
    // the commit to the current document.
    const remap = new Mapping(
      tracked.commits.slice(index).reduce((maps, c) => maps.concat(c.maps), [] as StepMap[]),
    );

    // Build up a transaction that includes all (inverted) steps in this
    // commit, rebased to the current document. They have to be applied
    // in reverse order.
    for (let i = commit.steps.length - 1; i >= 0; i--) {
      // The mapping is sliced to not include maps for this step and the
      // ones before it.
      const remapped = commit.steps[i].map(remap.slice(i + 1));

      if (!remapped) {
        continue;
      }

      const result = tr.maybeStep(remapped);

      // If the step can be applied, add its map to our mapping
      // pipeline, so that subsequent steps are mapped over it.
      if (result.doc) {
        remap.appendMap(remapped.getMap(), i);
      }
    }

    // Add a commit message and dispatch.
    if (tr.docChanged) {
      this.setMeta(tr, { message: this.options.revertMessage(commit.message) });
      dispatch(tr);
    }

    return true;
  };

  /**
   * Get the meta data for this custom plugin.
   */
  private getMeta(tr: Transaction): DiffMeta {
    return tr.getMeta(this.pluginKey) ?? {};
  }

  /**
   * Set the meta data for the plugin.
   */
  private setMeta(tr: Transaction, meta: DiffMeta): Transaction {
    tr.setMeta(this.pluginKey, { ...this.getMeta(tr), ...meta });

    return tr;
  }
}

interface TrackedStateParameter {
  /**
   * The tracked state.
   */
  tracked: TrackState;
}

interface HighlightStateParameter {
  /**
   * The decorations for highlighted commits.
   */
  decorations: DecorationSet;

  /**
   * The id's of the commits to be highlighted.
   */
  commits?: number[];
}

export interface DiffPluginState extends TrackedStateParameter, HighlightStateParameter {}

interface DiffMeta {
  message?: string;
  add?: number;
  clear?: number;
}

type CommitId = number | 'first' | 'last';

export interface HandlerParameter extends FromToParameter {
  /**
   * The commit.
   */
  commit: Commit;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      diff: DiffExtension;
    }
  }
}
