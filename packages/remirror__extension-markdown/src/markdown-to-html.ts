/**
 * @module
 *
 * Provides the main method used to convert markdown to html.
 */

import { marked } from 'marked';

marked.use({
  renderer: {
    list(body: string, isOrdered: boolean, start: number): string {
      if (isOrdered) {
        const startAttr = start !== 1 ? `start="${start}"` : '';
        return `<ol ${startAttr}>\n${body}</ol>\n`;
      }

      const taskListAttr = body.startsWith('<li data-task-list-item ') ? 'data-task-list' : '';
      return `<ul ${taskListAttr}>\n${body}</ul>\n`;
    },
    listitem(text: string, isTask: boolean, isChecked: boolean): string {
      if (!isTask) {
        return `<li>${text}</li>\n`;
      }

      const checkedAttr = isChecked ? 'data-checked' : '';
      return `<li data-task-list-item ${checkedAttr}>${text}</li>\n`;
    },
  },
});

/**
 * Converts the provided markdown to HTML.
 */
export function markdownToHtml(markdown: string, sanitizer?: (html: string) => string): string {
  return marked(markdown, { gfm: true, smartLists: true, xhtml: true, sanitizer });
}
