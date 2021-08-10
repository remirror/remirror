import { ComponentType } from 'react';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionPriority,
  ExtensionTag,
  getTextSelection,
  Handler,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorNode,
  ProsemirrorPlugin,
  Transaction,
} from '@remirror/core';
import { PasteRule } from '@remirror/pm/paste-rules';
import { NodeViewComponentProps } from '@remirror/react';

import { FileComponent, FileComponentProps } from './file-component';
import { findPlaceholderPayload, placeholderPlugin } from './file-placeholder-plugin';
import { PlaceholderPayload, uploadFile, UploadFileHandler } from './file-upload';
import { createDataUrlFileUploader } from './file-uploaders';

export interface FileOptions {
  uploadFileHandler?: UploadFileHandler<FileAttributes>;
  render?: (props: FileComponentProps) => React.ReactElement<HTMLElement> | null;

  /**
   * A regex test for the file type when users paste files.
   *
   * @default /^((?!image).)*$/i - Only match non-image files, as image files
   * will be handled by the `ImageExtension`.
   */
  pasteRuleRegexp?: RegExp;

  /**
   * Called after the `commands.deleteFile` has been called.
   */
  onDeleteFile?: Handler<(props: { tr: Transaction; pos: number; node: ProsemirrorNode }) => void>;
}

@extension<FileOptions>({
  defaultOptions: {
    uploadFileHandler: createDataUrlFileUploader,
    render: FileComponent,
    pasteRuleRegexp: /^((?!image).)*$/i,
  },
  handlerKeys: ['onDeleteFile'],
})
export class FileExtension extends NodeExtension<FileOptions> {
  get name() {
    return 'file' as const;
  }

  ReactComponent: ComponentType<NodeViewComponentProps> = (props) => {
    const payload: PlaceholderPayload<FileAttributes> | undefined = findPlaceholderPayload(
      props.view.state,
      props.node.attrs.id,
    );
    const context = payload?.context;
    const abort = () => payload?.fileUploader.abort();
    return this.options.render({ ...props, context, abort });
  };

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        id: { default: null },
        url: { default: '' },
        fileName: { default: '' },
        fileType: { default: '' },
        fileSize: { default: 0 },
        error: { default: null },
      },
      ...override,
      selectable: false,
      draggable: true,
      atom: true,
      content: '',
      parseDOM: [
        {
          tag: 'div[data-file]',
          priority: ExtensionPriority.Low,
          getAttrs: (dom) => {
            const anchor = dom as HTMLAnchorElement;
            const url = anchor.getAttribute('href');
            const fileName = anchor.getAttribute('data-filename');
            const fileType = anchor.getAttribute('data-filetype');
            const fileSize = anchor.getAttribute('data-filesize');

            return {
              ...extra.parse(dom),
              url,
              fileName,
              fileType,
              fileSize,
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { url, ...rest } = omitExtraAttributes(node.attrs, extra);
        const attrs = {
          ...extra.dom(node),
          ...rest,
          href: url,
          'data-file': '',
          'data-filename': node.attrs.fileName,
          'data-filetype': node.attrs.fileType,
          'data-filesize': node.attrs.fileSize,
        };

        return ['div', attrs];
      },
    };
  }

  createExternalPlugins(): ProsemirrorPlugin[] {
    return [placeholderPlugin];
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: 'file',
        regexp: this.options.pasteRuleRegexp,
        fileHandler: (props) => {
          let pos: number | undefined;

          if (props.type === 'drop') {
            pos = props.pos;
          }

          for (const file of props.files) {
            this.uploadFile(file, pos);
          }

          return true;
        },
      },
    ];
  }

  @command()
  uploadFiles(files: File[]): CommandFunction {
    return () => {
      for (const file of files) {
        this.uploadFile(file);
      }

      return true;
    };
  }

  @command()
  updateFile(pos: number, attrs: FileAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.setNodeMarkup(pos, undefined, attrs));
      return true;
    };
  }

  @command()
  insertFile(attributes: FileAttributes, selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const node = this.type.create(attributes);

      dispatch?.(tr.replaceRangeWith(from, to, node));

      return true;
    };
  }

  @command()
  deleteFile(pos: number): CommandFunction {
    return ({ tr, state, dispatch }) => {
      const node = state.doc.nodeAt(pos);

      if (node && node.type === this.type) {
        tr.delete(pos, pos + 1).scrollIntoView();
        this.options.onDeleteFile({ tr, pos, node });
        dispatch?.(tr);
        return true;
      }

      return false;
    };
  }

  @command()
  renameFile(pos: number, fileName: string): CommandFunction {
    return ({ tr, state, dispatch }) => {
      const node = state.doc.nodeAt(pos);

      if (node && node.type === this.type) {
        dispatch?.(tr.setNodeMarkup(pos, undefined, { ...node.attrs, fileName }));
        return true;
      }

      return false;
    };
  }

  private uploadFile(file: File, pos?: number | undefined): void {
    return uploadFile<FileAttributes>({
      file,
      pos,
      view: this.store.view,
      fileType: this.type,
      uploadFileHandler: this.options.uploadFileHandler,
    });
  }
}

export interface FileAttributes {
  // A temporary unique id during the file loading process
  id?: unknown;
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  error?: string | null;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      file: FileExtension;
    }
  }
}
