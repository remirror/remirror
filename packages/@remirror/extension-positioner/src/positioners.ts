import { createNanoEvents, Unsubscribe } from 'nanoevents';

import {
  EditorViewParameter,
  ElementParameter,
  ErrorConstant,
  invariant,
  isSelectionEmpty,
  Position,
  StateUpdateLifecycleParameter,
} from '@remirror/core';

import { hasStateChanged, isEmptyBlockNode } from './positioner-utils';

export type PositionerUpdateEvent = 'scroll' | 'state';
export interface Coords {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

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
  getID?: (data: Data) => string;

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
   * @defaultValue `['state']`
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
  scrollTop: number;
}

/**
 * This is the positioner. It exists to report the position of things in the
 * editor. Typically you will use it to get the position of the cursor.
 *
 * But you can be more ambitious and get the position all the active nodes of a
 * certain type. Or all visible nodes of a given time.
 *
 * The positions returned have a rect which is the viewport position.
 *
 * There are also the `top`, `left`, `right`, `bottom` which represent the
 * absolute positioned rectangle of the position in questions. For a cursor
 * position `left` and `right` are probably the same.
 */
export class Positioner<Data = any> {
  static create<Data>(parameter: BasePositioner<Data>): Positioner<Data> {
    return new Positioner(parameter);
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
   * Create a virtual node from the provided position to use in libraries like `poppy-js`.
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

const emptyRect = {
  top: -999_999,
  left: -999_999,
  right: -999_999,
  bottom: -999_999,
  height: 0,
  width: 0,
  x: -999_999,
  y: -999_999,
};

export const emptyVirtualPosition: VirtualPosition = {
  rect: { ...emptyRect, toJSON: () => emptyRect },
};

export interface VirtualPosition extends Partial<Position> {
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

/**
 * Render a floating selection positioner.
 *
 * - `rect` provides a viewport position which spans the width of the editor
 *   with a height identical to the cursor height.
 * - `top` - the top of the cursor.
 * - `bottom` - the bottom of the cursor.
 * - `left
 */
export const floatingSelectionPositioner = Positioner.create<Coords>({
  hasChanged: hasStateChanged,

  /**
   * This is only active for empty top level nodes. The data is the cursor start
   * and end position.
   */
  getActive(parameter) {
    const { state, view } = parameter;

    if (
      isSelectionEmpty(state) &&
      state.selection.$anchor.depth === 1 &&
      isEmptyBlockNode(state.selection.$anchor.parent)
    ) {
      return [view.coordsAtPos(state.selection.$anchor.pos)];
    }

    return [];
  },

  getPosition(parameter) {
    const { view, element, data: coords } = parameter;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    const parentRect = parent.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();

    const top = coords.top - parentRect.top;
    const bottom = coords.bottom - parentRect.top;

    // Since this is only active when the selection and node are empty, the left
    // position can be the cursor position.
    const left = coords.left - parentRect.left;

    // When used the right value will push the positioner to the extreme right
    // edge of the editor.
    const right = editorRect.right - parentRect.left;
    const rect = new DOMRect(coords.left, coords.top, right - left, coords.top - coords.bottom);

    return { top, bottom, left, right, rect };
  },
});

/**
 * Render a positioner which is centered around the selection. This is only
 * active for text selections, where the selection spans more than one
 * character.
 *
 * @remarks
 *
 * The menu will horizontally center itself `from` / `to` bounds of the current
 * selection.
 *
 * - `right` is undefined
 * - `left` will center your element based on the width of the current selection
 *   .
 * - `bottom` absolutely positions the element below the text selection.
 * - `top` absolutely positions the element above the text selection
 */
export const centeredSelectionPositioner = Positioner.create<{ start: Coords; end: Coords }>({
  hasChanged: hasStateChanged,
  getActive: (parameter) => {
    const { state, view } = parameter;

    if (state.selection.empty) {
      return [];
    }

    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    return [{ start, end }];
  },

  getPosition(parameter) {
    const { element, data } = parameter;
    const { start, end } = data;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The bubble menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = (start.left + end.left) / 2 - parentBox.left;
    const left = Math.min(
      parentBox.width - elementBox.width / 2,
      Math.max(calculatedLeft, elementBox.width / 2),
    );
    const top = Math.trunc(start.top - parentBox.top);
    const bottom = Math.trunc(start.bottom - parentBox.top);
    const rect = new DOMRect(start.left, start.top, end.right - start.left, end.bottom - start.top);

    return { rect, left, top, bottom };
  },
});

/**
 * Render a menu that is inline with the first character of the selection. This
 * is useful for suggestions since they should typically appear while typing
 * without a multi character selection.
 *
 * @remarks
 *
 * The menu will center itself within the selection.
 *
 * - `right` should be used to absolutely position away from the right hand edge
 *   of the screen.
 * - `left` should be used to absolutely position away from the left hand edge
 *   of the screen.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
 */
export const cursorPopupPositioner = Positioner.create<Coords>({
  hasChanged: hasStateChanged,

  /**
   * Only active when the selection is empty (one character)
   */
  getActive: (parameter) => {
    const { state, view } = parameter;

    if (!state.selection.empty) {
      return [];
    }

    return [view.coordsAtPos(state.selection.from)];
  },
  getPosition(parameter) {
    const { element, data: cursor } = parameter;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The popup menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = cursor.left - parentBox.left;
    const calculatedRight = parentBox.right - cursor.right;

    const bottom = Math.trunc(cursor.bottom - parentBox.top);
    const top = Math.trunc(cursor.top - parentBox.top);
    const rect = new DOMRect(cursor.left, cursor.top, 0, cursor.bottom - cursor.top);
    const left =
      calculatedLeft + elementBox.width > parentBox.width
        ? calculatedLeft - elementBox.width
        : calculatedLeft;
    const right =
      calculatedRight + elementBox.width > parentBox.width
        ? calculatedRight - elementBox.width
        : calculatedRight;

    return { rect, right, left, bottom, top };
  },
});
