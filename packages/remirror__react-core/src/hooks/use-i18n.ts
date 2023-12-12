import { useContext } from 'react';
import type { I18nFormatter } from '@remirror/core';

import { I18nContext } from '../contexts';

export type UseI18nReturn = I18nFormatter;

export function useI18n(): UseI18nReturn {
  return useContext(I18nContext);
}
