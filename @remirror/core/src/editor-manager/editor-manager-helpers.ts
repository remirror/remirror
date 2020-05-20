import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isEmptyArray, isFunction, object, sort } from '@remirror/core-helpers';

import { AnyExtension, AnyExtensionConstructor, isExtension } from '../extension';
import { AnyPreset, isPreset } from '../preset';
import { GetConstructor } from '../types';

export interface TransformExtensionOrPreset<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
> {
  extensions: ExtensionUnion[];
  extensionMap: WeakMap<GetConstructor<ExtensionUnion>, ExtensionUnion>;
  presets: PresetUnion[];
  presetMap: WeakMap<GetConstructor<PresetUnion>, PresetUnion>;
}

/**
 * Transforms the unsorted array of presets and extension into presets and
 * sorted extensions. Handles uniqueness of extensions and automatically pulling
 * throwing an error when required extensions are missing.
 *
 * TODO Add a check for requiredExtensions and inject them automatically TODO
 * Currently matching by constructor - what if different versions exist in the
 * same app...
 *
 * @param unionValues - the extensions to transform as well as their priorities
 *
 * @returns the list of extension instances sorted by priority
 */
export function transformExtensionOrPreset<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(
  unionValues: ReadonlyArray<ExtensionUnion | PresetUnion>,
): TransformExtensionOrPreset<ExtensionUnion, PresetUnion> {
  type ExtensionConstructor = GetConstructor<ExtensionUnion>;
  type PresetConstructor = GetConstructor<PresetUnion>;
  interface MissingConstructor {
    Constructor: AnyExtensionConstructor;
    extension: ExtensionUnion;
  }

  // The items to return.
  const presets: PresetUnion[] = [];
  const presetMap = new WeakMap<PresetConstructor, PresetUnion>();
  const extensions: ExtensionUnion[] = [];
  const extensionMap = new WeakMap<ExtensionConstructor, ExtensionUnion>();

  // Used to track duplicates and the presets they've been added by.
  const duplicateMap = new WeakMap<AnyExtensionConstructor, Array<PresetUnion | undefined>>();

  // The unsorted, de-duped, unrefined extensions.
  let rawExtensions: ExtensionUnion[] = [];

  /**
   * Adds the values to the duplicate map for checking duplicates.
   */
  const updateDuplicateMap = (extension: ExtensionUnion, preset?: PresetUnion) => {
    const key = extension.constructor;
    const duplicate = duplicateMap.get(key);
    duplicateMap.set(key as never, duplicate ? [...duplicate, preset] : [preset]);
  };

  for (const presetOrExtension of unionValues) {
    // Update the extension list in this block
    if (isExtension(presetOrExtension)) {
      rawExtensions.push(presetOrExtension);
      updateDuplicateMap(presetOrExtension);

      continue;
    }

    // Update the presets list in this block
    if (isPreset(presetOrExtension)) {
      presets.push(presetOrExtension);
      rawExtensions.push(...(presetOrExtension.extensions as ExtensionUnion[]));
      presetMap.set(presetOrExtension.constructor, presetOrExtension);

      presetOrExtension.extensions.forEach((extension) =>
        updateDuplicateMap(extension as ExtensionUnion, presetOrExtension),
      );

      continue;
    }

    // TODO: Allow constructors to be auto instantiated.

    // This is only reached if the passed value is invalid.
    invariant(false, { code: ErrorConstant.INVALID_MANAGER_ARGUMENTS });
  }

  // Sort the extensions.
  rawExtensions = sort(rawExtensions, (a, b) => a.priority - b.priority);

  // Keep track of added constructors for uniqueness.
  const found = new WeakSet<AnyExtensionConstructor>();

  // Remove extension duplicates and update the preset with the non duplicated
  // value.
  for (const extension of rawExtensions) {
    const key = extension.constructor;
    const duplicates = duplicateMap.get(key);

    invariant(duplicates, {
      message: `No entries where found for the ExtensionConstructor ${extension.name}`,
      code: ErrorConstant.INTERNAL,
    });

    if (found.has(key)) {
      continue;
    }

    found.add(key);
    extensions.push(extension);

    // Replace the extensions for all presets that referenced this constructor.
    duplicates.forEach((preset) => preset?.replaceExtension(key, extension));
  }

  const missing: MissingConstructor[] = [];

  /**
   * Populate the missing Constructors.
   */
  const findMissingExtensions = (extension: ExtensionUnion) => {
    if (!extension.requiredExtensions) {
      return;
    }

    for (const Constructor of extension.requiredExtensions ?? []) {
      if (found.has(Constructor as AnyExtensionConstructor)) {
        continue;
      }

      missing.push({ Constructor: Constructor as AnyExtensionConstructor, extension });
    }
  };

  // Throw if any required extension missing.
  for (const extension of extensions) {
    findMissingExtensions(extension);
  }

  invariant(isEmptyArray(missing), {
    code: ErrorConstant.MISSING_REQUIRED_EXTENSION,
    message: missing
      .map(
        ({ Constructor, extension }) =>
          `The extension '${extension.name}' requires '${Constructor.name} in order to run correctly.`,
      )
      .join('\n'),
  });

  return {
    extensions: rawExtensions,
    extensionMap,
    presets,
    presetMap,
  };
}

/**
 * Takes in an object and removes all function values.
 *
 * @remarks
 *
 * This is useful for deep equality checks when functions need to be ignored.
 *
 * A current limitation is that it only dives one level deep. So objects with
 * nested object methods will retain those methods.
 *
 * @param object_ - an object which might contain methods
 *
 * @returns a new object without any of the functions defined
 */
export function ignoreFunctions(object_: Record<string, unknown>) {
  const newObject: Record<string, unknown> = object();
  for (const key of Object.keys(object_)) {
    if (isFunction(object_[key])) {
      continue;
    }
    newObject[key] = object_[key];
  }

  return newObject;
}

/**
 * Identifies the stage the extension manager is at.
 */
export enum ManagerPhase {
  None,

  /**
   * When the extension manager is being created and the onCreate methods are
   * being called.
   *
   * This happens within the EditorManager constructor.
   */
  Create,

  /**
   * When the extension manager is being initialized. This is when the
   * onInitialize methods are being called.
   */
  Initialize,

  /**
   * When the view is being added and all onViewAdded methods are being called.
   */
  AddView,

  /**
   * The phases of creating this manager are completed.
   */
  Done,
}
