import { freeze, keys } from '@remirror/core-helpers';

import { ChangedProperties } from './types';

export interface GetChangedPropertiesParameter<Properties extends object> {
  /**
   * The previous readonly properties object.
   */
  previous: Required<Readonly<Properties>>;

  /**
   * The partial update object that was passed through.
   */
  update: Partial<Properties>;

  /**
   * A method to check whether two value are equal.
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
  const { previous, update, equals = defaultEquals } = parameter;
  const next = freeze({ ...previous, update });
  const changes = {} as ChangedProperties<Properties>;
  const propertyKeys = keys(previous);

  for (const key of propertyKeys) {
    const previousValue = previous[key];
    const nextValue = next[key];

    if (equals(previousValue, nextValue)) {
      changes[key] = { changed: false };
      continue;
    }

    changes[key] = { changed: true, previous: previousValue, next: nextValue };
  }

  return { changes: freeze(changes), next };
}

export interface GetChangedPropertiesReturn<Properties extends object> {
  /**
   * The next value of the properties after the update.
   */
  next: Readonly<Required<Properties>>;

  /**
   * An object with all the keys showing what's been changed.
   *
   * @remarks
   *
   * Using this can prevent unnecessary updates. It's possible for new
   * properties to be passed that are identical to the previous, by checking if
   * the object was changed this can be avoided.
   */
  changes: Readonly<ChangedProperties<Properties>>;
}
