/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  FromToProps,
  isNodeOfType,
  NodeWithPosition,
  ProsemirrorNode,
  textBetween,
} from '@remirror/core';
import { ExtensionWhitespaceMessages } from '@remirror/messages';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import {
  WhitespaceDecorator,
  WhitespaceDecoratorSettings,
  WhitespaceRange,
} from './whitespace-types';

interface GenerateDecorationsProps extends FromToProps {
  /**
   * The starting decoration set.
   *
   * @default DecorationSet.empty
   */
  decorationSet?: DecorationSet;

  /**
   * The document which is being acted on.
   */
  doc: ProsemirrorNode;

  /**
   * A list of the whitespace decorators which are used to create decorations
   * from the provided ranges.
   */
  decorators: WhitespaceDecorator[];
}

/**
 * Generate a decoration set of whitespace characters for the provided range.
 */
export function generateDecorations(props: GenerateDecorationsProps): DecorationSet {
  const { from, to, doc, decorators } = props;
  let { decorationSet = DecorationSet.empty } = props;

  for (const decorator of decorators) {
    decorationSet = decorator({ decorationSet, doc, from, to });
  }

  return decorationSet;
}

/**
 * Create the decoration widget which displays the hidden character.
 */
function createWidget(pos: number, key: string) {
  const span = document.createElement('span');
  span.classList.add('whitespace', `whitespace--${key}`);

  return Decoration.widget(pos, span, {
    marks: [],
    key,
  });
}

interface NodeBuilderProps {
  key: string;
  calculatePosition: (nodeWithPosition: NodeWithPosition) => number;
  predicate: (node: ProsemirrorNode) => boolean;
}

/**
 * Create a hidden character creator which responds to different node areas
 * within the editor.
 */
function createNodeBuilder(builderOptions: NodeBuilderProps) {
  return (details: WhitespaceRange) => {
    const { calculatePosition, key, predicate } = builderOptions;
    const { decorationSet, doc, from, to } = details;

    // The decorations to add.
    const added: Decoration[] = [];

    // The decorations to remove.
    const removed: Decoration[] = [];

    doc.nodesBetween(from, to, (node, pos) => {
      if (predicate(node)) {
        const widgetPos = calculatePosition({ node, pos });

        // Add the new decoration.
        added.push(createWidget(widgetPos, key));

        // Remove any decorations which existed at this position.
        removed.push(...decorationSet.find(widgetPos, widgetPos, (spec) => spec.key === key));
      }
    });

    return decorationSet.remove(removed).add(doc, added);
  };
}

interface CharacterBuilderProps {
  key: string;
  /**
   * Check the provided character to see if it is an invisible character.
   */
  predicate: (character: string) => boolean;
}

/**
 * Build a hidden character creator which responds to certain characters in the
 * document.
 */
export function createCharacterBuilder(builderOptions: CharacterBuilderProps) {
  return (details: WhitespaceRange): DecorationSet => {
    const { key, predicate } = builderOptions;
    const { decorationSet, doc, from, to } = details;
    const textRanges = textBetween({ from, to, doc });
    const decorations: Decoration[] = [];

    for (const { pos, text } of textRanges) {
      for (const [index, char] of [...text].entries()) {
        if (!predicate(char)) {
          continue;
        }

        decorations.push(createWidget(pos + index, key));
      }
    }

    return decorationSet.add(doc, decorations);
  };
}

export function createDefaultWhitespaceDecorators(settings: WhitespaceDecoratorSettings) {
  const {
    breakNodes = ['hardBreak'],
    paragraphNodes = ['paragraph'],
    spaceCharacters = [' '],
  } = settings;

  return {
    // Characters for the hard break character.
    hardBreak: createNodeBuilder({
      calculatePosition: ({ pos }) => pos,
      key: 'br',
      predicate: (node) => isNodeOfType({ node, types: breakNodes }),
    }),

    // Create decorations for paragraphs
    paragraph: createNodeBuilder({
      key: 'p',
      calculatePosition: ({ node, pos }) => pos + node.nodeSize - 1,
      predicate: (node) => isNodeOfType({ node, types: paragraphNodes }),
    }),

    // Create character decorations for space characters
    space: createCharacterBuilder({
      key: 's',
      predicate: (char) => spaceCharacters.includes(char),
    }),
  };
}

export const toggleWhitespaceOptions: Remirror.CommandDecoratorOptions = {
  icon: 'moreFill',
  description: ({ t }) => t(ExtensionWhitespaceMessages.DESCRIPTION),
  label: ({ t }) => t(ExtensionWhitespaceMessages.LABEL),
};
