import warning from 'tiny-warning';
import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isEmptyArray, sort } from '@remirror/core-helpers';
import type { Dispose, EditorView } from '@remirror/core-types';

import {
  AnyExtension,
  AnyExtensionConstructor,
  GetExtensions,
  isExtension,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
} from '../extension';
import type { GetConstructor, StateUpdateLifecycleProps } from '../types';

/**
 * Transforms the unsorted array of presets and extension into presets and
 * sorted extensions. Handles uniqueness of extensions and automatically throws
 * an error when required extensions are missing.
 *
 * @internalremarks Currently matching by constructor - what if different
 * versions exist in the same app
 *
 * @param initialExtensions - the extensions to be transformed. This includes
 * the extension that are parents to other extensions.
 *
 * @returns the list of extension instances sorted by priority
 */
export function transformExtensions<RawExtensions extends AnyExtension>(
  initialExtensions: readonly RawExtensions[],
  settings: Remirror.ManagerSettings,
): ExtensionTransformation<RawExtensions> {
  type Extension = GetExtensions<RawExtensions>;
  type ExtensionConstructor = GetConstructor<Extension>;

  // This is the holder for the sorted and cleaned extensions returned by this
  // function.
  const extensions: Extension[] = [];
  const extensionMap = new WeakMap<ExtensionConstructor, Extension>();

  // All the extensions which provide child extensions.
  const parentExtensions: Extension[] = [];

  // Used to track duplicates and the extension holders they were added by.
  const duplicateMap = new WeakMap<AnyExtensionConstructor, Extension[]>();

  // The unsorted, de-duped, unrefined extensions.
  let gatheredExtensions: Extension[] = [];

  // The mutable objects and the manager settings which are used to gather all
  // the deeply nested extensions.
  const gatherRawExtensionConfig = { duplicateMap, parentExtensions, gatheredExtensions, settings };

  for (const extension of initialExtensions) {
    gatherRawExtensions(gatherRawExtensionConfig, { extension: extension as Extension });
  }

  // Sort the extensions.
  gatheredExtensions = sort(gatheredExtensions, (a, z) => z.priority - a.priority);

  // Keep track of added constructors for uniqueness.
  const found = new WeakSet<AnyExtensionConstructor>();
  const names = new Set<string>();

  // Remove extension duplicates and update the parent extension with the
  // highest priority identical extension.
  for (const extension of gatheredExtensions) {
    const key = extension.constructor;
    const name = extension.name;
    const duplicates = duplicateMap.get(key);

    invariant(duplicates, {
      message: `No entries were found for the ExtensionConstructor ${extension.name}`,
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
    duplicates.forEach((parent) => parent?.replaceChildExtension(key, extension));
  }

  const missing: Array<MissingConstructor<Extension>> = [];

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

  return { extensions, extensionMap };
}

interface GatherAllExtensionsConfig<Extension extends AnyExtension> {
  /** The list of gathered raw extensions, updated by mutation. */
  gatheredExtensions: Extension[];

  /** The duplicate map which is updated by mutation. */
  duplicateMap: WeakMap<AnyExtensionConstructor, Extension[]>;

  /** The parent extensions which are updated by mutation  */
  parentExtensions: Extension[];

  /** The settings passed into the manager. */
  settings: Remirror.ManagerSettings;
}

interface GatherAllExtensionsProps<Extension extends AnyExtension> {
  /** The extension to check and gather children from. */
  extension: Extension;

  /** Used to check if there there is a circular dependency encountered. */
  names?: string[];

  /** The parent of this extension. */
  parentExtension?: Extension;
}

/**
 * Dive into the current extension and gather all child extensions including
 * those which are deeply nested.
 *
 * It also automatically handles circular dependencies. And logs a warning when
 * one is encountered.
 *
 * @param config - the configuration and mutable objects which are updated by
 * this function.
 * @param props - the extension, gathered names and parent extension.
 */
function gatherRawExtensions<Extension extends AnyExtension>(
  config: GatherAllExtensionsConfig<Extension>,
  props: GatherAllExtensionsProps<Extension>,
) {
  const { gatheredExtensions, duplicateMap, parentExtensions, settings } = config;
  const { extension, parentExtension } = props;

  // Get the list of parent names of the current extension. This is used to
  // track circular dependencies.
  let { names = [] } = props;

  invariant(isExtension(extension), {
    code: ErrorConstant.INVALID_MANAGER_EXTENSION,
    message: `An invalid extension: ${extension} was provided to the [[\`RemirrorManager\`]].`,
  });

  // The children provided by this extension.
  const childExtensions = extension.extensions;

  // Override the priority if the user has done so in the settings passed to the
  // [[`RemirrorManager`]].
  extension.setPriority(settings.priority?.[extension.name]);

  // Update the gathered extension list in this block
  gatheredExtensions.push(extension);

  // Keep track of the extensions which have been added multiple times by
  // separate extension parents. Later on, the highest priority extension will
  // be added to each parent instead of the one that they may have been
  // configured with.
  updateExtensionDuplicates({ duplicateMap, extension, parentExtension });

  // Check if there are any children extensions to be added an if not move onto
  // the next provided extension.
  if (childExtensions.length === 0) {
    return;
  }

  if (names.includes(extension.name)) {
    warning(
      false,
      `Circular dependency encountered when loading extensions: ${names.join(' > ')} > ${
        extension.name
      }`,
    );
    return;
  }

  names = [...names, extension.name];
  parentExtensions.push(extension);

  for (const child of childExtensions) {
    // Recursively gather all the children extension from the current extension
    // level.
    gatherRawExtensions(config, { names, extension: child, parentExtension: extension });
  }
}

interface FindMissingProps<Extension extends AnyExtension> {
  extension: Extension;
  found: WeakSet<AnyExtensionConstructor>;
  missing: Array<MissingConstructor<Extension>>;
}

/**
 * Populate missing Constructors.
 *
 * If any missing extensions are identified then it is the responsibility of the
 * calling method to deal with the error. Currently the action is to `throw` an
 * error.
 */
function findMissingExtensions<Extension extends AnyExtension>(props: FindMissingProps<Extension>) {
  const { extension, found, missing } = props;

  if (!extension.requiredExtensions) {
    return;
  }

  for (const Constructor of extension.requiredExtensions ?? []) {
    if (found.has(Constructor)) {
      continue;
    }

    missing.push({ Constructor: Constructor, extension });
  }
}

interface UpdateExtensionDuplicatesProps<Extension extends AnyExtension> {
  /**
   * The map of all duplicates.
   */
  duplicateMap: WeakMap<AnyExtensionConstructor, Extension[]>;

  /**
   * The extension to associate to the multiple presets that have added it..
   */
  extension: Extension;

  /**
   * The preset which was responsible for adding the extension (if it exists).
   */
  parentExtension?: Extension;
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
function updateExtensionDuplicates<Extension extends AnyExtension>(
  props: UpdateExtensionDuplicatesProps<Extension>,
) {
  const { duplicateMap, extension, parentExtension } = props;

  // The extension constructor is used as the identifier for lookups.
  const key = extension.constructor;

  const duplicate = duplicateMap.get(key);
  const parentToAdd: Extension[] = parentExtension ? [parentExtension] : [];

  duplicateMap.set(key, duplicate ? [...duplicate, ...parentToAdd] : parentToAdd);
}

/**
 * This is the object shape that is returned from the combined transformation.
 */
export interface ExtensionTransformation<
  Extension extends AnyExtension,
  Expanded extends AnyExtension = GetExtensions<Extension>,
> {
  /**
   * The list of extensions sorted by priority and original extension. Every
   * extension passed in and those contained by presets are placed here.
   */
  extensions: Expanded[];

  /**
   * A map where the key is the [[`ExtensionConstructor`]] and the value is the
   * [[`Extension`]] instance. This is used to lookup extensions contained
   * within a manager. It is a weak map so that values can be garbage collected
   * when references to the constructor are lost.
   */
  extensionMap: WeakMap<GetConstructor<Expanded>, Expanded>;
}

interface MissingConstructor<Extension extends AnyExtension> {
  Constructor: AnyExtensionConstructor;
  extension: Extension;
}

export interface ManagerLifecycleHandlers {
  /**
   * Contains the methods run when the manager is first created.
   */
  create: Array<() => Dispose | void>;

  /**
   * Holds the methods to run once the Editor has received the view from the
   * attached.
   */
  view: Array<(view: EditorView) => Dispose | void>;

  /**
   * The update method is called every time the state updates. This allows
   * extensions to listen to updates.
   */
  update: Array<(props: StateUpdateLifecycleProps) => void>;

  /**
   * Called when the manager is being destroyed.
   */
  destroy: Array<() => void>;
}

interface SetupExtensionProps {
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
export function extractLifecycleMethods(props: SetupExtensionProps): void {
  const { extension, nodeNames, markNames, plainNames, store, handlers } = props;

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

  if (isMarkExtension(extension)) {
    markNames.push(extension.name);
  }

  // Don't include the `doc` as a node since it is a requirement for all editors
  // and doesn't behave in the same way as other nodes.
  if (isNodeExtension(extension) && extension.name !== 'doc') {
    nodeNames.push(extension.name);
  }

  if (isPlainExtension(extension)) {
    plainNames.push(extension.name);
  }
}
