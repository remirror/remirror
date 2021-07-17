import { Placement } from '@popperjs/core';
import composeRefs from '@seznam/compose-react-refs';
import { matchSorter } from 'match-sorter';
import { FC, ReactChild, Ref, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMenuState } from 'reakit/Menu';
import useLayoutEffect from 'use-isomorphic-layout-effect';
import { cx, Except } from '@remirror/core';
import type { PositionerParam } from '@remirror/extension-positioner';
import { getPositioner } from '@remirror/extension-positioner';
import { useHelpers } from '@remirror/react-core';
import {
  useEditorFocus,
  UseEditorFocusProps,
  usePositioner,
  useSuggest,
} from '@remirror/react-hooks';
import { ComponentsTheme, ExtensionPositionerTheme } from '@remirror/theme';

import { MenuComponent } from './menu';
import {
  ComponentItem,
  MenuActionItemUnion,
  MenuCommandPaneItem,
  MenuPaneItem,
  ToolbarItem,
} from './react-component-types';
import { Toolbar } from './toolbar';
import { usePopper } from './use-popper';

interface BaseFloatingPositioner extends UseEditorFocusProps {
  /**
   * The positioner used to determine the position of the relevant part of the
   * editor state.
   */
  positioner: PositionerParam;

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

  /**
   * Where to place the popover relative to the positioner.
   */
  placement?: Placement;

  /**
   * When `true` the child component is rendered outside the `ProseMirror`
   * editor. Set this to `false` when you need to render special components
   * (like inputs) which capture events and conflict with the default
   * prosemirror editor.
   *
   * For toolbars which rely on clicks you can leave this as the default.
   *
   * Setting to true will also make scrolling less smooth since it will be using
   * JavaScript to keep track of the position of the element.
   *
   * @default false
   */
  renderOutsideEditor?: boolean;
}

interface FloatingWrapperProps extends BaseFloatingPositioner {
  /**
   * When true the arrow will be displayed.
   *
   * @default false
   */
  displayArrow?: boolean;

  animatedClass?: string;
  containerClass?: string;
  floatingLabel?: string;
}

export const FloatingWrapper: FC<FloatingWrapperProps> = (props): JSX.Element => {
  const {
    containerClass,
    placement = 'right-end',
    positioner,
    children,
    blurOnInactive = false,
    ignoredElements = [],
    enabled = true,
    floatingLabel,
    hideWhenInvisible = true,
    renderOutsideEditor = false,
  } = props;

  const [isFocused] = useEditorFocus({ blurOnInactive, ignoredElements });
  const {
    ref,
    active,
    height,
    x: left,
    y: top,
    width,
    visible,
  } = usePositioner(() => {
    const active = isFocused && enabled;
    const refinedPositioner = getPositioner(positioner);
    return refinedPositioner.active(active);

    // return renderOutsideEditor
    //   ? getPositioner(positioner)
    //       .clone(({ events = [] }) => ({ events: [...events, 'scroll'] }))
    //       .active(active)
    //   : getPositioner(positioner).active(active);
  }, [isFocused, enabled, renderOutsideEditor]);

  const shouldShow = (hideWhenInvisible ? visible : true) && active;
  const position = useMemo(() => ({ height, left, top, width }), [height, left, top, width]);
  const { popperRef, referenceRef, popoverStyles, update } = usePopper({
    placement,
    visible,
  });

  let floatingElement = (
    <div
      aria-label={floatingLabel}
      ref={popperRef as any}
      style={popoverStyles}
      className={cx(ComponentsTheme.FLOATING_POPOVER, containerClass)}
    >
      {shouldShow && children}
    </div>
  );

  if (!renderOutsideEditor) {
    floatingElement = <PositionerPortal>{floatingElement}</PositionerPortal>;
  }

  useLayoutEffect(() => {
    update();
  }, [shouldShow, update, height, left, top, width]);

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
          }}
          ref={composeRefs(ref, referenceRef) as Ref<any>}
        />
      </PositionerPortal>
      {floatingElement}
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

interface FloatingActionsMenuProps extends Partial<FloatingWrapperProps> {
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
    ...floatingWrapperProps
  } = props;
  const { change } = useSuggest({ char: '/', name: 'actions-dropdown', matchOffset: 0 });
  const query = change?.query.full;
  const menuState = useMenuState({ unstable_virtual: true, wrap: true, loop: true });

  const items = (
    query
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

  return (
    <FloatingWrapper
      enabled={!!query}
      positioner={positioner}
      placement={placement}
      animated={animated}
      blurOnInactive={blurOnInactive}
      ignoredElements={ignoredElements}
      {...floatingWrapperProps}
    >
      <div style={{ width: 50, height: 50, background: 'red' }} />
      <MenuComponent open={!!query && enabled} items={items} menuState={menuState} />
    </FloatingWrapper>
  );
};
