import { createContext } from 'react';

import { RemirrorContextProps } from './react-types';

/**
 * Creates a ReactContext for the Remirror editor
 */
export const RemirrorContext = createContext<RemirrorContextProps<any> | null>(null);
