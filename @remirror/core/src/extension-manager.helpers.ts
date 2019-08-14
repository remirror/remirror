import { DEFAULT_EXTENSION_PRIORITY, MarkGroup, NodeGroup, Tags } from '@remirror/core-constants';
import { bool, Cast, isFunction, sort } from '@remirror/core-helpers';
import {
  AnyFunction,
  Attrs,
  CommandParams,
  ExtensionManagerParams,
  ExtensionTags,
  GeneralExtensionTags,
  Key,
  MarkExtensionTags,
  NodeExtensionTags,
} from '@remirror/core-types';
import { isExtension, isMarkExtension, isNodeExtension } from './extension-helpers';
import {
  AnyExtension,
  ExtensionListParams,
  FlexibleExtension,
  PrioritizedExtension,
} from './extension-types';

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
   * @defaultValue false
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
 * Checks whether a given string is unique to the set. Add the name if it
 * doesn't already exist, or throw an error when `shouldThrow` is true.
 *
 * @param params - destructured params
 */
const isNameUnique = ({ name, set, shouldThrow = false, type = 'extension' }: IsNameUniqueParams) => {
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

interface CreateCommandsParams extends ExtensionListParams {
  /**
   * The command params which are passed to each extensions `commands` method.
   */
  params: CommandParams;
}

/**
 * Generate all the action commands for usage within the UI.
 *
 * Typically actions are used to create interactive menus. For example a menu
 * can use a command to toggle bold formatting or to undo the last action.
 */
export const createCommands = ({ extensions, params }: CreateCommandsParams) => {
  const getItemParams = (extension: Required<Pick<AnyExtension, 'commands'>>) =>
    extension.commands({
      ...params,
      ...(isMarkExtension(extension)
        ? { type: params.schema.marks[extension.name] }
        : isNodeExtension(extension)
        ? { type: params.schema.nodes[extension.name] }
        : ({} as any)),
    });

  const methodFactory = (method: any) => (attrs?: Attrs) => {
    const { view, getState } = params;
    view.focus();
    return method(attrs)(getState(), view.dispatch, view);
  };
  const items: Record<string, { command: AnyFunction; name: string }> = {};
  const names = new Set<string>();

  extensions.filter(hasExtensionProperty('commands')).forEach(currentExtension => {
    const item = getItemParams(currentExtension);

    Object.entries(item).forEach(([name, command]) => {
      isNameUnique({ name, set: names, shouldThrow: true });

      items[name] = { command: methodFactory(command), name: currentExtension.name };
    });
  });

  return items;
};
interface CreateHelpersParams extends ExtensionListParams {
  /**
   * The params which are passed to each extensions `helpers` method.
   */
  params: ExtensionManagerParams;
}

/**
 * Generate all the helpers from the extension list.
 *
 * Helpers are functions which enable extensions to provide useful
 * information or transformations to their consumers and other extensions.
 */
export const createHelpers = ({ extensions, params }: CreateHelpersParams) => {
  const getItemParams = (extension: Required<Pick<AnyExtension, 'helpers'>>) =>
    extension.helpers({
      ...params,
      ...(isMarkExtension(extension)
        ? { type: params.schema.marks[extension.name] }
        : isNodeExtension(extension)
        ? { type: params.schema.nodes[extension.name] }
        : ({} as any)),
    });

  const items: Record<string, AnyFunction> = {};
  const names = new Set<string>();

  extensions.filter(hasExtensionProperty('helpers')).forEach(currentExtension => {
    const item = getItemParams(currentExtension);

    Object.entries(item).forEach(([name, helper]) => {
      isNameUnique({ name, set: names, shouldThrow: true });

      items[name] = helper;
    });
  });

  return items;
};

/**
 * Checks to see if an optional property exists on an extension.
 *
 * @remarks
 * This is used by the extension manager to build the:
 * - plugins
 * - keys
 * - styles
 * - inputRules
 * - pasteRules
 *
 * @param property - the extension property / method name
 */
export const hasExtensionProperty = <GExt extends {}, GKey extends Key<GExt>>(property: GKey) => (
  extension: GExt,
): extension is GExt extends undefined ? never : GExt & Pick<Required<GExt>, GKey> =>
  bool(extension[property]);

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
  | 'isActive'
  | 'isEnabled';

/**
 * Looks at the passed property and calls the extension with the required
 * parameters.
 *
 * @param property - the extension method to map
 * @param params - the params the method will be called with
 */
export const extensionPropertyMapper = <
  GExt extends AnyExtension,
  GExtMethodProp extends ExtensionMethodProperties
>(
  property: GExtMethodProp,
  params: ExtensionManagerParams,
) => (extension: GExt): GExt[GExtMethodProp] extends AnyFunction ? ReturnType<GExt[GExtMethodProp]> : {} => {
  const extensionMethod = extension[property];
  if (!extensionMethod) {
    throw new Error('Invalid extension passed into the extension manager');
  }

  return Cast(
    isNodeExtension(extension)
      ? extensionMethod.bind(extension)({
          ...params,
          type: Cast(params.schema.nodes[extension.name]),
        })
      : isMarkExtension(extension)
      ? extensionMethod.bind(extension)!({ ...params, type: Cast(params.schema.marks[extension.name]) })
      : extensionMethod.bind(extension)!(Cast(params)),
  );
};

/**
 * Converts an extension to its mapped value
 */
function convertToExtensionMapValue(extension: FlexibleExtension): PrioritizedExtension {
  return isExtension(extension) ? { priority: DEFAULT_EXTENSION_PRIORITY, extension } : { ...extension };
}

/**
 * Sorts and transforms extension map based on the provided priorities and
 * outputs just the extensions
 *
 * TODO Add a check for requiredExtensions and inject them automatically
 *
 * @param values - the extensions to transform as well as their priorities
 * @returns the list of extension instances sorted by priority
 */
export const transformExtensionMap = <GExtensions extends AnyExtension[]>(
  values: Array<FlexibleExtension<GExtensions[number]>>,
): GExtensions =>
  sort(values.map(convertToExtensionMapValue), (a, b) => a.priority - b.priority).map(
    ({ extension }) => extension,
  ) as any;

/**
 * Takes in an object and removes all function values.
 *
 * @remarks
 * This is useful for deep equality checks when functions need to be ignored.
 *
 * A current limitation is that it only dives one level deep. So objects with
 * nested object methods will retain those methods.
 *
 * @param obj - an object which might contain methods
 * @returns a new object without any of the functions defined
 */
export const ignoreFunctions = (obj: Record<string, unknown>) => {
  const newObject: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (isFunction(obj[key])) {
      continue;
    }
    newObject[key] = obj[key];
  }

  return newObject;
};

/**
 * By default isActive should return false when no method specified.
 */
export const defaultIsActive = () => false;

/**
 * By default isEnabled should return true to let the code know that the
 * commands are available.
 */
export const defaultIsEnabled = () => true;

/**
 * Create the extension tags which are passed into each extensions method to
 * enable dynamically generated rules and commands.
 */
export const createExtensionTags = <
  GNodes extends string = string,
  GMarks extends string = string,
  GPlain extends string = string,
  GNames extends string = GNodes | GMarks | GPlain
>(
  extensions: AnyExtension[],
): ExtensionTags<GNodes, GMarks, GPlain> => {
  const general: GeneralExtensionTags<GNames> = {
    [Tags.FormattingMark]: [],
    [Tags.FormattingNode]: [],
    [Tags.LastNodeCompatible]: [],
  };

  const mark: MarkExtensionTags<GMarks> = {
    [MarkGroup.Alignment]: [],
    [MarkGroup.Behavior]: [],
    [MarkGroup.Color]: [],
    [MarkGroup.FontStyle]: [],
    [MarkGroup.Indentation]: [],
    [MarkGroup.Link]: [],
    [MarkGroup.Code]: [],
  };

  const node: NodeExtensionTags<GNodes> = { [NodeGroup.Block]: [], [NodeGroup.Inline]: [] };

  for (const extension of extensions) {
    if (isNodeExtension(extension)) {
      const group = extension.schema.group as NodeGroup;
      node[group] = node[group] ? [...node[group], extension.name as GNodes] : [extension.name as GNodes];
    } else if (isMarkExtension(extension)) {
      const group = extension.schema.group as MarkGroup;
      mark[group] = mark[group] ? [...mark[group], extension.name as GMarks] : [extension.name as GMarks];
    }

    (extension.tags as Tags[]).forEach(tag => {
      general[tag] = general[tag] ? [...general[tag], extension.name as GNames] : [extension.name as GNames];
    });
  }

  return {
    general,
    mark,
    node,
  } as any;
};
