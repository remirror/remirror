import { ErrorConstant, invariant, isElementDomNode, isTextDomNode } from '@remirror/core';

/**
 * The default sanitization method. Will throw if used in a non browser setting.
 */
export function htmlSanitizer(html: string): string {
  invariant(typeof document, {
    code: ErrorConstant.EXTENSION,
    message:
      'Attempting to sanitize html within a non-browser environment. Please provide your own `sanitizeHtml` method to the `MarkdownExtension`.',
  });

  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${html}</body>`,
    'text/html',
  );

  doc.normalize();
  sanitize(doc.body);

  return doc.body.innerHTML;
}

/**
 * Sanitize the provided node recursively.
 */
function sanitize(node: Node): void {
  // Do nothing for text nodes.
  if (isTextDomNode(node)) {
    return;
  }

  // Remove invalid nodes.
  if (!isElementDomNode(node) || /^(script|iframe|object|embed|svg)$/i.test(node.tagName)) {
    return (node as ChildNode)?.remove();
  }

  // Remove invalid attributes from the node.
  for (const { name } of node.attributes) {
    if (/^(class|id|name|href|src|alt|align|valign)$/i.test(name)) {
      continue;
    }

    node.attributes.removeNamedItem(name);
  }

  // Sanitize all children.
  for (const childNode of node.childNodes) {
    sanitize(childNode);
  }
}
