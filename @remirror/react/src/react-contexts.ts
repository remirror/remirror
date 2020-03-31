import { createContext } from 'react';

import { Manager } from '@remirror/core';

import { InjectedRemirrorProps } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRemirrorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<Manager | null>(null);
