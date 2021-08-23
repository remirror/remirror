import '@remirror/styles/all.css';

import { css } from '@emotion/css';
import { createContextState } from 'create-context-state';
import jsx from 'refractor/lang/jsx';
import md from 'refractor/lang/markdown';
import typescript from 'refractor/lang/typescript';
import { ExtensionPriority, getTheme } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  DocExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
} from 'remirror/extensions';
import {
  ComponentItem,
  ReactExtensions,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
  UseRemirrorReturn,
} from '@remirror/react';

export default { title: 'Markdown Editor' };

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const Basic = () => {
  const { manager, state, onChange, getContext } = useRemirror({
    extensions,
    content: basicContent,
    stringHandler: 'markdown',
  });

  return (
    <>
      <ThemeProvider>
        <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
          <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
        </Remirror>
        <pre>
          <code>{getContext()?.helpers.getMarkdown(state)}</code>
        </pre>
      </ThemeProvider>
    </>
  );
};

interface Context extends Props {
  setMarkdown: (markdown: string) => void;
  setVisual: (markdown: string) => void;
}

interface Props {
  visual: UseRemirrorReturn<ReactExtensions<ReturnType<typeof extensions>[number]>>;
  markdown: UseRemirrorReturn<ReactExtensions<DocExtension | CodeBlockExtension>>;
}

const [DualEditorProvider, useDualEditor] = createContextState<Context, Props>(({ props }) => {
  return {
    ...props,

    setMarkdown: (text: string) => {
      return props.markdown.getContext()?.setContent({
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: 'markdown' },
            content: text ? [{ type: 'text', text }] : undefined,
          },
        ],
      });
    },
    setVisual: (markdown: string) => {
      return props.visual.getContext()?.setContent(markdown);
    },
  };
});

const MarkdownTextEditor = () => {
  const { markdown, setVisual } = useDualEditor();

  return (
    <Remirror
      manager={markdown.manager}
      autoRender='end'
      onChange={({ helpers, state }) => {
        const text = helpers.getText({ state });
        return setVisual(text);
      }}
      classNames={[
        css`
          &.ProseMirror {
            padding: 0;

            pre {
              height: 100%;
              padding: ${getTheme((t) => t.space[3])};
              margin: 0;
            }
          }
        `,
      ]}
    >
      {/* <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' /> */}
    </Remirror>
  );
};

const VisualEditor = () => {
  const { visual, setMarkdown } = useDualEditor();

  return (
    <Remirror
      autoFocus
      manager={visual.manager}
      autoRender='end'
      onChange={({ helpers, state }) => {
        return setMarkdown(helpers.getMarkdown(state));
      }}
      initialContent={visual.state}
      classNames={[
        css`
          &.ProseMirror {
            p,
            h3,
            h4 {
              margin-top: ${getTheme((t) => t.space[2])};
              margin-bottom: ${getTheme((t) => t.space[2])};
            }

            h1,
            h2 {
              margin-bottom: ${getTheme((t) => t.space[3])};
              margin-top: ${getTheme((t) => t.space[3])};
            }
          }
        `,
      ]}
    >
      <Toolbar items={toolbarItems} refocusEditor label='Top Toolbar' />
    </Remirror>
  );
};

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const DualEditor = () => {
  const visual = useRemirror({
    extensions,
    stringHandler: 'markdown',
    content: '**Markdown** content is the _best_',
  });
  const markdown = useRemirror({
    extensions: () => [
      new DocExtension({ content: 'codeBlock' }),
      new CodeBlockExtension({
        supportedLanguages: [md, typescript],
        defaultLanguage: 'markdown',
        syntaxTheme: 'base16_ateliersulphurpool_light',
        defaultWrap: true,
      }),
    ],
    builtin: {
      exitMarksOnArrowPress: false,
    },

    stringHandler: 'html',
  });

  return (
    <DualEditorProvider visual={visual} markdown={markdown}>
      <ThemeProvider>
        <VisualEditor />
        <MarkdownTextEditor />
      </ThemeProvider>
    </DualEditorProvider>
  );
};

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension(),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension(),
  new LinkExtension(),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
  new CodeExtension(),
  new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
  new TrailingNodeExtension(),
  new TableExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
  /**
   * `HardBreakExtension` allows us to create a newline inside paragraphs.
   * e.g. in a list item
   */
  new HardBreakExtension(),
];

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 1 },
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarMenu,

        items: [
          {
            type: ComponentItem.MenuGroup,
            role: 'radio',
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 3 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 4 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 5 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 6 },
              },
            ],
          },
        ],
      },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleBlockquote',
        display: 'icon',
      },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCodeBlock', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleColumns',
        display: 'icon',
        attrs: { count: 2 },
      },
    ],
    separator: 'none',
  },
];

const basicContent = `
**Markdown** content is the _best_

<br>

# Heading 1

<br>

## Heading 2

<br>

### Heading 3

<br>

#### Heading 4

<br>

##### Heading 5

<br>

###### Heading 6

<br>

> Blockquote

\`\`\`ts
const a = 'asdf';
\`\`\`

playtime is just beginning

## List support

- an unordered
  - list is a thing
    - of beauty

1. As is
2. An ordered
3. List
`;
