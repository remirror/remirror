import { AnyExtension, MakeOptional } from '@remirror/core';
import {
  GetRootPropsConfig,
  InjectedRemirrorProps,
  oneChildOnly,
  RemirrorElementType,
} from '@remirror/react-utils';
import React, { ProviderProps, ReactElement } from 'react';
import { defaultProps } from '../react-constants';
import { RemirrorContext } from '../react-contexts';
import { useRemirrorManager } from '../react-hooks';
import { Remirror } from './remirror';
import { RemirrorProps } from './remirror-types';

export interface RemirrorContextProviderProps<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends ProviderProps<InjectedRemirrorProps<GExtensions>> {
  /**
   * Sets the first child element as a the root (where the prosemirror editor instance will be rendered).
   *
   * @remarks
   *
   * **Example with directly nested components**
   *
   * When using a remirror provider calling `getRootProps` is mandatory.
   * By setting `childAsRoot` to an object Remirror will inject these props into the first child element.
   *
   * ```tsx
   * import { ManagedRemirrorProvider, RemirrorManager } from '@remirror/react';
   *
   * const Editor = () => {
   *   return (
   *     <RemirrorManager>
   *       <ManagedRemirrorProvider childAsRoot={{ refKey: 'ref' }}>
   *         <div />
   *       </ManagedRemirrorProvider>
   *     </RemirrorManager>
   *   );
   * }
   * ```
   *
   * If this is set to an empty object then the outer element must be able to receive a default ref prop which will mount
   * the editor to it. If left undefined then the children components are responsible for calling `getRootProps`.
   *
   * @default undefined
   */
  childAsRoot?: GetRootPropsConfig<string> | boolean;
}

export interface RemirrorProviderProps<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends MakeOptional<Omit<RemirrorProps<GExtensions>, 'children'>, keyof typeof defaultProps>,
    Pick<RemirrorContextProviderProps<GExtensions>, 'childAsRoot'> {
  /**
   * All providers must have ONE child element.
   */
  children: ReactElement;
}

/**
 * This purely exists so that we know when the remirror editor has been called with a provider as opposed
 * to directly as a render prop by the user.
 *
 * It's important because when called directly by the user `getRootProps` is automatically called when the render prop
 * is called. However when called via a Provider the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested components is called.
 */
const RemirrorContextProvider = <GExtensions extends AnyExtension[] = AnyExtension[]>({
  childAsRoot: _,
  ...props
}: RemirrorContextProviderProps<GExtensions>) => {
  const Component = RemirrorContext.Provider as any;
  return <Component {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorElementType.ContextProvider;
RemirrorContextProvider.defaultProps = {
  childAsRoot: false,
};

/**
 * The RemirrorProvider which injects context into it's child component.
 *
 * @remarks
 * This only supports one child. At the moment if that that child is an built in html string element
 * then it is also treated as the
 *
 * These can either be consumed using React Hooks
 * - `useRemirrorContext`
 * - `usePositioner`
 *
 * Or the higher order components
 * - `withRemirror`
 * - `withPositioner`
 */
export const RemirrorProvider = <GExtensions extends AnyExtension[] = AnyExtension[]>({
  children,
  childAsRoot,
  ...props
}: RemirrorProviderProps<GExtensions>) => {
  return (
    <Remirror {...props}>
      {value => {
        return (
          <RemirrorContextProvider value={value} childAsRoot={childAsRoot}>
            {oneChildOnly(children)}
          </RemirrorContextProvider>
        );
      }}
    </Remirror>
  );
};

RemirrorProvider.$$remirrorType = RemirrorElementType.EditorProvider;

export interface ManagedRemirrorProviderProps<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends Omit<RemirrorProviderProps<GExtensions>, 'manager'> {}

/**
 * Renders the content while pulling the manager from the context and passing it on to the
 * RemirrorProvider.
 *
 * If no manager exists the child components are not rendered.
 */
export const ManagedRemirrorProvider = <GExtensions extends AnyExtension[] = AnyExtension[]>({
  children,
  ...props
}: ManagedRemirrorProviderProps<GExtensions>) => {
  const manager = useRemirrorManager<GExtensions>();

  return manager ? (
    <RemirrorProvider {...props} manager={manager}>
      {children}
    </RemirrorProvider>
  ) : null;
};

ManagedRemirrorProvider.$$remirrorType = RemirrorElementType.ManagedEditorProvider;
