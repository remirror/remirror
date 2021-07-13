import type { ReactNode, Ref } from 'react';
import type {
  AnyExtension,
  BuiltinPreset,
  FrameworkOutput,
  GetStaticAndDynamic,
  RemirrorEventListener,
  Shape,
} from '@remirror/core';
import type { PortalContainer } from '@remirror/extension-react-component';
import type { CorePreset, CreateCoreManagerOptions } from '@remirror/preset-core';
import type { ReactExtension, ReactExtensionOptions } from '@remirror/preset-react';

/**
 * Use this to build your own extension union type which extends from the
 * `ReactExtensions`.
 */
export type ReactExtensions<Extension extends AnyExtension = never> =
  | CorePreset
  | ReactExtension
  | BuiltinPreset
  | Extension;

/**
 * The config options for the `getRootProps` method.
 */
export interface GetRootPropsConfig<RefKey extends string = 'ref'> extends RefProps<RefKey>, Shape {
  /**
   * Allows for composing the refs together. If you have a ref you would also
   * like to add to the main element then just add it here.
   */
  ref?: Ref<HTMLElement>;
}

/**
 * The react ref key props for the `getRootProps` method.
 */
export type RefKeyRootProps<RefKey extends string = 'ref'> = {
  [P in Exclude<RefKey, 'key'>]: Ref<any>;
} & {
  key: string;
  children: ReactNode;
} & Shape;

export interface RefProps<RefKey = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @default 'ref'
   */
  refKey?: RefKey;
}

/**
 * These are the props passed to the render function provided when setting up
 * your editor.
 */
export interface ReactFrameworkOutput<Extension extends AnyExtension>
  extends FrameworkOutput<Extension> {
  /**
   * A function that returns the props which should be spread on the react
   * element to be used as the root for the editor. This is where the
   * ProseMirror editor is injected into the DOM).
   *
   * @remarks
   *
   * By default `Remirror` will add the prosemirror editor instance directly
   * into the first child element it receives. Using this method gives you full
   * control over where the editor should be injected.
   *
   * **IMPORTANT** In order to support SSR pre-rendering this should only be
   * spread on a component with NO children.
   *
   * **Example with indirectly nested components**
   *
   * ```tsx
   * import { Remirror } from '@remirror/react';
   * import { PresetCore } from '@remirror/preset-core';
   * import { BoldExtension } from '@remirror/extension-bold';
   *
   * const Editor = () => {
   *   const { getRootProps, renderSsr } = useRemirror();
   *   return <div {...getRootProps()} />;
   * }
   *
   * const EditorWrapper = () => {
   *   const corePreset = usePreset(CorePreset);
   *   const boldExtension = useExtension(BoldExtension);
   *   const manager = useManager([corePreset, boldExtension]);
   *
   *   return (
   *     <Remirror manager={manager}>
   *       <InnerEditor />
   *     </Remirror>
   *   );
   * }
   * ```
   */
  getRootProps: <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
  ) => RefKeyRootProps<RefKey>;

  /**
   * The portal container.
   *
   * @remarks
   *
   * This is the container used to keep track of all the react portals which are
   * being rendered into the prosemirror dom.
   *
   * @internal
   */
  portalContainer: PortalContainer;

  /**
   * Render an ssr component.
   */
  renderSsr: () => ReactNode;
}

/**
 * The options for the exported `createReactManager` method.
 */
export interface CreateReactManagerOptions extends CreateCoreManagerOptions {
  /**
   * Options for the react preset.
   */
  react?: GetStaticAndDynamic<ReactExtensionOptions>;
}

/**
 * This is a type alias for creating your own typed version of the remirror
 * method.
 *
 * ```ts
 * import { useRemirror, UseRemirrorContextType } from '@remirror/react';
 * import { SocialPreset } from 'remirror/extensions'
 *
 * const useSocialRemirror = useRemirror as UseRemirrorContextType<SocialPreset>;
 *
 * // With the remirror provider context.
 * const Editor = () => {
 *   const { commands } = useSocialRemirror();
 *
 *   // All available commands are shown with intellisense. Command click to goto the implementation.
 *   commands.toggleBold();
 * }
 * ```
 */
export type UseRemirrorContextType<Extension extends AnyExtension> = <Type extends AnyExtension>(
  handler?: RemirrorEventListener<Extension> | { autoUpdate: boolean },
) => ReactFrameworkOutput<Extension | Type>;
