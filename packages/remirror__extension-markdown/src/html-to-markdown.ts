/**
 * @module
 *
 * Use `turndown` to provide a github flavoured markdown converter and the
 * default common mark converter.
 */
import TurndownService from 'turndown';
import { ErrorConstant, invariant, isElementDomNode } from '@remirror/core';

/**
 * Converts the provide HTML to markdown.
 */
export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

/**
 * A tableRow is a heading row if:
 * - the parent is a THEAD
 * - or if its the first child of the TABLE or the first TBODY (possibly
 *   following a blank THEAD)
 * - and every cell is a TH
 */
function isHeadingRow(tableRow: Node): tableRow is HTMLTableRowElement {
  const parentNode = tableRow.parentNode;

  if (!isElementDomNode(parentNode)) {
    return false;
  }

  return (
    parentNode.nodeName === 'THEAD' ||
    (parentNode.firstChild === tableRow &&
      (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
      [...tableRow.childNodes].every((node) => {
        return node.nodeName === 'TH';
      }) &&
      [...tableRow.childNodes].some((node) => !!node.textContent))
  );
}

/**
 * Check whether this is the first `tbody` in the table.
 */
function isFirstTbody(element: Node): element is HTMLTableSectionElement {
  const previousSibling = element.previousSibling;
  return (
    element.nodeName === 'TBODY' &&
    (!previousSibling ||
      (isElementDomNode(previousSibling) &&
        previousSibling.nodeName === 'THEAD' &&
        !previousSibling.textContent?.trim()))
  );
}

/**
 * Create a cell from the table.
 */
function cell(content: string, node: Node) {
  const index = [...(node.parentNode?.childNodes ?? [])].indexOf(node as ChildNode);
  let prefix = ' ';

  if (index === 0) {
    prefix = '| ';
  }

  return `${prefix + content} |`;
}

/**
 * Create the turndown service which will be used to convert html to markdown.
 *
 * This supports html by default.
 */
const turndownService = new TurndownService({ codeBlockStyle: 'fenced', headingStyle: 'atx' })
  .addRule('taskListItems', {
    filter: (node) => {
      return (node as HTMLInputElement).type === 'checkbox' && node.parentNode?.nodeName === 'LI';
    },
    replacement: (_, node) => {
      return `${(node as HTMLInputElement).checked ? '[x]' : '[ ]'} `;
    },
  })
  .addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: (content, node) => {
      return cell(content, node as ChildNode);
    },
  })
  .addRule('tableRow', {
    filter: 'tr',
    replacement: (content, node) => {
      let borderCells = '';
      const alignMap = { left: ':--', right: '--:', center: ':-:' };

      if (isHeadingRow(node)) {
        for (const childNode of node.childNodes) {
          if (!isElementDomNode(childNode)) {
            // This should never happen.
            continue;
          }

          let border = '---';
          const align = (
            childNode.getAttribute('align') ?? ''
          ).toLowerCase() as keyof typeof alignMap;

          if (align) {
            border = alignMap[align] || border;
          }

          borderCells += cell(border, childNode);
        }
      }

      return `\n${content}${borderCells ? `\n${borderCells}` : ''}`;
    },
  })
  .addRule('table', {
    // Only convert tables with a heading row. Tables with no heading row are kept
    // using `keep` (see below).
    filter: (node) => {
      return node.nodeName === 'TABLE' && isHeadingRow((node as HTMLTableElement).rows[0] as any);
    },

    replacement: (content) => {
      // Ensure there are no blank lines
      content = content.replace('\n\n', '\n');
      return `\n\n${content}\n\n`;
    },
  })
  .addRule('tableSection', {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function (content) {
      return content;
    },
  })
  .keep((node) => {
    return node.nodeName === 'TABLE' && !isHeadingRow((node as HTMLTableElement).rows[0] as any);
  })
  .addRule('strikethrough', {
    filter: ['del', 's', 'strike' as 'del'],
    replacement: function (content) {
      return `~${content}~`;
    },
  })

  // Add improved code block support from html.
  .addRule('fencedCodeBlock', {
    filter: (node, options) => {
      return !!(
        options.codeBlockStyle === 'fenced' &&
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      );
    },

    replacement: (_, node, options) => {
      invariant(isElementDomNode(node.firstChild), {
        code: ErrorConstant.EXTENSION,
        message: `Invalid node \`${node.firstChild?.nodeName}\` encountered for codeblock when converting html to markdown.`,
      });

      const className = node.firstChild.getAttribute('class') ?? '';
      const language =
        className.match(/(?:lang|language)-(\S+)/)?.[1] ??
        node.firstChild.getAttribute('data-code-block-language') ??
        '';

      return `\n\n${options.fence}${language}\n${node.firstChild.textContent}\n${options.fence}\n\n`;
    },
  });
