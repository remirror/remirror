import { cx, isNullOrUndefined } from '@remirror/core';
import React from 'react';

export type { HTMLAttributes };

export function h<T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  attrs?: HTMLAttributes<T> | null,
  ...children: Array<string | Node>
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tagName);

  if (attrs) {
    for (let [key, value] of Object.entries(attrs)) {
      if (isNullOrUndefined(value)) {
        continue;
      }

      key = key.toLowerCase();

      if (key.length >= 3 && key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2), value as EventHandler);
      } else if (['class', 'classname'].includes(key)) {
        element.classList.add(...cx(value as string).split(' '));
      } else if (key === 'dataset') {
        for (const [dataKey, dataValue] of Object.entries(value as Record<string, string>)) {
          element.dataset[dataKey] = dataValue;
        }
      } else if (['number', 'boolean', 'string'].includes(typeof value)) {
        element.setAttribute(key, value.toString());
      } else {
        throw new TypeError(`Unexpected ${typeof value} value for attribute "${key}"`);
      }
    }
  }

  element.append(...children);
  return element;
}

export function stopEvent(e: Pick<MouseEvent, 'preventDefault' | 'stopPropagation'>): void {
  e.preventDefault();
  e.stopPropagation();
}

interface Coord {
  x: number;
  y: number;
}

export function getRelativeCoord(absoluteCoord: Coord, parent: Element): Coord {
  const parentRect = parent.getBoundingClientRect();
  return {
    x: absoluteCoord.x + parent.scrollLeft - parentRect.left,
    y: absoluteCoord.y + parent.scrollTop - parentRect.top,
  };
}

export function getAbsoluteCoord(relativeCoord: Coord, parent: Element): Coord {
  const parentRect = parent.getBoundingClientRect();
  return {
    x: relativeCoord.x - parent.scrollLeft + parentRect.left,
    y: relativeCoord.y - parent.scrollTop + parentRect.top,
  };
}

type EventHandler<E extends Event = Event, T = Element> = (this: T, event: E) => void;

type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent, T>;
type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent, T>;
type DragEventHandler<T = Element> = EventHandler<DragEvent, T>;
type FocusEventHandler<T = Element> = EventHandler<FocusEvent, T>;
type FormEventHandler<T = Element> = EventHandler<Event, T>;
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent, T>;
type MouseEventHandler<T = Element> = EventHandler<MouseEvent, T>;
type TouchEventHandler<T = Element> = EventHandler<TouchEvent, T>;
type PointerEventHandler<T = Element> = EventHandler<PointerEvent, T>;
type UIEventHandler<T = Element> = EventHandler<UIEvent, T>;
type WheelEventHandler<T = Element> = EventHandler<WheelEvent, T>;
type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent, T>;
type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent, T>;

export interface DOMEvents<T> {
  // Clipboard Events
  onCopy?: ClipboardEventHandler<T> | undefined;
  onCopyCapture?: ClipboardEventHandler<T> | undefined;
  onCut?: ClipboardEventHandler<T> | undefined;
  onCutCapture?: ClipboardEventHandler<T> | undefined;
  onPaste?: ClipboardEventHandler<T> | undefined;
  onPasteCapture?: ClipboardEventHandler<T> | undefined;

  // Composition Events
  onCompositionEnd?: CompositionEventHandler<T> | undefined;
  onCompositionEndCapture?: CompositionEventHandler<T> | undefined;
  onCompositionStart?: CompositionEventHandler<T> | undefined;
  onCompositionStartCapture?: CompositionEventHandler<T> | undefined;
  onCompositionUpdate?: CompositionEventHandler<T> | undefined;
  onCompositionUpdateCapture?: CompositionEventHandler<T> | undefined;

  // Focus Events
  onFocus?: FocusEventHandler<T> | undefined;
  onFocusCapture?: FocusEventHandler<T> | undefined;
  onBlur?: FocusEventHandler<T> | undefined;
  onBlurCapture?: FocusEventHandler<T> | undefined;

  // Form Events
  onChange?: FormEventHandler<T> | undefined;
  onChangeCapture?: FormEventHandler<T> | undefined;
  onBeforeInput?: FormEventHandler<T> | undefined;
  onBeforeInputCapture?: FormEventHandler<T> | undefined;
  onInput?: FormEventHandler<T> | undefined;
  onInputCapture?: FormEventHandler<T> | undefined;
  onReset?: FormEventHandler<T> | undefined;
  onResetCapture?: FormEventHandler<T> | undefined;
  onSubmit?: FormEventHandler<T> | undefined;
  onSubmitCapture?: FormEventHandler<T> | undefined;
  onInvalid?: FormEventHandler<T> | undefined;
  onInvalidCapture?: FormEventHandler<T> | undefined;

  // Keyboard Events
  onKeyDown?: KeyboardEventHandler<T> | undefined;
  onKeyDownCapture?: KeyboardEventHandler<T> | undefined;
  onKeyPress?: KeyboardEventHandler<T> | undefined;
  onKeyPressCapture?: KeyboardEventHandler<T> | undefined;
  onKeyUp?: KeyboardEventHandler<T> | undefined;
  onKeyUpCapture?: KeyboardEventHandler<T> | undefined;

  // MouseEvents
  onAuxClick?: MouseEventHandler<T> | undefined;
  onAuxClickCapture?: MouseEventHandler<T> | undefined;
  onClick?: MouseEventHandler<T> | undefined;
  onClickCapture?: MouseEventHandler<T> | undefined;
  onContextMenu?: MouseEventHandler<T> | undefined;
  onContextMenuCapture?: MouseEventHandler<T> | undefined;
  onDblClick?: MouseEventHandler<T> | undefined;
  onDblClickCapture?: MouseEventHandler<T> | undefined;
  onDoubleClick?: MouseEventHandler<T> | undefined;
  onDoubleClickCapture?: MouseEventHandler<T> | undefined;
  onDrag?: DragEventHandler<T> | undefined;
  onDragCapture?: DragEventHandler<T> | undefined;
  onDragEnd?: DragEventHandler<T> | undefined;
  onDragEndCapture?: DragEventHandler<T> | undefined;
  onDragEnter?: DragEventHandler<T> | undefined;
  onDragEnterCapture?: DragEventHandler<T> | undefined;
  onDragExit?: DragEventHandler<T> | undefined;
  onDragExitCapture?: DragEventHandler<T> | undefined;
  onDragLeave?: DragEventHandler<T> | undefined;
  onDragLeaveCapture?: DragEventHandler<T> | undefined;
  onDragOver?: DragEventHandler<T> | undefined;
  onDragOverCapture?: DragEventHandler<T> | undefined;
  onDragStart?: DragEventHandler<T> | undefined;
  onDragStartCapture?: DragEventHandler<T> | undefined;
  onDrop?: DragEventHandler<T> | undefined;
  onDropCapture?: DragEventHandler<T> | undefined;
  onMouseDown?: MouseEventHandler<T> | undefined;
  onMouseDownCapture?: MouseEventHandler<T> | undefined;
  onMouseEnter?: MouseEventHandler<T> | undefined;
  onMouseLeave?: MouseEventHandler<T> | undefined;
  onMouseMove?: MouseEventHandler<T> | undefined;
  onMouseMoveCapture?: MouseEventHandler<T> | undefined;
  onMouseOut?: MouseEventHandler<T> | undefined;
  onMouseOutCapture?: MouseEventHandler<T> | undefined;
  onMouseOver?: MouseEventHandler<T> | undefined;
  onMouseOverCapture?: MouseEventHandler<T> | undefined;
  onMouseUp?: MouseEventHandler<T> | undefined;
  onMouseUpCapture?: MouseEventHandler<T> | undefined;

  // Touch Events
  onTouchCancel?: TouchEventHandler<T> | undefined;
  onTouchCancelCapture?: TouchEventHandler<T> | undefined;
  onTouchEnd?: TouchEventHandler<T> | undefined;
  onTouchEndCapture?: TouchEventHandler<T> | undefined;
  onTouchMove?: TouchEventHandler<T> | undefined;
  onTouchMoveCapture?: TouchEventHandler<T> | undefined;
  onTouchStart?: TouchEventHandler<T> | undefined;
  onTouchStartCapture?: TouchEventHandler<T> | undefined;

  // Pointer Events
  onPointerDown?: PointerEventHandler<T> | undefined;
  onPointerDownCapture?: PointerEventHandler<T> | undefined;
  onPointerMove?: PointerEventHandler<T> | undefined;
  onPointerMoveCapture?: PointerEventHandler<T> | undefined;
  onPointerUp?: PointerEventHandler<T> | undefined;
  onPointerUpCapture?: PointerEventHandler<T> | undefined;
  onPointerCancel?: PointerEventHandler<T> | undefined;
  onPointerCancelCapture?: PointerEventHandler<T> | undefined;
  onPointerEnter?: PointerEventHandler<T> | undefined;
  onPointerEnterCapture?: PointerEventHandler<T> | undefined;
  onPointerLeave?: PointerEventHandler<T> | undefined;
  onPointerLeaveCapture?: PointerEventHandler<T> | undefined;
  onPointerOver?: PointerEventHandler<T> | undefined;
  onPointerOverCapture?: PointerEventHandler<T> | undefined;
  onPointerOut?: PointerEventHandler<T> | undefined;
  onPointerOutCapture?: PointerEventHandler<T> | undefined;
  onGotPointerCapture?: PointerEventHandler<T> | undefined;
  onGotPointerCaptureCapture?: PointerEventHandler<T> | undefined;
  onLostPointerCapture?: PointerEventHandler<T> | undefined;
  onLostPointerCaptureCapture?: PointerEventHandler<T> | undefined;

  // UI Events
  onScroll?: UIEventHandler<T> | undefined;
  onScrollCapture?: UIEventHandler<T> | undefined;

  // Wheel Events
  onWheel?: WheelEventHandler<T> | undefined;
  onWheelCapture?: WheelEventHandler<T> | undefined;

  // Animation Events
  onAnimationStart?: AnimationEventHandler<T> | undefined;
  onAnimationStartCapture?: AnimationEventHandler<T> | undefined;
  onAnimationEnd?: AnimationEventHandler<T> | undefined;
  onAnimationEndCapture?: AnimationEventHandler<T> | undefined;
  onAnimationIteration?: AnimationEventHandler<T> | undefined;
  onAnimationIterationCapture?: AnimationEventHandler<T> | undefined;

  // Transition Events
  onTransitionEnd?: TransitionEventHandler<T> | undefined;
  onTransitionEndCapture?: TransitionEventHandler<T> | undefined;
}

type HTMLAttributes<T extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[T], 'style'> & { style: Partial<HTMLElement['style']> }
> &
  DOMEvents<HTMLElementTagNameMap[T]>;

let domEventHandler: ClipboardEventHandler = (_event: ClipboardEvent) => void 0;
let reactEventHandler: React.ClipboardEventHandler = (_event: React.ClipboardEvent) => void 0;

let el = document.createElement('intput');
el.addEventListener('copy', domEventHandler);
el.addEventListener('copy', reactEventHandler);

reactEventHandler = () => {};
domEventHandler = () => {};
