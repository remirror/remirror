import type { CSSProperties, ElementType, ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';

import type { AnyCombinedUnion, MakeOptional } from '@remirror/core';
import { RemirrorPortals, usePortals } from '@remirror/extension-react-component';
import { i18n as defaultI18n } from '@remirror/i18n';
import { RemirrorType } from '@remirror/react-utils';
import type { RemirrorThemeType } from '@remirror/theme';
import { createThemeVariables, themeStyles } from '@remirror/theme';

import { useManager, useRemirror } from './hooks';
import { useReactEditor } from './hooks/use-react-editor';
import { I18nContext, RemirrorContext } from './react-contexts';
import type { BaseProps, CreateReactManagerOptions, I18nContextProps } from './react-types';

export interface RemirrorProviderProps<Combined extends AnyCombinedUnion>
  extends MakeOptional<BaseProps<Combined>, 'manager'> {
  /**
   * The children for the `RemirrorProvider`.
   */
  children?: ReactNode;

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
   * Set this to `start` or `end` to automatically render the editor to the dom.
   *
   * When set to `start` the editor will be added before all other child
   * components. If `end` the editable editor will be added after all child
   * components.
   *
   * @default undefined
   */
  autoRender?: boolean | 'start' | 'end';
}

/**
 * A default internal editor for the react framework.
 */
const AutoRenderedEditor = () => <div {...useRemirror().getRootProps()} />;

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
  const { children, autoRender, manager, combined, settings, ...rest } = props;
  const context = useReactEditor({
    ...rest,
    manager: useManager(manager ?? combined ?? [], settings),
  });

  // Subscribe to updates from the [[`PortalContainer`]]
  const portals = usePortals(context.portalContainer);

  return (
    <RemirrorContext.Provider value={context}>
      <RemirrorPortals portals={portals} context={context} />
      {(autoRender === 'start' || autoRender === true) && <AutoRenderedEditor />}
      {children}
      {autoRender === 'end' && <AutoRenderedEditor />}
    </RemirrorContext.Provider>
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
