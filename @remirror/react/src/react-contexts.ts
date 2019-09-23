import { ExtensionManager } from '@remirror/core';
import { createContext } from 'react';
import { InjectedRemirrorProps } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRemirrorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<ExtensionManager | null>(null);
