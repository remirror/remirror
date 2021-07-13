import {
  command,
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  EditorView,
  extension,
  FromToProps,
  Handler,
  hasTransactionChanged,
  Helper,
  helper,
  invariant,
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
  onMouseOverCommit?: Handler<(props: HandlerProps) => void>;

  /**
   * A handler that is called whenever a tracked change was being hovered is no
   * longer hovered.
   */
  onMouseLeaveCommit?: Handler<(props: HandlerProps) => void>;

  /**
   * Called when the commit is part of the current text selection. Called with
   * an array of possible selection.
   */
  onSelectCommits?: Handler<
    (selections: HandlerProps[], previousSelections?: HandlerProps[]) => void
  >;

  /**
   * Called when commits are deselected.
   */
  onDeselectCommits?: Handler<(selections: HandlerProps[]) => void>;
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

  private hovered?: HandlerProps;
  private selections?: HandlerProps[];

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
   * Highlight the provided commit.
   */
  @command()
  highlightCommit(commit: Commit | CommitId): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;

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

  /**
   * Remove the highlight from the commit.
   */
  @command()
  removeHighlightedCommit(commit: Commit | CommitId): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;

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
  @command()
  commitChange(message: string): CommandFunction {
    return (props) => {
      const { tr, dispatch } = props;

      if (dispatch) {
        dispatch(this.setMeta(tr, { message }));
      }

      return true;
    };
  }

  /**
   * Revert a commit which was added to the transaction history.
   */
  @command()
  revertCommit(commit?: Commit): CommandFunction {
    return (props) => {
      const { state, tr, dispatch } = props;

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

      const commitMaps: StepMap[] = [];

      for (const commit of tracked.commits.slice(index)) {
        commitMaps.push(...commit.maps);
      }

      // This is the mapping from the document as it was at the start of
      // the commit to the current document.
      const remap = new Mapping(commitMaps);

      // Build up a transaction that includes all (inverted) steps in this
      // commit, rebased to the current document. They have to be applied
      // in reverse order.
      for (let index = commit.steps.length - 1; index >= 0; index--) {
        // The mapping is sliced to not include maps for this step and the
        // ones before it.
        const remapped = commit.steps[index]?.map(remap.slice(index + 1));

        if (!remapped) {
          continue;
        }

        const result = tr.maybeStep(remapped);

        // If the step can be applied, add its map to our mapping
        // pipeline, so that subsequent steps are mapped over it.
        if (result.doc) {
          remap.appendMap(remapped.getMap(), index);
        }
      }

      // Add a commit message and dispatch.
      if (tr.docChanged) {
        this.setMeta(tr, { message: this.options.revertMessage(commit.message) });
        dispatch(tr);
      }

      return true;
    };
  }

  /**
   * Get the full list of tracked commit changes
   */
  @helper()
  getCommits(): Helper<Commit[]> {
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
  @helper()
  getCommit(id: CommitId): Helper<Commit> {
    const commits = this.getPluginState<DiffPluginState>().tracked.commits;
    const commit = isString(id) ? commits[this.getIndexByName(id)] : commits[id];
    invariant(commit, {});

    return commit;
  }

  private getCommitId(commit: Commit) {
    const { tracked } = this.getPluginState<DiffPluginState>();
    return tracked.commits.indexOf(commit);
  }

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
    const selections: HandlerProps[] = [];

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
  private getHandlerPropsFromEvent(view: EditorView, event: Event): HandlerProps | undefined {
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
    const props = this.getHandlerPropsFromEvent(view, event);

    if (props) {
      this.hovered = props;
      this.options.onMouseOverCommit(props);
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

    const commit = this.getHandlerPropsFromEvent(view, event);

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
  ): HighlightStateProps {
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
  private updateTracked(tr: Transaction, state: TrackedStateProps): TrackedStateProps {
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
}

interface TrackedStateProps {
  /**
   * The tracked state.
   */
  tracked: TrackState;
}

interface HighlightStateProps {
  /**
   * The decorations for highlighted commits.
   */
  decorations: DecorationSet;

  /**
   * The id's of the commits to be highlighted.
   */
  commits?: number[];
}

export interface DiffPluginState extends TrackedStateProps, HighlightStateProps {}

interface DiffMeta {
  message?: string;
  add?: number;
  clear?: number;
}

type CommitId = number | 'first' | 'last';

export interface HandlerProps extends FromToProps {
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
