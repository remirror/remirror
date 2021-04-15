/**
 * @module
 *
 * This is an internal module which is only used for the playground. The purpose
 * is to provide all the scoped remirror packages to the playground without
 * needing to import them all within the `@remirror/playground`.
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see `support/scripts/src/generate-playground.ts`
 */

import type { ComponentType } from 'react';
import * as remirrorExtensionPlaceholder from '@remirror/extension-placeholder';
import * as remirrorExtensionPositioner from '@remirror/extension-positioner';
import * as remirrorExtensionReactComponent from '@remirror/extension-react-component';
import * as remirrorExtensionReactSsr from '@remirror/extension-react-ssr';
import * as remirrorExtensionReactTables from '@remirror/extension-react-tables';
import * as remirrorPresetReact from '@remirror/preset-react';
import * as remirrorReactComponents from '@remirror/react-components';
import * as remirrorReactCore from '@remirror/react-core';
import * as remirrorReactHooks from '@remirror/react-hooks';
import * as remirrorReactRenderer from '@remirror/react-renderer';
import * as remirrorReactSsr from '@remirror/react-ssr';
import * as remirrorReactUtils from '@remirror/react-utils';

export const ReactPlaygroundImports = {
  '@remirror/extension-placeholder': remirrorExtensionPlaceholder,
  '@remirror/extension-positioner': remirrorExtensionPositioner,
  '@remirror/extension-react-component': remirrorExtensionReactComponent,
  '@remirror/extension-react-ssr': remirrorExtensionReactSsr,
  '@remirror/extension-react-tables': remirrorExtensionReactTables,
  '@remirror/preset-react': remirrorPresetReact,
  '@remirror/react-components': remirrorReactComponents,
  '@remirror/react-core': remirrorReactCore,
  '@remirror/react-hooks': remirrorReactHooks,
  '@remirror/react-renderer': remirrorReactRenderer,
  '@remirror/react-ssr': remirrorReactSsr,
  '@remirror/react-utils': remirrorReactUtils,
} as const;

export interface PlaygroundExportProps {
  /**
   * Use this component to add a debugger to the rendered editor.
   */
  DebugComponent: ComponentType<{ name?: string }>;
}
