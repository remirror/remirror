import { PlainObject } from '@remirror/core';

// Taken from dom-testing-library

const rawEventMap = {
  // Clipboard Events
  copy: {
    Constructor: 'ClipboardEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  cut: {
    Constructor: 'ClipboardEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  paste: {
    Constructor: 'ClipboardEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // Composition Events
  compositionEnd: {
    Constructor: 'CompositionEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  compositionStart: {
    Constructor: 'CompositionEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  compositionUpdate: {
    Constructor: 'CompositionEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  // Keyboard Events
  keyDown: {
    Constructor: 'KeyboardEvent',
    defaultProperties: { bubbles: true, cancelable: true, charCode: 0 },
  },
  keyPress: {
    Constructor: 'KeyboardEvent',
    defaultProperties: { bubbles: true, cancelable: true, charCode: 0 },
  },
  keyUp: {
    Constructor: 'KeyboardEvent',
    defaultProperties: { bubbles: true, cancelable: true, charCode: 0 },
  },
  // Focus Events
  focus: {
    Constructor: 'FocusEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  blur: {
    Constructor: 'FocusEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  focusIn: {
    Constructor: 'FocusEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  focusOut: {
    Constructor: 'FocusEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  // Form Events
  change: {
    Constructor: 'InputEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  input: {
    Constructor: 'InputEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  invalid: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: true },
  },
  submit: {
    Constructor: 'Event',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // Mouse Events
  click: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true, button: 0 },
  },
  contextMenu: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  dblClick: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  drag: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  dragEnd: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  dragEnter: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  dragExit: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  dragLeave: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  dragOver: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  dragStart: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  drop: {
    Constructor: 'DragEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseDown: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseEnter: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseLeave: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseMove: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseOut: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseOver: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  mouseUp: {
    Constructor: 'MouseEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // Selection Events
  select: {
    Constructor: 'Event',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  // Touch Events
  touchCancel: {
    Constructor: 'TouchEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  touchEnd: {
    Constructor: 'TouchEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  touchMove: {
    Constructor: 'TouchEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  touchStart: {
    Constructor: 'TouchEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // UI Events
  scroll: {
    Constructor: 'UIEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  // Wheel Events
  wheel: {
    Constructor: 'WheelEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // Media Events
  abort: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  canPlay: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  canPlayThrough: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  durationChange: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  emptied: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  encrypted: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  ended: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  // error: {
  //   Constructor: Event,
  //   defaultProperties: {bubbles: false, cancelable: false},
  // },
  loadedData: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  loadedMetadata: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  loadStart: {
    Constructor: 'ProgressEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  pause: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  play: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  playing: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  progress: {
    Constructor: 'ProgressEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  rateChange: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  seeked: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  seeking: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  stalled: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  suspend: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  timeUpdate: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  volumeChange: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  waiting: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  // Image Events
  load: {
    Constructor: 'UIEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  error: {
    Constructor: 'Event',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  // Animation Events
  animationStart: {
    Constructor: 'AnimationEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  animationEnd: {
    Constructor: 'AnimationEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  animationIteration: {
    Constructor: 'AnimationEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  // Transition Events
  transitionEnd: {
    Constructor: 'TransitionEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  // Pointer events
  pointerOver: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  pointerEnter: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  pointerDown: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  pointerMove: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  pointerUp: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  pointerCancel: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: false },
  },
  pointerOut: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: true, cancelable: true },
  },
  pointerLeave: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  gotPointerCapture: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
  lostPointerCapture: {
    Constructor: 'PointerEvent',
    defaultProperties: { bubbles: false, cancelable: false },
  },
};

export type EventType = keyof typeof rawEventMap | 'doubleClick' | 'tripleClick';
interface EventProperties {
  Constructor: string;
  defaultProperties: { bubbles: boolean; cancelable: boolean; button?: number; charCode?: number };
}
type EventMap = Record<EventType, EventProperties>;
const eventMap: EventMap = rawEventMap as EventMap;

export const createEvents = <GEvent extends Event>(event: EventType, options: PlainObject): GEvent[] => {
  const { Constructor, defaultProperties } = eventMap[event] || {
    Constructor: 'Event',
    defaultProperties: { bubbles: true, cancelable: true },
  };
  let eventName = event.toLowerCase();
  const properties: PlainObject = { ...defaultProperties, ...options };
  type GEventConstructor = new (type: string, eventInitDict?: EventInit) => GEvent;

  if (event === 'doubleClick') {
    eventName = 'dblclick';
  }
  let EventConstructor: GEventConstructor;
  if (event === 'tripleClick') {
    EventConstructor = MouseEvent as any;
    return [
      new EventConstructor('click', { ...properties, detail: 1 } as any),
      new EventConstructor('click', { ...properties, detail: 2 } as any),
      new EventConstructor('click', { ...properties, detail: 3 } as any),
    ];
  }

  EventConstructor = window[Constructor as keyof Window] || Event;

  return [new EventConstructor(eventName, properties)];
};
