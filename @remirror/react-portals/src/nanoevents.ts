export interface BaseEvents {
  [event: string]: (...args: any) => void;
}

export interface Emitter<Events extends BaseEvents> {
  /**
   * Event names in keys and arrays with listeners in values.
   *
   * ```js
   * emitter1.events = emitter2.events
   * emitter2.events = { }
   * ```
   */
  events: Partial<{ [EventsKey in keyof Events]: Array<Events[EventsKey]> }>;

  /**
   * Add a listener for a given event.
   *
   * ```js
   * const unbind = ee.on('tick', (tickType, tickDuration) => {
   *   count += 1
   * })
   *
   * disable () {
   *   unbind()
   * }
   * ```
   *
   * @param event The event name.
   * @param cb The listener function.
   * @returns Unbind listener from event.
   */
  on<EventsKey extends keyof Events>(
    this: this,
    event: EventsKey,
    cb: Events[EventsKey],
  ): () => void;

  /**
   * Calls each of the listeners registered for a given event.
   *
   * ```js
   * ee.emit('tick', tickType, tickDuration)
   * ```
   *
   * @param event The event name.
   * @param args The arguments for listeners.
   */
  emit<EventsKey extends keyof Events>(
    this: this,
    event: EventsKey,
    ...args: Parameters<Events[EventsKey]>
  ): void;
}

/**
 * Forked from https://github.com/ai/nanoevents/blob/700bbaa778cf0e62d1af503044c990e17a83033d/index.js#L1
 * Due to a type issue.
 */
const createNanoEvents = <Events extends { [event: string]: any } = BaseEvents>(): Emitter<
  Events
> => ({
  events: {},

  emit(event, ...args) {
    for (const fn of this.events[event] ?? []) {
      fn(...(args as any[]));
    }
  },

  on(event, cb) {
    this.events[event] = this.events[event] ?? [];
    this.events[event]?.push(cb);

    return () => (this.events[event] = this.events[event]?.filter((fn) => fn !== cb));
  },
});

export default createNanoEvents;
