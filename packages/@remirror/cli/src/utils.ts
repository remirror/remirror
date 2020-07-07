import updateNotifier from 'update-notifier';

import { CommandContext } from './types';

/**
 * Notify the user of available updates to the CLI.
 */
export const notifyUpdate = (context: CommandContext) => {
  const { name, internal, version } = context;

  if (internal) {
    return;
  }

  updateNotifier({ pkg: { name, version } }).notify();
};

export const colors = { pink: '#ef5777', lightBlue: '#4bcffa' };
