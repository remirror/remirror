import { DocExtension, ParagraphExtension, TextExtension } from '@remirror/core';

/** All the required and core extensions for testing */
export const nodeExtensions = [new DocExtension(), new TextExtension(), new ParagraphExtension()];

/** The types of the different nodes injected into every test setup */
export type BaseExtensionNodes = (typeof nodeExtensions)[number];

/** The names of default nodes injected into every test setup */
export type BaseExtensionNodeNames = Exclude<BaseExtensionNodes['name'], 'text'> | 'p';
