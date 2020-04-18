// TODO remove these exports
export * from '@remirror/core-constants';
export * from '@remirror/core-utils';
export * from '@remirror/core-types';
export * from '@remirror/core-helpers';

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
  CommandsFromExtensions,
  Extension,
  ExtensionTags,
  GetExtensionUnion,
  HelpersFromExtensions,
  MarkExtension,
  NodeExtension,
  PlainExtension,
  SchemaFromExtension,
} from './extension';

export { EditorManager, isEditorManager } from './editor-manager';
export type { AnyEditorManager, ManagerTransactionHandlerParameter } from './editor-manager';

export { PresetFactory, isPreset, isPresetConstructor } from './preset';
export type {
  AnyPreset,
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
