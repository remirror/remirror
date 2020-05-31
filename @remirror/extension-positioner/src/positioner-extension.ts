import {
  AddCustomHandler,
  CustomHandler,
  DefaultExtensionOptions,
  isString,
  PlainExtension,
  Position,
  TransactionLifecycleMethod,
  TransactionLifecycleParameter,
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
  public static defaultOptions: DefaultExtensionOptions<PositionerOptions> = {};

  get name() {
    return 'doc' as const;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
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

  public onTransaction: TransactionLifecycleMethod = (update) => {
    this.positionerHandler(update);
  };

  private positionerHandler(update: TransactionLifecycleParameter) {
    for (const handler of this.#positionerHandlerList) {
      this.calculatePositioner(handler, update);
    }
  }

  private calculatePositioner(handler: PositionerHandler, update: TransactionLifecycleParameter) {
    const { element, onChange, positioner } = handler;
    const { initialPosition, getPosition, hasChanged, isActive } = getPositioner(positioner);

    // Nothing has changed so return without calling on change.
    if (!hasChanged(update)) {
      return;
    }

    const parameters = { element, view: this.store.view, ...update };

    const active = isActive(parameters);

    if (!active) {
      onChange({ active });
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

interface ActiveChangeHandlerParameter extends Position {
  /**
   * This is an active positioner and has position properties available..
   */
  active: true;
}

interface InactiveChangeHandlerParameter {
  /**
   * This is inactive and has now position attached.
   */
  active: false;
}

export type PositionerChangeHandlerParameter =
  | ActiveChangeHandlerParameter
  | InactiveChangeHandlerParameter;

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

export type StringPositioner = keyof typeof positioners;
