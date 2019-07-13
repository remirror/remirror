import { DEFAULT_EXTENSION_PRIORITY } from './constants';
import {
  AnyExtension,
  ExtensionListParams,
  FlexibleExtension,
  isExtension,
  PrioritizedExtension,
} from './extension';
import { bool, Cast, isFunction } from './helpers/base';
import { isMarkExtension } from './mark-extension';
import { isNodeExtension } from './node-extension';
import {
  AnyFunction,
  Attrs,
  CommandParams,
  ExtensionCommandFunction,
  ExtensionManagerParams,
  FlexibleConfig,
} from './types';

type MethodFactory<GMappedFunc extends AnyFunction, GFunc extends AnyFunction> = (
  method: GFunc,
) => GMappedFunc;

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
 * Checks whether a given string is unique to the set.
 * Add the name if it doesn't already exist, or throw an error when `shouldThrow` is true.
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

/**
 * A utility type for the property getItemParams.
 */
export type GetItemParamsMethod<GKey extends keyof AnyExtension, GFunc extends AnyFunction> = (
  ext: AnyExtension & Pick<Required<AnyExtension>, GKey>,
) => FlexibleConfig<GFunc>;

/**
 * Params used when creating the actions for an extension manager.
 */
interface CreateFlexibleFunctionMapParams<
  GKey extends keyof AnyExtension,
  GMappedFunc extends AnyFunction,
  GFunc extends AnyFunction
> {
  /**
   * The key of the method on the extension. For example 'commands', 'active'.
   */
  key: GKey;

  /**
   * When true a command name that is not unique will cause an error.
   *
   * @defaultValue true
   */
  checkUniqueness?: boolean;

  /**
   * Provide the parameters which should be used for the extension method.
   */
  getItemParams: GetItemParamsMethod<GKey, GFunc>;

  /**
   * Transforms the entry into a callable method with attrs as the first optional parameter.
   * Something like `actions[name]()`
   */
  methodFactory: MethodFactory<GMappedFunc, GFunc>;

  /**
   * Transform an array of methods into a single method that can be called.
   */
  arrayTransformer: (fns: GFunc[], methodFactory: MethodFactory<GMappedFunc, GFunc>) => GMappedFunc;

  /**
   * Passes the context (usually the extension manager) which has an instance property `.extensions`
   */
  extensions: AnyExtension[];
}

/**
 * This creates a flexible function mapper.
 *
 * @remarks
 *
 * The reason is that extensions can have commands / enabled / active methods that return a very complex type signature
 *
 * ```ts
 * type FlexibleConfig<Func> = Record<string, Func | Func[]>
 * ```
 *
 * This creates a function that is able to step through each possibility and call the required method.
 *
 * @param param - destructured parameters
 */
export const createFlexibleFunctionMap = <
  GKey extends keyof AnyExtension,
  GMappedFunc extends AnyFunction,
  GFunc extends AnyFunction
>({
  key,
  checkUniqueness = true,
  getItemParams,
  methodFactory,
  arrayTransformer,
  extensions,
}: CreateFlexibleFunctionMapParams<GKey, GMappedFunc, GFunc>): Record<
  string,
  { command: GMappedFunc; name: string }
> => {
  const items: Record<string, { command: GMappedFunc; name: string }> = {};
  const names = new Set<string>();
  extensions.filter(hasExtensionProperty(key)).forEach(currentExtension => {
    const item = getItemParams(currentExtension);

    Object.entries(item).forEach(([name, command]) => {
      if (checkUniqueness) {
        isNameUnique({ name, set: names, shouldThrow: true });
      }

      items[name] = Array.isArray(command)
        ? { command: arrayTransformer(command, methodFactory), name: currentExtension.name }
        : { command: methodFactory(command), name: currentExtension.name };
    });
  });

  return items;
};

interface CommandFlexibleFunctionMapParams extends ExtensionListParams {
  /**
   * The command params which are passed to each extensions `commands` method.
   */
  params: CommandParams;
}

/**
 * Generate all the action commands for usage within the UI.
 *
 * Typically actions are used to create interactive menus.
 * For example a menu can use a command to toggle bold.
 */
export const createCommands = ({ extensions, params }: CommandFlexibleFunctionMapParams) =>
  createFlexibleFunctionMap<'commands', (attrs?: Attrs) => void, ExtensionCommandFunction>({
    extensions,
    key: 'commands',
    methodFactory: method => (attrs?: Attrs) => {
      const { view, getState } = params;
      view.focus();
      return method(attrs)(getState(), view.dispatch, view);
    },
    checkUniqueness: true,
    arrayTransformer: (fns, methodFactory) => () => {
      fns.forEach(callback => {
        methodFactory(callback);
      });
    },
    getItemParams: extension =>
      extension.commands({
        ...params,
        ...(isMarkExtension(extension)
          ? { type: params.schema.marks[extension.name] }
          : isNodeExtension(extension)
          ? { type: params.schema.nodes[extension.name] }
          : {}),
      }),
  });

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
export const hasExtensionProperty = <GExt extends AnyExtension, GKey extends keyof GExt>(property: GKey) => (
  extension: GExt,
): extension is GExt & Pick<Required<GExt>, GKey> => bool(extension[property]);

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
  params: ExtensionManagerParams,
) => (extension: GExt): GExt[GExtMethodProp] extends AnyFunction ? ReturnType<GExt[GExtMethodProp]> : {} => {
  const extensionMethod = extension[property];
  if (!extensionMethod) {
    return {} as any;
  }
  return Cast(
    isNodeExtension(extension)
      ? extensionMethod.bind(extension)({ ...params, type: params.schema.nodes[extension.name] })
      : isMarkExtension(extension)
      ? extensionMethod.bind(extension)!({ ...params, type: params.schema.marks[extension.name] })
      : extensionMethod.bind(extension)!(params),
  );
};

/**
 * Converts an extension to its mapped value
 */
function convertToExtensionMapValue(extension: FlexibleExtension): PrioritizedExtension {
  return isExtension(extension) ? { priority: DEFAULT_EXTENSION_PRIORITY, extension } : extension;
}

/**
 * Sorts and transforms extension map based on the provided priorities and outputs just the extensions
 *
 * TODO Add a check for requiredExtensions and inject them automatically
 *
 * @param values - the extensions to transform as well as their priorities
 * @returns the list of extension instances sorted by priority
 */
export const transformExtensionMap = (values: FlexibleExtension[]) =>
  values
    .map(convertToExtensionMapValue)
    .sort((a, b) => a.priority - b.priority)
    .map(({ extension }) => extension);

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
