import { EditorSchema } from '@remirror/core';
import md from 'markdown-it';
import { MarkdownParser } from 'prosemirror-markdown';

/**
 * Parses markdown content into a ProsemirrorNode compatible with the provided schema.
 */
export const fromMarkdown = (markdown: string, schema: EditorSchema) =>
  new MarkdownParser(schema, md('commonmark'), {
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
    list_item: { block: 'listItem' },
    bullet_list: { block: 'bulletList' },
    ordered_list: {
      block: 'orderedList',
      getAttrs: tok => ({ order: parseInt(tok.attrGet('order') || '1', 10) }),
    },
    heading: { block: 'heading', getAttrs: tok => ({ level: +tok.tag.slice(1) }) },
    code_block: { block: 'codeBlock' },
    fence: { block: 'codeBlock', getAttrs: tok => ({ language: tok.info }) },
    hr: { node: 'horizontalRule' },
    image: {
      node: 'image',
      getAttrs: tok => ({
        src: tok.attrGet('src'),
        title: tok.attrGet('title') || null,
        alt: (tok.children[0] && tok.children[0].content) || null,
      }),
    },
    hardbreak: { node: 'hardBreak' },
    em: { mark: 'italic' },
    strong: { mark: 'bold' },
    link: {
      mark: 'link',
      getAttrs: tok => ({
        href: tok.attrGet('href'),
        title: tok.attrGet('title') || null,
      }),
    },
    code_inline: { mark: 'code' },
  }).parse(markdown);
