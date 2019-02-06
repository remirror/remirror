import {
  AnyExtension,
  EditorSchema,
  ObjectNode,
  OffsetCalculator,
  Position,
  RawMenuPositionData,
  RemirrorActions,
  ShouldRenderMenu,
} from '@remirror/core';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { PlainObject } from 'simplytyped';
import { RemirrorCustomStyles } from './components';

export interface GetMenuPropsConfig<GRefKey extends string = 'ref'> extends BaseGetterConfig<GRefKey> {
  offset?: OffsetCalculator;
  shouldRender?: ShouldRenderMenu;
  offscreenPosition?: Partial<Position>;
  name: string;
}

export interface BaseGetterConfig<GRefKey extends string = 'ref'> {
  refKey?: GRefKey;
}

export interface GetRootPropsConfig<GRefKey extends string = 'ref'>
  extends BaseGetterConfig<GRefKey>,
    PlainObject {}
export interface InjectedRemirrorProps {
  /**
   * The prosemirror view
   */
  view: EditorView<EditorSchema>;
  actions: RemirrorActions;
  getMarkAttr(type: string): Record<string, string>;
  clearContent(triggerOnChange?: boolean): void;
  setContent(content: string | ObjectNode, triggerOnChange?: boolean): void;
  getRootProps<GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ): PlainObject & { [P in Exclude<GRefKey, 'children' | 'key'>]: React.Ref<any> };
  getMenuProps<GRefKey extends string = 'ref'>(
    options: GetMenuPropsConfig<GRefKey>,
  ): {
    position: Position;
    rawData: RawMenuPositionData | null;
    offscreen: boolean;
  } & { [P in Exclude<GRefKey, 'children' | 'key' | 'position' | 'rawData' | 'offscreen'>]: React.Ref<any> };
}

export type RenderPropFunction = (params: InjectedRemirrorProps) => JSX.Element;

export interface RemirrorEventListenerParams {
  state: EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  getHTML(): string;
  getText(lineBreakDivider?: string): string;
  getJSON(): ObjectNode;
  getDocJSON(): ObjectNode;
}

export type RemirrorEventListener = (params: RemirrorEventListenerParams) => void;

export type AttributePropFunction = (params: RemirrorEventListenerParams) => Record<string, string>;

export interface RemirrorProps {
  autoFocus?: boolean;
  placeholder?: string;
  onChange?: RemirrorEventListener;
  onFocus?: RemirrorEventListener;
  onBlur?: RemirrorEventListener;
  onFirstRender?: RemirrorEventListener;
  children: RenderPropFunction;
  dispatchTransaction?: ((tr: Transaction<EditorSchema>) => void) | null;
  initialContent: ObjectNode | string;
  attributes: Record<string, string> | AttributePropFunction;
  editable: boolean;
  label?: string;
  useBuiltInExtensions?: boolean;
  extensions: AnyExtension[];
  styles?: Partial<RemirrorCustomStyles> | null;
}
