import { EditorState, NodeViewPortalContainer, RemirrorContentType } from '@remirror/core';
import { RemirrorSSR } from '@remirror/react-ssr';
import { RemirrorProps } from '@remirror/react-utils';
import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { WebView } from 'react-native-webview';

export interface RemirrorNativeProps
  extends Pick<RemirrorProps, 'initialContent' | 'manager' | 'stringHandler'> {
  /**
   * The function that takes the preRendered HTML and injects a fully formed html string into the dom.
   *
   * @remarks
   * This function should be generated via `@remirror/cli`
   *
   * ```bash
   * yarn add @remirror/cli
   * yarn remirror bundle --language=typescript --output inject-html.ts <source>
   * ```
   */
  injectHtml(reactString: string): string;
}

interface RemirrorNativeState {
  editorState: EditorState;
}

/**
 * A native remirror component
 */
export class RemirrorNative extends Component<RemirrorNativeProps, RemirrorNativeState> {
  /**
   * The portal container which is purely a noop for now
   */
  private readonly portalContainer: NodeViewPortalContainer = new NodeViewPortalContainer();

  constructor(props: RemirrorNativeProps) {
    super(props);

    props.manager.init({ getState: () => this.state.editorState, portalContainer: this.portalContainer });
    this.state = { editorState: this.createStateFromContent(props.initialContent) };
  }

  /**
   * Create the editor state from a remirror content type.
   */
  private createStateFromContent(content: RemirrorContentType): EditorState {
    return this.props.manager.createState({ content, stringHandler: this.props.stringHandler });
  }

  private generateContent(content: RemirrorContentType) {
    const { manager, injectHtml } = this.props;
    const reactString = renderToString(
      <RemirrorSSR manager={manager} state={this.createStateFromContent(content)} attributes={{}} />,
    );

    return { html: injectHtml(reactString) };
  }

  public render() {
    return <WebView source={this.generateContent(this.props.initialContent)} />;
  }
}
