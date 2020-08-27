import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isEmptyArray, sort } from '@remirror/core-helpers';
import type { EditorView } from '@remirror/core-types';

import {
  AnyExtension,
  AnyExtensionConstructor,
  isExtension,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
} from '../extension';
import {
  AnyCombinedUnion,
  AnyPreset,
  InferCombinedExtensions,
  InferCombinedPresets,
  isPreset,
} from '../preset';
import type { GetConstructor, StateUpdateLifecycleParameter } from '../types';

/**
 * Transforms the unsorted array of presets and extension into presets and
 * sorted extensions. Handles uniqueness of extensions and automatically throws
 * an error when required extensions are missing.
 *
 * @internalremarks Currently matching by constructor - what if different
 * versions exist in the same app
 *
 * @param unionValues - the extensions to transform as well as their priorities
 *
 * @returns the list of extension instances sorted by priority
 */
export function transformCombinedUnion<Combined extends AnyCombinedUnion>(
  unionValues: readonly Combined[],
  settings: Remirror.ManagerSettings,
): CombinedTransformation<Combined> {
  type ExtensionUnion = InferCombinedExtensions<Combined>;
  type ExtensionConstructor = GetConstructor<ExtensionUnion>;
  type PresetUnion = InferCombinedPresets<Combined>;
  type PresetConstructor = GetConstructor<PresetUnion>;

  // The items to return.
  const presets: PresetUnion[] = [];
  const presetMap = new WeakMap<PresetConstructor, PresetUnion>();
  const extensions: ExtensionUnion[] = [];
  const extensionMap = new WeakMap<ExtensionConstructor, ExtensionUnion>();

  // Used to track duplicates and the presets they've been added by.
  const duplicateMap = new WeakMap<AnyExtensionConstructor, PresetUnion[]>();

  // The unsorted, de-duped, unrefined extensions.
  let rawExtensions: ExtensionUnion[] = [];

  for (const presetOrExtension of unionValues) {
    // Update the extension list in this block
    if (isExtension<ExtensionUnion>(presetOrExtension)) {
      presetOrExtension.setPriority(settings.priority?.[presetOrExtension.name]);
      rawExtensions.push(presetOrExtension);

      // Keep track of the extension which have been added multiple times by
      // separate presets. Later on, the highest priority extension will be
      // added to each preset instead of the one that they configured.
      updateExtensionDuplicates({ duplicateMap, extension: presetOrExtension });

      continue;
    }

    // Update the presets list in this block
    if (isPreset<PresetUnion>(presetOrExtension)) {
      presets.push(presetOrExtension);
      presetMap.set(presetOrExtension.constructor, presetOrExtension);

      for (const extension of presetOrExtension.extensions) {
        extension.setPriority(settings.priority?.[extension.name]);

        // Similar to the comment in the previous block. Add the preset to the
        // map for identifying extensions which are added by multiple presets.
        // Later the highest priority extension is shared amongst all presets
        // that require it to prevent instance of the same extension which would
        // break the editor.
        updateExtensionDuplicates({
          duplicateMap,
          extension: extension as ExtensionUnion,
          preset: presetOrExtension,
        });
        rawExtensions.push(extension as ExtensionUnion);
      }

      continue;
    }

    // TODO: Allow constructors to be auto instantiated.

    // This is only reached if the passed value is invalid.
    invariant(false, { code: ErrorConstant.INVALID_MANAGER_ARGUMENTS });
  }

  // Sort the extensions.
  rawExtensions = sort(rawExtensions, (a, b) => b.priority - a.priority);

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

  const missing: Array<MissingConstructor<ExtensionUnion>> = [];

  // Throw if any required extensions are missing.
  for (const extension of extensions) {
    findMissingExtensions({ extension, found, missing });
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

interface FindMissingParameter<ExtensionUnion extends AnyExtension> {
  extension: ExtensionUnion;
  found: WeakSet<AnyExtensionConstructor>;
  missing: Array<MissingConstructor<ExtensionUnion>>;
}

/**
 * Populate missing Constructors.
 *
 * If any missing extensions are identified then it is the responsibility of the
 * calling method to deal with the error. Currently the action is to `throw` an
 * error.
 */
function findMissingExtensions<ExtensionUnion extends AnyExtension>(
  parameter: FindMissingParameter<ExtensionUnion>,
) {
  const { extension, found, missing } = parameter;

  if (!extension.requiredExtensions) {
    return;
  }

  for (const Constructor of extension.requiredExtensions ?? []) {
    if (found.has(Constructor as AnyExtensionConstructor)) {
      continue;
    }

    missing.push({ Constructor: Constructor as AnyExtensionConstructor, extension });
  }
}

interface UpdateExtensionDuplicatesParameter<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
> {
  /**
   * The map of all duplicates.
   */
  duplicateMap: WeakMap<AnyExtensionConstructor, PresetUnion[]>;

  /**
   * The extension to associate to the multiple presets that have added it..
   */
  extension: ExtensionUnion;

  /**
   * The preset which was responsible for adding the extension (if it exists).
   */
  preset?: PresetUnion;
}

/**
 * Adds the values to the duplicate map which identifies each unique extension
 * in the manager and tracks the presets responsible for adding them. This is
 * used to make sure that only one instance of each extension is shared amongst
 * the presets which require it.
 *
 * At the moment, the highest priority extension is the one that is to all
 * presets which require it. This is done by checking the `duplicateMap` for
 * each extension, and replacing the instance of the required extension within
 * the preset with the highest priority instance.
 */
function updateExtensionDuplicates<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: UpdateExtensionDuplicatesParameter<ExtensionUnion, PresetUnion>) {
  const { duplicateMap, extension, preset } = parameter;

  // The extension constructor is used as the identifier for lookups.
  const key = extension.constructor;

  const duplicate = duplicateMap.get(key);
  const presetToAdd: PresetUnion[] = preset ? [preset] : [];

  duplicateMap.set(key, duplicate ? [...duplicate, ...presetToAdd] : presetToAdd);
}

/**
 * This is the object shape that is returned from the combined transformation.
 */
export interface CombinedTransformation<Combined extends AnyCombinedUnion> {
  /**
   * The list of extensions sorted by priority and original extension. Every
   * extension passed in and those contained by presets are placed here.
   */
  extensions: Array<InferCombinedExtensions<Combined>>;

  /**
   * A map where the key is the [[`ExtensionConstructor`]] and the value is the
   * [[`Extension`]] instance. This is used to lookup extensions contained
   * within a manager. It is a weak map so that values can be garbage collected
   * when references to the constructor are lost.
   */
  extensionMap: WeakMap<
    GetConstructor<InferCombinedExtensions<Combined>>,
    InferCombinedExtensions<Combined>
  >;

  /**
   * The list of presets within the extension.
   */
  presets: Array<InferCombinedPresets<Combined>>;

  /**
   * A map where the key is the [[`PresetConstructor`]] and the value is the
   * [[`Preset`]] instance. This is used to lookup presets contained within a
   * manager. It is a weak map so that values can be garbage collected when
   * references to the constructor are lost.
   */
  presetMap: WeakMap<
    GetConstructor<InferCombinedPresets<Combined>>,
    InferCombinedPresets<Combined>
  >;
}

interface MissingConstructor<ExtensionUnion extends AnyExtension> {
  Constructor: AnyExtensionConstructor;
  extension: ExtensionUnion;
}

export interface ManagerLifecycleHandlers {
  /**
   * Contains the methods run when the manager is first created.
   */
  create: Array<() => void>;

  /**
   * Holds the methods to run once the Editor has received the view from the attached.
   */
  view: Array<(view: EditorView) => void>;

  /**
   * The update method is called every time the state updates. This allows
   * extensions to listen to updates.
   */
  update: Array<(param: StateUpdateLifecycleParameter) => void>;

  /**
   * Called when the manager is being destroyed.
   */
  destroy: Array<() => void>;
}

interface SetupExtensionParameter {
  extension: AnyExtension;
  nodeNames: string[];
  markNames: string[];
  plainNames: string[];
  store: Remirror.ExtensionStore;
  handlers: ManagerLifecycleHandlers;
}

/**
 * This helper function extracts all the lifecycle methods from the provided
 * extension and adds them to the provided `handler` container.
 */
export function extractLifecycleMethods(parameter: SetupExtensionParameter): void {
  const { extension, nodeNames, markNames, plainNames, store, handlers } = parameter;

  // Add the store to the extension. The store is used by extensions to access
  // all the data included in `Remirror.ExtensionStore`. I decided on this
  // pattern because passing around parameters into each call method was
  // tedious. Why not just access `this.store` within your extension to get
  // whatever you need? Also using the store allows developers to extend the
  // behaviour of their editor by adding different behaviour to the global
  // namespace [[`Remirror.ExtensionStore`]].
  extension.setStore(store);

  // Gather all the handlers and add them where they exist.

  const createHandler = extension.onCreate?.bind(extension);
  const viewHandler = extension.onView?.bind(extension);
  const stateUpdateHandler = extension.onStateUpdate?.bind(extension);
  const destroyHandler = extension.onDestroy?.bind(extension);

  if (createHandler) {
    handlers.create.push(createHandler);
  }

  if (viewHandler) {
    handlers.view.push(viewHandler);
  }

  if (stateUpdateHandler) {
    handlers.update.push(stateUpdateHandler);
  }

  if (destroyHandler) {
    handlers.destroy.push(destroyHandler);
  }

  // Keep track of the names of the different types of extension held by this
  // manager. This is already in use by the [[`TagsExtension`]].

  if (isNodeExtension(extension)) {
    nodeNames.push(extension.name);
  }

  if (isMarkExtension(extension)) {
    markNames.push(extension.name);
  }

  if (isPlainExtension(extension)) {
    plainNames.push(extension.name);
  }
}
