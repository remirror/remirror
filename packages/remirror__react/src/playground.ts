import type { ComponentType } from 'react';
import * as remirrorExtensionReactComponent from '@remirror/extension-react-component';
import * as remirrorExtensionReactSsr from '@remirror/extension-react-ssr';
import * as remirrorPresetReact from '@remirror/preset-react';
import * as remirrorReactComponents from '@remirror/react-components';
import * as remirrorReactCore from '@remirror/react-core';
import * as remirrorReactHooks from '@remirror/react-hooks';
import * as remirrorReactRenderer from '@remirror/react-renderer';
import * as remirrorReactSsr from '@remirror/react-ssr';
import * as remirrorReactUtils from '@remirror/react-utils';

export const ReactPlaygroundImports = {
  '@remirror/extension-react-component': remirrorExtensionReactComponent,
  '@remirror/extension-react-ssr': remirrorExtensionReactSsr,
  '@remirror/preset-react': remirrorPresetReact,
  '@remirror/react-components': remirrorReactComponents,
  '@remirror/react-hooks': remirrorReactHooks,
  '@remirror/react-utils': remirrorReactUtils,
  '@remirror/react-core': remirrorReactCore,
  '@remirror/react-ssr': remirrorReactSsr,
  '@remirror/react-renderer': remirrorReactRenderer,
} as const;

export interface PlaygroundExportProps {
  /**
   * Use this component to add a debugger to the rendered editor.
   */
  DebugComponent: ComponentType<{ name?: string }>;
}
