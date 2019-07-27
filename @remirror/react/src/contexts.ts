import { ExtensionManager } from '@remirror/core';
import { InjectedPortalContextProps, InjectedRemirrorProps } from '@remirror/react-utils';
import { createContext } from 'react';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRemirrorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<ExtensionManager | null>(null);

/**
 * Creates the context that is available to all NodeView Components.
 */
export const NodeViewPortalContext = createContext<InjectedPortalContextProps | null>(null);
