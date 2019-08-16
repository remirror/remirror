import {
  createDocumentNode,
  DocExtension,
  EditorState,
  ExtensionManager,
  isObjectNode,
  isProsemirrorNode,
  isString,
  ProsemirrorNode,
  RemirrorContentType,
  SchemaParams,
  StringHandlerParams,
  TextExtension,
} from '@remirror/core';
import {
  baseExtensions,
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  HistoryExtension,
  HorizontalRuleExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  OrderedListExtension,
  PlaceholderExtension,
} from '@remirror/core-extensions';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import { ImageExtension } from '@remirror/extension-image';
import { RemirrorProvider, RemirrorProviderProps } from '@remirror/react';
import { RemirrorStateListenerParams } from '@remirror/react-utils';
import React, { FC, useMemo, useState } from 'react';
import { fromMarkdown } from './from-markdown';
import { toMarkdown } from './to-markdown';

import bash from 'refractor/lang/bash';
import markdown from 'refractor/lang/markdown';
import tsx from 'refractor/lang/tsx';
import typescript from 'refractor/lang/typescript';

/**
 * The props which are passed to the internal RemirrorProvider
 */
export type InternalEditorProps = Omit<RemirrorProviderProps, 'childAsRoot' | 'children'>;

const useMarkdownManager = () => {
  return useMemo(
    () =>
      ExtensionManager.create([
        { priority: 1, extension: new DocExtension({ content: 'block' }) },
        { priority: 1, extension: new CodeBlockExtension({ defaultLanguage: 'markdown' }) },
        new TextExtension(),
        new HistoryExtension(),
      ]),
    [],
  );
};

const InternalMarkdownEditor: FC<InternalEditorProps> = props => {
  return (
    <RemirrorProvider {...props} childAsRoot={true}>
      <div />
    </RemirrorProvider>
  );
};

const useWysiwygManager = () => {
  return useMemo(
    () =>
      ExtensionManager.create([
        ...baseExtensions,
        new CodeBlockExtension({ supportedLanguages: [markdown, bash, tsx, typescript] }),
        new PlaceholderExtension(),
        new LinkExtension(),
        new BoldExtension(),
        new ItalicExtension(),
        new HeadingExtension(),
        new BlockquoteExtension(),
        new ImageExtension(),
        new BulletListExtension(),
        new ListItemExtension(),
        new OrderedListExtension(),
        new HorizontalRuleExtension(),
        new HardBreakExtension(),
        new CodeExtension(),
      ]),
    [],
  );
};

const WysiwygEditor: FC<InternalEditorProps> = props => {
  return (
    <RemirrorProvider {...props} childAsRoot={true}>
      <div />
    </RemirrorProvider>
  );
};

interface CreateInitialContentParams extends SchemaParams {
  /** The content to render */
  content: RemirrorContentType;
}

/**
 * Allows the initial content passed down to the editor to be flexible. It can
 * receive the initial content as a string (markdown) or the wysiwyg content as a ProsemirrorNode / ObjectNode
 * - markdown string
 * - prosemirror node
 * - object node (json)
 */
const createInitialContent = ({ content, schema }: CreateInitialContentParams): Content => {
  if (isString(content)) {
    return {
      markdown: content,
      wysiwyg: fromMarkdown(content, schema),
    };
  }

  if (isProsemirrorNode(content)) {
    return {
      markdown: toMarkdown(content),
      wysiwyg: content,
    };
  }

  if (!isObjectNode(content)) {
    throw new Error('Invalid content passed into the editor');
  }

  const pmNode = createDocumentNode({ content, schema });

  return {
    markdown: toMarkdown(pmNode),
    wysiwyg: pmNode,
  };
};

export interface MarkdownEditorProps {
  initialValue?: RemirrorContentType;
  editor: EditorDisplay;
}

export type EditorDisplay = 'markdown' | 'wysiwyg';

// const Loading = () => <p>Loading...</p>

interface Content {
  markdown: string;
  wysiwyg: ProsemirrorNode;
}

/**
 * Transform a markdown content string into a Prosemirror node within a codeBlock editor instance
 */
const markdownStringHandler: StringHandlerParams['stringHandler'] = ({
  content: markdownContent,
  schema,
}) => {
  return schema.nodes.doc.create(
    {},
    schema.nodes.codeBlock.create(
      { language: 'markdown' },
      markdownContent ? schema.text(markdownContent) : undefined,
    ),
  );
};

export const MarkdownEditor: FC<MarkdownEditorProps> = ({ initialValue = '', editor }) => {
  const wysiwygManager = useWysiwygManager();
  const markdownManager = useMarkdownManager();
  const initialContent = createInitialContent({ content: initialValue, schema: wysiwygManager.schema });
  const [rawContent, setRawContent] = useState<Content>(initialContent);
  const [markdownEditorState, setMarkdownEditorState] = useState<EditorState>();
  const [wysiwygEditorState, setWysiwygEditorState] = useState<EditorState>();

  const createWysiwygState = (content: ProsemirrorNode) => wysiwygManager.createState({ content });
  const createMarkdownState = (content: string) =>
    wysiwygManager.createState({ content, stringHandler: markdownStringHandler });

  const onMarkdownStateChange = ({ newState, getText }: RemirrorStateListenerParams) => {
    setMarkdownEditorState(newState);
    setRawContent({ ...rawContent, markdown: getText() });
    setWysiwygEditorState(createWysiwygState(fromMarkdown(getText(), wysiwygManager.schema)));
  };

  const onWysiwygStateChange = ({ newState }: RemirrorStateListenerParams) => {
    setWysiwygEditorState(newState);
    setRawContent({ ...rawContent, wysiwyg: newState.doc });
    setMarkdownEditorState(createMarkdownState(toMarkdown(newState.doc)));
  };

  return editor === 'markdown' ? (
    <InternalMarkdownEditor
      manager={markdownManager}
      initialContent={rawContent.markdown}
      stringHandler={markdownStringHandler}
      value={markdownEditorState}
      onStateChange={onMarkdownStateChange}
    />
  ) : (
    <WysiwygEditor
      manager={wysiwygManager}
      initialContent={rawContent.wysiwyg}
      value={wysiwygEditorState}
      onStateChange={onWysiwygStateChange}
    />
  );
};
