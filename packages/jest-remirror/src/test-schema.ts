import { Cast, Doc, ExtensionManager, Paragraph, Text } from '@remirror/core';

/** All the required and core extensions for testing */
export const testNodeExtensions = [new Doc(), new Text(), new Paragraph()];

export const testExtensionManager = new ExtensionManager(testNodeExtensions, () => Cast({}), () => Cast({}));

export const testSchema = testExtensionManager.createSchema();

/** The types of the different nodes injected into every test setup */
export type BaseExtensionNodes = (typeof testNodeExtensions)[number];

/** The names of default nodes injected into every test setup */
export type BaseExtensionNodeNames = BaseExtensionNodes['name'];
