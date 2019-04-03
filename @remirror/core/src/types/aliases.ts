import { InputRule as PMInputRule } from 'prosemirror-inputrules';
import { Fragment as PMFragment, Mark as PMMark, ResolvedPos as PMResolvedPos } from 'prosemirror-model';
import {
  Plugin as PMPlugin,
  PluginKey as PMPluginKey,
  Selection as PMSelection,
  Transaction as PMTransaction,
} from 'prosemirror-state';
import { Mapping as PMMapping } from 'prosemirror-transform';
import {
  DecorationSet as PMDecorationSet,
  EditorView as PMEditorView,
  NodeView as PMNodeView,
} from 'prosemirror-view';
import { EditorSchema } from './base';

/* Type Aliases */

export type EditorView = PMEditorView<EditorSchema>;
export type Selection = PMSelection<EditorSchema>;
export type DecorationSet = PMDecorationSet<EditorSchema>;
export type Transaction = PMTransaction<EditorSchema>;
export type PluginKey<GPluginState = any> = PMPluginKey<GPluginState, EditorSchema>;
export type Plugin<GPluginState = any> = PMPlugin<GPluginState, EditorSchema>;
export type Mark = PMMark<EditorSchema>;
export type ResolvedPos = PMResolvedPos<EditorSchema>;
export type InputRule = PMInputRule<EditorSchema>;
export type Mapping = PMMapping;
export type Fragment = PMFragment<EditorSchema>;
export type NodeView = PMNodeView<EditorSchema>;
