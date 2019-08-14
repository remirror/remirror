import { ExtensionManager } from '@remirror/core';
import { InjectedRemirrorProps } from '@remirror/react-utils';
import { createContext } from 'react';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRemirrorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<ExtensionManager | null>(null);
