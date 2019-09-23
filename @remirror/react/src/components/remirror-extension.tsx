import { AbstractInstanceType, AnyExtension, OptionsOfExtension } from '@remirror/core';
import { RemirrorFC, RemirrorType } from '@remirror/react-utils';
import { RemirrorExtensionProps } from '../react-types';

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
 *     log('something happened');
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
 *     log('something happened');
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
  GConstructor extends { prototype: AnyExtension },
  GOptions extends OptionsOfExtension<AbstractInstanceType<GConstructor>>
>(
  _props: RemirrorExtensionProps<GConstructor, GOptions>,
) => {
  return null;
};

(RemirrorExtension as RemirrorFC<any>).$$remirrorType = RemirrorType.Extension;
