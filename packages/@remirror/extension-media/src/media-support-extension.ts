import {
  CommandFunction,
  CreateExtensionPlugin,
  delayedCommand,
  DelayedValue,
  EditorView,
  ErrorConstant,
  extension,
  invariant,
  Mark,
  NodeType,
  PlainExtension,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { PasteRule } from '@remirror/pm/paste-rules';

export interface MediaSupportOptions {
  createPlaceholder?: (view: EditorView, pos: number) => HTMLElement;
  updatePlaceholder?: (
    view: EditorView,
    pos: number,
    element: HTMLElement,
    progress: number,
  ) => void;
  destroyPlaceholder?: (view: EditorView, element: HTMLElement) => void;

  /**
   * The upload handler for the image extension.
   *
   * It receives a list of dropped or pasted files and returns a promise for the
   * attributes which should be used to insert the image into the editor.
   *
   * @param files - a list of files to upload.
   * @param setProgress - the progress handler.
   */
  uploadHandler?: (files: FileWithProgress[]) => MediaUpload[];
}

type MediaUpload = DelayedValue<ProsemirrorAttributes>;

interface FileWithProgress {
  file: File;
  progress: SetProgress;
}

/**
 * Set the progress.
 *
 * @param progress - a value between `0` and `1`.
 */
type SetProgress = (progress: number) => void;

/**
 * Add media support to the editor.
 */
@extension<MediaSupportOptions>({
  defaultOptions: {
    createPlaceholder,
    destroyPlaceholder: (_, element) => element.remove(),
    updatePlaceholder: () => {},
    uploadHandler,
  },
})
export class MediaSupportExtension extends PlainExtension<MediaSupportOptions> {
  get name() {
    return 'mediaSupport' as const;
  }

  /**
   * Set up the media handlers for the editor.
   */
  onCreate(): void {
    // Create the media handlers for the editor. The file paste rules, embed paste rules, etc.
  }

  /**
   *
   */
  createPlugin(): CreateExtensionPlugin {
    return {};
  }

  createCommands() {
    return {
      /**
       * Insert a file and automatically infer the media node which should be
       * used based on media extension within the editor.
       */
      insertMedia: (): CommandFunction => () => {
        return false;
      },

      /**
       * Replace the provided selection or range with a media node.
       *
       * -
       * - Check if the selection is valid.
       * - Replace the current selection
       *
       */
      replaceWithMedia: (): CommandFunction => () => {
        return false;
      },

      /**
       * Insert an image once the provide promise resolves.
       */
      uploadMedia: (
        type: string | NodeType,
        value: DelayedValue<{
          attrs?: ProsemirrorAttributes;
          marks: Mark[];
          content: ProsemirrorNode[] | ProsemirrorNode;
        }>,
      ): CommandFunction => {
        return this.store.createPlaceholderCommand({
          placeholder: {
            type: 'widget',
            pos: anchor,
            createElement: (view, pos) => {
              return createPlaceholder(view, pos);
            },
            onUpdate: (view, pos, element, data) => {
              updatePlaceholder(view, pos, element, data);
            },
            onDestroy: (view, element) => {
              destroyPlaceholder(view, element);
            },
          },
        });
        return delayedCommand({
          promise: value,
          immediate: (parameter) => {
            const { empty, anchor } = parameter.tr.selection;
            const { createPlaceholder, updatePlaceholder, destroyPlaceholder } = this.options;

            return this.store.commands.original.addPlaceholder(
              value,
              {
                type: 'widget',
                pos: anchor,
                createElement: (view, pos) => {
                  return createPlaceholder(view, pos);
                },
                onUpdate: (view, pos, element, data) => {
                  updatePlaceholder(view, pos, element, data);
                },
                onDestroy: (view, element) => {
                  destroyPlaceholder(view, element);
                },
              },
              !empty,
            )(parameter);
          },

          // Add the node once done.
          onDone: ({ value, ...rest }) => {
            const range = this.store.helpers.findPlaceholder(value);

            if (!range) {
              return false;
            }

            this.store.chain
              .removePlaceholder(value)
              .insertNode(type, { ...value, range })
              .run();

            return true;
          },

          // Cleanup in case of an error.
          onFail: (parameter) => this.store.commands.removePlaceholder.original(value)(parameter),
        });
      },
    };
  }

  private fileUploadHandler(files: File[]) {
    const { commands, chain } = this.store;
    const filesWithProgress: FileWithProgress[] = files.map((file, index) => ({
      file,
      progress: (progress) => {
        commands.updatePlaceholder(uploads[index], progress);
      },
    }));

    const uploads = this.options.uploadHandler(filesWithProgress);

    for (const upload of uploads) {
      chain.uploadImage(upload);
    }

    chain.run();
    return true;
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: 'file',
        regexp: /image/i,
        fileHandler: ({ files }) => this.fileUploadHandler(files),
      },
    ];
  }
}

function createPlaceholder(view: EditorView, pos: number): HTMLElement {
  const element = document.createElement('div');
  element.classList.add(ClassNames.ExtensionMedia.MEDIA_LOADER);

  return element;
}

/**
 * The default handler converts the files into their `base64` representations
 * and adds the attributes before inserting them into the editor.
 */
function uploadHandler(files: FileWithProgress[]): MediaUpload[] {
  invariant(files.length > 0, {
    code: ErrorConstant.EXTENSION,
    message: 'The upload handler was applied for the image extension without any valid files',
  });

  let completed = 0;
  const promises: Array<Promise<ProsemirrorAttributes>> = [];

  for (const { file, progress } of files) {
    promises.push(
      new Promise<ProsemirrorAttributes>((resolve) => {
        const reader = new FileReader();

        reader.addEventListener(
          'load',
          (readerEvent) => {
            completed += 1;
            progress(1);
            resolve({
              src: readerEvent.target?.result as string,
              fileName: file.name,
            });
          },
          { once: true },
        );

        reader.readAsDataURL(file);
      }),
    );
  }

  return promises;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      media: MediaSupportExtension;
    }
  }
}
