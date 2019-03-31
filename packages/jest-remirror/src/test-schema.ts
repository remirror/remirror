import { Doc, Paragraph, Text } from '@remirror/core';

/** All the required and core extensions for testing */
export const nodeExtensions = [new Doc(), new Text(), new Paragraph()];

/** The types of the different nodes injected into every test setup */
export type BaseExtensionNodes = (typeof nodeExtensions)[number];

/** The names of default nodes injected into every test setup */
export type BaseExtensionNodeNames = Exclude<BaseExtensionNodes['name'], 'text'> | 'p';
