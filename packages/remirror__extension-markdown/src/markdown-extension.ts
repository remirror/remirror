import {
  command,
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  extension,
  ExtensionTag,
  FragmentStringHandlerOptions,
  Helper,
  helper,
  InsertNodeOptions,
  NodeStringHandlerOptions,
  PlainExtension,
  ProsemirrorNode,
  Slice,
  Static,
  StringHandlerOptions,
} from '@remirror/core';
import { DOMSerializer, Fragment } from '@remirror/pm/model';

import { htmlToMarkdown } from './html-to-markdown';
import { markdownToHtml } from './markdown-to-html';
import { htmlSanitizer } from './markdown-utils';

export interface MarkdownOptions {
  /**
   * Converts the provided html to a markdown string.
   *
   * By default this uses
   */
  htmlToMarkdown?: Static<(html: string) => string>;

  /**
   * Takes a markdown string and outputs html. It is up to you to make sure the
   * markdown is sanitized during this function call by providing the
   * `sanitizeHtml` method.
   */
  markdownToHtml?: Static<(markdown: string, sanitizer?: (html: string) => string) => string>;

  /**
   * Provide a sanitizer to prevent XSS attacks.
   *
   * The default sanitizer has **zero** security guarantees so it's recommended
   * that you provide your own html sanitizer here.
   *
   * If you want to sanitize on the backend as well you will need to override
   * this method.
   */
  htmlSanitizer?: Static<(html: string) => string>;

  /**
   * The parent nodes (or tags) where the markdown extension shortcuts are
   * active.
   *
   * @default ['code']
   *
   * TODO implement keyboard shortcuts when within an activeNode for the
   * markdown extension.
   */
  activeNodes?: string[];

  /**
   * Set this to `true` to copy the values from the text editor as markdown.
   * This means that when pasting into a plain text editor (vscode) for example,
   * the markdown will be preserved.
   *
   * @default false
   */
  copyAsMarkdown?: boolean;
}

/**
 * This extension adds support for markdown editors using remirror.
 *
 * TODO - when presets are removed automatically include all the supported
 * extensions.
 *
 * This extension adds the following to the `ManagerStore`.
 *
 * - `getMarkdown()` - extract the markdown representation from the editor.
 *
 * Future features
 *
 * - [ ] Add markdown specific commands which add the markdown syntax to the
 *   text content.
 */
@extension<MarkdownOptions>({
  defaultOptions: {
    htmlToMarkdown,
    markdownToHtml,
    htmlSanitizer,
    activeNodes: [ExtensionTag.Code],
    copyAsMarkdown: false,
  },
  staticKeys: ['htmlToMarkdown', 'markdownToHtml', 'htmlSanitizer'],
})
export class MarkdownExtension extends PlainExtension<MarkdownOptions> {
  get name() {
    return 'markdown' as const;
  }

  /**
   * Add the `markdown` string handler and `getMarkdown` state helper method.
   */
  onCreate(): void {
    this.store.setStringHandler('markdown', this.markdownToProsemirrorNode.bind(this));
  }

  createPlugin(): CreateExtensionPlugin {
    const clipboardTextSerializer = this.options.copyAsMarkdown
      ? (slice: Slice) => {
          const wrapper = document.createElement('div');
          const serializer = DOMSerializer.fromSchema(this.store.schema);
          wrapper.append(serializer.serializeFragment(slice.content));

          // Here we take the sliced text and transform it into markdown.
          return this.options.htmlToMarkdown(wrapper.innerHTML);
        }
      : undefined;

    return {
      props: {
        clipboardTextSerializer,
      },
    };
  }

  /**
   * Convert the markdown to a prosemirror node.
   */
  private markdownToProsemirrorNode(options: FragmentStringHandlerOptions): Fragment;
  private markdownToProsemirrorNode(options: NodeStringHandlerOptions): ProsemirrorNode;
  private markdownToProsemirrorNode(options: StringHandlerOptions): ProsemirrorNode | Fragment {
    return this.store.stringHandlers.html({
      ...(options as NodeStringHandlerOptions),
      content: this.options.markdownToHtml(options.content, this.options.htmlSanitizer),
    });
  }

  /**
   * Insert a markdown string as a ProseMirror Node.
   *
   * ```ts
   * commands.insertMarkdown('# Heading\nAnd content');
   * // => <h1 id="heading">Heading</h1><p>And content</p>
   * ```
   *
   * The content will be inlined by default if not a block node.
   *
   * ```ts
   * commands.insertMarkdown('**is bold.**')
   * // => <strong>is bold.</strong>
   * ```
   *
   * To always wrap the content in a block you can pass the following option.
   *
   * ```ts
   * commands.insertMarkdown('**is bold.**', { alwaysWrapInBlock: true });
   * // => <p><strong>is bold.</strong></p>
   * ```
   */
  @command()
  insertMarkdown(
    markdown: string,
    options?: InsertNodeOptions & { alwaysWrapInBlock?: boolean },
  ): CommandFunction {
    return (props) => {
      const { state } = props;
      let html = this.options.markdownToHtml(markdown, this.options.htmlSanitizer);

      html =
        !options?.alwaysWrapInBlock && html.startsWith('<p><') && html.endsWith('</p>\n')
          ? html.slice(3, -5)
          : `<div>${html}</div>`;

      const fragment = this.store.stringHandlers.html({
        content: html,
        schema: state.schema,
        fragment: true,
      });

      return this.store.commands.insertNode.original(fragment, {
        ...options,
        replaceEmptyParentBlock: true,
      })(props);
    };
  }

  /**
   * Get the markdown content from the current document.
   *
   * @param state - the state provided to the `getMarkdown` method.
   */
  @helper()
  getMarkdown(state?: EditorState): Helper<string> {
    return this.options.htmlToMarkdown(this.store.helpers.getHTML(state));
  }

  /**
   * TODO add commands for plain text markdown
   * @notimplemented
   *
   * @internal
   */
  @command()
  toggleBoldMarkdown(): CommandFunction {
    return (_) => {
      return false;
    };
  }
}

declare global {
  namespace Remirror {
    interface StringHandlers {
      /**
       * Register the markdown string handler..
       */
      markdown: MarkdownExtension;
    }

    interface AllExtensions {
      markdown: MarkdownExtension;
    }
  }
}
