import { Extension, ExtensionConstructor } from '@remirror/core';
import { RemirrorElementType, RemirrorExtensionProps, RemirrorFC } from '../types';

export const RemirrorExtension = <
  GOptions extends {},
  GExtension extends Extension<GOptions, any> = Extension<GOptions, any>,
  GConstructor = ExtensionConstructor<GOptions, GExtension>
>(
  _props: RemirrorExtensionProps<GOptions, GExtension, GConstructor>,
) => {
  return null;
};

(RemirrorExtension as RemirrorFC<any>).$$remirrorType = RemirrorElementType.Extension;
