import { ComponentType } from 'react';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  EditorView,
  extension,
  ExtensionPriority,
  ExtensionTag,
  getTextSelection,
  Handler,
  isNumber,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeType,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorNode,
  ProsemirrorPlugin,
  Transaction,
} from '@remirror/core';
import { PasteRule } from '@remirror/pm/paste-rules';
import { NodeViewComponentProps } from '@remirror/react';

import { FileComponent, FileComponentProps } from './file-component';
import { ActionType } from './file-placeholder-actions';
import {
  findPlaceholderPayload,
  findPlaceholderPos,
  placeholderPlugin,
  setPlaceholderAction,
} from './file-placeholder-plugin';
import { createUploadContext, UploadContext } from './file-upload-context';
import { FileUploader } from './file-uploader';
import { createDataUrlFileUploader } from './file-uploaders';

export interface FileOptions {
  uploadFileHandler?: UploadFileHandler;
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
    const payload: PlaceholderPayload | undefined = findPlaceholderPayload(
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
        id: { default: null },
        ...extra.defaults(),
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
    return uploadFile({
      file,
      pos,
      view: this.store.view,
      fileType: this.type,
      uploadFileHandler: this.options.uploadFileHandler,
    });
  }
}

interface PlaceholderPayload {
  context: UploadContext;
  fileUploader: FileUploader;
}

type FileId = Record<never, never>;

export interface FileAttributes {
  // A temporary unique id during the file loading process
  id?: FileId | null;
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  error?: string | null;
}

type UploadFileHandler = () => FileUploader;

/**
 * Try to find a point where a node of the given type can be inserted
 * near `pos`, by searching up the node hierarchy when `pos` itself
 * isn't a valid place. Return null if no position was found.
 *
 * This function is similar to `insertPoint` from `prosemirror-transform`,
 * but it will also search for a valid position even if the `pos` is in the
 * middle of a node.
 */
function insertFilePoint(doc: ProsemirrorNode, pos: number, nodeType: NodeType): number | null {
  const $pos = doc.resolve(pos);

  if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType)) {
    return pos;
  }

  if ($pos.parentOffset === 0) {
    for (let d = $pos.depth - 1; d >= 0; d--) {
      const index = $pos.index(d);

      if ($pos.node(d).canReplaceWith(index, index, nodeType)) {
        return $pos.before(d + 1);
      }

      if (index > 0) {
        return null;
      }
    }
  }

  for (let d = $pos.depth - 1; d >= 0; d--) {
    const index = $pos.indexAfter(d);

    if ($pos.node(d).canReplaceWith(index, index, nodeType)) {
      return $pos.after(d + 1);
    }

    if (index < $pos.node(d).childCount) {
      return null;
    }
  }

  return null;
}

function createFilePlaceholder({
  id,
  context,
  file,
  pos,
  view,
  fileType,
  uploadFileHandler,
}: {
  id: FileId;
  context: UploadContext;
  file: File;
  pos: number | undefined;
  view: EditorView;
  fileType: NodeType;
  uploadFileHandler: UploadFileHandler;
}): FileUploader | void {
  const tr = view.state.tr;
  const insertPos = insertFilePoint(tr.doc, isNumber(pos) ? pos : tr.selection.from, fileType);

  if (!isNumber(insertPos)) {
    // failed to find a postition to insert the file node
    return;
  }

  // create a fileUploader, which will read and/or upload the file later
  const fileUploader = uploadFileHandler();

  // insert the file node
  const attrs: FileAttributes = { ...fileUploader.insert(file), id };
  tr.insert(insertPos, fileType.createChecked(attrs));

  // insert the placeholder decoration
  const payload: PlaceholderPayload = { context, fileUploader };
  setPlaceholderAction(tr, { type: ActionType.ADD_PLACEHOLDER, id, pos: insertPos, payload });

  view.dispatch(tr);

  return fileUploader;
}

function onFileLoaded({
  id,
  attrs,
  fileType,
  view,
}: {
  id: FileId;
  attrs: FileAttributes;
  fileType: NodeType;
  view: EditorView;
}) {
  const placeholderPos = findPlaceholderPos(view.state, id);

  // unexpected
  if (placeholderPos == null) {
    return;
  }

  const $pos = view.state.doc.resolve(placeholderPos);
  const fileNode = $pos.nodeAfter;

  // if the file node around the placeholder has been deleted, then delete
  // the placeholder and drop the uploaded file.
  if (!fileNode || fileNode.type !== fileType || fileNode.attrs.id !== id) {
    const tr = view.state.tr;
    setPlaceholderAction(tr, { type: ActionType.REMOVE_PLACEHOLDER, id });
    view.dispatch(tr);
    return;
  }

  // Update the file node at the placeholder's position, and remove
  // the placeholder.
  const tr = view.state.tr;
  setPlaceholderAction(tr, { type: ActionType.REMOVE_PLACEHOLDER, id });
  const fileAttrs: FileAttributes = {
    ...fileNode.attrs,
    ...attrs,
    id: null,
  };
  tr.setNodeMarkup(placeholderPos, undefined, fileAttrs);
  view.dispatch(tr);
}

function uploadFile({
  file,
  pos,
  view,
  fileType,
  uploadFileHandler,
}: {
  file: File;
  pos: number | undefined;
  view: EditorView;
  fileType: NodeType;
  uploadFileHandler: UploadFileHandler;
}): void {
  // A fresh object to act as the ID for this upload.
  const id: FileId = {};

  const context = createUploadContext();

  const fileUploader = createFilePlaceholder({
    id,
    context,
    file,
    pos,
    view,
    fileType,
    uploadFileHandler,
  });

  fileUploader
    ?.upload(context)
    .then((attrs) => onFileLoaded({ id, fileType, view, attrs }))
    .catch((error) => onFileLoaded({ id, fileType, view, attrs: { error: error.message } }));
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      file: FileExtension;
    }
  }
}
