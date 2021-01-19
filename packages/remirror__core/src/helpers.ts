import { ErrorConstant } from '@remirror/core-constants';
import { freeze, invariant, keys, object } from '@remirror/core-helpers';
import type { GetFixedDynamic, GetPartialDynamic, ValidOptions } from '@remirror/core-types';

import type { GetChangeOptionsReturn, PickChanged } from './types';

export interface GetChangedOptionsProps<Options extends ValidOptions> {
  /**
   * The previous readonly properties object.
   */
  previousOptions: GetFixedDynamic<Options>;

  /**
   * The partial update object that was passed through.
   */
  update: GetPartialDynamic<Options>;

  /**
   * A method to check whether two values are equal.
   */
  equals?: (valueA: unknown, valueB: unknown) => boolean;
}

function defaultEquals(valueA: unknown, valueB: unknown) {
  return valueA === valueB;
}

/**
 * Get the property changes and the next value from an update.
 */
export function getChangedOptions<Options extends ValidOptions>(
  props: GetChangedOptionsProps<Options>,
): GetChangeOptionsReturn<Options> {
  const { previousOptions, update, equals = defaultEquals } = props;
  const next = freeze({ ...previousOptions, ...update });
  const changes = object<any>();
  const optionKeys = keys(previousOptions);

  for (const key of optionKeys) {
    const previousValue = previousOptions[key];
    const value = next[key];

    if (equals(previousValue, value)) {
      changes[key] = { changed: false };
      continue;
    }

    changes[key] = { changed: true, previousValue, value };
  }

  const pickChanged: PickChanged<Options> = (keys) => {
    const picked = object<any>();

    for (const key of keys) {
      const item = changes[key];

      if (item?.changed) {
        picked[key] = item.value;
      }
    }

    return picked;
  };

  return { changes: freeze(changes), options: next, pickChanged };
}

export interface IsNameUniqueProps {
  /**
   * The name to check against
   */
  name: string;

  /**
   * The set to check within
   */
  set: Set<string>;

  /**
   * The error code to use
   *
   * @default 'extension'
   */
  code: ErrorConstant.DUPLICATE_HELPER_NAMES | ErrorConstant.DUPLICATE_COMMAND_NAMES;
}

const codeLabelMap = {
  [ErrorConstant.DUPLICATE_HELPER_NAMES]: 'helper method',
  [ErrorConstant.DUPLICATE_COMMAND_NAMES]: 'command method',
};

/**
 * Checks whether a given string is unique to the set. Add the name if it
 * doesn't already exist, or throw an error when `shouldThrow` is true.
 *
 * @param props - destructured params
 */
export function throwIfNameNotUnique(props: IsNameUniqueProps): void {
  const { name, set, code } = props;
  const label = codeLabelMap[code];

  invariant(!set.has(name), {
    code,
    message: `There is a naming conflict for the name: ${name} used in this '${label}'. Please rename or remove from the editor to avoid runtime errors.`,
  });

  set.add(name);
}
