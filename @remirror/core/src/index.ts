// TODO remove these exports
export * from '@remirror/core-constants';
export * from '@remirror/core-utils';
export * from '@remirror/core-types';
export * from '@remirror/core-helpers';

export { DocExtension, ParagraphExtension, TextExtension } from './nodes';

export { builtInExtensions } from './builtins';
export type { BuiltInExtensions, BuiltinPreset } from './builtins';

export {
  ExtensionFactory,
  isExtension,
  isExtensionConstructor,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
} from './extension';
export type {
  AnyExtension,
  AnyExtensionConstructor,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
  Extension,
  GetExtensionUnion,
  MarkExtension,
  NodeExtension,
  PlainExtension,
  ExtensionTags,
} from './extension';

export { EditorManager, isEditorManager } from './editor-manager';
export type { ManagerTransactionHandlerParameter } from './editor-manager';

export { PresetFactory, isPreset, isPresetConstructor } from './preset';
export type {
  GetPresetUnion,
  Preset,
  PresetConstructor,
  PresetListParameter,
  PresetParameter,
} from './preset';

export type {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ManagerMethodParameter,
} from './types';

// TODO move to a new package.
export * from './commands';
