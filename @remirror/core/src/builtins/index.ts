import { AttributesExtension } from './attributes-extension';
import { InputRulesExtension } from './input-rules-extension';
import { KeymapExtension } from './keymap-extensions';
import { NodeViewsExtension } from './node-views-extension';
import { PasteRulesExtension } from './paste-rules-extension';
import { PluginsExtension } from './plugins-extension';
import { SuggestionExtension } from './suggestion-extension';

export * from './attributes-extension';
export * from  './input-rules-extension'
export * from  './keymap-extensions'
export * from  './node-views-extension'
export * from  './paste-rules-extension'
export * from  './plugins-extension'
export * from  './suggestion-extension'


export const builtInExtensions = [NodeViewsExtension, AttributesExtension,InputRulesExtension, KeymapExtension, PasteRulesExtension, PluginsExtension, SuggestionExtension] as const;
export type BuiltInExtensions = (typeof builtInExtensions)[number]
