export type {
  AnyExtension,
  AnyExtensionConstructor,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
  BaseExtensionFactoryParameter,
  DefaultSettingsType,
  Extension,
  ExtensionEventMethods,
  ExtensionFactoryParameter,
  ExtensionTagParameter,
  ExtensionTags,
  GetMarkNames,
  GetNodeNames,
  GetPlainNames,
  MarkExtension,
  MarkExtensionConstructor,
  MarkExtensionFactoryParameter,
  NodeExtension,
  NodeExtensionConstructor,
  NodeExtensionFactoryParameter,
  PlainExtensionConstructor,
  SchemaFromExtension,
} from './extension-base';

export { isExtension, isMarkExtension, isNodeExtension, isPlainExtension } from './extension-base';
export { ExtensionFactory, isExtensionConstructor } from './extension-factory';
export type {
  ActionNames,
  CommandsFromExtensions as ActionsFromExtensions,
  ExtensionFromConstructor,
  ExtensionListParameter,
  ExtensionParameter,
  ExtensionsParameter,
  GetExtensionParameter,
  MapCommandToAction,
} from './extension-types';
