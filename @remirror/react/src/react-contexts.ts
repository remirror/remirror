import { createContext } from 'react';

import { Manager } from '@remirror/core';

import { InjectedRenderEditorProps } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRenderEditorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<Manager | null>(null);
