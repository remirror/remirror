import { DocExtension, TextExtension } from '@remirror/core';
import { ParagraphExtension } from '@remirror/core-extensions';

/** All the required and core extensions for testing */
export const nodeExtensions = [new DocExtension(), new TextExtension(), new ParagraphExtension()];

/** The types of the different nodes injected into every test setup */
export type BaseExtensionNodes = (typeof nodeExtensions)[number];

/** The names of default nodes injected into every test setup */
export type BaseExtensionNodeNames = Exclude<BaseExtensionNodes['name'], 'text'> | 'p';
