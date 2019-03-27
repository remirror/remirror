import {
  Extension,
  ExtensionConstructor,
  NodeExtension,
  NodeExtensionConstructor,
  NodeExtensionOptions,
} from '@remirror/core';
import { Component } from 'react';
import { RemirrorElementType, RemirrorExtensionProps, RemirrorNodeExtensionProps } from '../types';

export class RemirrorExtension<
  GOptions extends {},
  GExtension extends Extension<GOptions, any> = Extension<GOptions, any>,
  GConstructor = ExtensionConstructor<GOptions, GExtension>,
  GProps = RemirrorExtensionProps<GOptions, GExtension, GConstructor>
> extends Component<GProps> {
  public static $$remirrorType = RemirrorElementType.Extension;

  /**
   * A component that renders nothing but registers the extension every time it is called
   */
  public render() {
    return null;
  }
}

export class RemirrorNodeExtension<
  GOptions extends NodeExtensionOptions,
  GExtension extends NodeExtension<GOptions> = NodeExtension<GOptions>,
  GConstructor extends NodeExtensionConstructor<GOptions, GExtension> = NodeExtensionConstructor<
    GOptions,
    GExtension
  >,
  GProps extends RemirrorNodeExtensionProps<GOptions, GExtension, GConstructor> = RemirrorExtensionProps<
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
