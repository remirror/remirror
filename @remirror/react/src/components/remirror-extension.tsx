import { Extension, ExtensionConstructor } from '@remirror/core';
import { RemirrorElementType, RemirrorExtensionProps, RemirrorFC } from '@remirror/react-utils';

/**
 * This component creates an extension that will be picked up by a parent RemirrorManager.
 *
 * @remarks
 *
 * This is a more React-ish way of configuring the editor extensions. The alternative to creating a
 * component tree structure would be manually dealing with the ExtensionManager.
 *
 * Without `RemirrorExtension`
 * ```tsx
 * const WithoutRemirrorExtensions = () => {
 *   const handler = () => {
 *     console.log('something happened');
 *   }
 *
 *   const manager = ExtensionManager.create([
 *     ...baseExtensions,
 *     { extension: new TestExtension({ handler }), priority: 1 },
 *     new PlaceholderExtension({ emptyNodeClass: 'empty' })
 *   ]);
 *
 *   return (
 *    <RemirrorProvider manager={manager}>
 *      <Component />
 *    </RemirrorProvider>
 *   )
 * }
 * ```
 *
 * With `RemirrorExtension`
 * ```tsx
 * const WithRemirrorExtensions = () => {
 *   const handler = () => {
 *     console.log('something happened');
 *   }
 *
 *   return (
 *    <RemirrorManager>
 *      <ManagedRemirrorProvider>
 *        <Component />
 *      </ManagedRemirrorProvider>
 *      <RemirrorExtension Constructor={TestExtension} handler={handler} priority={1} />
 *      <RemirrorExtension Constructor={PlaceholderExtension} emptyNodeClass='empty' />
 *    </RemirrorManager>
 *   )
 * }
 * ```
 *
 * Choose the pattern that best suits your style.
 */
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
