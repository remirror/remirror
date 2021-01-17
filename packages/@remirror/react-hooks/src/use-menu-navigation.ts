/**
 * @module
 *
 * Create menu navigation handlers when within the editor.
 */

import { Reducer, useReducer } from 'react';
import { ValueOf } from 'type-fest';

export const MenuNavigationAction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
  Enter: 'enter',
  Escape: 'escape',
} as const;
export type MenuNavigationActionType = ValueOf<typeof MenuNavigationAction>;

// export function useMenuNavigation<State extends {index: number}>(reducer: ) {}
