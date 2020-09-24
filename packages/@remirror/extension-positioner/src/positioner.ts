import { createNanoEvents, Unsubscribe } from 'nanoevents';

import {
  EditorViewParameter,
  ElementParameter,
  ErrorConstant,
  invariant,
  StateUpdateLifecycleParameter,
} from '@remirror/core';

/**
 * The events that can trigger a positioner update.
 */
export type PositionerUpdateEvent = 'scroll' | 'state';

export interface Coords {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface VirtualPosition extends Partial<Coords> {
  /**
   * The bounding client of the tracked element. The `DOMRect` is relative to
   * the `viewport` and can be used by libraries like `Tippy.js` and
   * `react-popper`.
   *
   * It should be possible to use this `rect` with tooltip libraries as a
   * virtual element.
   */
  rect: DOMRect;
}

export interface GetPositionParameter<Data>
  extends EditorViewParameter,
    ElementParameter,
    BasePositionerParameter {
  /**
   * The data that can be transformed into a position.
   */
  data: Data;
}

export interface GetActiveParameter extends EditorViewParameter, BasePositionerParameter {}

export interface BasePositioner<Data> {
  /**
   * Determines whether anything has changed and whether to continue with a
   * recalculation. By default this is only true when the document has or
   * selection has changed.
   *
   * @remarks
   *
   * Sometimes it is useful to recalculate the positioner on every state update.
   * In this case you can set this method to always return true.
   *
   * ```ts
   * const positioner: Positioner = {
   *   hasStateChanged: () => true
   * };
   * ```
   */
  hasChanged: (parameter: BasePositionerParameter) => boolean;

  /**
   * Get a unique id for the data returned from `getActive`.
   *
   * If left undefined, it defaults to use the index.
   */
  getID?: (data: Data, index: number) => string;

  /**
   * Get the active items that will be passed into the `getPosition` method.
   */
  getActive: (parameter: GetActiveParameter) => Data[];

  /**
   * Calculate and return an array of `VirtualPosition`'s which represent the
   * virtual element the positioner represents.
   */
  getPosition: (parameter: GetPositionParameter<Data>) => VirtualPosition;

  /**
   * An array of update listeners to determines when the positioner will update it's position.
   *
   * - `state` - updates when the prosemirror state is updated - default.
   * - `scroll` - updates when the editor is scrolled (debounced)
   *
   * @default ['state']
   */
  events?: PositionerUpdateEvent[];
}

export interface VirtualNode {
  getBoundingClientRect: () => DOMRect;
}

export interface SetActiveElement {
  /**
   * Set the html element for the active position.
   */
  setElement: (element: HTMLElement) => void;

  /**
   * The unique ide for the active element.
   */
  id: string;
}

export interface BasePositionerParameter extends StateUpdateLifecycleParameter {
  /**
   * The event that triggered this update.
   */
  event: PositionerUpdateEvent;

  /**
   * The scroll position.
   */
  scrollTop: number;
}

export interface ElementsAddedParameter {
  position: VirtualPosition;
  element: HTMLElement;
  id: string;
}

interface PositionerEvents {
  /**
   * Called when the dom elements have all been received. In some frameworks
   * like `React` this may be called asynchronously.
   */
  done: (parameter: ElementsAddedParameter[]) => void;

  /**
   * Called when the active values have been updated.
   */
  update: (elementSetters: SetActiveElement[]) => void;
}

/**
 * This is the positioner. It exists to report the position of things in the
 * editor. Typically you will use it to get the position of the cursor.
 *
 * But you can be more ambitious and get the position all the active nodes of a
 * certain type. Or all visible nodes of a certain type in the editor, updated
 * as it scrolls.
 *
 * The positions returned have a rect which is the viewport position.
 *
 * There are also the `top`, `left`, `right`, `bottom` which represent the
 * absolute positioned rectangle of the position in questions. For a cursor
 * position `left` and `right` are probably the same.
 */
export class Positioner<Data = any> {
  /**
   * Create a positioner.
   */
  static create<Data>(parameter: BasePositioner<Data>): Positioner<Data> {
    return new Positioner(parameter);
  }

  /**
   * Create a positioner from an existing positioner.
   *
   * This is useful when you want to modify parts of the positioner.
   */
  static fromPositioner<Data>(positioner: Positioner, base: Partial<BasePositioner<Data>>) {
    return Positioner.create({ ...positioner.basePositioner, ...base });
  }

  readonly events: PositionerUpdateEvent[];

  #handler = createNanoEvents<PositionerEvents>();
  #active: Data[] = [];
  #parameters: Map<number, GetPositionParameter<Data>> = new Map();
  #ids: string[] = [];
  #updated = false;

  readonly #getActive: (parameter: GetActiveParameter) => Data[];
  readonly #getID?: (data: Data, index: number) => string;
  readonly #getPosition: (parameter: GetPositionParameter<Data>) => VirtualPosition;
  readonly hasChanged: (parameter: BasePositionerParameter) => boolean;

  get basePositioner(): BasePositioner<Data> {
    return {
      getActive: this.#getActive,
      getPosition: this.#getPosition,
      hasChanged: this.hasChanged,
      events: this.events,
      getID: this.#getID,
    };
  }

  private constructor(parameter: BasePositioner<Data>) {
    this.#getActive = parameter.getActive;
    this.#getPosition = parameter.getPosition;
    this.#getID = parameter.getID;
    this.hasChanged = parameter.hasChanged;
    this.events = parameter.events ?? ['state'];
  }

  /**
   * Get the active element setters.
   */
  onActiveChanged(parameter: GetActiveParameter) {
    const active = this.#getActive(parameter);
    this.#active = active;
    this.#parameters = new Map();
    this.#updated = false;
    this.#ids = [];

    const elementSetters: SetActiveElement[] = [];

    for (const [index, data] of active.entries()) {
      const id = this.getID(data, index);
      this.#ids.push(id);

      elementSetters.push({
        setElement: (element: HTMLElement) => {
          return this.addParameter({ ...parameter, data, element }, index);
        },
        id,
      });
    }

    this.#handler.emit('update', elementSetters);
  }

  /**
   * Get the id for the active data. Defaults to the index of the data item.
   */
  getID(data: Data, index: number): string {
    return this.#getID?.(data, index) ?? index.toString();
  }

  /**
   * Create a virtual node from the provided position to use in libraries like `react-poppy`.
   */
  getVirtualNode(position: VirtualPosition): VirtualNode {
    return {
      getBoundingClientRect: () => position.rect,
    };
  }

  /**
   * Add a listener to the positioner events.
   */
  readonly addListener = <Key extends keyof PositionerEvents>(
    event: Key,
    cb: PositionerEvents[Key],
  ): Unsubscribe => {
    return this.#handler.on(event, cb);
  };

  private addParameter(parameter: GetPositionParameter<Data>, index: number) {
    if (this.#updated) {
      return;
    }

    this.#parameters.set(index, parameter);

    if (this.#parameters.size < this.#active.length) {
      return;
    }

    const doneParameter: ElementsAddedParameter[] = [];

    for (const index of this.#active.keys()) {
      const item = this.#parameters.get(index);

      invariant(item, {
        code: ErrorConstant.INTERNAL,
        message: 'Something went wrong when retrieving the parameters',
      });

      doneParameter.push({
        position: this.#getPosition(item),
        element: item.element,
        id: this.#ids[index],
      });
    }

    this.#handler.emit('done', doneParameter);
  }
}
