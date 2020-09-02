import { findMatches, isFunction, isNullOrUndefined } from '@remirror/core-helpers';
import type {
  GetAttributesParameter,
  Mark,
  MarkTypeParameter,
  NodeTypeParameter,
  ProsemirrorNode,
  ProsemirrorPlugin,
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

export interface UpdateCaptureTextParameter {
  /**
   * The first capture group from the matching input rule.
   */
  captureGroup: string;

  /**
   * The text of the full match which was received.
   */
  fullMatch: string;

  /**
   * The starting position of the match relative to the `doc`.
   */
  start: number;

  /**
   * The end position of the match relative to the `doc`.
   */
  end: number;
}

interface MarkInputRuleParameter
  extends Partial<GetAttributesParameter>,
    RegExpParameter,
    MarkTypeParameter,
    BaseInputRuleParameter {
  /**
   * Ignore the match when all characters in the capture group are whitespace.
   *
   * This helps stop situations from occurring where the a capture group matches
   * but you don't want an update if it's all whitespace.
   *
   * @default false
   */
  ignoreWhitespace?: boolean;

  /**
   * Update the capture group. This is needed sometimes because lookbehind regex
   * don't work in some browsers and can't be transpiled or polyfilled. This
   * method allows the developer to update the details of the matching input
   * rule details before it is acted on.
   *
   * The capture group refers to the first match within the matching bracket.
   *
   * ```ts
   * abc.match(/ab(c)/) => ['abc', 'a']
   * ```
   *
   * In the above example the capture group is the first index so in this case
   * the captured text would be `a`.
   *
   * @param captured - All the details about the capture to allow for full
   * customisation.
   * @returns updated details or undefined to leave unchanged.
   *
   * See https://github.com/remirror/remirror/issues/574#issuecomment-678700121
   * for more context.
   */
  updateCaptured?: (captured: UpdateCaptureTextParameter) => Partial<UpdateCaptureTextParameter>;
}

/**
 * Creates a paste rule based on the provided regex for the provided mark type.
 *
 * TODO extract this into a separate package
 * - All contained in one plugin.
 * - Support for node paste rules
 * - Support for pasting different kinds of content.
 */
export function markPasteRule(parameter: MarkInputRuleParameter): ProsemirrorPlugin {
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
export function markInputRule(parameter: MarkInputRuleParameter): InputRule {
  const {
    regexp,
    type,
    getAttributes,
    ignoreWhitespace = false,
    beforeDispatch,
    updateCaptured,
  } = parameter;

  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;

    // These are the attributes which are added to the mark and they can be
    // obtained from the match if a function is provided.
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;

    // Update the internal values with the user provided method.
    const details =
      updateCaptured?.({ captureGroup: match[1], fullMatch: match[0], start, end }) ?? {};

    // Store the updated values or the original.
    const captureGroup = details.captureGroup ?? match[1];
    const fullMatch = details.fullMatch ?? match[0];
    start = details.start ?? start;
    end = details.end ?? end;

    let markEnd = end;
    let initialStoredMarks: Mark[] = [];

    // This helps prevent matches which are only whitespace from triggering an
    // update.
    if (ignoreWhitespace && captureGroup?.trim() === '') {
      return null;
    }

    if (captureGroup) {
      const startSpaces = fullMatch.search(/\S/);
      const textStart = start + fullMatch.indexOf(captureGroup);
      const textEnd = textStart + captureGroup.length;
      initialStoredMarks = tr.storedMarks ?? [];

      if (textEnd < end) {
        tr.delete(textEnd, end);
      }

      if (textStart > start) {
        tr.delete(start + startSpaces, textStart);
      }

      markEnd = start + startSpaces + captureGroup.length;
    }

    tr.addMark(start, markEnd, type.create(attributes));

    // Make sure not to reactivate any marks which had previously been
    // deactivated. By keeping track of the initial stored marks we are able to
    // discard any unintended consequences of deleting text and adding it again.
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
export function nodeInputRule(parameter: NodeInputRuleParameter): InputRule {
  const { regexp, type, getAttributes, beforeDispatch } = parameter;

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
export function plainInputRule(parameter: PlainInputRuleParameter): InputRule {
  const { regexp, transformMatch, beforeDispatch } = parameter;

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
