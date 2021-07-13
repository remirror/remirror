import { createNanoEvents, Unsubscribe } from 'nanoevents';
import {
  EditorState,
  EditorViewProps,
  ErrorConstant,
  Except,
  invariant,
  isFunction,
  StateUpdateLifecycleProps,
} from '@remirror/core';
import type { HoverEventHandlerProps, MouseEventHandlerProps } from '@remirror/extension-events';

/**
 * The events that can trigger a positioner update.
 */
export type PositionerUpdateEvent = 'scroll' | 'state' | 'hover' | 'contextmenu';

export interface Rect {
  /**
   * Pixel distance from left of the reference frame.
   * Alias of `left`.
   */
  x: number;

  /**
   * Pixel distance from top of the reference frame.
   * Alias of `top` for css.
   */
  y: number;

  /**
   * The height of the captured position.
   */
  height: number;

  /**
   * The width of the captured position.
   */
  width: number;
}

/**
 * The absolutely positioned coordinates relative to the editor element. With
 * these coordinates you can perfectly simulate a position within the text
 * editor and render it as you decide.
 */
export interface PositionerPosition extends Rect {
  /**
   * The position relative to the document viewport. This can be used with
   * `position: fixed` when that is a better fit for your application.
   */
  rect: DOMRect;

  /**
   * True when any part of the captured position is visible within the dom view.
   */
  visible: boolean;
}

export interface GetPositionProps<Data> extends EditorViewProps, BasePositionerProps {
  /**
   * The data that can be transformed into a position.
   */
  data: Data;

  /**
   * The reference element being used by the positioner to determine
   * positioning.
   */
  element: HTMLElement;
}

export interface GetActiveProps extends EditorViewProps, BasePositionerProps {}

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
  hasChanged: (props: BasePositionerProps) => boolean;

  /**
   * Get a unique id for the data returned from `getActive`.
   *
   * If left undefined, it defaults to use the index.
   */
  getID?: (data: Data, index: number) => string;

  /**
   * Get the active items that will be passed into the `getPosition` method.
   */
  getActive: (props: GetActiveProps) => Data[];

  /**
   * Calculate and return an array of `VirtualPosition`'s which represent the
   * virtual element the positioner represents.
   */
  getPosition: (props: GetPositionProps<Data>) => PositionerPosition;

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

export interface BasePositionerProps extends Omit<StateUpdateLifecycleProps, 'previousState'> {
  previousState: undefined | EditorState;

  /**
   * The event that triggered this update.
   */
  event: PositionerUpdateEvent;

  /**
   * The scroll event information.
   */
  scroll?: {
    scrollTop: number;
  };

  /**
   * The hover event information. This is only present when the update was
   * triggered by a hover event.
   */
  hover?: Except<HoverEventHandlerProps, 'view'>;

  /**
   * The contextmenu event information. This is only present when the update was
   * triggered by a contextmenu event.
   */
  contextmenu?: Except<MouseEventHandlerProps, 'view'>;
}

export interface ElementsAddedProps {
  position: PositionerPosition;
  element: HTMLElement;
  id: string;
}

interface PositionerEvents {
  /**
   * Called when the dom elements have all been received. In some frameworks
   * like `React` this may be called asynchronously.
   */
  done: (props: ElementsAddedProps[]) => void;

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
   * An empty return value for the positioner.
   */
  static EMPTY: never[] = [];

  /**
   * Create a positioner.
   */
  static create<Data>(props: BasePositioner<Data>): Positioner<Data> {
    return new Positioner(props);
  }

  /**
   * Create a positioner from an existing positioner.
   *
   * This is useful when you want to modify parts of the positioner.
   */
  static fromPositioner<Data>(
    positioner: Positioner,
    base: Partial<BasePositioner<Data>>,
  ): Positioner<Data> {
    return Positioner.create({ ...positioner.basePositioner, ...base });
  }

  readonly events: PositionerUpdateEvent[];

  #handler = createNanoEvents<PositionerEvents>();
  #active: Data[] = [];
  #props: Map<number, GetPositionProps<Data>> = new Map();
  #ids: string[] = [];
  #updated = false;

  /**
   * Store the props for the most recent update. This is used by `React` to
   * reapply the most recent props to the new positioner when the positioner is
   * recreated within a component.
   */
  recentUpdate?: GetActiveProps;

  readonly #constructorProps: BasePositioner<Data>;
  readonly #getActive: BasePositioner<Data>['getActive'];
  readonly #getID?: (data: Data, index: number) => string;
  readonly #getPosition: BasePositioner<Data>['getPosition'];
  readonly hasChanged: (props: BasePositionerProps) => boolean;

  get basePositioner(): BasePositioner<Data> {
    return {
      getActive: this.#getActive,
      getPosition: this.#getPosition,
      hasChanged: this.hasChanged,
      events: this.events,
      getID: this.#getID,
    };
  }

  private constructor(props: BasePositioner<Data>) {
    this.#constructorProps = props;
    this.#getActive = props.getActive;
    this.#getPosition = props.getPosition;
    this.#getID = props.getID;
    this.hasChanged = props.hasChanged;
    this.events = props.events ?? ['state', 'scroll'];
  }

  /**
   * Get the active element setters.
   */
  onActiveChanged(props: GetActiveProps): void {
    this.recentUpdate = props;
    const active = this.#getActive(props);
    this.#active = active;
    this.#props = new Map();
    this.#updated = false;
    this.#ids = [];

    const elementSetters: SetActiveElement[] = [];

    for (const [index, data] of active.entries()) {
      const id = this.getID(data, index);
      this.#ids.push(id);

      elementSetters.push({
        setElement: (element: HTMLElement) => {
          return this.addProps({ ...props, data, element }, index);
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
   * Add a listener to the positioner events.
   */
  readonly addListener = <Key extends keyof PositionerEvents>(
    event: Key,
    cb: PositionerEvents[Key],
  ): Unsubscribe => {
    return this.#handler.on(event, cb);
  };

  private addProps(props: GetPositionProps<Data>, index: number) {
    if (this.#updated) {
      return;
    }

    this.#props.set(index, props);

    if (this.#props.size < this.#active.length) {
      return;
    }

    const doneProps: ElementsAddedProps[] = [];

    for (const index of this.#active.keys()) {
      const item = this.#props.get(index);

      invariant(item, {
        code: ErrorConstant.INTERNAL,
        message: 'Something went wrong when retrieving the parameters',
      });

      const id = this.#ids[index];

      if (!id) {
        return;
      }

      doneProps.push({
        position: this.#getPosition(item),
        element: item.element,
        id,
      });
    }

    this.#handler.emit('done', doneProps);
  }

  /**
   * Create a new Positioner with the provided props.
   */
  clone(props?: PositionerCloneProps<Data>): Positioner<Data> {
    return Positioner.create({
      ...this.#constructorProps,
      ...(isFunction(props) ? props(this.#constructorProps) : props),
    });
  }

  /**
   * Clones the positioner while updating the `active` value. This is designed
   * for usage in frameworks like `react`.
   */
  active(isActive: boolean | ((data: Data) => boolean)): Positioner<Data> {
    const filterFunction = isFunction(isActive) ? isActive : () => isActive;

    return this.clone((original) => ({
      getActive: (props) => original.getActive(props).filter(filterFunction),
    }));
  }
}

type PositionerCloneProps<Data> =
  | Partial<BasePositioner<Data>>
  | ((original: BasePositioner<Data>) => Partial<BasePositioner<Data>>);
