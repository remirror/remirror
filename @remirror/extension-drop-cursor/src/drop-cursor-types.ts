import { BaseExtensionOptions } from '@remirror/core';
import { ComponentType } from 'react';

export interface DropCursorExtensionOptions extends BaseExtensionOptions {
  /**
   * The component to render when an item is being dropped.
   */
  Component?: ComponentType<any>;

  /**
   * The main color of the component being rendered.
   */
  color?: string;

  /**
   * The width of the drop cursor.
   */
  width?: string | number;
}
