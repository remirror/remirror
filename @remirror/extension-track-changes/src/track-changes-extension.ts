import {
  CommandFunction,
  CreatePluginReturn,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  EditorState,
  HandlerKeyList,
  isEmptyArray,
  isNumber,
  PlainExtension,
  Static,
  StaticKeyList,
  Transaction,
} from '@remirror/core';
import { Mapping, StepMap } from '@remirror/pm/transform';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import { Commit, Span, TrackState } from './track-changes-utils';

export interface TrackChangesOptions {
  /**
   * @default 'blame-marker';
   */
  blameMarkerClass?: Static<string>;

  /**
   * @default `(message: string) => "Revert: '" + message + "'"`
   */
  revertMessage?: (message: string) => string;
}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class TrackChangesExtension extends PlainExtension<TrackChangesOptions> {
  static readonly staticKeys: StaticKeyList<TrackChangesOptions> = [];
  static readonly handlerKeys: HandlerKeyList<TrackChangesOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<TrackChangesOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<TrackChangesOptions> = {
    blameMarkerClass: 'blame-marker',
    revertMessage: (message: string) => `Revert: '${message}'`,
  };

  get name() {
    return 'trackChanges' as const;
  }

  /**
   * Create the command for managing the commits in the document.
   */
  createCommands = () => {
    return {
      /**
       * Attach a commit message to the recent change.
       */
      commitChange: (message: string) => this.commit(message),

      /**
       * Revert the provided commit.
       */
      revertCommit: (commit?: Commit): CommandFunction => this.revertCommit(commit),

      /**
       * Highlight the provided commit.
       */
      highlightCommit: (commit: Commit) => this.highlightCommit(commit),

      /**
       * Remove the highlight from the commit.
       */
      removeHighlightedCommit: (commit: Commit) => this.removeHighlightedCommit(commit),
    };
  };

  createHelpers = () => {
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
  };

  /**
   * Get the full list of tracked commit changes
   */
  private getCommits() {
    return this.getPluginState<TrackChangesPluginState>().tracked.commits;
  }

  /**
   * Get the commit by it's index
   */
  private getCommit(id: CommitId) {
    const commits = this.getPluginState<TrackChangesPluginState>().tracked.commits;

    switch (id) {
      case 'first':
        return commits[0];
      case 'last':
        return commits[commits.length - 1];
      default:
        return commits[id];
    }
  }

  /**
   * Create the custom change tracking plugin.
   *
   * This has been adapted from the prosemirror website demo.
   * https://github.com/ProseMirror/website/blob/master/example/track/index.js
   */
  createPlugin = (): CreatePluginReturn => {
    return {
      state: {
        init: (_, state) => {
          return this.createInitialState(state);
        },

        apply: (tr, pluginState: TrackChangesPluginState, _: EditorState, state: EditorState) => {
          return this.applyStateUpdates(tr, pluginState, state);
        },
      },
      props: {
        decorations: (state) => {
          return this.getPluginState<TrackChangesPluginState>(state).decorations;
        },
      },
    };
  };

  /**
   * Create the initial plugin state for the custom plugin.
   */
  private createInitialState(state: EditorState): TrackChangesPluginState {
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
    pluginState: TrackChangesPluginState,
    state: EditorState,
  ): TrackChangesPluginState {
    return {
      ...this.updateTracked(tr, pluginState),
      ...this.updateHighlights(tr, pluginState, state),
    };
  }

  /**
   * Apply updates to the highlight decorations.
   */
  private updateHighlights(
    tr: Transaction,
    pluginState: TrackChangesPluginState,
    state: EditorState,
  ): HighlightStateParameter {
    const { add, clear } = this.getMeta(tr);

    if (add && pluginState.commit !== add) {
      const { tracked } = pluginState;
      const decorations: Decoration[] = [];

      for (const { commit, from, to } of tracked.blameMap) {
        if (!isNumber(commit) || tracked.commits[commit] !== add) {
          continue;
        }

        decorations.push(Decoration.inline(from, to, { class: this.options.blameMarkerClass }));
      }

      return { decorations: DecorationSet.create(state.doc, decorations), commit: add };
    }

    if (clear && pluginState.commit === clear) {
      return { decorations: DecorationSet.empty, commit: undefined };
    }

    if (tr.docChanged && pluginState.commit) {
      return {
        decorations: pluginState.decorations.map(tr.mapping, tr.doc),
        commit: pluginState.commit,
      };
    }

    return { decorations: pluginState.decorations, commit: pluginState.commit };
  }

  /**
   * Apply updates for the commit tracker.
   *
   * Please note this isn't able to track marks and annotations. It can only
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

  private highlightCommit(commit: Commit): CommandFunction {
    return (parameter) => {
      const { tr, dispatch } = parameter;

      if (dispatch) {
        dispatch(this.setMeta(tr, { add: commit }));
      }

      return true;
    };
  }

  private removeHighlightedCommit(commit: Commit): CommandFunction {
    return (parameter) => {
      const { tr, dispatch } = parameter;

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

    const { tracked } = this.getPluginState<TrackChangesPluginState>(state);
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
  private getMeta(tr: Transaction): TrackChangesMeta {
    return tr.getMeta(this.pluginKey) ?? {};
  }

  /**
   * Set the meta data for the plugin.
   */
  private setMeta(tr: Transaction, meta: TrackChangesMeta): Transaction {
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
   * The commit to be highlighted.
   */
  commit?: Commit;
}

export interface TrackChangesPluginState extends TrackedStateParameter, HighlightStateParameter {}

interface TrackChangesMeta {
  message?: string;
  add?: Commit;
  clear?: Commit;
}

type CommitId = number | 'first' | 'last';
