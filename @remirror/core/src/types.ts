import { FlipPartialAndRequired } from '@remirror/core-types';

/**
 * This is the shape for both the preset and extension so that properties can be
 * set with an identical interface.
 *
 * @typeParam Properties - The properties used by the object.
 */
export interface PropertiesShape<Properties extends object> {
  /**
   * A properties object with all value required.
   */
  readonly properties: Required<Properties>;

  /**
   * Reset the properties object to the default values.
   */
  resetProperties: () => void;

  /**
   * Set the properties to the newly defined values.
   */
  setProperties: (properties: Partial<Properties>) => void;
}

type Changes<Type> =
  | {
      /**
       * Whether or not the value has changed.
       *
       * - `false` when no change occurred.
       */
      changed: false;
    }
  | {
      /**
       * - `true` when a change occurred.
       */
      changed: true;
      /**
       * The previous value before the changed. This is only accessible when
       * `changed` is `true`.
       */
      previous: Type;

      /**
       * The new value after the change. This is only accessible when
       * `changed` is `true`.
       */
      next: Type;
    };

/**
 * Highlights all the properties that have changed.
 */
export type ChangedProperties<Properties extends object> = {
  [Key in keyof Properties]: Changes<Properties[Key]>;
};
