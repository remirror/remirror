import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isEmptyArray, isFunction, object, sort } from '@remirror/core-helpers';

import { AnyExtension, isExtension, isMarkExtension, isNodeExtension } from '../extension';
import { AnyPreset, isPreset } from '../preset';
import { GetConstructor, ManagerMethodParameter } from '../types';

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
   * The type of the unique check
   *
   * @defaultValue 'extension'
   */
  type?: string;
}

/**
 * Checks whether a given string is unique to the set. Add the name if it
 * doesn't already exist, or throw an error when `shouldThrow` is true.
 *
 * @param parameter - destructured params
 */
export function throwIfNameNotUnique(parameter: IsNameUniqueParameter) {
  const { name, set, type = 'extension' } = parameter;

  invariant(!set.has(name), {
    message: `There is a naming conflict for the name: ${name} used in this type: ${type}. Please rename to avoid runtime errors.`,
  });

  set.add(name);
}

/**
 * Get the params to which will be passed into the extension method call.
 *
 * @param extension - the extension to test.
 * @param params - the params without the type.
 */
export function getParameterWithType<
  ExtensionUnion extends AnyExtension,
  Parameter extends ManagerMethodParameter
>(extension: ExtensionUnion, parameter: Parameter) {
  if (isMarkExtension(extension)) {
    return { ...parameter, type: parameter.schema().marks[extension.name] };
  }

  if (isNodeExtension(extension)) {
    return { ...parameter, type: parameter.schema().nodes[extension.name] };
  }

  return parameter as any;
}

// /**
//  * Generate all the helpers from the extension list.
//  *
//  * Helpers are functions which enable extensions to provide useful information
//  * or transformations to their consumers and other extensions.
//  */
// const createHelpers = ({ extensions, params }: CreateHelpersParameter) => {
//   const getItemParameters = (extension: Required<Pick<AnyExtension, 'helpers'>>) =>
//     extension.helpers({
//       ...params,
//       ...getParameterWithType(extension, params),
//     });

//   const items: Record<string, AnyFunction> = object();
//   const names = new Set<string>();

//   extensions.filter(hasExtensionProperty('helpers')).forEach((currentExtension) => {
//     const item = getItemParameters(currentExtension);

//     Object.entries(item).forEach(([name, helper]) => {
//       isNameUnique({ name, set: names, shouldThrow: true });

//       items[name] = helper;
//     });
//   });

//   return items;
// };

export interface TransformExtensionOrPreset<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
> {
  extensions: ExtensionUnion[];
  extensionMap: WeakMap<GetConstructor<ExtensionUnion>, ExtensionUnion>;
  presets: PresetUnion[];
  presetMap: WeakMap<GetConstructor<PresetUnion>, PresetUnion>;
}

/**
 * Transforms the unsorted array of presets and extension into presets and
 * sorted extensions. Handles uniqueness of extensions and automatically pulling
 * in required extensions.
 *
 * TODO Add a check for requiredExtensions and inject them automatically
 * TODO Currently matching by constructor - what if different versions exist in
 * the same app...
 *
 * @param unionValues - the extensions to transform as well as their priorities
 *
 * @returns the list of extension instances sorted by priority
 */
export function transformExtensionOrPreset<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
>(
  unionValues: Array<ExtensionUnion | PresetUnion>,
): TransformExtensionOrPreset<ExtensionUnion, PresetUnion> {
  type ExtensionConstructor = GetConstructor<ExtensionUnion>;
  type PresetConstructor = GetConstructor<PresetUnion>;
  interface MissingConstructor {
    Constructor: ExtensionConstructor;
    extension: ExtensionUnion;
  }

  // The items to return.
  const presets = [] as PresetUnion[];
  const extensionMap = new WeakMap<ExtensionConstructor, ExtensionUnion>();
  const presetMap = new WeakMap<PresetConstructor, PresetUnion>();
  const extensions = [] as ExtensionUnion[];

  // Used to check track duplicates and the presets they've been added by.
  const duplicateMap = new WeakMap<ExtensionConstructor, Array<PresetUnion | undefined>>();

  // The extensions
  let rawExtensions = [] as ExtensionUnion[];

  /**
   * Adds the values to the duplicate map for checking duplicates.
   */
  const updateDuplicateMap = (extension: ExtensionUnion, preset?: PresetUnion) => {
    const key = extension.constructor;
    const duplicate = duplicateMap.get(key);
    duplicateMap.set(key, duplicate ? [...duplicate, preset] : [preset]);
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
      rawExtensions.push(...presetOrExtension.extensions);
      presetMap.set(presetOrExtension.constructor, presetOrExtension);

      presetOrExtension.extensions.forEach((extension) =>
        updateDuplicateMap(extension, presetOrExtension),
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
  const found = new WeakSet<ExtensionConstructor>();

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
    for (const Constructor of extension.requiredExtensions) {
      if (found.has(Constructor)) {
        continue;
      }

      missing.push({ Constructor, extension });
    }
    extension.requiredExtensions.every((Constructor) => found.has(Constructor));
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
          `The extension '${extension.name}' requires '${Constructor.extensionName} in order to run correctly.`,
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
   * When the extension manager is being created.
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
