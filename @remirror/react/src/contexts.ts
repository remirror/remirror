import { Cast, ExtensionManager } from '@remirror/core';
import { createContext } from 'react';
import { InjectedRemirrorProps } from './types';

/**
 * Creates a ReactContext for the RemirrorEditor component
 */
export const RemirrorEditorContext = createContext<InjectedRemirrorProps>(Cast<InjectedRemirrorProps>({}));

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<ExtensionManager>(ExtensionManager.create([]));
