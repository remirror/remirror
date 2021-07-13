import updateNotifier from 'update-notifier';

import type { CommandContext } from './cli-types';

/**
 * Notify the user of available updates to the CLI.
 */
export function notifyUpdate(context: CommandContext): void {
  const { name, internal, version } = context;

  if (internal) {
    return;
  }

  updateNotifier({ pkg: { name, version } }).notify();
}

export const colors = { pink: '#ef5777', lightBlue: '#4bcffa' };
