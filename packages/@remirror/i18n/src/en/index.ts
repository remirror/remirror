import type { Messages } from '@lingui/core';

type EnMessages = Record<'user.mention.avatar.alt', Messages[string]>;

export interface EnLocale {
  /**
   * The messages available for the `en` locale.
   */
  messages: EnMessages;
}

export const en: EnLocale = { messages: { 'user.mention.avatar.alt': ['Avatar for ', ['name']] } };

export default en;
