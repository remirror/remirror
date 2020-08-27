import { useCallback } from 'react';
import type { Except } from 'type-fest';

import {
  AnyExtension,
  AnyPreset,
  BuiltinPreset,
  omit,
  RemirrorEventListener,
} from '@remirror/core';
import { hasStateChanged } from '@remirror/extension-positioner';
import type {
  ChangeReason,
  ExitReason,
  SuggestChangeHandler,
  SuggestChangeHandlerParameter,
  Suggester,
  SuggestState,
} from '@remirror/pm/suggest';
import { usePreset, useRemirror, useSetState } from '@remirror/react';

/**
 * This hook allows you to dynamically create a suggester which can respond to
 * user input of activation characters or regex patterns.
 *
 * By adding a suggester it is possible to keep track of what the user has
 * typed and receive meaningful information in return.
 *
 * This includes
 *
 * - The range of the matching text
 * - The matching text value
 * - The query value, which excludes the matching character (or character regex).
 * - The matching capture groups [FULL_MATCH, MATCHING_CHARACTER, CUSTOM_GROUPS]
 *
 * The return value has two keys, `exit` and `change` which can both be
 * `undefined`. The reason for including both the `exit` and `change` return
 * values is that it's possible for both to occur at the the same time during a
 * **jump** from one [[`Suggester`]] _match_ to another suggester match.
 *
 * The cursor has exited and entered (changed) at the same time.
 */
export function useSuggester(props: UseSuggesterProps): UseSuggesterReturn {
  const { helpers } = useRemirror<BuiltinPreset>();

  const [hookState, setHookState] = useSetState<UseSuggesterState>({
    change: undefined,
    exit: undefined,
    updatesSinceLastChange: 0,
    updatesSinceLastExit: 0,
    ...helpers.getSuggestMethods(),
  });

  // Track changes in the suggester
  const onChange: SuggestChangeHandler = useCallback(
    (parameter) => {
      const { changeReason, exitReason, match, query, text, range } = parameter;

      // Keep track of changes
      if (changeReason) {
        const change = { match, query, text, range, reason: changeReason };
        setHookState({ change, updatesSinceLastChange: 0 });
      }

      if (exitReason) {
        const exit = { match, query, text, range, reason: exitReason };
        setHookState({ exit, updatesSinceLastExit: 0 });
      }
    },
    [setHookState],
  );

  // This change handler will be called on every editor state update. It keeps
  // the state for the suggester that has been added correct.
  const onStateUpdate: RemirrorEventListener<AnyExtension | AnyPreset> = useCallback(
    (parameter) => {
      const { tr, state, previousState } = parameter;

      if (!hasStateChanged({ tr, state, previousState }) || helpers.getSuggestState().removed) {
        return;
      }

      // Group all updates into one object.
      const stateUpdate: Partial<UseSuggesterState> = {};

      if (hookState.updatesSinceLastChange > 0 && hookState.change) {
        stateUpdate.change = undefined;
      }

      if (hookState.updatesSinceLastExit > 0 && hookState.exit) {
        stateUpdate.exit = undefined;
      }

      if (hookState.updatesSinceLastChange === 0 && hookState.change) {
        stateUpdate.updatesSinceLastChange = hookState.updatesSinceLastChange + 1;
      }

      if (hookState.updatesSinceLastExit === 0 && hookState.exit) {
        stateUpdate.updatesSinceLastExit = hookState.updatesSinceLastExit + 1;
      }

      // Call the state function to update the state.
      setHookState(stateUpdate);
    },
    [
      helpers,
      hookState.change,
      hookState.exit,
      hookState.updatesSinceLastChange,
      hookState.updatesSinceLastExit,
      setHookState,
    ],
  );

  // Attached the editor state handler to the instance of the remirror editor.
  useRemirror(onStateUpdate);

  // Add the suggester to the editor via the BuiltinPreset.
  usePreset(
    BuiltinPreset,
    ({ addCustomHandler }) => addCustomHandler('suggester', { ...props, onChange }),
    [props, onChange],
  );

  return omit(hookState, ['updatesSinceLastExit', 'updatesSinceLastChange']);
}

export interface UseSuggesterProps extends Except<Suggester, 'onChange'> {}

type SuggestStateMethods = Pick<
  SuggestState,
  'addIgnored' | 'clearIgnored' | 'removeIgnored' | 'ignoreNextExit' | 'setMarkRemoved'
>;

interface ExitReasonParameter {
  /**
   * The reason for the exit. More details can be found in the [[`ExitReason`]] docs.
   */
  reason: ExitReason;
}

interface ChangeReasonParameter {
  /**
   * The reason for the change. More details can be found in the [[`ChangeReason`]] docs.
   */
  reason: ChangeReason;
}

export interface UseSuggesterReturn extends SuggestStateMethods {
  change:
    | (Pick<SuggestChangeHandlerParameter, 'text' | 'query' | 'range' | 'match'> &
        ChangeReasonParameter)
    | undefined;
  exit:
    | (Pick<SuggestChangeHandlerParameter, 'text' | 'query' | 'range' | 'match'> &
        ExitReasonParameter)
    | undefined;
}

interface UseSuggesterState extends UseSuggesterReturn {
  /**
   * Keep track of the updates since the last change to this suggester. If
   * greater than `1` then reset the `change` state.
   */
  updatesSinceLastChange: number;

  /**
   * Keep track of the updates since the last exit from this suggester. If
   * greater than `1` then reset the `exit` state.
   */
  updatesSinceLastExit: number;
}
