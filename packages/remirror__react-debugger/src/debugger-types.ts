/**
 * @module
 *
 * Provide the types used within this debugging module.
 */

import type { Delta } from 'jsondiffpatch';
import { EditorState, FromToProps, RemirrorJSON, Shape } from '@remirror/core';

export interface JsonDiffOutput {
  id: string;
  delta: Delta | undefined;
}

export interface JsonDiffInput {
  id: string;
  a: object;
  b: object;
}

export interface JsonDiffWorkerInput {
  id: string;
  input: JsonDiffInput;
}

export interface JsonMark {
  type: string;
  attributes: Shape;
}

export type SelectionType = 'node' | 'text' | 'cell' | 'all' | 'unknown';
export interface JsonSelection {
  type: SelectionType;
  empty: boolean;
  anchor: number;
  head: number;
  from: number;
  to: number;
}

export interface HistoryEntry {
  id: string;
  state: EditorState;
  timestamp: number;
  diffPending: boolean;
  diff: Delta | undefined;
  selection: Delta | undefined;
  selectionContent: string;
}

export interface DebuggerSnapshot {
  name: string;
  timestamp: number;
  content: RemirrorJSON;
  selection: FromToProps;
}
