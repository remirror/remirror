import { AnyExtension, Extension } from './extension';
import { bool, Cast, isFunction, isObject } from './helpers/base';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';
import { AnyFunction, CommandParams, ExtensionManagerParams, ExtensionType, FlexibleConfig } from './types';

type MethodFactory<GMappedFunc extends AnyFunction, GFunc extends AnyFunction> = (
  params: CommandParams,
  method: GFunc,
) => GMappedFunc;

interface IsNameUniqueParams {
  name: string;
  set: Set<string>;
  shouldThrow?: boolean;
  type?: string;
}

/**
 * Checks whether a given string is unique to the set.
 * Add the name if it doesn't already exist, or throw an error when `shouldThrow` is true.
 *
 * @param params
 * @param params.name
 * @param params.set
 * @param params.shouldThrow
 * @param params.type
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
 * This creates a flexible function mapper.
 *
 * The reason is that extensions can have commands / enabled / active methods that return a very complex type signature
 *
 * ```ts
 * type FlexibleConfig<Func> = Func | Func[] | Record<string, Func | Func[]>
 * ```
 *
 * This creates a function that is able to step through each possibility and perform the action required.
 *
 * @param param
 * @param param.key
 * @param param.checkUniqueness
 * @param param.getItemParams
 * @param param.methodFactory
 * @param param.arrayTransformer
 * @param param.ctx
 */
export const createFlexibleFunctionMap = <
  GKey extends keyof AnyExtension,
  GMappedFunc extends AnyFunction,
  GFunc extends AnyFunction
>({
  key,
  checkUniqueness,
  getItemParams,
  methodFactory,
  arrayTransformer,
  ctx,
}: {
  checkUniqueness: boolean;
  key: GKey;
  getItemParams: (
    ext: AnyExtension & Pick<Required<AnyExtension>, GKey>,
    params: CommandParams,
  ) => FlexibleConfig<GFunc>;
  methodFactory: MethodFactory<GMappedFunc, GFunc>;
  arrayTransformer: (
    fns: GFunc[],
    params: CommandParams,
    methodFactory: MethodFactory<GMappedFunc, GFunc>,
  ) => GMappedFunc;
  ctx: HasExtensions;
}) => (params: CommandParams): Record<string, GMappedFunc> => {
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
        if (checkUniqueness) {
          isNameUnique({ name: commandName, set: names, shouldThrow: true });
        }
        items[commandName] = Array.isArray(commandValue)
          ? arrayTransformer(commandValue, params, methodFactory)
          : methodFactory(params, commandValue);
      });
    }
  });

  return items;
};

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isObject(extension) && extension instanceof NodeExtension;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension
 */
export const isMarkExtension = (extension: unknown): extension is MarkExtension<any> =>
  isObject(extension) && extension instanceof MarkExtension;

/**
 * Checks whether the this is an extension and if it is a plain one
 *
 * @param extension
 */
export const isPlainExtension = (extension: unknown): extension is Extension<any, never> =>
  isObject(extension) && extension instanceof Extension && extension.type === ExtensionType.EXTENSION;

/**
 * Checks to see if an optional property exists on an extension.
 * Used by the extension manager to build the plugins, keymaps etc...
 */
export const hasExtensionProperty = <GExt extends AnyExtension, GKey extends keyof GExt>(property: GKey) => (
  extension: GExt,
): extension is GExt & Pick<Required<GExt>, GKey> => bool(extension[property]);

/**
 * Keys for the methods available on an extension (useful for filtering)
 */
type ExtensionMethodProperties = 'inputRules' | 'pasteRules' | 'keys' | 'plugin' | 'styles';

/**
 * Looks at the passed property and calls the extension with the required parameters.
 *
 * @param property
 * @param params
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
    return Cast({});
  }
  return Cast(
    isNodeExtension(extension)
      ? extensionMethod.bind(extension)({ ...params, type: params.schema.nodes[extension.name] })
      : isMarkExtension(extension)
      ? extensionMethod.bind(extension)!({ ...params, type: params.schema.marks[extension.name] })
      : extensionMethod.bind(extension)!(params),
  );
};

export interface ExtensionMapValue {
  extension: AnyExtension;
  priority: number;
}

export type ExtensionMap = Map<symbol, ExtensionMapValue>;

/**
 * Sorts and transforms extension map based on the provided priorities and outputs just the extensions
 *
 * Todo add a check for requiredExtensions and inject them automatically
 *
 * @param extensionMapValues
 */
export const transformExtensionMap = (extensionMapValues: ExtensionMapValue[]) =>
  extensionMapValues.sort((a, b) => a.priority - b.priority).map(({ extension }) => extension);

export const ignoreFunctions = (map: Record<string, unknown>) => {
  const newMap: Record<string, unknown> = {};
  for (const key of Object.keys(map)) {
    if (isFunction(map[key])) {
      continue;
    }
    newMap[key] = map[key];
  }

  return newMap;
};
