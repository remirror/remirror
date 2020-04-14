import { createContext } from 'react';

import { EditorManager } from '@remirror/core';

import { InjectedRenderEditorProps } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<InjectedRenderEditorProps | null>(null);

/**
 * Creates a ReactContext for the RemirrorManager component
 */
export const RemirrorManagerContext = createContext<EditorManager | null>(null);
