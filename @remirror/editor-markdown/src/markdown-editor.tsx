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
import { baseExtensions, HistoryExtension, PlaceholderExtension } from '@remirror/core-extensions';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import { RemirrorProvider, RemirrorProviderProps } from '@remirror/react';
import { RemirrorStateListenerParams } from '@remirror/react-utils';
import React, { FC, useMemo, useState } from 'react';
import { fromMarkdown } from './from-markdown';
import { toMarkdown } from './to-markdown';

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

const MarkdownEditor: FC<InternalEditorProps> = props => {
  return (
    <RemirrorProvider {...props} childAsRoot={true}>
      <div />
    </RemirrorProvider>
  );
};

const useWysiwygManager = () => {
  return useMemo(
    () => ExtensionManager.create([...baseExtensions, new CodeBlockExtension(), new PlaceholderExtension()]),
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

const createInitialContent = ({ content, schema }: CreateInitialContentParams): Content => {
  if (isString(content)) {
    return {
      markdown: content,
      pmNode: fromMarkdown(content, schema),
    };
  }

  if (isProsemirrorNode(content)) {
    return {
      markdown: toMarkdown(content),
      pmNode: content,
    };
  }

  if (!isObjectNode(content)) {
    throw new Error('Invalid content passed into the editor');
  }

  const pmNode = createDocumentNode({ content, schema });

  return {
    markdown: toMarkdown(pmNode),
    pmNode,
  };
};

export interface EditorProps {
  initialValue?: RemirrorContentType;
  editor: 'markdown' | 'wysiwyg';
}

// const Loading = () => <p>Loading...</p>

interface Content {
  markdown: string;
  pmNode: ProsemirrorNode;
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
    schema.nodes.codeBlock.create({ language: 'markdown' }, schema.text(markdownContent)),
  );
};

export const Editor: FC<EditorProps> = ({ initialValue = '', editor }) => {
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
    setRawContent({ ...rawContent, pmNode: newState.doc });
    setMarkdownEditorState(createMarkdownState(toMarkdown(newState.doc)));
  };

  return editor === 'markdown' ? (
    <MarkdownEditor
      manager={markdownManager}
      initialContent={rawContent.markdown}
      stringHandler={markdownStringHandler}
      value={markdownEditorState}
      onStateChange={onMarkdownStateChange}
    />
  ) : (
    <WysiwygEditor
      manager={wysiwygManager}
      initialContent={rawContent.pmNode}
      value={wysiwygEditorState}
      onStateChange={onWysiwygStateChange}
    />
  );
};
