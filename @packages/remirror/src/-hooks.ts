// import { useCallback, useState } from 'react';

// import { inputRules, undoInputRule } from 'prosemirror-inputrules';
// import { keymap } from 'prosemirror-keymap';
// import { Schema } from 'prosemirror-model';
// import { EditorState, Transaction } from 'prosemirror-state';
// import { EditorView } from 'prosemirror-view';
// import { baseKeymap, selectParentNode } from './config/commands';
// import { Bold } from './config/marks';
// import { Doc, Paragraph, Text } from './config/nodes';
// import { Placeholder } from './config/plugins';
// import { ExtensionManager } from './config/utils';
// import { isAttributeFunction } from './helpers';
// import { EditorSchema, IExtension, RemirrorEventListenerParams, RemirrorProps } from './types';

// const builtInExtensions = [new Doc(), new Text(), new Paragraph(), new Bold(), new Placeholder()];

// function createManager(
//   stateCallback: () => EditorState,
//   extensions: IExtension[],
//   useBuiltIn: boolean = true,
// ) {
//   return new ExtensionManager(
//     [...(useBuiltIn ? builtInExtensions : []), ...extensions],
//     stateCallback,
//   );
// }

// function createSchema(manager: ExtensionManager) {
//   return new Schema({
//     nodes: manager.nodes,
//     marks: manager.marks,
//   });
// }

// function createEditorState(manager: ExtensionManager, schema: EditorSchema) {
//   return EditorState.create({
//     plugins: [
//       ...manager.plugins,
//       inputRules({
//         rules: manager.inputRules({ schema }),
//       }),
//       ...manager.pasteRules({ schema }),
//       ...manager.keymaps({ schema }),
//       keymap({
//         Backspace: undoInputRule,
//         Escape: selectParentNode,
//       }),
//       keymap(baseKeymap),
//     ],
//   });
// }

// function eventListenerParams(): RemirrorEventListenerParams {
//   return {
//     state: this.state.editorState,
//     view: this.view,
//     getHTML: this.getHTML,
//     getJSON: this.getJSON,
//     getDocJSON: this.getDocJSON,
//     getText: this.getText,
//   };
// }

// /**
//  * This sets the attributes that wrap the outer prosemirror node.
//  * It is currently used for setting the aria attributes on the content-editable prosemirror div.
//  */
// const getAttributes = (
//   state: EditorState<EditorSchema>,
//   params: Pick<RemirrorProps, 'attributes'>,
// ) => {
//   const { attributes } = params;
//   const propAttributes = isAttributeFunction(attributes)
//     ? attributes({ ...this.eventListenerParams, state })
//     : attributes;

//   const defaultAttributes = {
//     role: 'textbox',
//     'aria-multiline': 'true',
//     'aria-placeholder': this.props.placeholder || '',
//     ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
//     'aria-label': this.props.label || '',
//     class: this.uid,
//   };
//   return { ...defaultAttributes, ...propAttributes };
// };

// const dispatchTransaction = (
//   transaction: Transaction<EditorSchema>,
//   editorState: EditorState,
//   setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
//   params: Pick<RemirrorProps, 'onChange' | 'dispatchTransaction'>,
// ) => {
//   if (params.dispatchTransaction) {
//     params.dispatchTransaction(transaction);
//   }
//   const { state, transactions } = editorState.applyTransaction(transaction);
//   this.view.updateState(state);

//   // setEditorState(setEditorState), () => {
//   //   if (transactions.some(tr => tr.docChanged) && params.onChange) {
//   //     params.onChange({ ...this.eventListenerParams, state });
//   //   }
//   // });
// };

// function createView(state: EditorState, params: Pick<RemirrorProps, 'editable'>) {
//   return new EditorView<EditorSchema>(undefined, {
//     state,
//     dispatchTransaction: this.dispatchTransaction,
//     attributes: this.getAttributes,
//     editable: () => {
//       return params.editable;
//     },
//   });
// }

// export function useRemirrorEditorState(params: RemirrorProps) {
//   const manager = createManager(() => editorState, params.extensions, params.useBuiltInExtensions);
//   const schema = createSchema(manager);
//   const initialState = createEditorState(manager, schema);
//   const [editorState, setEditorState] = useState(initialState);
//   const a = useCallback();

//   return {};
// }
