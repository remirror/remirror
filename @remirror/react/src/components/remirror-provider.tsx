import React, { ProviderProps, ReactElement, ReactNode, useEffect } from 'react';

import { AnyCombinedUnion } from '@remirror/core';
import { i18n as defaultI18n } from '@remirror/i18n';
import { oneChildOnly, RemirrorType } from '@remirror/react-utils';

import { RemirrorPortals } from '../portals';
import { I18nContext, RemirrorContext } from '../react-contexts';
import {
  BaseProps,
  GetRootPropsConfig,
  I18nContextProps,
  RemirrorContextProps,
} from '../react-types';
import { RenderEditor } from './render-editor';

interface RemirrorContextProviderProps<Combined extends AnyCombinedUnion>
  extends ProviderProps<RemirrorContextProps<Combined>>,
    Pick<RemirrorProviderProps<Combined>, 'childAsRoot'> {}

export interface RemirrorProviderProps<Combined extends AnyCombinedUnion>
  extends BaseProps<Combined> {
  /**
   * The `RemirrorProvider` only supports **ONE** child element.
   */
  children: ReactElement;

  /**
   * Sets the first child element as a the root (where the prosemirror editor
   * instance will be rendered).
   *
   * @remarks
   *
   * **Example with directly nested components**
   *
   * When using a remirror provider calling `getRootProps` is mandatory. By
   * setting `childAsRoot` to an object Remirror will inject these props into
   * the first child element.
   *
   * ```tsx
   * import { RemirrorProvider, useManager } from '@remirror/react';
   *
   * const Editor = () => {
   *   const manager = useManager([...myExtensions]);
   *
   *   return (
   *     <RemirrorProvider childAsRoot={{ refKey: 'ref' }}>
   *       <div />
   *     </RemirrorProvider>,
   *   );
   * };
   * ```
   *
   * If this is set to an empty object then the outer element must be able to
   * receive a default ref prop which will mount the editor to it. If left
   * undefined then the children components are responsible for calling
   * `getRootProps`.
   *
   * @defaultValue undefined
   */
  childAsRoot?: GetRootPropsConfig<string> | boolean;
}

/**
 * This purely exists so that we know when the remirror editor has been called
 * with a provider as opposed to directly as a render prop by the user.
 *
 * It's important because, when called directly by the user, `getRootProps` is
 * automatically called when the render prop is called. However, when called via
 * a Provider, the render prop renders the context component and it's not until
 * the element is actually rendered that the getRootProp in any nested
 * components is called.
 */
const RemirrorContextProvider = <Combined extends AnyCombinedUnion>({
  childAsRoot: _,
  ...props
}: RemirrorContextProviderProps<Combined>) => {
  return <RemirrorContext.Provider {...props} />;
};

RemirrorContextProvider.$$remirrorType = RemirrorType.ContextProvider;
RemirrorContextProvider.defaultProps = {
  childAsRoot: false,
};

/**
 * The RemirrorProvider which injects context into it's child component.
 *
 * @remarks
 * This only supports one child. At the moment if that that child is a built in
 * html string element then it is also where the prosemirror editor will be
 * injected (root element).
 *
 * These can either be consumed using React Hooks
 * - `useRemirror`
 * - `usePositioner`
 */
export const RemirrorProvider = <Combined extends AnyCombinedUnion>(
  props: RemirrorProviderProps<Combined>,
) => {
  const { children, childAsRoot, ...rest } = props;

  return (
    <RenderEditor {...rest}>
      {(value) => {
        return (
          <RemirrorContextProvider value={value} childAsRoot={childAsRoot}>
            <RemirrorPortals portalContainer={value.portalContainer} />
            {oneChildOnly(children)}
          </RemirrorContextProvider>
        );
      }}
    </RenderEditor>
  );
};

RemirrorProvider.$$remirrorType = RemirrorType.EditorProvider;

export interface I18nProviderProps extends Partial<I18nContextProps> {
  children: ReactNode;
}

/**
 * A provider component for the remirror i18n helper library.
 */
export const I18nProvider = (props: I18nProviderProps) => {
  const { i18n = defaultI18n, locale = 'en', children } = props;

  useEffect(() => {
    i18n.activate(locale);
  }, [i18n, locale]);

  return <I18nContext.Provider value={{ i18n, locale }}>{children}</I18nContext.Provider>;
};

I18nProvider.$$remirrorType = RemirrorType.I18nProvider;
