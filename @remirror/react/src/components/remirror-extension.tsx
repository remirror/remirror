import { Extension, SimpleExtensionConstructor } from '@remirror/core';
import { Component } from 'react';
import { RemirrorElementType, RemirrorExtensionProps } from '../types';

export class RemirrorExtension<
  GOptions extends {},
  GExtension extends Extension<GOptions, any> = Extension<GOptions, any>,
  GConstructor extends SimpleExtensionConstructor<GOptions, GExtension> = SimpleExtensionConstructor<
    GOptions,
    GExtension
  >,
  GProps extends RemirrorExtensionProps<GOptions, GExtension, GConstructor> = RemirrorExtensionProps<
    GOptions,
    GExtension,
    GConstructor
  >
> extends Component<GProps> {
  public static $$remirrorType = RemirrorElementType.Extension;

  /**
   * A component that renders nothing but registers the extension every time it is called
   */
  public render() {
    return null;
  }
}
