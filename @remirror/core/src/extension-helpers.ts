import {
  DEFAULT_EXTENSION_PRIORITY,
  ErrorConstant,
  ExtensionType,
  RemirrorClassName,
} from '@remirror/core-constants';
import { invariant, isObject, isString, object } from '@remirror/core-helpers';
import { Attrs, ExtraAttrs } from '@remirror/core-types';

import { Extension } from './extension';
import { AnyExtension, FlexibleExtension, PrioritizedExtension } from './extension-types';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';

/**
 * Determines if the passed in extension is any type of extension.
 *
 * @param extension - the extension to check
 */
export const isExtension = (extension: unknown): extension is AnyExtension =>
  isObject(extension) && extension.toString().startsWith(RemirrorClassName.Extension);

/**
 * Checks whether the this is an extension and if it is a plain one
 *
 * @param extension - the extension to check
 */
export const isPlainExtension = (extension: unknown): extension is Extension<any, any, any, any> =>
  isExtension(extension) && extension.type === ExtensionType.Plain;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type
 * of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isMarkExtension = (extension: unknown): extension is MarkExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.Mark;

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type
 * of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.Node;

/**
 * Converts an extension to an object with a priority.
 */
export const convertToPrioritizedExtension = <GExtension extends AnyExtension = any>(
  extension: FlexibleExtension<GExtension>,
): PrioritizedExtension<GExtension> => {
  return isExtension(extension)
    ? { priority: DEFAULT_EXTENSION_PRIORITY, extension }
    : { ...extension };
};

/**
 * Allows for the addition of attributes to the defined schema.
 *
 * @remarks
 *
 * This is only used in node and mark extensions.
 *
 * For now extraAttrs can only be optional.
 */
export const extraAttrs = (fallback: string | null = '', extension: AnyExtension) => {
  // Make sure this is a node or mark extension.
  invariant(isNodeExtension(extension) || isMarkExtension(extension), ErrorConstant.EXTRA_ATTRS);

  const extraAttrs: ExtraAttrs[] = (extension.config.extraAttrs as ExtraAttrs[] | undefined) ?? [];
  const attrs: Record<string, { default?: unknown }> = object();

  for (const item of extraAttrs) {
    if (Array.isArray(item)) {
      attrs[item[0]] = { default: item[1] };
      continue;
    }

    if (isString(item)) {
      attrs[item] = { default: fallback };
      continue;
    }

    const { name, default: def } = item;
    attrs[name] = def !== undefined ? { default: def } : {};
  }

  return attrs;
};

/**
 * Runs through the extraAttrs and retrieves them.
 */
export const getExtraAttrs = (domNode: Node, extension: AnyExtension) => {
  // Make sure this is a node or mark extension.
  invariant(isNodeExtension(extension) || isMarkExtension(extension), ErrorConstant.EXTRA_ATTRS);

  const extraAttrs: ExtraAttrs[] = extension.config.extraAttrs ?? [];
  const attrs: Attrs = object();

  for (const attr of extraAttrs) {
    if (Array.isArray(attr)) {
      // Use the default
      const [name, , attributeName] = attr;
      attrs[name] = attributeName ? (domNode as Element).getAttribute(attributeName) : undefined;
      continue;
    }

    if (isString(attr)) {
      // Assume the name is the same
      attrs[attr] = (domNode as Element).getAttribute(attr);
      continue;
    }

    const { name, getAttrs, default: fallback } = attr;
    attrs[name] = getAttrs ? getAttrs(domNode) || fallback : fallback;
  }

  return attrs;
};
