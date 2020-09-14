import { CreatePluginReturn, extensionDecorator, Handler, PlainExtension } from '@remirror/core';

export interface EventsOptions {
  /**
   * Listens for blur events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  blur: Handler<(event: FocusEvent) => boolean | undefined>;

  /**
   * Listens for focus events on the editor.
   *
   * Return `true` to prevent any other prosemirror listeners from firing.
   */
  focus: Handler<(event: FocusEvent) => boolean | undefined>;
}

/**
 * The events extension which listens to events which occur within the
 * remirror editor.
 *
 * TODO - add more events based on user feedback.
 */
@extensionDecorator<EventsOptions>({
  handlerKeys: ['blur', 'focus'],
  handlerKeyOptions: { blur: { earlyReturnValue: true }, focus: { earlyReturnValue: true } },
})
export class EventsExtension extends PlainExtension<EventsOptions> {
  get name() {
    return 'events' as const;
  }

  createPlugin(): CreatePluginReturn {
    return {
      props: {
        handleDOMEvents: {
          focus: (_, event) => {
            return this.options.focus(event as FocusEvent) ?? false;
          },
          blur: (_, event) => {
            return this.options.blur(event as FocusEvent) ?? false;
          },
        },
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      events: EventsExtension;
    }
  }
}
