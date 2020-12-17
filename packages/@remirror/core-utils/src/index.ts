export { nonChainable, convertCommand, chainableEditorState, chainCommands } from '@remirror/pm';

export {
  isChrome,
  lift,
  preserveSelection,
  removeMark,
  replaceText,
  setBlockType,
  toggleBlockItem,
  toggleWrap,
  updateMark,
  wrapIn,
} from './command-utils';

export type {
  CreateDocumentNodeParameter,
  GetMarkRange,
  InvalidContentBlock,
  InvalidContentHandler,
  InvalidContentHandlerParameter,
  StringHandler,
  StringHandlerParameter,
} from './core-utils';
export {
  areSchemasCompatible,
  isEmptyBlockNode,
  atDocEnd,
  atDocStart,
  canInsertNode,
  closestElement,
  createDocumentNode,
  endPositionOfParent,
  fromHtml,
  getCursor,
  getDocument,
  getInvalidContent,
  getMarkAttributes,
  getMarkRange,
  getMarkRanges,
  getMatchString,
  getNearestNonTextElement,
  getRemirrorJSON,
  getSelectedGroup,
  getSelectedWord,
  getTextContentFromSlice,
  getTextSelection,
  isAllSelection,
  isDocNode,
  isDocNodeEmpty,
  isDomNode,
  isEditorSchema,
  isEditorState,
  isElementDomNode,
  isMarkActive,
  isMarkType,
  isNodeSelection,
  isNodeType,
  isProsemirrorMark,
  isProsemirrorNode,
  isRemirrorJSON,
  isResolvedPos,
  isSelection,
  areStatesEqual,
  isTextDomNode,
  isTextSelection,
  isTransaction,
  shouldUseDomEnvironment,
  startPositionOfParent,
  omitExtraAttributes,
  toDom,
  toHtml,
  getChangedRanges,
  getChangedNodeRanges,
} from './core-utils';

export { environment } from './environment';

export type { ModifierKeys } from './keyboard-utils';
export {
  ALT,
  CAPS_LOCK,
  COMMAND,
  CTRL,
  isApple,
  mod,
  Modifier,
  SHIFT,
  WINDOWS,
} from './keyboard-utils';

export type { NodeWithPosition } from './prosemirror-node-utils';
export {
  containsNodesOfType,
  findBlockNodes,
  findChildren,
  findChildrenByAttribute,
  findChildrenByMark,
  findChildrenByNode,
  findInlineNodes,
  findTextNodes,
  getChangedNodes,
} from './prosemirror-node-utils';

export type {
  ShouldSkipFunction,
  SkippableInputRule,
  ShouldSkipParameter,
} from './prosemirror-rules';
export { markInputRule, markPasteRule, nodeInputRule, plainInputRule } from './prosemirror-rules';

export type {
  FindProsemirrorNodeResult,
  FindSelectedNodeOfType,
  SchemaJSON,
} from './prosemirror-utils';
export {
  applyClonedTransaction,
  chainKeyBindingCommands,
  cloneTransaction,
  findElementAtPosition,
  findNodeAtPosition,
  findNodeAtSelection,
  findParentNode,
  findParentNodeOfType,
  findPositionOfNodeAfter,
  findPositionOfNodeBefore,
  findSelectedNodeOfType,
  hasTransactionChanged,
  isNodeActive,
  isNodeOfType,
  isSelectionEmpty,
  markEqualsType,
  mergeKeyBindings,
  mergeProsemirrorKeyBindings,
  removeNodeAfter,
  removeNodeAtPosition,
  removeNodeBefore,
  replaceNodeAtPosition,
  schemaToJSON,
  getActiveNode,
} from './prosemirror-utils';
