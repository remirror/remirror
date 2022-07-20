import { ComponentType, PropsWithChildren } from 'react';
import { AnyExtension, EditorState } from '@remirror/core';
import type { NodeViewComponentProps } from '@remirror/extension-react-component';

export type SsrTransformer = (element: JSX.Element, state?: EditorState) => JSX.Element;

export interface ManagerStoreReactComponent {
  Component: ComponentType<PropsWithChildren<NodeViewComponentProps>>;
  props: Omit<NodeViewComponentProps, 'node' | 'view'>;
}

declare global {
  namespace Remirror {
    interface ExcludeOptions {
      /**
       * Whether to use the SSR component when not in a DOM environment
       *
       * @default undefined
       */
      reactSSR?: boolean;
    }

    interface ManagerStore<Extension extends AnyExtension> {
      /**
       * The transformer for updating the SSR rendering of the prosemirror state
       * and allowing it to render without defects.
       */
      ssrTransformer: SsrTransformer;

      /**
       * Components for ssr transformations.
       */
      components: Record<string, ManagerStoreReactComponent>;
    }

    interface BaseExtension {
      /**
       * A method for transforming the original JSX element received by the
       * extension. This is typically for usage in server side rendered
       * environment.
       *
       * @remarks
       *
       * Some extensions add decorations to the ProsemirrorView based on their
       * state. These decorations can touch any node or mark and it would be
       * very difficult to model this without transforming the complete produced
       * JSX element.
       *
       * An example is that all empty paragraphs in prosemirror automatically
       * have a `<br />` tag injected into them during runtime. The
       * ReactSSRSerializer which transform the `toDOM` method output for
       * paragraph tags `[p, 0]` into JSX `<p />` has no way of knowing about
       * this. That is where this creator method can help. We can transform the
       * automatically generated JSX and inject `<br />` tags for the initial
       * server render. That way there is no jump or layout adjustment when the
       * document first loads on the browser.
       */
      createSSRTransformer?(): SsrTransformer;
    }
  }
}
