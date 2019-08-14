import { ExtensionType } from '@remirror/core-constants';
import { isObject } from '@remirror/core-helpers';
import { Extension } from './extension';
import { AnyExtension } from './extension-types';
import { MarkExtension } from './mark-extension';
import { NodeExtension } from './node-extension';

/**
 * Determines if the passed in extension is a any type of extension.
 *
 * @param extension - the extension to check
 */
export const isExtension = (extension: unknown): extension is AnyExtension =>
  isObject(extension) && extension instanceof Extension;

/**
 * Checks whether the this is an extension and if it is a plain one
 *
 * @param extension - the extension to check
 */
export const isPlainExtension = (extension: unknown): extension is Extension<any> =>
  isExtension(extension) && extension.type === ExtensionType.Plain;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isMarkExtension = (extension: unknown): extension is MarkExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.Mark;

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 *
 * @param extension - the extension to check
 */
export const isNodeExtension = (extension: unknown): extension is NodeExtension<any> =>
  isExtension(extension) && extension.type === ExtensionType.Node;
