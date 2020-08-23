import { cx } from 'linaria';
import { parse, stringify } from 'tiny-querystring';

import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  findSelectedNodeOfType,
  NodeExtension,
  NodeExtensionSpec,
  object,
  ProsemirrorAttributes,
  Shape,
  Static,
} from '@remirror/core';

export interface IframeOptions {
  /**
   * The default source to use for the iframe.
   */
  defaultSource?: Static<string>;

  /**
   * The class to add to the iframe.
   *
   * @defaultValue 'remirror-iframe'
   */
  class?: Static<string>;
}

export type IframeAttributes = ProsemirrorAttributes<{
  src: string;
  frameBorder?: number | string;
  allowFullScreen?: 'true';
  width?: string | number;
  height?: string | number;
  type?: 'custom' | 'youtube';
}>;

/**
 * An extension for the remirror editor.
 */
@extensionDecorator<IframeOptions>({
  defaultOptions: {
    defaultSource: '',
    class: 'remirror-iframe',
  },
  staticKeys: ['class', 'class'],
})
export class IframeExtension extends NodeExtension<IframeOptions> {
  get name() {
    return 'iframe' as const;
  }

  readonly tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    const { defaultSource } = this.options;

    return {
      attrs: {
        ...extra.defaults(),
        src: defaultSource ? { default: defaultSource } : {},
        allowFullScreen: { default: true },
        frameBorder: { default: 0 },
        type: { default: 'custom' },
        width: { default: null },
        height: { default: null },
      },
      selectable: false,
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs: (dom) => {
            const frameBorder = (dom as HTMLElement).getAttribute('frameborder');
            return {
              ...extra.parse(dom),
              type: (dom as HTMLElement).getAttribute('data-embed-type'),
              height: (dom as HTMLElement).getAttribute('height'),
              width: (dom as HTMLElement).getAttribute('width'),
              allowFullScreen:
                (dom as HTMLElement).getAttribute('allowfullscreen') === 'false' ? false : true,
              frameBorder: frameBorder ? Number.parseInt(frameBorder, 10) : 0,
              src: (dom as HTMLElement).getAttribute('src'),
            };
          },
        },
      ],
      toDOM: (node) => {
        const { frameBorder, allowFullScreen, src, type, ...rest } = node.attrs;
        const { class: className } = this.options;

        return [
          'iframe',
          {
            ...extra.dom(node),
            ...rest,
            class: cx(className, `${className}-${type as string}`),
            src,
            'data-embed-type': type,
            allowfullscreen: allowFullScreen ? 'true' : 'false',
            frameBorder: frameBorder.toString(),
          },
        ];
      },
    };
  }

  /**
   * Provides the commands for the iFrame extension.
   */
  createCommands() {
    return {
      /**
       * Add a custom iFrame to the editor.
       */
      addIframe: this.addIframe,

      /**
       * Add a YouTube embedded iFrame to the editor.
       */
      addYouTubeVideo: this.addYouTubeVideo,

      /**
       * Update the iFrame source for the currently selected video.
       */
      updateIframeSource: this.updateIframeSource,

      /**
       * Update the YouTube video iFrame.
       */
      updateYouTubeVideo: this.updateYouTubeVideo,
    };
  }

  /**
   * Creates the command for adding an iFrame to the editor.
   */
  private readonly addIframe = (attributes: IframeAttributes): CommandFunction => {
    return ({ state, dispatch }) => {
      const tr = state.tr.replaceSelectionWith(this.type.create(attributes));

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
  };

  /**
   * The command for adding a YouTube iframe.
   */
  private readonly addYouTubeVideo = (parameter: CreateYouTubeIframeParameter): CommandFunction => {
    return this.addIframe({
      src: createYouTubeUrl(parameter),
      frameBorder: 0,
      type: 'youtube',
      allowFullScreen: 'true',
    });
  };

  /**
   * Creates the command for updating the iFrame source.
   */
  private readonly updateIframeSource = (src: string): CommandFunction => {
    return ({ state, dispatch }) => {
      const { tr } = state;
      const found = findSelectedNodeOfType({ selection: tr.selection, types: this.type });

      if (!found) {
        return false;
      }

      tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, src });

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
  };

  private readonly updateYouTubeVideo = (
    parameter: CreateYouTubeIframeParameter,
  ): CommandFunction => {
    return this.updateIframeSource(createYouTubeUrl(parameter));
  };
}

interface CreateYouTubeIframeParameter {
  /**
   * The video id (dQw4w9WgXcQ) or full link (https://www.youtube.com/watch?v=dQw4w9WgXcQ).
   */
  video: string;

  /**
   * The number os seconds in to start at.
   * @defaultValue `0`
   */
  startAt?: number;

  /**
   * When true will show the player controls.
   *
   * @defaultValue `true`
   */
  showControls?: boolean;

  /**
   * According to YouTube: _When you turn on privacy-enhanced mode, YouTube
   * won't store information about visitors on your website unless they play the
   * video._
   *
   * @defaultValue `true`
   */
  enhancedPrivacy?: boolean;
}

/**
 * A Url parser that relies on the browser for the majority of the work.
 */
function parseUrl(url: string) {
  const parser = document.createElement('a');

  // Let the browser do the work
  parser.href = url;

  const searchObject = parse(parser.search.replace(/^\?/, ''));

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject,
    hash: parser.hash,
  };
}

function createYouTubeUrl(parameter: CreateYouTubeIframeParameter) {
  const { video, enhancedPrivacy = true, showControls = true, startAt = 0 } = parameter;
  const id: string = (parseUrl(video)?.searchObject?.v as string) ?? video;
  const urlStart = enhancedPrivacy ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
  const searchObject = object<Shape>();

  if (!showControls) {
    searchObject.controls = '0';
  }

  if (startAt) {
    searchObject['amp;start'] = startAt;
  }

  return `${urlStart}/embed/${id}?${stringify(searchObject)}`;
}
