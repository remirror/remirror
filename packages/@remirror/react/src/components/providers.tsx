import type { ReactChild, ReactFragment } from 'react';
import React, {
  CSSProperties,
  ElementType,
  ProviderProps,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
} from 'react';

import type { AnyCombinedUnion, MakeOptional } from '@remirror/core';
import { i18n as defaultI18n } from '@remirror/i18n';
import { RemirrorType } from '@remirror/react-utils';
import type { RemirrorThemeType } from '@remirror/theme';
import { createThemeVariables, themeStyles } from '@remirror/theme';

import { useManager } from '../hooks';
import { I18nContext, RemirrorContext } from '../react-contexts';
import type {
  BaseProps,
  CreateReactManagerOptions,
  GetRootPropsConfig,
  I18nContextProps,
  RemirrorContextProps,
} from '../react-types';
import { ReactEditor } from './react-editor';

interface RemirrorContextProviderProps<Combined extends AnyCombinedUnion>
  extends ProviderProps<RemirrorContextProps<Combined>>,
    Pick<RemirrorProviderProps<Combined>, 'childAsRoot'> {}

export interface RemirrorProviderProps<Combined extends AnyCombinedUnion>
  extends MakeOptional<BaseProps<Combined>, 'manager'> {
  /**
   * The `RemirrorProvider` only supports **ONE** child element. You can place
   * the child element in a fragment if needed.
   */
  children: ReactChild | ReactFragment | ReactPortal;

  /**
   * The presets and extensions that you would like to use to automatically
   * create the manager.
   *
   * These extensions and presets can't be updated and are not dynamic. You
   * should not change they during the component lifecycle as they are created
   * once at the very start and never recreated.
   */
  combined?: Combined[];

  /**
   * The settings to provide to the `RemirrorManager`, `ReactPreset` and
   * `CorePreset`. This is only applied when no `manager` is provided.
   */
  settings?: CreateReactManagerOptions;

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
   * @default undefined
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
): ReactElement<RemirrorProviderProps<Combined>> => {
  const { children, childAsRoot, manager, combined, settings, ...rest } = props;

  return (
    <ReactEditor {...rest} manager={useManager(manager ?? combined ?? [], settings)}>
      {(value) => {
        return (
          <RemirrorContextProvider value={value} childAsRoot={childAsRoot}>
            {children}
          </RemirrorContextProvider>
        );
      }}
    </ReactEditor>
  );
};

RemirrorProvider.$$remirrorType = RemirrorType.Provider;

export interface I18nProviderProps extends Partial<I18nContextProps> {
  children: ReactNode;
}

/**
 * A provider component for the remirror i18n helper library.
 *
 * This uses `@lingui/core` in the background. So please star and support the
 * project when you have a moment.
 */
export const I18nProvider = (props: I18nProviderProps): ReactElement<I18nProviderProps> => {
  const { i18n = defaultI18n, locale = 'en', supportedLocales, children } = props;

  useEffect(() => {
    i18n.activate(locale, supportedLocales ?? [locale]);
  }, [i18n, locale, supportedLocales]);

  return (
    <I18nContext.Provider value={{ i18n, locale, supportedLocales }}>
      {children}
    </I18nContext.Provider>
  );
};

I18nProvider.$$remirrorType = RemirrorType.I18nProvider;

export interface ThemeProviderProps {
  /**
   * The theme to customise the look and feel of your remirror editor.
   */
  theme: RemirrorThemeType;

  /**
   * The custom component to use for rendering this editor.
   *
   * @default 'div'
   */
  as?: ElementType<{ style?: CSSProperties; className?: string }>;

  children: ReactNode;
}

/**
 * This the `ThemeProvider`. Wrap your editor with it to customise the theming
 * of content within your editor.
 *
 * Please be aware that this wraps your component in an extra dom layer.
 */
export const ThemeProvider = (props: ThemeProviderProps): ReactElement<ThemeProviderProps> => {
  const { theme, children, as: Component = 'div' } = props;

  return (
    <Component style={createThemeVariables(theme).styles} className={themeStyles}>
      {children}
    </Component>
  );
};

ThemeProvider.$$remirrorType = RemirrorType.ThemeProvider;
