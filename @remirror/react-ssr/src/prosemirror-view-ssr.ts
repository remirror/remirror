import {
  Cast,
  EditorSchema,
  EditorState,
  RenderEnvironment,
  shouldUseDOMEnvironment,
  Transaction,
} from '@remirror/core';
import minDocument from 'min-document';
import { DirectEditorProps as DEP, EditorView } from 'prosemirror-view';

type DirectEditorProps = DEP<EditorSchema>;

/**
 * A mock editor view used only when prosemirror is running on the server
 */
export class EditorViewSSR {
  public state: EditorState;
  public dom: Element;
  public dragging = null;
  public update(_props: DirectEditorProps): void {}
  public setProps(_props: DirectEditorProps): void {}
  public updateState(_state: EditorState): void {}
  public someProp(_propName: string, f?: (prop: any) => any): any {
    return f ? f(null) : null;
  }
  public hasFocus(): boolean {
    return false;
  }
  public focus(): void {}
  public root: Document | DocumentFragment;
  public posAtCoords(_coords: {
    left: number;
    top: number;
  }): { pos: number; inside: number } | null | undefined {
    return null;
  }
  public coordsAtPos(_pos: number): { left: number; right: number; top: number; bottom: number } {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }
  public domAtPos(_pos: number): { node: Node; offset: number } {
    return { node: this.dom, offset: 0 };
  }
  public nodeDOM(_pos: number): Node | null | undefined {
    return null;
  }
  public posAtDOM(_node: Node, _offset: number, _bias?: number | null): number {
    return 0;
  }
  public endOfTextblock(
    _dir: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward',
    _state?: EditorState,
  ): boolean {
    return true;
  }
  /**
   * Removes the editor from the DOM and destroys all [node
   * views](#view.NodeView).
   */
  public destroy(): void {}
  public dispatch(_tr: Transaction): void {}

  constructor(
    public place: Node | ((p: Node) => void) | { mount: Node } | undefined,
    public props: DirectEditorProps,
  ) {
    const doc = minDocument;
    this.root = doc;
    this.dom = doc.createElement('div');
    this.state = props.state;
  }
}

/**
 * Creates a new editor view
 *
 * @param place
 * @param props
 * @param forceEnvironment
 */
export const createEditorView = <GSchema extends EditorSchema = any>(
  place: Node | ((p: Node) => void) | { mount: Node } | undefined,
  props: DirectEditorProps,
  forceEnvironment?: RenderEnvironment,
): EditorView<GSchema> => {
  const Constructor = shouldUseDOMEnvironment(forceEnvironment)
    ? EditorView
    : Cast<typeof EditorView>(EditorViewSSR);
  return new Constructor(place, props) as any;
};
