/**
 * @module
 *
 * Provides the main method used to convert markdown to html.
 */

import marked from 'marked';

const INPUT_END_WHITESPACE_REGEX = /\/>\s+(\w)/;

const renderer = {
  list(text: string) {
    if (text.includes('data-checkbox')) {
      return `<ul data-checkbox>${text}</ul>`;
    }

    return false;
  },
  listitem(text: string, task: boolean) {
    if (task) {
      return `<li data-checkbox>${text.replace(INPUT_END_WHITESPACE_REGEX, '/>$1')}</li>\n`;
    }

    return false;
  },
};
marked.use({ renderer });

/**
 * Converts the provided markdown to HTML.
 */
export function markdownToHtml(markdown: string, sanitizer?: (html: string) => string): string {
  const html = marked(markdown, { gfm: true, smartLists: true, xhtml: true });

  return sanitizer ? sanitizer(html) : html;
}
