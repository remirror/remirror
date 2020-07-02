import { ReactNode, Ref } from 'react';

import {
  AnyCombinedUnion,
  AnyExtension,
  AnyPreset,
  BuiltinPreset,
  CombinedUnion,
  EditorState,
  EditorWrapperOutput,
  EditorWrapperProps,
  RemirrorManager,
  SchemaFromCombined,
  Shape,
} from '@remirror/core';
import { I18n } from '@remirror/i18n';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

import { PortalContainer } from './portals';

export type DefaultReactCombined = CombinedUnion<
  AnyExtension,
  CorePreset | ReactPreset | BuiltinPreset | AnyPreset
>;

/**
 * Use this to build your own combined union type.
 */
export type ReactCombinedUnion<Combined extends AnyCombinedUnion> =
  | CorePreset
  | ReactPreset
  | BuiltinPreset
  | Combined;

export interface BaseProps<Combined extends AnyCombinedUnion> extends EditorWrapperProps<Combined> {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related
   * functionality.
   *
   * TODO - why does this only work as `any`.
   */
  manager: RemirrorManager<any>;

  /**
   * When onStateChange is defined this prop is used to set the next state value
   * of the remirror editor.
   *
   * @remarks
   *
   * If this exists the editor becomes a controlled component. Nothing will be
   * updated unless you explicitly set the value prop to the updated state.
   *
   * Without a deep understanding of Prosemirror this is not recommended.
   */
  value?: EditorState<SchemaFromCombined<Combined>> | null;

  /**
   * Set to true to ignore the hydration warning for a mismatch between the
   * rendered server and client content.
   *
   * @remarks
   *
   * This is a potential solution for those who require server side rendering.
   *
   * While on the server the prosemirror document is transformed into a react
   * component so that it can be rendered. The moment it enters the DOM
   * environment prosemirror takes over control of the root element. The problem
   * is that this will always see this hydration warning on the client:
   *
   * `Warning: Did not expect server HTML to contain a <div> in <div>.`
   *
   * Setting this to true removes the warning at the cost of a slightly slower
   * start up time. It uses the two pass solution mentioned in the react docs.
   * See {@link https://reactjs.org/docs/react-dom.html#hydrate}.
   *
   * For ease of use this prop copies the name used by react for DOM Elements.
   * See {@link
   * https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning.
   */
  suppressHydrationWarning?: boolean;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end`
   * of it's container DOM element.
   *
   * @defaultValue 'end'
   */
  insertPosition?: 'start' | 'end';
}

/**
 * The config options for the `getRootProps` method.
 */
export interface GetRootPropsConfig<RefKey extends string = 'ref'>
  extends RefParameter<RefKey>,
    Shape {}

/**
 * The react ref key props for the `getRootProps` method.
 */
export type RefKeyRootProps<RefKey extends string = 'ref'> = {
  [P in Exclude<RefKey, 'key'>]: Ref<any>;
} & {
  key: string;
  children: ReactNode;
} & Shape;

export interface RefParameter<RefKey = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @defaultValue 'ref'
   */
  refKey?: RefKey;
}

export interface I18nContextProps {
  /**
   * Provide your own i18n with all the locales you need for your app.
   *
   * ```ts
   * import { i18n } from '@remirror/i18n';
   * import esLocale from '@remirror/i18n/es';
   * import { SocialEditor } from '@remirror/react-social-editor';
   * import { es } from 'make-plural/plurals';
   *
   * i18n.loadLocaleData('es', { plurals: es });
   *
   * i18n.load({
   *   es: esLocale.messages,
   * });
   *
   * const Editor = () => {
   *   <SocialEditor i18n={i18n} />
   * }
   * ```
   */
  i18n: I18n;

  /**
   * The current locale for this context.
   *
   * @defaultValue 'en'
   */
  locale: string;

  /**
   * Supported locales. Defaults to including the locale.
   *
   * @defaultValue `[locale]`
   */
  supportedLocales?: string[];
}

/**
 * These are the props passed to the render function provided when setting up
 * your editor.
 */
export interface RemirrorContextProps<Combined extends AnyCombinedUnion>
  extends EditorWrapperOutput<Combined> {
  /**
   * A function that returns props which should be spread on a react element and
   * declare it as the editor root (where the editor is injected in the DOM).
   *
   * @remarks
   *
   * By default remirror will add the prosemirror editor instance directly into
   * the first child element it receives. Using this method gives you full
   * control over where the editor should be injected.
   *
   * **IMPORTANT** In order to support SSR pre-rendering this should only be
   * spread on a component with NO children.
   *
   * **Example with indirectly nested components**
   *
   * ```tsx
   * import { RemirrorProvider } from '@remirror/react';
   * import { PresetCore } from '@remirror/preset-core';
   * import { BoldExtension } from '@remirror/extension-bold';
   *
   * const Editor = () => {
   *   const { getRootProps } = useRemirror();
   *   return <div {...getRootProps()} />;
   * }
   *
   * const EditorWrapper = () => {
   *   const corePreset = usePreset(CorePreset);
   *   const boldExtension = useExtension(BoldExtension);
   *   const manager = useManager([corePreset, boldExtension]);
   *
   *   return (
   *     <RemirrorProvider manager={manager}>
   *       <InnerEditor />
   *     </RemirrorProvider>
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
}
