import {
  AddCustomHandler,
  CustomHandler,
  DefaultExtensionOptions,
  isString,
  PlainExtension,
  Position,
  StateUpdateLifecycleParameter,
} from '@remirror/core';

import {
  bubblePositioner,
  defaultPositioner,
  floatingPositioner,
  popupMenuPositioner,
  Positioner,
} from './positioners';

export interface PositionerOptions {
  /**
   * An object specifying the positioner and the change handler for responding
   * to changes in the positioner output. This is a custom handler and should be
   * amended with `addCustomHandler`.
   */
  positionerHandler?: CustomHandler<PositionerHandler>;
}

/**
 * This is the default parent node. It is required in the Prosemirror Schema and
 * a representation of the `doc` is required as the top level node in all
 * editors.
 *
 * @required
 * @core
 */
export class PositionerExtension extends PlainExtension<PositionerOptions> {
  static defaultOptions: DefaultExtensionOptions<PositionerOptions> = {};

  get name() {
    return 'positioner' as const;
  }

  #positionerHandlerList: PositionerHandler[] = [];

  protected onAddCustomHandler: AddCustomHandler<PositionerOptions> = ({ positionerHandler }) => {
    if (!positionerHandler) {
      return;
    }

    this.#positionerHandlerList = [...this.#positionerHandlerList, positionerHandler];
    return () => {
      this.#positionerHandlerList = this.#positionerHandlerList.filter(
        (handler) => handler !== positionerHandler,
      );
    };
  };

  onStateUpdate(update: StateUpdateLifecycleParameter) {
    this.positionerHandler(update);
  }

  private positionerHandler(update: StateUpdateLifecycleParameter) {
    for (const handler of this.#positionerHandlerList) {
      this.calculatePositioner(handler, update);
    }
  }

  private calculatePositioner(handler: PositionerHandler, update: StateUpdateLifecycleParameter) {
    const { element, onChange, positioner } = handler;
    const { initialPosition, getPosition, hasChanged, isActive } = getPositioner(positioner);

    // Nothing has changed so return without calling on change.
    if (!hasChanged(update)) {
      return;
    }

    const parameters = { element, view: this.store.view, ...update };

    const active = isActive(parameters);

    if (!active) {
      onChange({ ...initialPosition, active });
    } else {
      onChange({ ...initialPosition, ...getPosition(parameters), active });
    }
  }
}

export interface PositionerHandler {
  /**
   * The HTML element to calculate a position for.
   */
  element: HTMLElement;

  /**
   * The positioner to use for calculating the relative position.
   */
  positioner: Positioner | StringPositioner;

  /**
   * Method to call when there is a change in the position.
   */
  onChange: PositionerChangeHandlerMethod;
}

export type PositionerChangeHandlerMethod = (position: PositionerChangeHandlerParameter) => void;

export interface PositionerChangeHandlerParameter extends Position {
  /**
   * When true this is an active positioner. When false the positions default to
   * the default positioner values.
   */
  active: boolean;
}

const positioners = {
  bubble: bubblePositioner,
  floating: floatingPositioner,
  popupMenu: popupMenuPositioner,
  default: defaultPositioner,
};

function getPositioner(positioner: StringPositioner | Positioner): Positioner {
  if (isString(positioner)) {
    return positioners[positioner];
  }

  return positioner;
}

export function getInitialPosition(positioner: StringPositioner | Positioner) {
  return getPositioner(positioner).initialPosition;
}

export type StringPositioner = keyof typeof positioners;
