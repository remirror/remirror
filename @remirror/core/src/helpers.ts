import { ErrorConstant } from '@remirror/core-constants';
import { freeze, invariant, keys } from '@remirror/core-helpers';

import { ChangedProperties } from './types';

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
  const changes = {} as ChangedProperties<Properties>;
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

export interface GetChangedPropertiesReturn<Properties extends object> {
  /**
   * The next value of the properties after the update.This also includes values which have not been changed.
   */
  properties: Readonly<Required<Properties>>;

  /**
   * An object with all the keys showing what's been changed. This should be
   * used to determine the children extensions which should be updated.
   *
   * @remarks
   *
   * Using this can prevent unnecessary updates. It's possible for new
   * properties to be passed that are identical to the previous, by checking if
   * the object was changed this can be avoided.
   *
   * This uses a discriminated union. When the `changed` property
   *
   * ```ts
   * if (changes.myProperty.changed) {}
   */
  changes: Readonly<ChangedProperties<Properties>>;
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
