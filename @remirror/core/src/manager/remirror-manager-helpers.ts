import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isEmptyArray, sort } from '@remirror/core-helpers';

import { AnyExtensionConstructor, isExtension } from '../extension';
import {
  AnyCombinedUnion,
  InferCombinedExtensions,
  InferCombinedPresets,
  isPreset,
} from '../preset';
import { GetConstructor } from '../types';

export interface TransformExtensionOrPreset<Combined extends AnyCombinedUnion> {
  extensions: Array<InferCombinedExtensions<Combined>>;
  extensionMap: WeakMap<
    GetConstructor<InferCombinedExtensions<Combined>>,
    InferCombinedExtensions<Combined>
  >;
  presets: Array<InferCombinedPresets<Combined>>;
  presetMap: WeakMap<
    GetConstructor<InferCombinedPresets<Combined>>,
    InferCombinedPresets<Combined>
  >;
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
export function transformCombinedUnion<Combined extends AnyCombinedUnion>(
  unionValues: readonly Combined[],
): TransformExtensionOrPreset<Combined> {
  type ExtensionUnion = InferCombinedExtensions<Combined>;
  type ExtensionConstructor = GetConstructor<ExtensionUnion>;
  type PresetUnion = InferCombinedPresets<Combined>;
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
  const updateExtensionDuplicates = (extension: ExtensionUnion, preset?: PresetUnion) => {
    const key = extension.constructor;
    const duplicate = duplicateMap.get(key);
    duplicateMap.set(key as never, duplicate ? [...duplicate, preset] : [preset]);
  };

  for (const presetOrExtension of unionValues) {
    // Update the extension list in this block
    if (isExtension<ExtensionUnion>(presetOrExtension)) {
      rawExtensions.push(presetOrExtension);
      updateExtensionDuplicates(presetOrExtension);

      continue;
    }

    // Update the presets list in this block
    if (isPreset<PresetUnion>(presetOrExtension)) {
      presets.push(presetOrExtension);
      presetMap.set(presetOrExtension.constructor, presetOrExtension);

      for (const extension of presetOrExtension.extensions) {
        updateExtensionDuplicates(extension as ExtensionUnion, presetOrExtension);
        rawExtensions.push(extension as ExtensionUnion);
      }

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
  const names = new Set<string>();

  // Remove extension duplicates and update the preset with the non duplicated
  // value.
  for (const extension of rawExtensions) {
    const key = extension.constructor;
    const name = extension.name;
    const duplicates = duplicateMap.get(key);

    invariant(duplicates, {
      message: `No entries where found for the ExtensionConstructor ${extension.name}`,
      code: ErrorConstant.INTERNAL,
    });

    if (found.has(key) || names.has(name)) {
      continue;
    }

    found.add(key);
    names.add(name);
    extensions.push(extension);
    extensionMap.set(key, extension);

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
    extensions,
    extensionMap,
    presets,
    presetMap,
  };
}
