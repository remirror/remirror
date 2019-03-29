import { Doc, ExtensionManager, Paragraph, Text, Cast } from '@remirror/core';
import {
  Bold,
  Italic,
  Placeholder,
  Underline,
  Blockquote,
  Composition,
  History,
} from '@remirror/core-extensions';
import minDocument from 'min-document';

export const helpers = {
  getEditorState: Cast(jest.fn()),
  getPortalContainer: Cast(jest.fn()),
};

export const extensions = [
  { extension: new Composition(), priority: 2 },
  { extension: new Doc(), priority: 2 },
  { extension: new Text(), priority: 2 },
  { extension: new Paragraph(), priority: 2 },
  { extension: new History(), priority: 2 },
  { extension: new Placeholder(), priority: 2 },
  { extension: new Bold(), priority: 3 },
  { extension: new Italic(), priority: 3 },
  { extension: new Underline(), priority: 3 },
  { extension: new Blockquote(), priority: 3 },
];
export const manager = ExtensionManager.create(extensions).init(helpers);

export const createTestManager = () => ExtensionManager.create(extensions);

export const schema = manager.createSchema();
export const plugins = manager.plugins({ schema, ...helpers });
export const testDocument = minDocument;
export const initialJson = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Better docs to come soon...',
        },
      ],
    },
  ],
};
