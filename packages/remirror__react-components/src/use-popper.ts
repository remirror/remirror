import { createPopper, Instance, Placement, State } from '@popperjs/core';
import {
  CSSProperties,
  Dispatch,
  Ref,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isUA } from 'reakit-utils/dom';
import { shallowEqual } from 'reakit-utils/shallowEqual';
import useLayoutEffect from 'use-isomorphic-layout-effect';

const isSafari = isUA('Mac') && !isUA('Chrome') && isUA('Safari');

export interface PopperState {
  /**
   * The reference element.
   */
  referenceRef: Ref<HTMLElement | undefined>;
  /**
   * The popover element.
   * @private
   */
  popperRef: Ref<HTMLElement | undefined>;
  /**
   * The arrow element.
   * @private
   */
  arrowRef: Ref<HTMLElement | undefined>;
  /**
   * Popover styles.
   * @private
   */
  popoverStyles: CSSProperties;
  /**
   * Arrow styles.
   * @private
   */
  arrowStyles: CSSProperties;
  /**
   * `placement` passed to the hook.
   * @private
   */
  originalPlacement: Placement;
  /**
   * @private
   */
  update: () => boolean;
  /**
   * Actual `placement`.
   */
  placement: Placement;
}

export interface PopperActions {
  /**
   * Change the `placement` state.
   */
  place: Dispatch<SetStateAction<Placement>>;
}

export interface UsePopperProps extends Partial<Pick<PopperState, 'placement'>> {
  /**
   * Whether or not the popover should have `position` set to `fixed`.
   */
  fixed?: boolean;
  /**
   * Flip the popover's placement when it starts to overlap its reference
   * element.
   */
  flip?: boolean;
  /**
   * Offset between the reference and the popover: [main axis, alt axis]. Should not be combined with `gutter`.
   */
  offset?: [number | string, number | string];
  /**
   * Offset between the reference and the popover on the main axis. Should not be combined with `offset`.
   */
  gutter?: number;
  /**
   * Prevents popover from being positioned outside the boundary.
   */
  preventOverflow?: boolean;

  /**
   * Whether the popper should be visible.
   */
  visible?: boolean;
}

export interface PopperStateReturn extends PopperState, PopperActions {}

function applyStyles(styles?: Partial<CSSStyleDeclaration>) {
  return (prevStyles: CSSProperties) => {
    if (styles && !shallowEqual(prevStyles, styles)) {
      return styles as CSSProperties;
    }

    return prevStyles;
  };
}

export function usePopper(props: UsePopperProps = {}): PopperStateReturn {
  const {
    gutter = 12,
    placement: sealedPlacement = 'bottom',
    flip: flip = true,
    offset: sealedOffset,
    preventOverflow: preventOverflow = true,
    fixed = false,
    visible = false,
  } = props;

  const popper = useRef<Instance | null>(null);
  const referenceRef = useRef<HTMLElement>();
  const popperRef = useRef<HTMLElement>();
  const arrowRef = useRef<HTMLElement>();

  const [originalPlacement, place] = useState(sealedPlacement);
  const [placement, setPlacement] = useState(sealedPlacement);
  const [offset] = useState(sealedOffset || [0, gutter]);
  const [popoverStyles, setPopoverStyles] = useState<CSSProperties>({
    position: fixed ? 'fixed' : 'absolute',
    left: '-9999999px',
    top: '-9999999px',
  });
  const [arrowStyles, setArrowStyles] = useState<CSSProperties>({});

  const update = useCallback(() => {
    if (popper.current) {
      popper.current.forceUpdate();
      return true;
    }

    return false;
  }, []);

  const updateState = useCallback((state: Partial<State>) => {
    if (state.placement) {
      setPlacement(state.placement);
    }

    if (state.styles) {
      setPopoverStyles(applyStyles(state.styles.popper));

      if (arrowRef.current) {
        setArrowStyles(applyStyles(state.styles.arrow));
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (referenceRef.current && popperRef.current) {
      popper.current = createPopper(referenceRef.current, popperRef.current, {
        // https://popper.js.org/docs/v2/constructors/#options
        placement: originalPlacement,
        strategy: fixed ? 'fixed' : 'absolute',
        // Safari needs styles to be applied in the first render, otherwise
        // hovering over the popover when it gets visible for the first time
        // will change its dimensions unexpectedly.
        onFirstUpdate: isSafari ? updateState : undefined,
        modifiers: [
          {
            // https://popper.js.org/docs/v2/modifiers/event-listeners/
            name: 'eventListeners',
            enabled: visible,
          },
          {
            // https://popper.js.org/docs/v2/modifiers/apply-styles/
            name: 'applyStyles',
            enabled: false,
          },
          {
            // https://popper.js.org/docs/v2/modifiers/flip/
            name: 'flip',
            enabled: flip,
            options: { padding: 8 },
          },
          {
            // https://popper.js.org/docs/v2/modifiers/offset/
            name: 'offset',
            options: { offset },
          },
          {
            // https://popper.js.org/docs/v2/modifiers/prevent-overflow/
            name: 'preventOverflow',
            enabled: preventOverflow,
            options: {
              tetherOffset: () => arrowRef.current?.clientWidth || 0,
            },
          },
          {
            // https://popper.js.org/docs/v2/modifiers/arrow/
            name: 'arrow',
            enabled: !!arrowRef.current,
            options: { element: arrowRef.current },
          },
          {
            // https://popper.js.org/docs/v2/modifiers/#custom-modifiers
            name: 'updateState',
            phase: 'write',
            requires: ['computeStyles'],
            enabled: visible,
            fn: ({ state }) => updateState(state),
          },
        ],
      });
    }

    return () => {
      if (popper.current) {
        popper.current.destroy();
        popper.current = null;
      }
    };
  }, [originalPlacement, fixed, visible, flip, offset, preventOverflow, updateState]);

  // Ensure that the popover will be correctly positioned with an additional
  // update.
  useEffect(() => {
    if (!visible) {
      return;
    }

    const id = window.requestAnimationFrame(() => {
      popper.current?.forceUpdate();
    });

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [visible]);

  return useMemo(
    () => ({
      referenceRef,
      popperRef,
      arrowRef,
      popoverStyles,
      arrowStyles,
      update,
      originalPlacement,
      placement,
      place,
    }),
    [arrowStyles, originalPlacement, placement, popoverStyles, update],
  );
}
