import {
  Cast,
  EditorSchema,
  EditorState,
  getDocument,
  RenderEnvironment,
  shouldUseDomEnvironment,
  Transaction,
} from '@remirror/core';
import { DirectEditorProps, EditorView } from '@remirror/pm/view';

/**
 * A mock editor view used only when prosemirror is running on the server
 */
export class EditorViewSSR<Schema extends EditorSchema = EditorSchema> {
  state: EditorState<Schema>;
  dom: Element;
  dragging = null;
  root: Document | DocumentFragment;

  constructor(
    _place: Node | ((p: Node) => void) | { mount: Node } | undefined,
    props: DirectEditorProps<Schema>,
  ) {
    const doc = getDocument('ssr');

    this.root = doc;
    this.dom = doc.createElement('div');
    this.state = props.state;
  }

  update(_props: DirectEditorProps<Schema>): void {}
  setProps(_props: DirectEditorProps<Schema>): void {}
  updateState(_state: EditorState): void {}
  someProps(_propName: string, f?: (prop: any) => any): any {
    return f ? f(null) : null;
  }
  hasFocus(): boolean {
    return false;
  }
  focus(): void {}
  posAtCoords(_coords: {
    left: number;
    top: number;
  }): { pos: number; inside: number } | null | undefined {
    return null;
  }
  coordsAtPos(_pos: number): { left: number; right: number; top: number; bottom: number } {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }
  domAtPos(_pos: number): { node: Node; offset: number } {
    return { node: this.dom, offset: 0 };
  }
  nodeDOM(_pos: number): Node | null | undefined {
    return null;
  }
  posAtDOM(_node: Node, _offset: number, _bias?: number | null): number {
    return 0;
  }
  endOfTextblock(
    _dir: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward',
    _state?: EditorState,
  ): boolean {
    return true;
  }
  /**
   * Removes the editor from the DOM and destroys all [node
   * views](#view.NodeView).
   */
  destroy(): void {}
  dispatch(_tr: Transaction): void {}
}

/**
 * Creates a new editor view
 *
 * @param place
 * @param props
 * @param forceEnvironment
 */
export function createEditorView<Schema extends EditorSchema = EditorSchema>(
  place: Node | ((p: Node) => void) | { mount: Node } | undefined,
  props: DirectEditorProps<Schema>,
  forceEnvironment?: RenderEnvironment,
): EditorView<Schema> {
  const Constructor = shouldUseDomEnvironment(forceEnvironment)
    ? EditorView
    : Cast<typeof EditorView>(EditorViewSSR);
  return new Constructor(place, props);
}
