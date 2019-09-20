import { BaseExtensionOptions } from '@remirror/core';
import { ComponentType } from 'react';

/**
 * This indicates whether the current cursor position is within a textblock or
 * between two nodes.
 */
export type DropCursorType = 'block' | 'inline';

export interface DropCursorExtensionComponentProps {
  options: Omit<Required<DropCursorExtensionOptions>, 'Component'>;
  type: DropCursorType;
  container: HTMLElement;
}

export interface DropCursorExtensionOptions extends BaseExtensionOptions {
  /**
   * The component to render when an item is being dragged over and is between two nodes.
   */
  Component?: ComponentType<DropCursorExtensionComponentProps>;

  // /**
  //  * The component to render when an item is being dragged over and is within text content.
  //  */
  // InlineComponent?: ComponentType<DropCursorExtensionComponentProps>;

  /**
   * The main color of the component being rendered.
   *
   * This can be a named color from the theme such as `background`
   *
   * @defaultValue `primary`
   */
  color?: string;

  /**
   * The width of the inline drop cursor.
   *
   * @defaultValue '2px'
   */
  inlineWidth?: string | number;

  /**
   * The horizontal margin around the inline cursor.
   *
   * @defaultValue '10px'
   */
  inlineSpacing?: string | number;

  /**
   * The width of the block drop cursor.
   *
   * @defaultValue '100%'
   */
  blockWidth?: string | number;

  /**
   * The height of the block drop cursor.
   */
  blockHeight?: string | number;

  /**
   * The class name added to the block widget
   *
   * @defaultValue 'remirror-drop-cursor-block'
   */
  blockClassName?: string;

  /**
   * The class name added to the node that appears before the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-block'
   */
  beforeBlockClassName?: string;

  /**
   * The class name added to the node that appears after the block drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-block'
   */
  afterBlockClassName?: string;

  /**
   * The class name added to the inline drop cursor widget
   *
   * @defaultValue 'remirror-drop-cursor-inline'
   */
  inlineClassName?: string;

  /**
   * The class name added to the node that appears before the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-before-inline'
   */
  beforeInlineClassName?: string;

  /**
   * The class name added to the node that appears after the inline drop cursor widget.
   *
   * @defaultValue 'remirror-drop-cursor-after-inline'
   */
  afterInlineClassName?: string;
}
