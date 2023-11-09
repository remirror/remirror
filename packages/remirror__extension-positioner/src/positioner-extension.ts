import {
  AddCustomHandler,
  command,
  CommandFunction,
  CustomHandler,
  debounce,
  EditorState,
  extension,
  Helper,
  helper,
  isFunction,
  isString,
  PlainExtension,
  ProsemirrorAttributes,
  StateUpdateLifecycleProps,
  Static,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { ExtensionPositionerTheme } from '@remirror/theme';

import { positioners } from './core-positioners';
import type {
  BasePositionerProps,
  Positioner,
  PositionerUpdateEvent,
  SetActiveElement,
} from './positioner';
import {
  POSITIONER_UPDATE_ALL,
  POSITIONER_UPDATE_KEY,
  POSITIONER_WIDGET_KEY,
} from './positioner-utils';

export interface PositionerOptions {
  /**
   * An object specifying the positioner and the change handler for responding
   * to changes in the positioner output. This is a custom handler and should be
   * amended with `addCustomHandler`.
   */
  positioner?: CustomHandler<Positioner>;

  /**
   * The `ms` to debounce scroll events. Scroll events affect the visibility of
   * the rendered positioners. By default they are enabled for all positioners.
   *
   * @defaultValue 100
   */
  scrollDebounce?: Static<number>;
}

/**
 * This is the positioner extension which is used to track the positions of
 * different parts of your editor.
 *
 * For example, you can track the cursor or all visible paragraph nodes.
 */
@extension<PositionerOptions>({
  defaultOptions: { scrollDebounce: 100 },
  customHandlerKeys: ['positioner'],
  staticKeys: ['scrollDebounce'],
})
export class PositionerExtension extends PlainExtension<PositionerOptions> {
  get name() {
    return 'positioner' as const;
  }

  /**
   * All the active positioners for the editor.
   */
  private positioners: Positioner[] = [];

  /**
   * The document element which is used for storing the positioner decoration.
   */
  private element?: HTMLElement;

  protected onAddCustomHandler: AddCustomHandler<PositionerOptions> = ({ positioner }) => {
    if (!positioner) {
      return;
    }

    this.positioners = [...this.positioners, positioner];

    // Ensure `onStateUpdate` is trigger when a positioner is added
    this.store.commands.forceUpdate();

    return () => {
      this.positioners = this.positioners.filter((handler) => handler !== positioner);
    };
  };

  createAttributes(): ProsemirrorAttributes {
    /**
     * Add the positioner class to make the main editor container `relative` so
     * that positioners can be fixed in relation to the editor.
     */
    return { class: ExtensionPositionerTheme.EDITOR };
  }

  protected init(): void {
    this.onScroll = debounce(this.options.scrollDebounce, this.onScroll.bind(this));
  }

  createEventHandlers(): CreateEventHandlers {
    return {
      scroll: () => {
        this.onScroll();
        return false;
      },
      hover: (_, hover) => {
        this.positioner(this.getBaseProps('hover', { hover }));
        return false;
      },
      contextmenu: (_, contextmenu) => {
        this.positioner(this.getBaseProps('contextmenu', { contextmenu }));
        return false;
      },
    };
  }

  onStateUpdate(update: StateUpdateLifecycleProps): void {
    this.positioner({
      ...update,
      previousState: update.firstUpdate ? undefined : update.previousState,
      event: 'state',
      helpers: this.store.helpers,
    });
  }

  /**
   * Create a placeholder decoration which is never removed from the document.
   */
  createDecorations(state: EditorState): DecorationSet {
    this.element ??= this.createElement();

    // Only add the decorations when there are positioners present.
    if (!this.element.hasChildNodes()) {
      return DecorationSet.empty;
    }

    // Use the element as the decoration which is always available at the start of the document.
    const decoration = Decoration.widget(0, this.element, {
      key: 'positioner-widget',
      side: -1,
      // TODO tests this which prevents any events from bubbling through
      stopEvent: () => true,
    });
    return DecorationSet.create(state.doc, [decoration]);
  }

  /**
   * Trigger an update of positioners manually. This can be useful to update positioners when
   * the view is updated in a way that doesn't trigger a ProseMirror state change. For instance
   * when an image URL is loaded and the document is reflowed.
   *
   * @param key - Allows filtering a specific type of positioner to update. Defaults to all.
   */
  @command()
  forceUpdatePositioners(key = POSITIONER_UPDATE_ALL): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.setMeta(POSITIONER_UPDATE_KEY, { key }));
      return true;
    };
  }

  /**
   * Get the html element which contains all the positioner elements and
   * components.
   */
  @helper()
  getPositionerWidget(): Helper<HTMLElement> {
    return (this.element ??= this.createElement());
  }

  private createElement() {
    const element = document.createElement('span');
    element.dataset.id = POSITIONER_WIDGET_KEY;
    element.classList.add(POSITIONER_WIDGET_KEY);
    element.setAttribute('role', 'presentation');

    return element;
  }

  private triggerPositioner(positioner: Positioner, update: BasePositionerProps) {
    if (!positioner.hasChanged(update)) {
      // Nothing has changed so return without calling the change handler.
      return;
    }

    positioner.onActiveChanged({ ...update, view: this.store.view });
  }

  private positioner(update: BasePositionerProps) {
    for (const positioner of this.positioners) {
      const eventIsNotSupported = !positioner.events.includes(update.event);

      if (eventIsNotSupported) {
        continue;
      }

      this.triggerPositioner(positioner, update);
    }
  }

  private getBaseProps(
    event: PositionerUpdateEvent,
    extra: Partial<BasePositionerProps>,
  ): BasePositionerProps {
    const state = this.store.getState();
    const previousState = this.store.previousState;

    return {
      helpers: this.store.helpers,
      event,
      firstUpdate: false,
      previousState,
      state,
      ...extra,
    };
  }

  private onScroll(): void {
    this.positioner(
      this.getBaseProps('scroll', {
        scroll: { scrollTop: this.store.view.dom.scrollTop },
      }),
    );
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

/**
 * This is a helper method for getting the positioner. The props can either
 * be a named positioner or a positioner that you've created for the purpose.
 */
export function getPositioner(positioner: PositionerParam): Positioner {
  if (isString(positioner)) {
    return positioners[positioner].clone() as any;
  }

  if (isFunction(positioner)) {
    return positioner().clone();
  }

  return positioner.clone();
}

export type StringPositioner = keyof typeof positioners;
export type CallbackPositioner = () => Positioner;
export type PositionerParam = StringPositioner | Positioner | CallbackPositioner;

declare global {
  namespace Remirror {
    interface AllExtensions {
      positioner: PositionerExtension;
    }
  }
}
