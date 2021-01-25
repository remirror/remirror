import { ProsemirrorNode, range, RemirrorJSON } from '@remirror/core';

function findNode(
  fullPath: Array<string | number>,
  currentNode: ProsemirrorNode,
  nodeToFind: ProsemirrorNode,
): Array<string | number> | undefined {
  if (nodeToFind === currentNode) {
    return fullPath;
  }

  if (!currentNode.content || currentNode.content.size === 0) {
    return;
  }

  let result: Array<string | number> | undefined;

  currentNode.content.forEach((node, _offset, index) => {
    const path = findNode([...fullPath, 'content', index], node, nodeToFind);

    if (path?.length && !result) {
      result = path;
    }
  });

  return result;
}

export function generateNodePath(
  doc: ProsemirrorNode,
  node: ProsemirrorNode,
): Array<string | number> | undefined {
  const path = findNode([], doc, node);

  if (!path) {
    return;
  }

  const cleanedPath: Array<string | number> = [];

  // [0, content, content, 0] => [0, content, 0]
  // Because JSON representation a bit different from actual DOC.
  for (const section of path) {
    // TODO test this assumption
    if (section === 'content' && cleanedPath[cleanedPath.length - 1] === 'content') {
      continue;
    }

    cleanedPath.push(section);
  }

  return cleanedPath;
}

function findNodeJson(
  fullPath: Array<string | number>,
  node: RemirrorJSON,
  nodeToFind: RemirrorJSON,
): Array<string | number> | undefined {
  if (nodeToFind === node) {
    return fullPath;
  }

  if (!node.content) {
    return;
  }

  // if (currentNode.content === nodeToFind) {
  //   return fullPath.concat('content');
  // }

  for (const index of range(node.content.length)) {
    const path = findNodeJson([...fullPath, 'content', index], node, nodeToFind);

    if (path?.length) {
      return path;
    }
  }

  return;
}

export function generateJsonNodePath(
  doc: RemirrorJSON,
  node: RemirrorJSON,
): Array<string | number> | undefined {
  const path = findNodeJson([], doc, node);

  if (!path) {
    return;
  }

  const cleanedPath: Array<string | number> = [];

  for (const section of path) {
    cleanedPath.push(section);

    if (section === 'content') {
      cleanedPath.push('content');
    }
  }

  return cleanedPath;
}
