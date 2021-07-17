/**
 * @module
 *
 * Provides the main method used to convert markdown to html.
 */

import marked from 'marked';

/**
 * Converts the provided markdown to HTML.
 */
export function markdownToHtml(markdown: string, sanitizer?: (html: string) => string): string {
  return marked(markdown, { gfm: true, smartLists: true, xhtml: true, sanitizer });
}
