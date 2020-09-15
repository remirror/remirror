import { createContext } from 'react';

import { i18n } from '@remirror/i18n';

import type { I18nContextProps, ReactFrameworkOutput } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<ReactFrameworkOutput<any> | null>(null);

/**
 * Create the context for the i18n framework used within remirror.
 */
export const I18nContext = createContext<I18nContextProps>({ i18n, locale: 'en' });
