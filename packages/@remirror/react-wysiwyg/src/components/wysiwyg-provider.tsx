import React, { FC } from 'react';

import { WysiwygPreset } from '@remirror/preset-wysiwyg';
import { I18nProvider, RemirrorProvider, ThemeProvider } from '@remirror/react';

import { useWysiwygManager } from '../hooks';
import type { WysiwygProviderProps } from '../wysiwyg-types';

/**
 * A wysiwyg editor provider with provides the required context to get started
 * creating your next editor.
 */
export const WysiwygProvider: FC<WysiwygProviderProps> = (props) => {
  const {
    theme,
    ThemeComponent,
    children,
    i18n,
    locale,
    combined,
    manager,
    settings,
    ...rest
  } = props;
  const wysiwygManager = useWysiwygManager(manager ?? combined ?? [], settings);

  // Check that the wysiwyg manager includes the required WysiwygPreset
  wysiwygManager.getPreset(WysiwygPreset);

  return (
    <I18nProvider i18n={i18n} locale={locale}>
      <RemirrorProvider {...rest} manager={wysiwygManager} childAsRoot={false}>
        <ThemeProvider theme={theme ?? {}} as={ThemeComponent}>
          {children}
        </ThemeProvider>
      </RemirrorProvider>
    </I18nProvider>
  );
};
