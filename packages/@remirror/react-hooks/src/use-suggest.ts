import { useCallback } from 'react';
import { Except } from 'type-fest';

import {
  BuiltinPreset,
  EditorState,
  EditorStateParameter,
  hasTransactionChanged,
  omit,
  pick,
  TransactionParameter,
} from '@remirror/core';
import {
  SuggestChangeHandlerMethod,
  SuggestChangeHandlerParameter,
  Suggester,
  SuggestExitHandlerMethod,
  SuggestExitHandlerParameter,
  SuggestState,
} from '@remirror/pm/suggest';
import { usePreset, useRemirror, useSetState } from '@remirror/react';

export interface UseSuggesterProps
  extends Except<
    Suggester,
    'onChange' | 'onExit' | 'onCharacterEntry' | 'keyBindings' | 'createCommand'
  > {}

type SuggestStateMethods = Pick<
  SuggestState,
  'addIgnored' | 'clearIgnored' | 'removeIgnored' | 'ignoreNextExit' | 'setMarkRemoved'
>;

export interface UseSuggesterReturn extends SuggestStateMethods {
  change:
    | Pick<SuggestChangeHandlerParameter, 'matchText' | 'queryText' | 'range' | 'reason'>
    | undefined;
  exit:
    | Pick<SuggestExitHandlerParameter, 'matchText' | 'queryText' | 'range' | 'reason'>
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

/**
 * The reason for including both the `exit` and `change` return values is that
 * it's possible to both exit and change at the same time when jumping from one
 * suggester matching text to another. The cursor has exited and entered
 * (changed) at the same time.
 */
export function useSuggester(props: UseSuggesterProps): UseSuggesterReturn {
  const { helpers } = useRemirror<BuiltinPreset>();

  const suggestHelpers = helpers.getSuggestPluginHelpers();
  const [hookState, setHookState] = useSetState<UseSuggesterState>({
    change: undefined,
    exit: undefined,
    updatesSinceLastChange: 0,
    updatesSinceLastExit: 0,
    ...suggestHelpers,
  });

  // Track changes in the suggester
  const onChange: SuggestChangeHandlerMethod = useCallback(
    (parameter) => {
      const { name } = parameter.suggester;
      const change = pick(parameter, ['matchText', 'queryText', 'range', 'reason']);

      setHookState({ change: name === props.name ? change : undefined, updatesSinceLastExit: 0 });
    },
    [props.name, setHookState],
  );

  // Track exits from the suggester
  const onExit: SuggestExitHandlerMethod = useCallback(
    (parameter) => {
      const { name } = parameter.suggester;
      const exit = pick(parameter, ['matchText', 'queryText', 'range', 'reason']);

      setHookState({ exit: name === props.name ? exit : undefined, updatesSinceLastExit: 0 });
    },
    [props.name, setHookState],
  );

  useRemirror(
    useCallback(
      ({ tr, state, previousState }) => {
        if (
          !hasStateChanged({ tr, state, previousState }) ||
          helpers.getSuggestPluginState().removed
        ) {
          return;
        }

        if (hookState.updatesSinceLastChange > 0 && hookState.change) {
          setHookState({ change: undefined });
        }

        if (hookState.updatesSinceLastExit > 0 && hookState.exit) {
          setHookState({ exit: undefined });
        }

        if (hookState.updatesSinceLastChange === 0 && hookState.change) {
          setHookState({ updatesSinceLastChange: hookState.updatesSinceLastChange + 1 });
        }

        if (hookState.updatesSinceLastExit === 0 && hookState.exit) {
          setHookState({ updatesSinceLastExit: hookState.updatesSinceLastExit + 1 });
        }
      },
      [
        helpers,
        hookState.change,
        hookState.exit,
        hookState.updatesSinceLastChange,
        hookState.updatesSinceLastExit,
        setHookState,
      ],
    ),
  );

  usePreset(
    BuiltinPreset,
    ({ addCustomHandler }) => {
      return addCustomHandler('suggester', { ...props, onChange, onExit });
    },
    [props, onChange, onExit],
  );

  return omit(hookState, ['updatesSinceLastExit', 'updatesSinceLastChange']);
}

interface HasChangedParameter extends EditorStateParameter, Partial<TransactionParameter> {
  previousState: EditorState;
}

function hasStateChanged(parameter: HasChangedParameter) {
  const { tr, state, previousState } = parameter;

  if (tr) {
    return hasTransactionChanged(tr);
  }

  return !state.doc.eq(previousState.doc) || !state.selection.eq(previousState.selection);
}
