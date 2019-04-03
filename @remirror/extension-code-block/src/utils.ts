import { flattenArray, FromToParams, NodeWithPosition } from '@remirror/core';
import { Decoration } from 'prosemirror-view';
import refractor, { RefractorNode } from 'refractor/core';

interface ParsedRefractorNode {
  /**
   * The text to be wrapped
   */
  text: string;

  /**
   * The classes that will wrap the node
   */
  classes: string[];
}

interface PositionedRefractorNode extends FromToParams, ParsedRefractorNode {}

/**
 * Maps the refractor nodes into text and classes which will be used to create our decoration.
 */
function parseRefractorNodes(
  refractorNodes: RefractorNode[],
  className: string[] = [],
): ParsedRefractorNode[][] {
  return refractorNodes.map(node => {
    const classes = [
      ...className,
      ...(node.type === 'element' && node.properties.className ? node.properties.className : []),
    ];

    if (node.type === 'element') {
      return parseRefractorNodes(node.children, classes) as any;
    }

    return {
      text: node.value,
      classes,
    };
  });
}

/**
 * Creates a decoration set for the provided blocks
 */
export function createDecorations(blocks: NodeWithPosition[]) {
  const decorations: Decoration[] = [];

  blocks.forEach(block => {
    const positionedRefractorNodes = getPositionedRefractorNodes(block);
    // console.log(positionedRefractorNodes);
    positionedRefractorNodes.forEach(positionedRefractorNode => {
      const decoration = Decoration.inline(positionedRefractorNode.from, positionedRefractorNode.to, {
        class: positionedRefractorNode.classes.join(' '),
      });
      decorations.push(decoration);
    });
  });

  // console.log(decorations);
  return decorations;
}

/**
 * Retrieves positioned refractor nodes from the positionedNode
 *
 * @param nodeWithPosition - a node and position
 * @returns the positioned refractor nodes which are text, classes and a FromTo interface
 */
const getPositionedRefractorNodes = ({ node, pos }: NodeWithPosition) => {
  let startPos = pos + 1;
  const refractorNodes = refractor.highlight(node.textContent, node.attrs.language);
  // console.log(JSON.stringify(refractorNodes, null, 2));
  function mapper(refractorNode: ParsedRefractorNode): PositionedRefractorNode {
    const from = startPos;
    const to = from + refractorNode.text.length;
    startPos = to;
    return {
      ...refractorNode,
      from,
      to,
    };
  }

  const parsedRefractorNodes = parseRefractorNodes(refractorNodes);

  return flattenArray<ParsedRefractorNode>(parsedRefractorNodes).map(mapper);
};
