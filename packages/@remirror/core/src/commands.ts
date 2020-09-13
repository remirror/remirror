import type {
  AttributesParameter,
  CommandFunction,
  EditorSchema,
  MarkTypeParameter,
  RangeParameter,
} from '@remirror/core-types';
import { convertCommand, isMarkActive } from '@remirror/core-utils';
import { toggleMark as originalToggleMark } from '@remirror/pm/commands';

export interface ToggleMarkParameter<Schema extends EditorSchema = EditorSchema>
  extends MarkTypeParameter<Schema>,
    Partial<AttributesParameter>,
    Partial<RangeParameter> {}

/**
 * A custom `toggleMark` function that works for the `remirror` codebase.
 *
 * Create a command function that toggles the given mark with the given
 * attributes. Will return `false` when the current selection doesn't support
 * that mark. This will remove the mark if any marks of that type exist in the
 * selection, or add it otherwise. If the selection is empty, this applies to
 * the [stored marks](#state.EditorState.storedMarks) instead of a range of the
 * document.
 *
 * The differences from the `prosemirror-commands` version.
 * - Acts on the transaction rather than the state to allow for commands to be
 *   chained together.
 * - Uses the ONE parameter function signature for compatibility with remirror.
 * - Supports passing a custom range.
 */
export function toggleMark(parameter: ToggleMarkParameter): CommandFunction {
  const { type, attrs, range } = parameter;

  return (parameter) => {
    const { dispatch, tr } = parameter;

    if (range) {
      isMarkActive({ trState: tr, type, ...range })
        ? dispatch?.(tr.removeMark(range.from, range.to, type))
        : dispatch?.(tr.addMark(range.from, range.to, type.create(attrs)));

      return true;
    }

    return convertCommand(originalToggleMark(type, attrs))(parameter);
  };
}
