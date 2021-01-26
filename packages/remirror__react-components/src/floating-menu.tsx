/**
 * @module
 *
 * Exploratory code for the floating elements.
 */

import { cx } from '@linaria/core';
import composeRefs from '@seznam/compose-react-refs';
import { matchSorter } from 'match-sorter';
import type { FC, ReactChild, Ref } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMenuState } from 'reakit/Menu';
import { Popover, PopoverState, usePopoverState } from 'reakit/Popover';
import { Except } from 'type-fest';
import { ExtensionPriority, isEmptyArray } from '@remirror/core';
import type { PositionerParam } from '@remirror/extension-positioner';
import { getPositioner } from '@remirror/extension-positioner';
import { useEditorDomRef, useHelpers } from '@remirror/react-core';
import {
  useEditorFocus,
  UseEditorFocusProps,
  useKeymap,
  usePositioner,
  useSuggest,
} from '@remirror/react-hooks';
import { ComponentsTheme, ExtensionPositionerTheme } from '@remirror/theme';

import { ControllableMenu } from './react-component-menu';
import { Toolbar } from './react-component-toolbar';
import {
  ComponentItem,
  MenuActionItemUnion,
  MenuCommandPaneItem,
  MenuPaneItem,
  ToolbarItem,
} from './react-component-types';

interface UseFloatingPositioner extends UseEditorFocusProps {
  /**
   * The positioner used to determine the position of the relevant part of the
   * editor state.
   */
  positioner: PositionerParam;

  /**
   * Where to place the popover relative to the positioner.
   */
  placement?: PopoverState['placement'];

  /**
   * When `true` will hide the popover element whenever the positioner is no
   * longer visible in the DOM.
   */
  hideWhenInvisible?: boolean;

  /**
   * Set animated as detailed [here](https://reakit.io/docs/popover/#animating).
   *
   * Currently this is turned off due to problems with an infinite loop.
   */
  animated?: boolean | number;

  /**
   * Set to false to make the positioner inactive.
   */
  enabled?: boolean;
}

function useFloatingPositioner(props: UseFloatingPositioner) {
  const {
    positioner,
    animated,
    placement = 'top',
    enabled = true,
    blurOnInactive = false,
    ignoredElements = [],
    hideWhenInvisible = true,
  } = props;
  const editorRef = useEditorDomRef();
  const popoverState = usePopoverState({ placement, modal: false, animated });
  const [isFocused] = useEditorFocus({ blurOnInactive, ignoredElements });
  const { ref, active, height, x: left, y: top, width, visible } = usePositioner(
    () => getPositioner(positioner).active(isFocused && enabled),
    [isFocused, enabled],
  );
  const position = useMemo(() => ({ height, left, top, width }), [height, left, top, width]);

  useEffect(() => {
    const shouldShow = (hideWhenInvisible ? visible : true) && active;

    if (!shouldShow) {
      popoverState.stopAnimation();
      return popoverState.hide();
    }

    if (!popoverState.visible) {
      popoverState.show();
    }

    popoverState.unstable_update();
  }, [active, popoverState, placement, position, visible, hideWhenInvisible]);

  return useMemo(
    () => ({
      editorRef,
      positionerRef: composeRefs(ref, popoverState.unstable_referenceRef) as Ref<any>,
      popoverState,
      position,
    }),
    [editorRef, popoverState, position, ref],
  );
}

interface FloatingWrapperProps extends UseFloatingPositioner {
  animatedClass?: string;
  containerClass?: string;
  floatingLabel?: string;

  /**
   * When true the arrow will be displayed.
   *
   * @default false
   */
  displayArrow?: boolean;
}

export const FloatingWrapper: FC<FloatingWrapperProps> = (props): JSX.Element => {
  const {
    animated,
    animatedClass,
    containerClass,
    placement,
    positioner,
    children,
    blurOnInactive,
    ignoredElements,
    enabled,
    floatingLabel,
    hideWhenInvisible,
  } = props;
  const { editorRef, positionerRef, popoverState, position } = useFloatingPositioner({
    animated,
    placement,
    positioner,
    blurOnInactive,
    ignoredElements,
    enabled,
    hideWhenInvisible,
  });

  return (
    <>
      <PositionerPortal>
        <span
          className={ExtensionPositionerTheme.POSITIONER}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            background: 'blue',
          }}
          ref={positionerRef}
        />
      </PositionerPortal>
      <PositionerPortal>
        <Popover
          {...popoverState}
          aria-label={floatingLabel}
          hideOnEsc={true}
          unstable_initialFocusRef={editorRef}
          unstable_finalFocusRef={editorRef}
          className={cx(ComponentsTheme.FLOATING_POPOVER, containerClass)}
        >
          {animated ? <div className={animatedClass}>{children}</div> : children}
        </Popover>
      </PositionerPortal>
    </>
  );
};

interface FloatingToolbarProps extends Except<ToolbarItem, 'type'>, FloatingWrapperProps {}

export const FloatingToolbar = (props: FloatingToolbarProps): JSX.Element => {
  const {
    placement,
    positioner,
    animated = 200,
    animatedClass = ComponentsTheme.ANIMATED_POPOVER,
    containerClass,
    blurOnInactive,
    enabled,
    floatingLabel,
    ignoredElements,
    ...toolbarProps
  } = props;
  const floatingWrapperProps = {
    placement,
    positioner,
    animated,
    animatedClass,
    containerClass,
    blurOnInactive,
    enabled,
    floatingLabel,
    ignoredElements,
  };

  return (
    <FloatingWrapper {...floatingWrapperProps}>
      <Toolbar {...toolbarProps} refocusEditor={false} />
    </FloatingWrapper>
  );
};

export interface PositionerComponentProps {
  children: ReactChild;
}

/**
 * Render a component into the editors positioner widget using `createPortal`
 * from `react-dom`.
 */
export const PositionerPortal: FC<PositionerComponentProps> = (props) => {
  const container = useHelpers().getPositionerWidget();

  return createPortal(<>{props.children}</>, container);
};

interface FloatingActionsMenuProps extends Partial<UseFloatingPositioner> {
  actions: MenuActionItemUnion[];
}

/**
 * Respond to user queries in the editor.
 */
export const FloatingActionsMenu = (props: FloatingActionsMenuProps): JSX.Element => {
  const {
    actions,
    animated = false,
    placement = 'right-end',
    positioner = 'nearestWord',
    blurOnInactive,
    ignoredElements,
    enabled = true,
  } = props;
  const { change } = useSuggest({ char: '/', name: 'actions-dropdown', matchOffset: 0 });
  const query = change?.query.full;
  const menuState = useMenuState({ unstable_virtual: true, wrap: true, loop: true });

  const items = (query
    ? matchSorter(actions, query, {
        keys: ['tags', 'description', (item) => item.description?.replace(/\W/g, '') ?? ''],
        threshold: matchSorter.rankings.CONTAINS,
      })
    : actions
  ).map<MenuPaneItem | MenuCommandPaneItem>((item) =>
    item.type === ComponentItem.MenuAction
      ? { ...item, type: ComponentItem.MenuPane }
      : { ...item, type: ComponentItem.MenuCommandPane },
  );

  const createArrowBinding = useCallback(
    (key: 'up' | 'down') => () => {
      if (!query || isEmptyArray(items)) {
        return false;
      }

      key === 'up' ? menuState.up() : menuState.down();

      return true;
    },
    [query, items, menuState],
  );

  const ArrowUp = useMemo(() => createArrowBinding('up'), [createArrowBinding]);
  const ArrowDown = useMemo(() => createArrowBinding('down'), [createArrowBinding]);

  const bindings = useMemo(
    () => ({
      /**
       * Handle the enter key being pressed
      //  */
      // Enter: () => {
      //   if (!query || isEmptyArray(items)) {
      //     return false;
      //   }

      //   menuState

      //   command(emoji);

      //   return true;
      // },

      // /**
      //  * Clear suggestions when the escape key is pressed.
      //  */
      // Escape: () => {
      //   if (!state) {
      //     return false;
      //   }

      //   menuState.

      //   // Ignore the current mention so that it doesn't show again for this
      //   // matching area
      //   helpers
      //     .getSuggestMethods()
      //     .addIgnored({ from: state.range.from, name: 'emoji', specific: true });

      //   setState(null);
      //   return true;
      // },

      ArrowDown,
      ArrowUp,
    }),
    [ArrowDown, ArrowUp],
  );

  useKeymap(bindings, ExtensionPriority.High);

  return (
    <FloatingWrapper
      enabled={!!query}
      positioner={positioner}
      placement={placement}
      animated={animated}
      blurOnInactive={blurOnInactive}
      ignoredElements={ignoredElements}
    >
      <div style={{ width: 50, height: 50, background: 'red' }} />
      <ControllableMenu open={!!query && enabled} items={items} menuState={menuState} />
    </FloatingWrapper>
  );
};

/**
 * Query the provided items and return a list of items which can be used in the
 * menu.
 */
// function queryActionItems(actions: MenuActionItemUnion[]) {}
