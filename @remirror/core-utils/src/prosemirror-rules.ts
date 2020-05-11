import { findMatches, isFunction, isNullOrUndefined } from '@remirror/core-helpers';
import {
  EditorSchema,
  GetAttributesParameter,
  MarkTypeParameter,
  NodeTypeParameter,
  ProsemirrorNode,
  RegExpParameter,
} from '@remirror/core-types';
import { InputRule } from '@remirror/pm/inputrules';
import { Fragment, Slice } from '@remirror/pm/model';
import { Plugin, TextSelection } from '@remirror/pm/state';

interface NodeInputRuleParameter
  extends Partial<GetAttributesParameter>,
    RegExpParameter,
    NodeTypeParameter {
  /**
   * Allows for setting a text selection at the start of the newly created node.
   * Leave blank or set to false to ignore.
   */
  updateSelection?: boolean;
}
interface PlainInputRuleParameter extends RegExpParameter {
  /**
   * Allows for setting a text selection at the start of the newly created node.
   * Leave blank or set to false to ignore.
   */
  updateSelection?: boolean;

  /**
   * A function that transforms the match into the desired value.
   */
  transformMatch: (match: string[]) => string | null | undefined;
}

interface MarkInputRuleParameter
  extends Partial<GetAttributesParameter>,
    RegExpParameter,
    MarkTypeParameter {}

/**
 * Creates a paste rule based on the provided regex for the provided mark type
 */
export const markPasteRule = ({ regexp, type, getAttributes }: MarkInputRuleParameter) => {
  const handler = (fragment: Fragment) => {
    const nodes: ProsemirrorNode[] = [];

    fragment.forEach((child) => {
      if (child.isText) {
        const text = child.text ?? '';
        let pos = 0;

        // ? For some reason including the index param makes this work. I'm not sure why...?
        findMatches(text, regexp).forEach((match, _) => {
          if (!match[1]) {
            return;
          }

          const start = match.index;
          const end = start + match[0].length;
          const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;

          if (start > 0) {
            nodes.push(child.cut(pos, start));
          }

          nodes.push(child.cut(start, end).mark(type.create(attributes).addToSet(child.marks)));

          pos = end;
        });

        if (text && pos < text.length) {
          nodes.push(child.cut(pos));
        }
      } else {
        nodes.push(child.copy(handler(child.content)));
      }
    });

    return Fragment.fromArray(nodes);
  };

  return new Plugin({
    props: {
      transformPasted: (slice) => new Slice(handler(slice.content), slice.openStart, slice.openEnd),
    },
  });
};

/**
 * Creates an input rule based on the provided regex for the provided mark type
 */
export const markInputRule = ({
  regexp,
  type,
  getAttributes: getAttributes,
}: MarkInputRuleParameter) => {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;

    let markEnd = end;

    if (match[1]) {
      const startSpaces = match[0].search(/\S/);
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;

      if (textEnd < end) {
        tr.delete(textEnd, end);
      }

      if (textStart > start) {
        tr.delete(start + startSpaces, textStart);
      }

      markEnd = start + startSpaces + match[1].length;
    }

    return (
      tr
        .addMark(start, markEnd, type.create(attributes))
        // Make sure not to continue with any ongoing marks
        .removeStoredMark(type)
    );
  });
};

/**
 * Creates an node input rule based on the provided regex for the provided node type
 */
export const nodeInputRule = ({
  regexp,
  type,
  getAttributes: getAttributes,
  updateSelection = false,
}: NodeInputRuleParameter) => {
  return new InputRule(regexp, (state, match, start, end) => {
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
    const { tr } = state;

    tr.replaceWith(start - 1, end, type.create(attributes));

    if (updateSelection) {
      const $pos = tr.doc.resolve(start);
      tr.setSelection(new TextSelection($pos));
    }
    return tr;
  });
};

/**
 * Creates an node input rule based on the provided regex for the provided node type
 */
export const plainInputRule = <Schema extends EditorSchema = EditorSchema>({
  regexp,
  transformMatch,
  updateSelection = false,
}: PlainInputRuleParameter) => {
  return new InputRule<Schema>(regexp, (state, match, start, end) => {
    const value = transformMatch(match);

    if (isNullOrUndefined(value)) {
      return null;
    }

    const { tr } = state;

    if (value === '') {
      tr.delete(start, end);
    } else {
      tr.replaceWith(start, end, state.schema.text(value) as ProsemirrorNode<Schema>);
    }

    if (updateSelection) {
      const $pos = tr.doc.resolve(start);
      tr.setSelection(new TextSelection($pos));
    }
    return tr;
  });
};
