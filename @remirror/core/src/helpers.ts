import { ErrorConstant } from '@remirror/core-constants';
import { freeze, invariant, keys, object } from '@remirror/core-helpers';

import { ChangedProperties, GetChangedPropertiesReturn } from './types';

export interface GetChangedPropertiesParameter<Properties extends object> {
  /**
   * The previous readonly properties object.
   */
  previousProperties: Required<Readonly<Properties>>;

  /**
   * The partial update object that was passed through.
   */
  update: Partial<Properties>;

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
export function getChangedProperties<Properties extends object>(
  parameter: GetChangedPropertiesParameter<Properties>,
): GetChangedPropertiesReturn<Properties> {
  const { previousProperties: previous, update, equals = defaultEquals } = parameter;
  const next = freeze({ ...previous, ...update });
  const changes: ChangedProperties<Required<Properties>> = object();
  const propertyKeys = keys(previous);

  for (const key of propertyKeys) {
    const previousValue = previous[key];
    const value = next[key];

    if (equals(previousValue, value)) {
      changes[key] = { changed: false };
      continue;
    }

    changes[key] = { changed: true, previousValue, value };
  }

  return { changes: freeze(changes), properties: next };
}

export interface IsNameUniqueParameter {
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
   * @defaultValue 'extension'
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
 * @param parameter - destructured params
 */
export function throwIfNameNotUnique(parameter: IsNameUniqueParameter) {
  const { name, set, code } = parameter;
  const label = codeLabelMap[code];

  invariant(!set.has(name), {
    message: `There is a naming conflict for the name: ${name} used in this '${label}'. Please rename or remove from the editor to avoid runtime errors.`,
  });

  set.add(name);
}
