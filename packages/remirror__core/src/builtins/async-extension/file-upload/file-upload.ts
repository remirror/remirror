import { isNumber, uniqueId } from '@remirror/core-helpers';
import { ProsemirrorNode } from '@remirror/pm';
import { NodeType } from '@remirror/pm/model';
import { EditorView } from '@remirror/pm/view';

import { ActionType } from '../file-placeholder-actions';
import { findUploadPlaceholderPos, setUploadPlaceholderAction } from '../file-placeholder-plugin';
import { FileUploader } from '../file-uploader';
import { createUploadContext, UploadContext } from '../upload-context';

/**
 * Any `ProsemirrorNode` can use the `uploadFile` function in this file as long
 * as its attributes implement this interface.
 */
interface AbstractNodeAttributes {
  // A temporary unique during the upload progress.
  id?: any;

  // The reason of the upload failure.
  error?: string | null;
}

export type UploadFileHandler<NodeAttributes> = () => FileUploader<NodeAttributes>;

export interface UploadPlaceholderPayload<NodeAttributes extends AbstractNodeAttributes> {
  context: UploadContext;
  fileUploader: FileUploader<NodeAttributes>;
}

export interface UploadFileProps<NodeAttributes extends AbstractNodeAttributes = object> {
  file: File;
  pos: number | undefined;
  view: EditorView;
  fileType: NodeType;
  uploadHandler: UploadFileHandler<NodeAttributes>;
}

/**
 * Insert a file into the editor and upload it.
 */
export function uploadFile<NodeAttributes extends AbstractNodeAttributes>({
  file,
  pos,
  view,
  fileType,
  uploadHandler,
}: UploadFileProps<NodeAttributes>): void {
  const id = uniqueId('file-placeholder-');

  const context = createUploadContext();

  const fileUploader = createFilePlaceholder<NodeAttributes>({
    id,
    context,
    file,
    pos,
    view,
    fileType,
    uploadHandler,
  });

  fileUploader
    ?.upload(context)
    .then((attrs) => onFileLoaded({ id, fileType, view, attrs }))
    .catch((error) => onFileLoaded({ id, fileType, view, attrs: { error: error.message } }));
}

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

function createFilePlaceholder<NodeAttributes extends AbstractNodeAttributes>({
  id,
  context,
  file,
  pos,
  view,
  fileType,
  uploadHandler,
}: {
  id: string;
  context: UploadContext;
  file: File;
  pos: number | undefined;
  view: EditorView;
  fileType: NodeType;
  uploadHandler: UploadFileHandler<NodeAttributes>;
}): FileUploader<NodeAttributes> | void {
  const tr = view.state.tr;
  const insertPos = insertFilePoint(tr.doc, isNumber(pos) ? pos : tr.selection.from, fileType);

  if (!isNumber(insertPos)) {
    // failed to find a postition to insert the file node
    return;
  }

  // create a fileUploader, which will read and/or upload the file later
  const fileUploader = uploadHandler();

  // insert the file node
  const attrs: NodeAttributes = { ...fileUploader.insert(file), id };
  tr.insert(insertPos, fileType.createChecked(attrs));

  // insert the placeholder decoration
  const payload: UploadPlaceholderPayload<NodeAttributes> = { context, fileUploader };
  setUploadPlaceholderAction(tr, { type: ActionType.ADD_PLACEHOLDER, id, pos: insertPos, payload });

  view.dispatch(tr);

  return fileUploader;
}

function onFileLoaded<NodeAttributes extends AbstractNodeAttributes>({
  id,
  attrs,
  fileType,
  view,
}: {
  id: string;
  attrs: NodeAttributes;
  fileType: NodeType;
  view: EditorView;
}) {
  const placeholderPos = findUploadPlaceholderPos(view.state, id);

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
    setUploadPlaceholderAction(tr, { type: ActionType.REMOVE_PLACEHOLDER, id });
    view.dispatch(tr);
    return;
  }

  // Update the file node at the placeholder's position, and remove
  // the placeholder.
  const tr = view.state.tr;
  setUploadPlaceholderAction(tr, { type: ActionType.REMOVE_PLACEHOLDER, id });
  const fileAttrs: NodeAttributes = { ...fileNode.attrs, ...attrs, id: null };
  // We need to update the node to trigger the render function, which will accept
  // different properties during and after the upload progress.
  tr.setNodeMarkup(placeholderPos, undefined, fileAttrs);
  view.dispatch(tr);
}
