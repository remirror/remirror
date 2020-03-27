import { AttributeSpec } from 'prosemirror-model';

import { ErrorConstant } from '@remirror/core-constants';
import { invariant, isArray, isString, object } from '@remirror/core-helpers';
import {
  Attrs,
  BaseExtensionConfig,
  CreateExtraAttrs,
  ExtraAttrs,
  GetExtraAttrs,
} from '@remirror/core-types';

import { AnyExtension, isMarkExtension, isNodeExtension } from './extension';

/**
 * Allows for the addition of attributes to the defined schema. These are
 * defined in the static config and directly update the schema when applied.
 * They can't be changed during the lifetime of the editor or the Schema will
 * break.
 *
 * @remarks
 *
 * This can only be used in a `NodeExtension` or `MarkExtension`. The additional
 * attributes can only be optional.
 */
export const createExtraAttrsFactory = <Config extends BaseExtensionConfig>(
  extension: AnyExtension,
): CreateExtraAttrs => ({ fallback }) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttrs: ExtraAttrs[] = extension.config.extraAttrs ?? [];
  const attrs: Record<string, AttributeSpec> = object();

  for (const item of extraAttrs) {
    if (isArray(item)) {
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
 * Runs through the extraAttrs provided and retrieves them.
 */
export const getExtraAttrsFactory = <Config extends BaseExtensionConfig>(
  extension: AnyExtension,
): GetExtraAttrs => (domNode) => {
  // Make sure this is a node or mark extension. Will throw if not.
  invariant(
    isNodeExtension<Config>(extension) || isMarkExtension<Config>(extension),
    ErrorConstant.EXTRA_ATTRS,
  );

  const extraAttrs = extension.config.extraAttrs ?? [];
  const attrs: Attrs = object();

  for (const attr of extraAttrs) {
    if (isArray(attr)) {
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
