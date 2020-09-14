import {
  AddCustomHandler,
  CreatePluginReturn,
  CustomHandler,
  debounce,
  extensionDecorator,
  isString,
  PlainExtension,
  StateUpdateLifecycleParameter,
  Static,
} from '@remirror/core';

import type {
  BasePositionerParameter,
  Positioner,
  PositionerUpdateEvent,
  SetActiveElement,
} from './positioner';
import {
  centeredSelectionPositioner,
  cursorPopupPositioner,
  floatingSelectionPositioner,
} from './positioners';

export interface PositionerOptions {
  /**
   * An object specifying the positioner and the change handler for responding
   * to changes in the positioner output. This is a custom handler and should be
   * amended with `addCustomHandler`.
   */
  positioner?: CustomHandler<Positioner>;

  /**
   * The `ms` to debounce scroll events.
   *
   * @default 50
   */
  scrollDebounce?: Static<number>;
}

interface TriggerUpdateParameter {
  event: PositionerUpdateEvent;
  firstUpdate: boolean;
}

/**
 * This is the positioner extension which is used to track the positions of
 * different parts of your editor.
 *
 * For example, you can track the cursor or all visible paragraph nodes.
 */
@extensionDecorator<PositionerOptions>({
  defaultOptions: { scrollDebounce: 50 },
  customHandlerKeys: ['positioner'],
  staticKeys: ['scrollDebounce'],
})
export class PositionerExtension extends PlainExtension<PositionerOptions> {
  get name() {
    return 'positioner' as const;
  }

  #positioners: Positioner[] = [];

  protected onAddCustomHandler: AddCustomHandler<PositionerOptions> = ({ positioner }) => {
    if (!positioner) {
      return;
    }

    this.#positioners = [...this.#positioners, positioner];
    return () => {
      this.#positioners = this.#positioners.filter((handler) => handler !== positioner);
    };
  };

  protected init(): void {
    this.onScroll = debounce(this.options.scrollDebounce, this.onScroll.bind(this));
  }

  private getParameter({ event, firstUpdate }: TriggerUpdateParameter) {
    const state = this.store.getState();
    const previousState = this.store.previousState ?? state;

    return {
      event,
      firstUpdate,
      previousState,
      state,
      scrollTop: this.store.view.dom.scrollTop,
    };
  }

  private onScroll(): void {
    const parameter = this.getParameter({ event: 'scroll', firstUpdate: false });
    this.positioner(parameter);
  }

  createPlugin(): CreatePluginReturn {
    return {
      props: {
        handleDOMEvents: {
          scroll: () => {
            this.onScroll();
            return false;
          },
        },
      },
    };
  }

  onStateUpdate(update: StateUpdateLifecycleParameter): void {
    this.positioner({
      ...update,
      event: 'state',
      scrollTop: this.store.view.dom.scrollTop,
      firstUpdate: false,
    });
  }

  private positioner(update: BasePositionerParameter) {
    for (const positioner of this.#positioners) {
      const eventIsNotSupported = !positioner.events.includes(update.event);

      if (eventIsNotSupported) {
        continue;
      }

      this.triggerPositioner(positioner, update);
    }
  }

  private triggerPositioner(positioner: Positioner, update: BasePositionerParameter) {
    if (!positioner.hasChanged(update)) {
      // Nothing has changed so return without calling the change handler.
      return;
    }

    positioner.onActiveChanged({ ...update, view: this.store.view });
  }
}

export interface PositionerHandler {
  /**
   * The positioner to use for calculating the relative position.
   */
  positioner: Positioner;

  /**
   * Method to call when there is a change in the position.
   */
  onChange: PositionerChangeHandlerMethod;
}

/**
 * This type is used for setting elements which are associated with the relevant
 * positioner. Once teh
 */
export type PositionerChangeHandlerMethod = (elementSetters: SetActiveElement[]) => void;

const positioners = {
  bubble: centeredSelectionPositioner,
  centeredSelection: centeredSelectionPositioner,
  floating: floatingSelectionPositioner,
  floatingSelection: floatingSelectionPositioner,
  popup: cursorPopupPositioner,
  cursor: cursorPopupPositioner,
};

/**
 * This is a helper method for getting the positioner. The parameter can either
 * be a named positioner or a positioner that you've created for the purpose.
 */
export function getPositioner(positioner: StringPositioner | Positioner): Positioner {
  if (isString(positioner)) {
    return positioners[positioner];
  }

  return positioner;
}

export type StringPositioner = keyof typeof positioners;

declare global {
  namespace Remirror {
    interface AllExtensions {
      positioner: PositionerExtension;
    }
  }
}
