import { EventType as DomEventType } from '@testing-library/dom';
import { EventType } from 'jest-prosemirror';

const eventType: EventType = 'abort';
const domEventType: DomEventType = 'animationEnd';

const excludeEvents = (): Exclude<DomEventType, EventType> => undefined as never;
const excludeDomEvents = (): Exclude<EventType, DomEventType> => undefined as never;

// @dts-jest:pass:snap
excludeEvents();

// @dts-jest:pass:snap
excludeDomEvents();
