import {
  DocExtension,
  ExtensionManager,
  ParagraphExtension,
  TextExtension,
  Cast,
  PrioritizedExtension,
} from '@remirror/core';
import {
  BoldExtension,
  ItalicExtension,
  PlaceholderExtension,
  UnderlineExtension,
  BlockquoteExtension,
  HistoryExtension,
} from '@remirror/core-extensions';
import minDocument from 'min-document';

export const helpers = {
  getState: Cast(jest.fn()),
  getPortalContainer: Cast(jest.fn()),
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
 * @deprecated Causes issues when multiple tests use this. Prefer {@link createTestManager}
 */
export const manager = ExtensionManager.create(extensions).init(helpers);

export const createBaseTestManager = (extra: PrioritizedExtension[] = []) =>
  ExtensionManager.create([...baseExtensions, ...extra]);

export const createTestManager = (extra: PrioritizedExtension[] = []) =>
  ExtensionManager.create([...extensions, ...extra]);

export const { schema, plugins } = manager.data;
export const testDocument = minDocument;
export const initialJson = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] }],
};
