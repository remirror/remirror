import React, { FC } from 'react';

import { SocialPreset } from '@remirror/preset-social';
import { I18nProvider, RemirrorProvider, ThemeProvider } from '@remirror/react';

import { useSocialManager } from '../hooks';
import { SocialProviderProps } from '../social-types';

/**
 * A social editor provider with provides the required context to get started
 * creating your next editor.
 */
export const SocialProvider: FC<SocialProviderProps> = (props) => {
  const {
    theme,
    ThemeComponent,
    children,
    i18n,
    locale,
    characterLimit,
    combined,
    manager,
    settings,
    ...rest
  } = props;
  const socialManager = useSocialManager(manager ?? combined ?? [], settings);

  // Check that the social manager includes the required SocialPreset
  socialManager.getPreset(SocialPreset);

  return (
    <I18nProvider i18n={i18n} locale={locale}>
      <RemirrorProvider {...rest} manager={socialManager} childAsRoot={false}>
        <ThemeProvider theme={theme ?? {}} as={ThemeComponent}>
          {children}
        </ThemeProvider>
      </RemirrorProvider>
    </I18nProvider>
  );
};
