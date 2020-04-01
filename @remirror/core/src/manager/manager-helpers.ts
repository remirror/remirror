import {
  DEFAULT_EXTENSION_PRIORITY,
  ErrorConstant,
  MarkGroup,
  NodeGroup,
  Tag,
} from '@remirror/core-constants';
import {
  bool,
  Cast,
  entries,
  invariant,
  isFunction,
  isUndefined,
  object,
  sort,
  uniqueBy,
} from '@remirror/core-helpers';
import {
  AnyFunction,
  CommandParameter,
  ExtensionCommandFunction,
  ManagerParameter,
} from '@remirror/core-types';

import {
  AnyExtension,
  ExtensionListParameter,
  GetConstructor,
  GetMarkNames,
  GetName,
  GetNodeNames,
  isExtension,
  isMarkExtension,
  isNodeExtension,
} from '../extension';
import { AnyPreset, isPreset } from '../preset';
import {
  ExtensionOrPreset,
  ExtensionTags,
  GeneralExtensionTags,
  MarkExtensionTags,
  NodeExtensionTags,
} from './manager-types';

/**
 * Converts an extension preset array to a list of extensions.
 */
export const extensionOrPresetToExtension = <ExtensionUnion extends AnyExtension = any>(
  presetOrExtension: ExtensionOrPreset<ExtensionUnion>,
): readonly ExtensionUnion[] => {
  return isExtension(presetOrExtension) ? [presetOrExtension] : presetOrExtension.extensions;
};

interface IsNameUniqueParams {
  /**
   * The name to check against
   */
  name: string;

  /**
   * The set to check within
   */
  set: Set<string>;

  /**
   * Whether to throw when not unique
   *
   * @defaultValue `false`
   */
  shouldThrow?: boolean;

  /**
   * The type of the unique check
   *
   * @defaultValue 'extension'
   */
  type?: string;
}

/**
 * Checks whether a given string is unique to the set. Add the name if it doesn't already exist, or
 * throw an error when `shouldThrow` is true.
 *
 * @param params - destructured params
 */
const isNameUnique = ({
  name,
  set,
  shouldThrow = false,
  type = 'extension',
}: IsNameUniqueParams) => {
  if (set.has(name)) {
    const message = `There is a naming conflict for the name: ${name} used in this type: ${type}. Please rename to avoid runtime errors.`;
    if (shouldThrow) {
      throw new Error(message);
    } else {
      console.error(message);
    }
  } else {
    set.add(name);
  }
};

interface CreateCommandsParams extends ExtensionListParameter {
  /**
   * The command params which are passed to each extensions `commands` method.
   */
  params: CommandParameter;
}

/**
 * Get the params to which will be passed into the extension method call.
 *
 * @param extension - the extension to test.
 * @param params - the params without the type.
 */
const getParametersType = <GKey extends keyof AnyExtension, GParams extends ManagerParameter>(
  extension: Required<Pick<AnyExtension, GKey>>,
  parameters: GParams,
) => {
  if (isMarkExtension(extension)) {
    return { type: parameters.schema.marks[extension.name] };
  }

  if (isNodeExtension(extension)) {
    return { type: parameters.schema.nodes[extension.name] };
  }

  return object();
};

/**
 * Checks to see if an optional property exists on an extension.
 *
 * @remarks
 *
 * This is used by the extension manager to build the:
 * - plugins
 * - keys
 * - styles
 * - inputRules
 * - pasteRules
 *
 * @param property - the extension property / method name
 */
export const hasExtensionProperty = <
  ExtensionUnion extends object,
  ExtensionProperty extends keyof ExtensionUnion
>(
  property: ExtensionProperty,
) => (
  extension: ExtensionUnion,
): extension is ExtensionUnion extends undefined
  ? never
  : ExtensionUnion & Pick<Required<ExtensionUnion>, ExtensionProperty> => bool(extension[property]);

/**
 * Generate all the action commands for usage within the UI.
 *
 * Typically actions are used to create interactive menus. For example a menu can use a command to
 * toggle bold formatting or to undo the last action.
 */
export const createCommands = ({ extensions, params }: CreateCommandsParams) => {
  const getItemParameters = (extension: Required<Pick<AnyExtension, 'commands'>>) =>
    extension.commands({
      ...params,
      ...getParametersType(extension, params),
    });

  const { view, getState } = params;

  const methodFactory = (method: ExtensionCommandFunction) => (...arguments_: unknown[]) => {
    view.focus();
    return method(...arguments_)(getState(), view.dispatch, view);
  };
  const items: Record<
    string,
    { command: AnyFunction; isEnabled: AnyFunction; name: string }
  > = Object.create(null);
  const names = new Set<string>();

  extensions.filter(hasExtensionProperty('commands')).forEach((currentExtension) => {
    const item = getItemParameters(currentExtension);

    entries(item).forEach(([name, command]) => {
      isNameUnique({ name, set: names, shouldThrow: true });

      items[name] = {
        name: currentExtension.name,
        command: methodFactory(command),
        isEnabled: (...arguments_: unknown[]): boolean => {
          return !!command(...arguments_)(getState(), undefined, view);
        },
      };
    });
  });

  return items;
};
interface CreateHelpersParams extends ExtensionListParameter {
  /**
   * The params which are passed to each extensions `helpers` method.
   */
  params: ManagerParameter;
}

/**
 * Generate all the helpers from the extension list.
 *
 * Helpers are functions which enable extensions to provide useful information or transformations to
 * their consumers and other extensions.
 */
export const createHelpers = ({ extensions, params }: CreateHelpersParams) => {
  const getItemParameters = (extension: Required<Pick<AnyExtension, 'helpers'>>) =>
    extension.helpers({
      ...params,
      ...getParametersType(extension, params),
    });

  const items: Record<string, AnyFunction> = object();
  const names = new Set<string>();

  extensions.filter(hasExtensionProperty('helpers')).forEach((currentExtension) => {
    const item = getItemParameters(currentExtension);

    Object.entries(item).forEach(([name, helper]) => {
      isNameUnique({ name, set: names, shouldThrow: true });

      items[name] = helper;
    });
  });

  return items;
};

/**
 * Keys for the methods available on an extension (useful for filtering)
 */
type ExtensionMethodProperties =
  | 'inputRules'
  | 'pasteRules'
  | 'keys'
  | 'plugin'
  | 'styles'
  | 'nodeView'
  | 'extensionData'
  | 'suggestions'
  | 'isActive';

/**
 * Looks at the passed property and calls the extension with the required parameters.
 *
 * @param property - the extension method to map
 * @param params - the params the method will be called with
 */
export const extensionPropertyMapper = <
  GExt extends AnyExtension,
  GExtMethodProp extends ExtensionMethodProperties
>(
  property: GExtMethodProp,
  parameters: ManagerParameter,
) => (
  extension: GExt,
): GExt[GExtMethodProp] extends AnyFunction ? ReturnType<GExt[GExtMethodProp]> : {} => {
  const extensionMethod = extension[property];
  if (!extensionMethod) {
    throw new Error('Invalid extension passed into the extension manager');
  }

  const getFn = () => {
    if (isNodeExtension(extension)) {
      return extensionMethod.bind(extension)({
        ...parameters,
        type: Cast(parameters.schema.nodes[extension.name]),
      });
    }
    if (isMarkExtension(extension)) {
      return extensionMethod.bind(extension)({
        ...parameters,
        type: Cast(parameters.schema.marks[extension.name]),
      });
    }
    return extensionMethod.bind(extension)(Cast(parameters));
  };

  return Cast(getFn());
};

export interface TransformExtensionOrPreset<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
> {
  extensions: ExtensionUnion[];
  extensionMap: Map<GetConstructor<ExtensionUnion>, ExtensionUnion>;
  presets: PresetUnion[];
  presetMap: Map<GetConstructor<PresetUnion>, PresetUnion>;
}

/**
 * Transforms the unsorted array of presets and extension into presets and
 * sorted extensions. Handles uniqueness of extensions and automatically pulling
 * in required extensions.
 *
 * TODO Add a check for requiredExtensions and inject them automatically
 *
 * @param unionValues - the extensions to transform as well as their priorities
 * @returns the list of extension instances sorted by priority
 */
export const transformExtensionOrPreset = <
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
>(
  unionValues: Array<ExtensionUnion | PresetUnion>,
): TransformExtensionOrPreset<ExtensionUnion, PresetUnion> => {
  const presets = [] as PresetUnion[];
  const extensionMap = new Map<GetConstructor<ExtensionUnion>, ExtensionUnion>();
  const presetMap = new Map<GetConstructor<PresetUnion>, PresetUnion>();

  let extensions = [] as ExtensionUnion[];

  for (const presetOrExtension of unionValues) {
    // Update the extension list in this block
    if (isExtension(presetOrExtension)) {
      extensions.push(presetOrExtension);
      extensionMap.set(presetOrExtension.constructor, presetOrExtension);

      continue;
    }

    // Update the presets list in this block
    if (isPreset(presetOrExtension)) {
      presets.push(presetOrExtension);
      extensions.push(...presetOrExtension.extensions);
      presetMap.set(presetOrExtension.constructor, presetOrExtension);

      continue;
    }

    // This is only reached if the passed value is invalid.
    invariant(false, { code: ErrorConstant.INVALID_MANAGER_ARGUMENTS });
  }

  // Sort the extensions.
  extensions = sort(
    uniqueBy(extensions, (extension) => extension.name),
    (a, b) => a.priority - b.priority,
  );

  // Pull in all required extensions.

  return {
    extensions,
    extensionMap,
    presets,
    presetMap,
  };
};

/**
 * Takes in an object and removes all function values.
 *
 * @remarks
 * This is useful for deep equality checks when functions need to be ignored.
 *
 * A current limitation is that it only dives one level deep. So objects with nested object methods
 * will retain those methods.
 *
 * @param obj - an object which might contain methods
 * @returns a new object without any of the functions defined
 */
export const ignoreFunctions = (object_: Record<string, unknown>) => {
  const newObject: Record<string, unknown> = object();
  for (const key of Object.keys(object_)) {
    if (isFunction(object_[key])) {
      continue;
    }
    newObject[key] = object_[key];
  }

  return newObject;
};

/**
 * By default isActive should return false when no method specified.
 */
export const defaultIsActive = () => false;

/**
 * By default isEnabled should return true to let the code know that the commands are available.
 */
export const defaultIsEnabled = () => true;

/**
 * Create the extension tags which are passed into each extensions method to enable dynamically
 * generated rules and commands.
 */
export const createExtensionTags = <ExtensionUnion extends AnyExtension>(
  extensions: readonly ExtensionUnion[],
): ExtensionTags<ExtensionUnion> => {
  type MarkNames = GetMarkNames<ExtensionUnion>;
  type NodeNames = GetNodeNames<ExtensionUnion>;
  type AllNames = GetName<ExtensionUnion>;

  const general: GeneralExtensionTags<AllNames> = {
    [Tag.FormattingMark]: [],
    [Tag.FormattingNode]: [],
    [Tag.LastNodeCompatible]: [],
    [Tag.NodeCursor]: [],
  };

  const mark: MarkExtensionTags<MarkNames> = {
    [MarkGroup.Alignment]: [],
    [MarkGroup.Behavior]: [],
    [MarkGroup.Color]: [],
    [MarkGroup.FontStyle]: [],
    [MarkGroup.Indentation]: [],
    [MarkGroup.Link]: [],
    [MarkGroup.Code]: [],
  };

  const node: NodeExtensionTags<NodeNames> = {
    [NodeGroup.Block]: [],
    [NodeGroup.Inline]: [],
  };

  for (const extension of extensions) {
    if (isNodeExtension(extension)) {
      const group = extension.schema.group as NodeGroup;

      node[group] = isUndefined(node[group]) ? [extension.name] : [...node[group], extension.name];
    }

    if (isMarkExtension(extension)) {
      const group = extension.schema.group as MarkGroup;

      mark[group] = isUndefined(mark[group]) ? [extension.name] : [...mark[group], extension.name];
    }

    for (const tag of extension.tags as Tag[]) {
      general[tag] = isUndefined(general[tag])
        ? [extension.name]
        : [...general[tag], extension.name];
    }
  }

  return {
    general,
    mark,
    node,
  };
};
