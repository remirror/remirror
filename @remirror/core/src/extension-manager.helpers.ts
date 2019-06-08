import { DEFAULT_EXTENSION_PRIORITY } from './constants';
import { AnyExtension, Extension } from './extension';
import { bool, capitalize, Cast, isFunction, isObject } from './helpers/base';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';
import { AnyFunction, CommandParams, ExtensionManagerParams, ExtensionType, FlexibleConfig } from './types';

type MethodFactory<GMappedFunc extends AnyFunction, GFunc extends AnyFunction> = (
  params: CommandParams,
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
export const isNameUnique = ({ name, set, shouldThrow = false, type = 'extension' }: IsNameUniqueParams) => {
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

export interface HasExtensions {
  /** A list of passed extensions */
  extensions: AnyExtension[];
}

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
   * Whether or not to check for uniqueness.
   *
   * @defaultValue true
   */
  checkUniqueness?: boolean;

  /**
   * Provide the parameters which should be used for the extension method.
   */
  getItemParams: (
    ext: AnyExtension & Pick<Required<AnyExtension>, GKey>,
    params: CommandParams,
  ) => FlexibleConfig<GFunc>;

  /**
   * Transforms the entry into a callable method with attrs as the first optional parameter.
   * Something like `actions[name].command()`
   */
  methodFactory: MethodFactory<GMappedFunc, GFunc>;

  /**
   * Transform an array of items in a method that can be called.
   */
  arrayTransformer: (
    fns: GFunc[],
    params: CommandParams,
    methodFactory: MethodFactory<GMappedFunc, GFunc>,
  ) => GMappedFunc;

  /**
   * Passes the context (usually the extension manager) which has an instance property `.extensions`
   */
  ctx: HasExtensions;
}

/**
 * This creates a flexible function mapper.
 *
 * @remarks
 *
 * The reason is that extensions can have commands / enabled / active methods that return a very complex type signature
 *
 * ```ts
 * type FlexibleConfig<Func> = Func | Func[] | Record<string, Func | Func[]>
 * ```
 *
 * This creates a function that is able to step through each possibility and perform the action required.
 *
 * @param param - destructured parameters
 *
 * @internal
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
  ctx,
}: CreateFlexibleFunctionMapParams<GKey, GMappedFunc, GFunc>) => (
  params: CommandParams,
): Record<string, GMappedFunc> => {
  const items: Record<string, GMappedFunc> = {};
  const names = new Set<string>();
  ctx.extensions.filter(hasExtensionProperty(key)).forEach(currentExtension => {
    const { name } = currentExtension;
    if (checkUniqueness) {
      isNameUnique({ name, set: names, shouldThrow: true });
    }
    const item = getItemParams(currentExtension, params);
    if (Array.isArray(item)) {
      items[name] = arrayTransformer(item, params, methodFactory);
    } else if (isFunction(item)) {
      items[name] = methodFactory(params, item);
    } else {
      Object.entries(item).forEach(([commandName, commandValue]) => {
        // Namespace the actions created to minimise accidental naming collision
        const namespacedName = `${name}${capitalize(commandName)}`;

        if (checkUniqueness) {
          isNameUnique({ name: namespacedName, set: names, shouldThrow: true });
        }
        items[namespacedName] = Array.isArray(commandValue)
          ? arrayTransformer(commandValue, params, methodFactory)
          : methodFactory(params, commandValue);
      });
    }
  });

  return items;
};

/**
 * Determines if the passed in extension is a any type of extension.
 *
 * @param extension - the extension to check
 */
export const isExtension = (extension: unknown): extension is AnyExtension =>
  isObject(extension) && extension instanceof Extension;

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isExtension(extension) && extension instanceof NodeExtension;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isMarkExtension = (extension: unknown): extension is MarkExtension<any> =>
  isExtension(extension) && extension instanceof MarkExtension;

/**
 * Checks whether the this is an extension and if it is a plain one
 *
 * @param extension - the extension to check
 */
export const isPlainExtension = (extension: unknown): extension is Extension<any, never> =>
  isExtension(extension) && extension.type === ExtensionType.EXTENSION;

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
type ExtensionMethodProperties = 'inputRules' | 'pasteRules' | 'keys' | 'plugin' | 'styles' | 'nodeView';

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
 * Provides a priority value to the extension which determines the priority.
 *
 * @remarks
 * A lower value for priority means a higher priority. Think of it as an index and position in array
 * except that it can also support negative values.
 */
export interface PrioritizedExtension {
  /**
   * The instantiated extension
   */
  extension: AnyExtension;

  /**
   * A priority given to the extension.
   *
   * @remarks
   * A lower number implies an earlier place in the extension list and hence more priority over the extensions that follow.
   *
   * @defaultValue 2
   */
  priority: number;
}

/**
 * Either a PrioritizedExtension or the actual Extension
 */
export type FlexibleExtension = PrioritizedExtension | AnyExtension;

/**
 * Converts an extension to its mapped value
 */
function convertToExtensionMapValue(extension: FlexibleExtension): PrioritizedExtension {
  return isExtension(extension) ? { priority: DEFAULT_EXTENSION_PRIORITY, extension } : extension;
}

/**
 * Sorts and transforms extension map based on the provided priorities and outputs just the extensions
 *
 * TODO: Add a check for requiredExtensions and inject them automatically
 *
 * @param values - the extensions to transform as well as their priorities
 * @returns the list of extension instances sorted by priority
 *
 * @internal
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
 *
 * @internal
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
