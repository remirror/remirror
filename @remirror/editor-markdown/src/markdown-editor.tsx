import {
  createDocumentNode,
  DocExtension,
  EditorState,
  ExtensionManager,
  ExtensionsFromManager,
  isObjectNode,
  isProsemirrorNode,
  isString,
  ProsemirrorNode,
  RemirrorContentType,
  SchemaFromExtensions,
  SchemaParams,
  StringHandlerParams,
  TextExtension,
} from '@remirror/core';
import {
  baseExtensions,
  BaseKeymapExtension,
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeExtension,
  CompositionExtension,
  GapCursorExtension,
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
import { RemirrorProvider, RemirrorProviderProps, RemirrorStateListenerParams } from '@remirror/react';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
        {
          priority: 1,
          extension: new CodeBlockExtension({ defaultLanguage: 'markdown', toggleType: 'codeBlock' }),
        },
        { priority: 1, extension: new TextExtension() },
        { extension: new CompositionExtension(), priority: 3 },
        { extension: new HistoryExtension(), priority: 3 },
        { extension: new GapCursorExtension(), priority: 10 },
        { extension: new BaseKeymapExtension(), priority: 10 },
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

const WysiwygEditor: FC<InternalEditorProps> = ({ children, ...props }) => {
  return (
    <RemirrorProvider {...props} childAsRoot={true}>
      <div>{children}</div>
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

interface MarkdownEditorProps {
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

const useDebounce = (fn: () => any, ms: number = 0, args: any[] = []) => {
  useEffect(() => {
    const handle = setTimeout(fn.bind(null, args), ms);

    return () => {
      // if args change then clear timeout
      clearTimeout(handle);
    };
  }, [args, fn, ms]);
};

export const MarkdownEditor: FC<MarkdownEditorProps> = ({ initialValue = '', editor, children }) => {
  type WysiwygExtensions = ExtensionsFromManager<typeof wysiwygManager>;
  type WysiwygSchema = SchemaFromExtensions<WysiwygExtensions>;
  type MarkdownExtensions = ExtensionsFromManager<typeof markdownManager>;
  type MarkdownSchema = SchemaFromExtensions<MarkdownExtensions>;

  const wysiwygManager = useWysiwygManager();
  const markdownManager = useMarkdownManager();
  const initialContent = createInitialContent({ content: initialValue, schema: wysiwygManager.schema });
  const [markdownEditorState, setMarkdownEditorState] = useState<EditorState<MarkdownSchema>>();
  const [markdownParams, setMarkdownParams] = useState<
    Pick<RemirrorStateListenerParams<MarkdownExtensions>, 'getText' | 'tr'>
  >({ getText: () => initialContent.markdown });
  const [wysiwygEditorState, setWysiwygEditorState] = useState<EditorState<WysiwygSchema>>();

  const updateWysiwygFromMarkdown = useCallback(
    (md: string) => {
      const state = wysiwygManager.createState({ content: fromMarkdown(md, wysiwygManager.schema) });
      setWysiwygEditorState(state);
    },
    [wysiwygManager],
  );

  const updateMarkdownFromWysiwyg = useCallback(
    (doc: ProsemirrorNode) =>
      setMarkdownEditorState(
        markdownManager.createState({ content: toMarkdown(doc), stringHandler: markdownStringHandler }),
      ),
    [markdownManager],
  );

  useDebounce(
    () => {
      const { tr, getText } = markdownParams;
      if (tr && tr.docChanged) {
        console.log('onMarkdownStateChange: triggering wysiwyg change');
        updateWysiwygFromMarkdown(getText());
        return;
      }
      console.log('onMarkdownStateChange: SKIP wysiwyg');
    },
    500,
    [markdownParams.getText, markdownParams.tr],
  );

  const onMarkdownStateChange = ({
    newState,
    getText,
    tr,
  }: RemirrorStateListenerParams<MarkdownExtensions>) => {
    console.log('onMarkdownStateChange: setting state');
    setMarkdownParams({ getText, tr });
    setMarkdownEditorState(newState);
  };

  const onWysiwygStateChange = ({ newState, tr }: RemirrorStateListenerParams<WysiwygExtensions>) => {
    console.log('onWysiwygStateChange: setting state');
    setWysiwygEditorState(newState);

    if (tr && tr.docChanged) {
      console.log('onWysiwygStateChange: triggering markdown change');
      updateMarkdownFromWysiwyg(newState.doc);
      return;
    }

    console.log('onWysiwygStateChange: SKIP markdown');
  };

  useEffect(() => {
    if (editor === 'markdown') {
      markdownManager.view.focus();
    }

    if (editor === 'wysiwyg') {
      wysiwygManager.view.focus();
    }
  }, [editor, markdownManager.view, wysiwygManager.view]);

  return (
    <>
      <div style={{ display: editor === 'markdown' ? 'block' : 'none' }}>
        <InternalMarkdownEditor
          manager={markdownManager}
          initialContent={initialContent.markdown}
          stringHandler={markdownStringHandler}
          value={markdownEditorState}
          onStateChange={onMarkdownStateChange}
        />
      </div>
      <div style={{ display: editor === 'wysiwyg' ? 'block' : 'none' }}>
        <WysiwygEditor
          manager={wysiwygManager}
          initialContent={initialContent.wysiwyg}
          value={wysiwygEditorState}
          onStateChange={onWysiwygStateChange}
        >
          {children}
        </WysiwygEditor>
      </div>
    </>
  );
};
