import minDocument from 'min-document';

import {
  BaseExtensionSettings,
  Cast,
  DocExtension,
  Extension,
  FlexibleExtension,
  Manager,
  TextExtension,
} from '@remirror/core';
import {
  BlockquoteExtension,
  BoldExtension,
  HeadingExtension,
  HistoryExtension,
  ItalicExtension,
  ParagraphExtension,
  PlaceholderExtension,
  UnderlineExtension,
} from '@remirror/core-extensions';
import { ExtensionFactory } from '@remirror/core/lib/extension/extension-factory';
import { PortalContainer } from '@remirror/react-portals';
import { defaultRemirrorThemeValue } from '@remirror/ui';

export const helpers = {
  getState: Cast(jest.fn()),
  portalContainer: new PortalContainer(),
  getTheme: () => defaultRemirrorThemeValue,
};

export const baseExtensions = [
  { extension: new DocExtension(), priority: 2 },
  { extension: new TextExtension(), priority: 2 },
  { extension: new ParagraphExtension(), priority: 2 },
];

export const extensions = [
  ...baseExtensions,
  { extension: new HistoryExtension(), priority: 2 },
  { extension: new PlaceholderExtension(), priority: 2 },
  { extension: new BoldExtension(), priority: 3 },
  { extension: new ItalicExtension(), priority: 3 },
  { extension: new UnderlineExtension(), priority: 3 },
  { extension: new BlockquoteExtension(), priority: 3 },
];

/**
 * Useful for testing
 */
export const ExtensionMap = {
  nodes: {
    blockquote: new BlockquoteExtension(),
    heading: new HeadingExtension(),
  },
  marks: {
    bold: new BoldExtension(),
    italic: new ItalicExtension(),
    underline: new UnderlineExtension(),
  },
};

/**
 * @deprecated Causes issues when multiple tests use this. Prefer {@link createTestManager}
 */
export const manager = Manager.create(extensions).init(helpers);

export const createBaseTestManager = <GFlexibleList extends FlexibleExtension[]>(
  extra: GFlexibleList = [] as any,
) => Manager.create([...baseExtensions, ...extra]);

export const createTestManager = <GFlexibleList extends FlexibleExtension[]>(
  extra: GFlexibleList = [] as any,
) => Manager.create([...extensions, ...extra]);

export const { schema, plugins } = manager.data;
export const testDocument = minDocument;
export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

export const TestExtension = ExtensionFactory.typed<
  { run?: boolean } & BaseExtensionSettings
>().plain({
  name: 'test',
  defaultSettings: { run: true },
  defaultProperties: {},
});
