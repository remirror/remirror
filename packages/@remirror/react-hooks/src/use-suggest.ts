import { useCallback, useMemo, useState } from 'react';
import type { Except } from 'type-fest';

import {
  ApplyStateLifecycleProps,
  BuiltinPreset,
  isEmptyObject,
  PluginsExtension,
  SuggestExtension,
} from '@remirror/core';
import { hasStateChanged } from '@remirror/extension-positioner';
import type {
  ChangeReason,
  ExitReason,
  SuggestChangeHandler,
  SuggestChangeHandlerProps,
  Suggester,
  SuggestState,
} from '@remirror/pm/suggest';
import { ReplaceAroundStep } from '@remirror/pm/transform';
import { useExtension, useRemirrorContext } from '@remirror/react';

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
export function useSuggest(props: UseSuggesterProps): UseSuggestReturn {
  const { helpers } = useRemirrorContext<BuiltinPreset>();

  const [hookState, setHookState] = useState<UseSuggestState>(() => ({
    change: undefined,
    exit: undefined,
    shouldResetChangeState: false,
    shouldResetExitState: false,
    ...helpers.getSuggestMethods(),
  }));

  // Track changes in the suggester
  const onChange: SuggestChangeHandler = useCallback(
    (options) => {
      const { changeReason, exitReason, match, query, text, range } = options;
      const stateUpdate: Partial<UseSuggestState> = {};

      // Keep track of changes
      if (changeReason) {
        stateUpdate.change = { match, query, text, range, reason: changeReason };
        stateUpdate.shouldResetChangeState = false;
      }

      if (exitReason) {
        stateUpdate.exit = { match, query, text, range, reason: exitReason };
        stateUpdate.shouldResetExitState = false;

        if (!changeReason) {
          stateUpdate.change = undefined;
        }
      }

      if (!isEmptyObject(stateUpdate)) {
        setHookState((prevState) => ({ ...prevState, ...stateUpdate }));
      }
    },
    [setHookState],
  );

  // This change handler will be called on every editor state update. It keeps
  // the state for the suggester that has been added correct.
  const onApplyState = useCallback(
    ({ tr, state, previousState }: ApplyStateLifecycleProps) => {
      const [step] = tr.steps;

      if (!hasStateChanged({ tr, state, previousState }) || helpers.getSuggestState().removed) {
        return;
      }

      // Call the state function to update the state.
      setHookState((prevState) => {
        // Group all updates into one object.
        const stateUpdate: UseSuggestState = { ...prevState };

        if (
          prevState.shouldResetChangeState &&
          prevState.change &&
          !(step instanceof ReplaceAroundStep)
        ) {
          console.log('RESET CHANGE', prevState.shouldResetChangeState);
          stateUpdate.change = undefined;
        }

        if (
          prevState.shouldResetExitState &&
          prevState.exit &&
          !(step instanceof ReplaceAroundStep)
        ) {
          stateUpdate.exit = undefined;
        }

        if (!prevState.shouldResetChangeState && prevState.change) {
          console.log('set RESET CHANGE to true');
          stateUpdate.shouldResetChangeState = true;
        }

        if (!prevState.shouldResetExitState && prevState.exit) {
          stateUpdate.shouldResetExitState = true;
        }

        return stateUpdate;
      });
    },
    [helpers, setHookState],
  );

  // Attach the editor state handler to the instance of the remirror editor.
  useExtension(PluginsExtension, ({ addHandler }) => addHandler('applyState', onApplyState), [
    onApplyState,
  ]);

  // Add the suggester to the editor via the `useExtension` hook.
  useExtension(
    SuggestExtension,
    ({ addCustomHandler }) => addCustomHandler('suggester', { ...props, onChange }),
    [onChange, props],
  );

  return useMemo(() => {
    // console.log(
    //   'MEMOIZED VALUE',
    //   `'${hookState.change?.query.full ?? ''}'`,
    //   hookState.shouldResetChangeState,
    // );
    return {
      addIgnored: hookState.addIgnored,
      change: hookState.change,
      exit: hookState.exit,
      clearIgnored: hookState.clearIgnored,
      ignoreNextExit: hookState.ignoreNextExit,
      removeIgnored: hookState.removeIgnored,
      setMarkRemoved: hookState.setMarkRemoved,
    };
  }, [
    // hookState.shouldResetChangeState,
    hookState.addIgnored,
    hookState.change,
    hookState.clearIgnored,
    hookState.exit,
    hookState.ignoreNextExit,
    hookState.removeIgnored,
    hookState.setMarkRemoved,
  ]);
}

/**
 * @deprecated - Renamed to useSuggest
 */
export const useSuggester = useSuggest;

export interface UseSuggesterProps extends Except<Suggester, 'onChange'> {}

type SuggestStateMethods = Pick<
  SuggestState,
  'addIgnored' | 'clearIgnored' | 'removeIgnored' | 'ignoreNextExit' | 'setMarkRemoved'
>;

interface ExitReasonProps {
  /**
   * The reason for the exit. More details can be found in the [[`ExitReason`]] docs.
   */
  reason: ExitReason;
}

interface ChangeReasonProps {
  /**
   * The reason for the change. More details can be found in the [[`ChangeReason`]] docs.
   */
  reason: ChangeReason;
}

export interface UseSuggestReturn extends SuggestStateMethods {
  change:
    | (Pick<SuggestChangeHandlerProps, 'text' | 'query' | 'range' | 'match'> & ChangeReasonProps)
    | undefined;
  exit:
    | (Pick<SuggestChangeHandlerProps, 'text' | 'query' | 'range' | 'match'> & ExitReasonProps)
    | undefined;
}

interface UseSuggestState extends UseSuggestReturn {
  /**
   * Keep track of the updates since the last change to this suggester. If
   * greater than `1` then reset the `change` state.
   */
  shouldResetChangeState: boolean;

  /**
   * Keep track of the updates since the last exit from this suggester. If
   * greater than `1` then reset the `exit` state.
   */
  shouldResetExitState: boolean;
}
