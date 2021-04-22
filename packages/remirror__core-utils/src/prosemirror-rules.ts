import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isFunction, isNullOrUndefined, isString } from '@remirror/core-helpers';
import type {
  EditorState,
  EditorStateProps,
  GetAttributesProps,
  Mark,
  MarkType,
  MarkTypeProps,
  NodeTypeProps,
  RegExpProps,
  TransactionProps,
} from '@remirror/core-types';
import { InputRule } from '@remirror/pm/inputrules';
import { NodeType } from '@remirror/pm/model';
import { markActiveInRange } from '@remirror/pm/suggest';

export interface BeforeDispatchProps extends TransactionProps {
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

export interface BaseInputRuleProps extends ShouldSkip {
  /**
   * A method which can be used to add more steps to the transaction after the
   * input rule update but before the editor has dispatched to update to a new
   * state.
   *
   * ```ts
   * import { nodeInputRule } from 'remirror';
   *
   * nodeInputRule({
   *   type,
   *   regexp: /abc/,
   *     beforeDispatch?: (props: BeforeDispatchProps) => void; : (tr)
   *     => tr.insertText('hello')
   * });
   * ```
   */
  beforeDispatch?: (props: BeforeDispatchProps) => void;

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
  updateCaptured?: UpdateCaptured;
}

type UpdateCaptured = (captured: UpdateCaptureTextProps) => Partial<UpdateCaptureTextProps>;

export interface NodeInputRuleProps
  extends Partial<GetAttributesProps>,
    RegExpProps,
    NodeTypeProps,
    BaseInputRuleProps {}

export interface PlainInputRuleProps extends RegExpProps, BaseInputRuleProps {
  /**
   * A function that transforms the match into the desired value.
   *
   * Return `null` or `undefined` to invalidate the match.
   */
  transformMatch: (match: string[]) => string | null | undefined;
}

export interface UpdateCaptureTextProps {
  /**
   * The first capture group from the matching input rule.
   */
  captureGroup: string | undefined;

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

interface MarkInputRuleProps
  extends Partial<GetAttributesProps>,
    RegExpProps,
    MarkTypeProps,
    BaseInputRuleProps {}

/**
 * Creates an input rule based on the provided regex for the provided mark type.
 */
export function markInputRule(props: MarkInputRuleProps): SkippableInputRule {
  const {
    regexp,
    type,
    getAttributes,
    ignoreWhitespace = false,
    beforeDispatch,
    updateCaptured,
    shouldSkip,
    invalidMarks,
  } = props;

  let markType: MarkType | undefined;

  const rule: SkippableInputRule = new InputRule(regexp, (state, match, start, end) => {
    const { tr, schema } = state;

    if (!markType) {
      markType = isString(type) ? schema.marks[type] : type;

      invariant(markType, {
        code: ErrorConstant.SCHEMA,
        message: `Mark type: ${type} does not exist on the current schema.`,
      });
    }

    let captureGroup = match[1];
    let fullMatch = match[0];

    // These are the attributes which are added to the mark and they can be
    // obtained from the match if a function is provided.
    const details = gatherDetails({
      captureGroup,
      fullMatch,
      end,
      start,
      rule,
      state,
      ignoreWhitespace,
      invalidMarks,
      shouldSkip,
      updateCaptured,
    });

    if (!details) {
      return null;
    }

    ({ start, end, captureGroup, fullMatch } = details);

    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
    let markEnd = end;
    let initialStoredMarks: Mark[] = [];

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

    tr.addMark(start, markEnd, markType.create(attributes));

    // Make sure not to reactivate any marks which had previously been
    // deactivated. By keeping track of the initial stored marks we are able to
    // discard any unintended consequences of deleting text and adding it again.
    tr.setStoredMarks(initialStoredMarks);

    // Allow the caller of this method to update the transaction before it is
    // returned and dispatched by ProseMirror.
    beforeDispatch?.({ tr, match, start, end });

    return tr;
  });

  return rule;
}

/**
 * Creates a node input rule based on the provided regex for the provided node
 * type.
 *
 * Input rules transform content as the user types based on whether a match is
 * found with a sequence of characters.
 */
export function nodeInputRule(props: NodeInputRuleProps): SkippableInputRule {
  const {
    regexp,
    type,
    getAttributes,
    beforeDispatch,
    shouldSkip,
    ignoreWhitespace = false,
    updateCaptured,
    invalidMarks,
  } = props;

  const rule: SkippableInputRule = new InputRule(regexp, (state, match, start, end) => {
    const attributes = isFunction(getAttributes) ? getAttributes(match) : getAttributes;
    const { tr, schema } = state;
    const nodeType: NodeType = isString(type) ? schema.nodes[type] : type;

    let captureGroup = match[1];
    let fullMatch = match[0];

    // These are the attributes which are added to the mark and they can be
    // obtained from the match if a function is provided.
    const details = gatherDetails({
      captureGroup,
      fullMatch,
      end,
      start,
      rule,
      state,
      ignoreWhitespace,
      invalidMarks,
      shouldSkip,
      updateCaptured,
    });

    if (!details) {
      return null;
    }

    ({ start, end, captureGroup, fullMatch } = details);

    invariant(nodeType, {
      code: ErrorConstant.SCHEMA,
      message: `No node exists for ${type} in the schema.`,
    });

    const content = nodeType.createAndFill(attributes);

    if (content) {
      tr.replaceRangeWith(nodeType.isBlock ? tr.doc.resolve(start).before() : start, end, content);
      beforeDispatch?.({ tr, match: [fullMatch, captureGroup ?? ''], start, end });
    }

    return tr;
  });

  return rule;
}

/**
 * Creates a plain rule based on the provided regex. You can see this being used
 * in the `@remirror/extension-emoji` when it is setup to use plain text.
 */
export function plainInputRule(props: PlainInputRuleProps): SkippableInputRule {
  const {
    regexp,
    transformMatch,
    beforeDispatch,
    shouldSkip,
    ignoreWhitespace = false,
    updateCaptured,
    invalidMarks,
  } = props;

  const rule: SkippableInputRule = new InputRule(regexp, (state, match, start, end) => {
    const value = transformMatch(match);

    if (isNullOrUndefined(value)) {
      return null;
    }

    const { tr, schema } = state;
    let captureGroup = match[1];
    let fullMatch = match[0];

    // These are the attributes which are added to the mark and they can be
    // obtained from the match if a function is provided.
    const details = gatherDetails({
      captureGroup,
      fullMatch,
      end,
      start,
      rule,
      state,
      ignoreWhitespace,
      invalidMarks,
      shouldSkip,
      updateCaptured,
    });

    if (!details) {
      return null;
    }

    ({ start, end, captureGroup, fullMatch } = details);

    if (value === '') {
      tr.delete(start, end);
    } else {
      tr.replaceWith(start, end, schema.text(value));
    }

    beforeDispatch?.({ tr, match, start, end });

    return tr;
  });

  return rule;
}

export interface ShouldSkipProps extends EditorStateProps, UpdateCaptureTextProps {
  /** The type of input rule that has been activated */
  ruleType: 'mark' | 'node' | 'plain';
}

interface ShouldSkip {
  /**
   * Every input rule calls this function before deciding whether or not to run.
   *
   * This is run for every successful input rule match to check if there are any
   * reasons to prevent it from running.
   *
   * In particular it is so that the input rule only runs when there are no
   * active checks that prevent it from doing so.
   *
   * - Other extension can register a `shouldSkip` handler
   * - Every time the input rule is running it makes sure it isn't blocked.
   */
  shouldSkip?: ShouldSkipFunction;

  /**
   * A list of marks which if existing in the provided range should invalidate
   * the range.
   */
  invalidMarks?: string[];
}

/**
 * A function which is called to check whether an input rule should be skipped.
 *
 * - When it returns false then it won't be skipped.
 * - When it returns true then it will be skipped.
 */
export type ShouldSkipFunction = (props: ShouldSkipProps) => boolean;

/**
 * An input rule which can have a `shouldSkip` property that returns true when
 * the input rule should be skipped.
 */
export type SkippableInputRule = ShouldSkip & InputRule;

interface GatherDetailsProps extends Omit<BaseInputRuleProps, 'beforeDispatch'> {
  /**
   * The first capture group from the matching input rule.
   */
  captureGroup: string | undefined;

  /**
   * The text of the full match which was received.
   */
  fullMatch: string | undefined;

  /**
   * The starting position of the match relative to the `doc`.
   */
  start: number;

  /**
   * The end position of the match relative to the `doc`.
   */
  end: number;

  /**
   * The current editor state.
   */
  state: EditorState;

  /**
   * The input rule being run. This can have global skip handlers attached.
   */
  rule: SkippableInputRule;
}

/**
 * This is a monster of a function.
 *
 * TODO make it make sense.
 */
function gatherDetails({
  captureGroup,
  fullMatch,
  end,
  start,
  rule,
  ignoreWhitespace,
  shouldSkip,
  updateCaptured,
  state,
  invalidMarks,
}: GatherDetailsProps): UpdateCaptureTextProps | null {
  if (fullMatch == null) {
    return null;
  }

  // Update the internal values with the user provided method.
  const details = updateCaptured?.({ captureGroup, fullMatch, start, end }) ?? {};

  // Store the updated values or the original.
  captureGroup = details.captureGroup ?? captureGroup;
  fullMatch = details.fullMatch ?? fullMatch;
  start = details.start ?? start;
  end = details.end ?? end;

  const $from = state.doc.resolve(start);
  const $to = state.doc.resolve(end);

  if (
    // Skip when the range contains an excluded mark.
    (invalidMarks && markActiveInRange({ $from, $to }, invalidMarks)) ||
    (rule.invalidMarks && markActiveInRange({ $from, $to }, rule.invalidMarks)) ||
    // Skip pure whitespace updates
    (ignoreWhitespace && captureGroup?.trim() === '') ||
    // Skip when configured to do
    shouldSkip?.({ state, captureGroup, fullMatch, start, end, ruleType: 'mark' }) ||
    rule.shouldSkip?.({ state, captureGroup, fullMatch, start, end, ruleType: 'mark' })
  ) {
    return null;
  }

  return { captureGroup, end, fullMatch, start };
}
