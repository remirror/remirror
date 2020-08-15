import { findMatches, isFunction, isNullOrUndefined } from '@remirror/core-helpers';
import type {
  GetAttributesParameter,
  Mark,
  MarkTypeParameter,
  NodeTypeParameter,
  ProsemirrorNode,
  RegExpParameter,
  TransactionParameter,
} from '@remirror/core-types';
import { InputRule } from '@remirror/pm/inputrules';
import { Fragment, Slice } from '@remirror/pm/model';
import { Plugin, PluginKey } from '@remirror/pm/state';

export interface BeforeDispatchParameter extends TransactionParameter {
  /**
   * The matches returned by the regex.
   */
  match: string[];

  /**
   * The start position of the most recently typed character.
   */
  start: number;

  /**
   * The end position of the most recently typed character.
   */
  end: number;
}

export interface BaseInputRuleParameter {
  /**
   * A method which can be used to add more steps to the transaction after the
   * input rule update but before the editor has dispatched to update to a new
     state.
   *
   * ```ts
   * import { nodeInputRule } from 'remirror/core';
   *
   * nodeInputRule({
   *   type,
   *   regexp: /abc/,
   *     beforeDispatch?: (parameter: BeforeDispatchParameter) => void; : (tr)
         => tr.insertText('hello')
   * });
   * ```
   */
  beforeDispatch?: (parameter: BeforeDispatchParameter) => void;
}

export interface NodeInputRuleParameter
  extends Partial<GetAttributesParameter>,
    RegExpParameter,
    NodeTypeParameter,
    BaseInputRuleParameter {}

export interface PlainInputRuleParameter extends RegExpParameter, BaseInputRuleParameter {
  /**
   * A function that transforms the match into the desired value.
   */
  transformMatch: (match: string[]) => string | null | undefined;
}

interface MarkInputRuleParameter
  extends Partial<GetAttributesParameter>,
    RegExpParameter,
    MarkTypeParameter,
    BaseInputRuleParameter {}

/**
 * Creates a paste rule based on the provided regex for the provided mark type.
 *
 * TODO extract this into a separate package
 * - All contained in one plugin.
 * - Support for node paste rules
 * - Support for pasting different kinds of content.
 */
export function markPasteRule(parameter: MarkInputRuleParameter) {
  const { regexp, type, getAttributes } = parameter;
  const handler = (fragment: Fragment) => {
    const nodes: ProsemirrorNode[] = [];

    fragment.forEach((child) => {
      if (child.isText) {
        const text = child.text ?? '';
        let pos = 0;

        findMatches(text, regexp).forEach((match) => {
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
    key: new PluginKey('pasteRule'),
    props: {
      transformPasted: (slice) => new Slice(handler(slice.content), slice.openStart, slice.openEnd),
    },
  });
}

/**
 * Creates an input rule based on the provided regex for the provided mark type.
 */
export function markInputRule(parameter: MarkInputRuleParameter) {
  const { regexp, type, getAttributes, beforeDispatch: beforeDispatch } = parameter;

  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
    let markEnd = end;
    let initialStoredMarks: Mark[] = [];

    if (match[1]) {
      const startSpaces = match[0].search(/\S/);
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;
      initialStoredMarks = tr.storedMarks ?? [];

      if (textEnd < end) {
        tr.delete(textEnd, end);
      }

      if (textStart > start) {
        tr.delete(start + startSpaces, textStart);
      }

      markEnd = start + startSpaces + match[1].length;
    }

    tr.addMark(start, markEnd, type.create(attributes));

    // Make sure not to continue with any ongoing marks
    tr.setStoredMarks(initialStoredMarks);

    // Allow the caller of this method to update the transaction before it is
    // returned and dispatched by ProseMirror.
    beforeDispatch?.({ tr, match, start, end });

    return tr;
  });
}

/**
 * Creates a node input rule based on the provided regex for the provided node
 * type.
 *
 * Input rules transform content as the user types based on whether a match is
 * found with a sequence of characters.
 */
export function nodeInputRule(parameter: NodeInputRuleParameter) {
  const { regexp, type, getAttributes, beforeDispatch: beforeDispatch } = parameter;

  return new InputRule(regexp, (state, match, start, end) => {
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
    const { tr } = state;

    tr.replaceWith(start - 1, end, type.create(attributes));

    beforeDispatch?.({ tr, match, start, end });

    return tr;
  });
}

/**
 * Creates a plain rule based on the provided regex. You can see this being used
 * in the `@remirror/extension-emoji` when it is setup to use plain text.
 */
export function plainInputRule(parameter: PlainInputRuleParameter) {
  const { regexp, transformMatch, beforeDispatch: beforeDispatch } = parameter;

  return new InputRule(regexp, (state, match, start, end) => {
    const value = transformMatch(match);

    if (isNullOrUndefined(value)) {
      return null;
    }

    const { tr } = state;

    if (value === '') {
      tr.delete(start, end);
    } else {
      tr.replaceWith(start, end, state.schema.text(value));
    }

    beforeDispatch?.({ tr, match, start, end });

    return tr;
  });
}
