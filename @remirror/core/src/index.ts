export { BuiltinPreset, builtInExtensions } from './builtins';
export type { BuiltInExtensions } from './builtins';

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
  MarkExtension,
  NodeExtension,
  PlainExtension,
  ExtensionTags,
} from './extension';

export { Manager, isManager } from './manager';
export type {
  GetExtensionUnion,
  GetPresetUnion,
  ManagerTransactionHandlerParameter,
} from './manager';

export { PresetFactory, isPreset, isPresetConstructor } from './preset';
export type { Preset, PresetConstructor, PresetListParameter, PresetParameter } from './preset';

export type {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ManagerMethodParameter,
} from './types';
